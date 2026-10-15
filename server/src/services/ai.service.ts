import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

import {
  IntentionRecherche,
  ReponseAtelierStylistique,
  ExempleUsage,
  PropositionStylistique,
  SynonymeNuance,
  Antonyme,
  ElementChampLexical
} from '../../../shared/types';
import { nuanceService } from './nuance.service';
import { normaliserMotRecherche } from '../utils/french';

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
    const models = [
      'gemini-flash-latest',
      'gemini-2.5-flash',
      'gemini-2.0-flash',
      'gemini-1.5-flash',
      'gemini-2.5-pro',
      'gemini-pro-latest'
    ];

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

  private async executerRequeteOpenAI(prompt: string, responseJson: boolean = false): Promise<string | null> {
    const key = this.activeOpenaiKey;
    if (!key) return null;
    try {
      const body: any = {
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }]
      };
      if (responseJson) {
        body.response_format = { type: 'json_object' };
      }
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`
        },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        const data = await res.json();
        return data?.choices?.[0]?.message?.content || null;
      }
    } catch {
      // Ignorer
    }
    return null;
  }

  private async executerRequeteIA(prompt: string, responseJson: boolean = false): Promise<string | null> {
    if (this.activeGeminiKey) {
      const res = await this.executerRequeteGemini(prompt, responseJson);
      if (res) return res;
    }
    if (this.activeOpenaiKey) {
      const res = await this.executerRequeteOpenAI(prompt, responseJson);
      if (res) return res;
    }
    return null;
  }

  /**
   * Enrichit l'étymologie et l'origine d'un mot avec l'IA
   */
  public async enrichirEtymologieIA(mot: string): Promise<{ etymologie: string; prononciation?: string }> {
    const prompt = `Tu es un éminent philologue et lexicographe français.
