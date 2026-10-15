import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

import {
  IntentionRecherche,
  ReponseAtelierStylistique,
  ExempleUsage,
  PropositionStylistique
} from '../../../shared/types';
import { nuanceService } from './nuance.service';

export class AIService {
  private geminiKey: string | undefined;
  private openaiKey: string | undefined;

  constructor() {
    this.geminiKey = process.env.GEMINI_API_KEY;
    this.openaiKey = process.env.OPENAI_API_KEY;
  }

  private get activeGeminiKey(): string | undefined {
    return this.geminiKey || process.env.GEMINI_API_KEY;
  }

  private get activeOpenaiKey(): string | undefined {
    return this.openaiKey || process.env.OPENAI_API_KEY;
  }

  /**
   * Vérifie si un service IA externe est configuré
   */
  public isAvailable(): boolean {
    return Boolean(this.activeGeminiKey || this.activeOpenaiKey);
  }

  public getStatus(): { isConfigured: boolean; provider: 'gemini' | 'openai' | 'none'; maskedKey?: string } {
    const gem = this.activeGeminiKey;
    if (gem) {
      const masked = gem.length > 8
        ? '••••••••' + gem.slice(-4)
        : '••••••••';
      return { isConfigured: true, provider: 'gemini', maskedKey: masked };
    }
    const oai = this.activeOpenaiKey;
    if (oai) {
      const masked = oai.length > 8
        ? '••••••••' + oai.slice(-4)
        : '••••••••';
      return { isConfigured: true, provider: 'openai', maskedKey: masked };
    }
    return { isConfigured: false, provider: 'none' };
  }

  /**
   * Met à jour la clé API dynamiquement et persiste dans .env
   */
  public setApiKey(provider: 'gemini' | 'openai', key: string): void {
    const cleanKey = key.trim();
    if (provider === 'gemini') {
      this.geminiKey = cleanKey || undefined;
      process.env.GEMINI_API_KEY = cleanKey;
      this.sauvegarderEnv('GEMINI_API_KEY', cleanKey);
    } else if (provider === 'openai') {
      this.openaiKey = cleanKey || undefined;
      process.env.OPENAI_API_KEY = cleanKey;
      this.sauvegarderEnv('OPENAI_API_KEY', cleanKey);
    }
  }

  private sauvegarderEnv(variable: string, valeur: string): void {
    try {
      const envPath = path.resolve(process.cwd(), '.env');
      let content = '';
      if (fs.existsSync(envPath)) {
        content = fs.readFileSync(envPath, 'utf-8');
      }
      const regex = new RegExp(`^${variable}=.*$`, 'm');
      if (regex.test(content)) {
        content = content.replace(regex, `${variable}=${valeur}`);
      } else {
        content = content ? `${content}\n${variable}=${valeur}` : `${variable}=${valeur}`;
      }
      fs.writeFileSync(envPath, content.trim() + '\n', 'utf-8');
    } catch (err) {
      console.warn('Impossible de persister dans .env:', err);
    }
  }

  /**
   * Teste la validité de la clé API auprès du fournisseur
   */
  public async testConnection(): Promise<{ success: boolean; message: string; latencyMs?: number }> {
    if (!this.isAvailable()) {
      return { success: false, message: 'Aucune clé d\'API n\'est actuellement configurée.' };
    }

    const t0 = Date.now();
    try {
      const gemKey = this.activeGeminiKey;
      const oaiKey = this.activeOpenaiKey;

      if (gemKey) {
        const raw = await this.executerRequeteGemini('Réponds en un seul mot : Actif');
        const latencyMs = Date.now() - t0;
        if (raw) {
          return {
            success: true,
            message: `Connexion Google Gemini validée avec succès ! (Temps de réponse : ${latencyMs}ms)`,
            latencyMs
          };
        } else {
          return {
            success: false,
            message: 'Échec de connexion : vérifiez que la clé API Google Gemini est valide et dispose des droits.',
            latencyMs
          };
        }
      } else if (oaiKey) {
        const url = 'https://api.openai.com/v1/chat/completions';
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${oaiKey}`
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: 'Actif' }],
            max_tokens: 5
          })
        });

        const latencyMs = Date.now() - t0;
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          const errMsg = errData?.error?.message || `Erreur HTTP ${res.status}`;
          return { success: false, message: `OpenAI a refusé la requête : ${errMsg}`, latencyMs };
        }

        return {
          success: true,
          message: `Connexion OpenAI validée avec succès ! (Temps de réponse : ${latencyMs}ms)`,
          latencyMs
        };
      }
    } catch (err: any) {
      return { success: false, message: `Erreur réseau ou d'accès à l'API : ${err.message}` };
    }

    return { success: false, message: 'Fournisseur d\'IA non pris en charge.' };
  }

  /**
   * Exécute une requête avec cascade automatique de modèles Gemini
   */
  private async executerRequeteGemini(prompt: string, responseJson: boolean = false): Promise<string | null> {
    const key = this.activeGeminiKey;
    if (!key) return null;
    const models = ['gemini-3.5-flash', 'gemini-3.7-flash', 'gemini-3.8-flash'];

    for (const m of models) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${key}`;
        const body: any = {
          contents: [{ parts: [{ text: prompt }] }]
        };
        if (responseJson) {
          body.generationConfig = { responseMimeType: 'application/json' };
        }

        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });

        if (res.ok) {
          const data = await res.json();
          const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) return rawText;
        }
      } catch (err) {
        // Essayer le modèle suivant
      }
    }
    return null;
  }

  /**
   * Génère des exemples littéraires originaux lorsque l'IA est connectée
   */
  public async genererExemplesStylistiques(
    mot: string,
    categorie: string = 'nom',
    registre: string = 'littéraire'
  ): Promise<ExempleUsage[]> {
    if (this.isAvailable()) {
      try {
        if (this.activeGeminiKey) {
          const exemplesIA = await this.appelerGeminiPourExemples(mot, registre);
          if (exemplesIA && exemplesIA.length > 0) {
            return exemplesIA;
          }
        }
      } catch (err) {
        console.warn('Erreur appel IA pour exemples:', err);
      }
    }

    // Aucune simulation ou fausse donnée si pas d'IA connectée
    return [];
  }

  /**
   * Enrichit la recherche d'intention par IA si configurée
   */
  public async analyserIntentionStylistique(intention: IntentionRecherche): Promise<ReponseAtelierStylistique> {
    if (!this.isAvailable()) {
      return nuanceService.chercherParIntention(intention);
    }

    try {
      if (this.activeGeminiKey) {
        const reponse = await this.appelerGeminiPourIntention(intention);
        if (reponse) return reponse;
      }
    } catch (err) {
      console.warn('Erreur IA intention stylistique, repli vers le moteur de nuances:', err);
    }

    return nuanceService.chercherParIntention(intention);
  }

  private async appelerGeminiPourExemples(mot: string, registre: string): Promise<ExempleUsage[]> {
    const prompt = `Tu es un maître de style littéraire français de haute volée. Pour le mot "${mot}", génère 4 phrases d'exemple distinctes et inspirantes (1 narrative, 1 descriptive, 1 de dialogue, 1 poétique) dans un registre ${registre}.
Respecte scrupuleusement le sens du mot sans contresens.
Réponds uniquement au format JSON valide :
[
  {"texte": "phrase narrative...", "type": "narratif"},
  {"texte": "phrase descriptive...", "type": "descriptif"},
  {"texte": "phrase dialoguée...", "type": "dialogue"},
  {"texte": "phrase poétique...", "type": "poétique"}
]`;

    const rawText = await this.executerRequeteGemini(prompt, true);
    if (!rawText) return [];

    try {
      const json = JSON.parse(rawText);
      return json.map((item: any) => ({
        texte: item.texte,
        type: item.type,
        estGenereIA: true,
        source: 'Généré par modèle IA (Gemini) — Suggestion d’écriture'
      }));
    } catch {
      return [];
    }
  }

  private async appelerGeminiPourIntention(intention: IntentionRecherche): Promise<ReponseAtelierStylistique | null> {
    const prompt = `Tu es un assistant de style pour écrivains de langue française.
L'auteur a pour intention d'écriture : "${intention.idee}".
Émotion : "${intention.emotion || 'non spécifiée'}". Contexte : "${intention.contexteNarratif || 'général'}". Registre : "${intention.registre || 'littéraire'}".
Propose 4 mots ou locutions en français parfaitement ciblés avec nuance distinctive, registre, intensité (1 à 4) et un exemple littéraire marquant.
Réponds uniquement en JSON valide conforme à cette structure :
{
  "intentionReformulee": "...",
  "conseilStylistique": "...",
  "motsProposes": [
    {
      "mot": "...",
      "categorie": "nom|verbe|adjectif",
      "pourquoiCeMot": "...",
      "nuanceDistinctive": "...",
      "intensite": 1,
      "registre": "littéraire|soutenu|courant",
      "exemplePhrase": "..."
    }
  ]
}`;

    const rawText = await this.executerRequeteGemini(prompt, true);
    if (!rawText) return null;

    try {
      const parsed = JSON.parse(rawText);
      return {
        intentionReformulee: parsed.intentionReformulee,
        conseilStylistique: parsed.conseilStylistique,
        motsProposes: (parsed.motsProposes || []).map((m: any) => ({
          ...m,
          estGenereIA: true
        })),
        source: 'ia_assistee'
      };
    } catch {
      return null;
    }
  }
}

export const aiService = new AIService();