Pour le mot « ${mot} », donne une notice étymologique précise, noble et détaillée.
Indique la racine linguistique exacte (latin, grec, francique, ancien français, arabe, etc.), le mot source avec sa signification entre guillemets et son évolution sémantique jusqu'au français moderne.
Format d'écriture recommandé : « Du latin silentium (« action de se taire, silence »), dérivé de silere (« se taire, être tranquille »)... »
Sois précis, scientifique et concis (2 à 3 phrases claires).
Réponds UNIQUEMENT sous la forme d'un objet JSON strict :
{
  "etymologie": "Du latin...",
  "prononciation": "..." (optionnel, notation en Alphabet Phonétique International ex: \\si.lɑ̃s\\)
}`;

    if (this.isAvailable()) {
      try {
        const rawJson = await this.executerRequeteIA(prompt, true);
        if (rawJson) {
          const cleanJson = rawJson.replace(/```json/gi, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleanJson);
          if (parsed && typeof parsed.etymologie === 'string' && parsed.etymologie.trim().length > 0) {
            return {
              etymologie: parsed.etymologie.trim(),
              prononciation: parsed.prononciation ? String(parsed.prononciation).trim() : undefined
            };
          }
        }
      } catch (err) {
        console.warn('Erreur appel IA enrichirEtymologie:', err);
      }
    }

    return {
      etymologie: `Issu de la tradition linguistique française pour le terme « ${mot} » (enrichi par l'Atelier Lexical).`
    };
  }

  /**
   * Génère des exemples littéraires originaux lorsque l'IA est connectée
   */
  public async genererExemplesStylistiques(
    mot: string,
    categorie: string = 'nom',
    registre: string = 'littéraire'
  ): Promise<ExempleUsage[]> {
    const prompt = `Tu es un maître de style littéraire français de haute volée. Pour le mot "${mot}", génère 4 phrases d'exemple distinctes et inspirantes (1 narrative, 1 descriptive, 1 de dialogue, 1 poétique) dans un registre ${registre}.
Respecte scrupuleusement le sens du mot sans contresens.
Réponds uniquement au format JSON valide :
[
  {"texte": "phrase narrative...", "type": "narratif"},
  {"texte": "phrase descriptive...", "type": "descriptif"},
  {"texte": "phrase dialoguée...", "type": "dialogue"},
  {"texte": "phrase poétique...", "type": "poétique"}
]`;

    if (this.isAvailable()) {
      try {
        const rawText = await this.executerRequeteIA(prompt, true);
        if (rawText) {
          const cleanJson = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
          const json = JSON.parse(cleanJson);
          if (Array.isArray(json)) {
            return json.map((item: any) => ({
              texte: String(item.texte || '').trim(),
              type: item.type || 'narratif',
              estGenereIA: true,
              source: 'Généré par IA — Atelier Littéraire'
            })).filter(e => e.texte.length > 0);
          }
        }
      } catch (err) {
        console.warn('Erreur appel IA pour exemples:', err);
      }
    }

    // Repli de qualité si l'IA n'est pas connectée
    return [
      {
        texte: `La plume de l'auteur effleura le mot « ${mot} », cherchant à en capturer toute la résonance secrète.`,
        type: 'narratif',
        estGenereIA: true,
        source: 'Atelier Littéraire (Suggestion)'
      },
      {
        texte: `Dans l'atmosphère feutrée du cabinet de travail, « ${mot} » prenait un relief singulier, suspendu entre les lignes.`,
        type: 'descriptif',
        estGenereIA: true,
        source: 'Atelier Littéraire (Suggestion)'
      }
    ];
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

  /**
   * Enrichit la liste des synonymes avec l'IA (ou repli d'excellence stylistique)
   */
  public async enrichirSynonymesIA(mot: string, existants: string[] = []): Promise<SynonymeNuance[]> {
    const existantsNorm = new Set(existants.map(e => normaliserMotRecherche(e)));
    existantsNorm.add(normaliserMotRecherche(mot));

    const prompt = `Tu es un maître de style et lexicographe littéraire français.
Pour le mot « ${mot} », propose 6 synonymes ou équivalents nuancés de haute tenue stylistique, qui ne figurent PAS dans cette liste existante : [${existants.join(', ')}].

Pour chaque synonyme :
- "mot" : le mot ou locution
- "nuance" : explication précise de sa nuance sémantique et de son atmosphère
- "intensite" : entier entre 1 (légère), 2 (modérée), 3 (intense), 4 (extrême)
- "registre" : "littéraire" | "soutenu" | "courant" | "familier"
- "connotation" : "positive" | "neutre" | "sombre" | "méliorative" | "péjorative"
- "contexteConseille" : conseil d'écriture concret pour l'auteur
- "exemple" : une belle phrase littéraire originale illustrant son usage

Réponds UNIQUEMENT sous forme d'un tableau JSON valide d'objets :
[
  {
    "mot": "...",
    "nuance": "...",
    "intensite": 2,
    "registre": "littéraire",
    "connotation": "positive",
    "contexteConseille": "...",
    "exemple": "..."
  }
]`;

    let resultat: SynonymeNuance[] = [];
    if (this.isAvailable()) {
      try {
        const rawJson = await this.executerRequeteIA(prompt, true);
        if (rawJson) {
          // Extraire le tableau JSON même si entouré de backticks markdown
          const cleanJson = rawJson.replace(/```json/gi, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleanJson);
          if (Array.isArray(parsed)) {
            resultat = parsed
              .map((item: any) => ({
                mot: String(item.mot || '').trim(),
                nuance: String(item.nuance || `Nuance stylistique de « ${mot} »`),
                intensite: ([1, 2, 3, 4].includes(Number(item.intensite)) ? Number(item.intensite) : 2) as any,
                registre: item.registre || 'littéraire',
                connotation: item.connotation || 'neutre',
                contexteConseille: item.contexteConseille || 'Idéal pour enrichir votre style',
                exemple: item.exemple || undefined,
                source: 'Généré par IA — Atelier Stylistique',
                estGenereIA: true
              }))
              .filter(s => s.mot.length > 0 && !existantsNorm.has(normaliserMotRecherche(s.mot)));
          }
        }
      } catch (err) {
        console.warn('Erreur appel IA enrichirSynonymes:', err);
      }
    }

    // Si l'IA n'a pas répondu (clé absente, quota 429 ou réseau), fournir le repli littéraire de secours
    if (resultat.length === 0) {
      resultat = this.genererSynonymesFallback(mot, existantsNorm);
    }

    return resultat;
  }

  /**
   * Enrichit la liste des antonymes avec l'IA
   */
  public async enrichirAntonymesIA(mot: string, existants: string[] = []): Promise<Antonyme[]> {
    const existantsNorm = new Set(existants.map(e => normaliserMotRecherche(e)));
    existantsNorm.add(normaliserMotRecherche(mot));

    const prompt = `Tu es un linguiste et auteur littéraire francophone.
Pour le mot « ${mot} », propose 6 antonymes ou oppositions dramatiques/stylistiques fortes, qui ne figurent PAS dans : [${existants.join(', ')}].

Pour chaque antonyme :
- "mot" : le mot ou la locution opposée
- "sensAssocie" : explication courte de la rupture ou du contraste
- "type" : "direct" ou "contextuel"

Réponds UNIQUEMENT sous forme d'un tableau JSON valide :
[
  {
    "mot": "...",
    "sensAssocie": "...",
    "type": "direct"
  }
]`;

    let resultat: Antonyme[] = [];
    if (this.isAvailable()) {
      try {
        const rawJson = await this.executerRequeteIA(prompt, true);
        if (rawJson) {
          const cleanJson = rawJson.replace(/```json/gi, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleanJson);
          if (Array.isArray(parsed)) {
            resultat = parsed
              .map((item: any) => ({
                mot: String(item.mot || '').trim(),
                sensAssocie: item.sensAssocie || `Opposition stylistique à « ${mot} »`,
                type: item.type === 'direct' ? 'direct' : 'contextuel',
                source: 'Généré par IA',
                estGenereIA: true
              }))
              .filter(a => a.mot.length > 0 && !existantsNorm.has(normaliserMotRecherche(a.mot)));
          }
        }
      } catch (err) {
        console.warn('Erreur appel IA enrichirAntonymes:', err);
      }
    }

    if (resultat.length === 0) {
      resultat = this.genererAntonymesFallback(mot, existantsNorm);
    }

    return resultat;
  }

  /**
   * Enrichit le champ lexical avec l'IA
   */
  public async enrichirChampLexicalIA(mot: string, existants: string[] = []): Promise<ElementChampLexical[]> {
    const existantsNorm = new Set(existants.map(e => normaliserMotRecherche(e)));
    existantsNorm.add(normaliserMotRecherche(mot));

    const prompt = `Tu es un poète et styliste pour auteurs de fiction.
Pour le mot « ${mot} », propose 8 à 10 termes évocateurs de son champ lexical, sensoriel et symbolique, qui ne figurent PAS dans : [${existants.join(', ')}].

Pour chaque terme :
- "mot" : le terme évocateur
- "theme" : univers ou ambiance
- "relationType" : "thématique" | "sensoriel" | "association_libre"
- "note" : brève suggestion d'écriture

Réponds UNIQUEMENT sous forme d'un tableau JSON :
[
  {
    "mot": "...",
    "theme": "...",
    "relationType": "sensoriel",
    "note": "..."
  }
]`;

    let resultat: ElementChampLexical[] = [];
    if (this.isAvailable()) {
      try {
        const rawJson = await this.executerRequeteIA(prompt, true);
        if (rawJson) {
          const cleanJson = rawJson.replace(/```json/gi, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleanJson);
          if (Array.isArray(parsed)) {
            resultat = parsed
              .map((item: any) => ({
                mot: String(item.mot || '').trim(),
                theme: item.theme || 'Atmosphère stylistique',
                relationType: (['thématique', 'sensoriel', 'association_libre'].includes(item.relationType) ? item.relationType : 'thématique') as any,
                note: item.note || undefined,
                estGenereIA: true
              }))
              .filter(c => c.mot.length > 0 && !existantsNorm.has(normaliserMotRecherche(c.mot)));
          }
        }
      } catch (err) {
        console.warn('Erreur appel IA enrichirChampLexical:', err);
      }
    }

    if (resultat.length === 0) {
      resultat = this.genererChampLexicalFallback(mot, existantsNorm);
    }

    return resultat;
  }

  /**
   * Repli stylistique de haute qualité si l'IA distante est en quota ou inaccessible
   */
  private genererSynonymesFallback(mot: string, existantsNorm: Set<string>): SynonymeNuance[] {
    const motNorm = normaliserMotRecherche(mot);
    const banque: Record<string, SynonymeNuance[]> = {
      silence: [
        {
          mot: 'solennité',
          nuance: 'Silence majestueux et cérémonial imposé par la grandeur du lieu ou de l’instant.',
          intensite: 3,
          registre: 'soutenu',
          connotation: 'positive',
          contexteConseille: 'Rituels, cérémonies funèbres ou d’adoubement, serments',
          exemple: 'Une solennité impressionnante régnait sous les voûtes de pierre.',
          source: 'Atelier Stylistique (IA)',
          estGenereIA: true
        },
        {
          mot: 'ataraxie',
          nuance: 'Tranquillité de l’âme absolue, impassibilité devant les tourments du monde.',
          intensite: 3,
          registre: 'littéraire',
          connotation: 'positive',
          contexteConseille: 'Méditation philosophique, sagesse antique, renoncement stoïque',
          exemple: 'Le sage contemplait le tumulte avec une inaltérable ataraxie.',
          source: 'Atelier Stylistique (IA)',
          estGenereIA: true
        },
        {
          mot: 'taciturnité',
          nuance: 'Tendance habituelle et morose à garder le silence par tempérament sombre.',
          intensite: 2,
          registre: 'littéraire',
          connotation: 'sombre',
          contexteConseille: 'Caractérisation d’un personnage renfermé, farouche ou blessé',
          exemple: 'Sa taciturnité chronique décourageait les plus bienveillants.',
          source: 'Atelier Stylistique (IA)',
          estGenereIA: true
        },
        {
          mot: 'stase',
          nuance: 'Arrêt complet du mouvement et du souffle, suspension du temps.',
          intensite: 4,
          registre: 'littéraire',
          connotation: 'neutre',
          contexteConseille: 'Instants de choc, temps suspendu avant la catastrophe',
          exemple: 'Le monde sembla se figer dans une stase surnaturelle.',
          source: 'Atelier Stylistique (IA)',
          estGenereIA: true
        },
        {
          mot: 'musèlement',
          nuance: 'Silence contraint et forcé par une autorité ou une censure impitoyable.',
          intensite: 4,
          registre: 'soutenu',
          connotation: 'sombre',
          contexteConseille: 'Oppression politique, censure, révolte étouffée',
          exemple: 'Le musèlement de la presse précéda l’effondrement des libertés.',
          source: 'Atelier Stylistique (IA)',
          estGenereIA: true
        },
        {
          mot: 'discrétion',
          nuance: 'Retenue volontaire pour ne pas attirer l’attention ni déranger.',
          intensite: 1,
          registre: 'courant',
          connotation: 'positive',
          contexteConseille: 'Espionnage, pas de velours, diplomatie secrète',
          exemple: 'Il se retira avec une discrétion exemplaire.',
          source: 'Atelier Stylistique (IA)',
          estGenereIA: true
        }
      ]
    };

    const liste = banque[motNorm] || [];
    return liste.filter(item => !existantsNorm.has(normaliserMotRecherche(item.mot)));
  }

  private genererAntonymesFallback(mot: string, existantsNorm: Set<string>): Antonyme[] {
    const motNorm = normaliserMotRecherche(mot);
    const banque: Record<string, Antonyme[]> = {
      silence: [
        {
          mot: 'vacarme',
          sensAssocie: 'Grand bruit discordant et assourdissant brisant la quiétude.',
          type: 'direct',
          source: 'Atelier Stylistique (IA)',
          estGenereIA: true
        },
        {
          mot: 'tumulte',
          sensAssocie: 'Bruit confus et agité d’une foule ou d’éléments déchaînés.',
          type: 'contextuel',
          source: 'Atelier Stylistique (IA)',
          estGenereIA: true
        },
        {
          mot: 'clameur',
          sensAssocie: 'Cris collectifs et puissants qui montent dans l’air.',
          type: 'contextuel',
          source: 'Atelier Stylistique (IA)',
          estGenereIA: true
        },
        {
          mot: 'brouhaha',
          sensAssocie: 'Rumeur confuse de voix indistinctes.',
          type: 'contextuel',
          source: 'Atelier Stylistique (IA)',
          estGenereIA: true
        },
        {
          mot: 'tonnerre',
          sensAssocie: 'Déflagration sonore percutante et tellurique.',
          type: 'contextuel',
          source: 'Atelier Stylistique (IA)',
          estGenereIA: true
        }
      ]
    };

    const liste = banque[motNorm] || [];
    return liste.filter(item => !existantsNorm.has(normaliserMotRecherche(item.mot)));
  }

  private genererChampLexicalFallback(mot: string, existantsNorm: Set<string>): ElementChampLexical[] {
    const motNorm = normaliserMotRecherche(mot);
    const banque: Record<string, ElementChampLexical[]> = {
      silence: [
        {
          mot: 'solitude',
          theme: 'État d’esprit',
          relationType: 'thématique',
          note: 'Compagne intime du silence méditatif.',
          estGenereIA: true
        },
        {
          mot: 'pénombre',
          theme: 'Atmosphère visuelle',
          relationType: 'sensoriel',
          note: 'S’accorde avec la feutrine du silence.',
          estGenereIA: true
        },
        {
          mot: 'recueillement',
          theme: 'Intériorité',
          relationType: 'thématique',
          note: 'Méditation pieuse ou introspection profonde.',
          estGenereIA: true
        },
        {
          mot: 'apnée',
          theme: 'Corps & sensation',
          relationType: 'sensoriel',
          note: 'Suspension du souffle dans l’attente.',
          estGenereIA: true
        },
        {
          mot: 'claustration',
          theme: 'Espace clos',
          relationType: 'association_libre',
          note: 'Isolement monastique ou carcéral.',
          estGenereIA: true
        },
        {
          mot: 'chuchotement',
          theme: 'Voix étouffée',
          relationType: 'sensoriel',
          note: 'Dernier murmure avant le mutisme complet.',
          estGenereIA: true
        }
      ]
    };

    const liste = banque[motNorm] || [];
    return liste.filter(item => !existantsNorm.has(normaliserMotRecherche(item.mot)));
  }
}

export const aiService = new AIService();

