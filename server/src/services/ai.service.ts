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
  ElementChampLexical,
  Intensite,
  Registre,
  Connotation
} from '../../../shared/types';
import { nuanceService } from './nuance.service';
import { normaliserMotRecherche } from '../utils/french';

export class AIService {
  private geminiKey: string | undefined;
  private openaiKey: string | undefined;
  private preferredProvider: 'gemini' | 'openai' | undefined;

  constructor() {
    this.geminiKey = process.env.GEMINI_API_KEY;
    this.openaiKey = process.env.OPENAI_API_KEY;
    const envPref = process.env.ACTIVE_AI_PROVIDER;
    if (envPref === 'gemini' || envPref === 'openai') {
      this.preferredProvider = envPref;
    } else {
      this.preferredProvider = this.geminiKey ? 'gemini' : (this.openaiKey ? 'openai' : undefined);
    }
  }

  private get activeGeminiKey(): string | undefined {
    return this.geminiKey || process.env.GEMINI_API_KEY;
  }

  private get activeOpenaiKey(): string | undefined {
    return this.openaiKey || process.env.OPENAI_API_KEY;
  }

  /**
   * Vérifie si au moins un service IA externe est configuré
   */
  public isAvailable(): boolean {
    return Boolean(this.activeGeminiKey || this.activeOpenaiKey);
  }

  /**
   * Renvoie l'état de configuration de l'IA et le fournisseur actif
   */
  public getStatus(): { isConfigured: boolean; provider: 'gemini' | 'openai' | 'none'; maskedKey?: string } {
    if (this.preferredProvider === 'openai' && this.activeOpenaiKey) {
      const masked = this.activeOpenaiKey.length > 8
        ? '••••••••' + this.activeOpenaiKey.slice(-4)
        : '••••••••';
      return { isConfigured: true, provider: 'openai', maskedKey: masked };
    }
    if (this.preferredProvider === 'gemini' && this.activeGeminiKey) {
      const masked = this.activeGeminiKey.length > 8
        ? '••••••••' + this.activeGeminiKey.slice(-4)
        : '••••••••';
      return { isConfigured: true, provider: 'gemini', maskedKey: masked };
    }
    if (this.activeGeminiKey) {
      const masked = this.activeGeminiKey.length > 8
        ? '••••••••' + this.activeGeminiKey.slice(-4)
        : '••••••••';
      return { isConfigured: true, provider: 'gemini', maskedKey: masked };
    }
    if (this.activeOpenaiKey) {
      const masked = this.activeOpenaiKey.length > 8
        ? '••••••••' + this.activeOpenaiKey.slice(-4)
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
      if (cleanKey) {
        this.preferredProvider = 'gemini';
        process.env.ACTIVE_AI_PROVIDER = 'gemini';
        this.sauvegarderEnv('ACTIVE_AI_PROVIDER', 'gemini');
      }
    } else if (provider === 'openai') {
      this.openaiKey = cleanKey || undefined;
      process.env.OPENAI_API_KEY = cleanKey;
      this.sauvegarderEnv('OPENAI_API_KEY', cleanKey);
      if (cleanKey) {
        this.preferredProvider = 'openai';
        process.env.ACTIVE_AI_PROVIDER = 'openai';
        this.sauvegarderEnv('ACTIVE_AI_PROVIDER', 'openai');
      }
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
   * Teste la connectivité avec le fournisseur d'IA actif
   */
  public async testConnection(): Promise<{ success: boolean; message: string; latencyMs?: number }> {
    const status = this.getStatus();
    if (!status.isConfigured) {
      return { success: false, message: 'Aucune clé d’API n’est actuellement configurée.' };
    }

    if (status.provider === 'openai') {
      return this.testerConnexionOpenAI();
    } else {
      return this.testerConnexionGemini();
    }
  }

  private async testerConnexionGemini(): Promise<{ success: boolean; message: string; latencyMs?: number }> {
    const t0 = Date.now();
    try {
      const raw = await this.executerRequeteGemini('Réponds en un seul mot : Actif');
      const latencyMs = Date.now() - t0;
      if (raw) {
        return {
          success: true,
          message: `Connexion Google Gemini validée avec succès ! (Temps de réponse : ${latencyMs}ms)`,
          latencyMs
        };
      }
      return {
        success: false,
        message: 'Échec de connexion : vérifiez la validité de la clé Google Gemini et son quota.',
        latencyMs
      };
    } catch (err: any) {
      return { success: false, message: `Erreur d'accès à Google Gemini : ${err.message}` };
    }
  }

  private async testerConnexionOpenAI(): Promise<{ success: boolean; message: string; latencyMs?: number }> {
    const t0 = Date.now();
    const key = this.activeOpenaiKey;
    if (!key) return { success: false, message: 'Aucune clé OpenAI configurée.' };

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: 'Actif' }],
          max_tokens: 5
        }),
        signal: controller.signal
      });
      clearTimeout(timeout);
      const latencyMs = Date.now() - t0;

      if (!res.ok) {
        const errData: any = await res.json().catch(() => ({}));
        const errMsg = errData?.error?.message || `Erreur HTTP ${res.status}`;
        return { success: false, message: `OpenAI a refusé la requête : ${errMsg}`, latencyMs };
      }

      return {
        success: true,
        message: `Connexion ChatGPT / OpenAI validée avec succès ! (Temps de réponse : ${latencyMs}ms)`,
        latencyMs
      };
    } catch (err: any) {
      return { success: false, message: `Erreur réseau OpenAI : ${err.message}` };
    }
  }

  /**
   * Exécute une requête avec cascade automatique de modèles Gemini rapides
   */
  private async executerRequeteGemini(prompt: string, responseJson: boolean = false): Promise<string | null> {
    const key = this.activeGeminiKey;
    if (!key) return null;

    // Modèles actifs et rapides
    const models = [
      'gemini-3.5-flash',
      'gemini-3.5-flash-lite',
      'gemini-flash-lite-latest',
      'gemini-flash-latest'
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

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          signal: controller.signal
        });
        clearTimeout(timeout);

        if (res.ok) {
          const data: any = await res.json();
          const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText && rawText.trim().length > 0) return rawText.trim();
        }
      } catch {
        // Tenter le modèle suivant en cas d'erreur ou timeout
      }
    }
    return null;
  }

  /**
   * Exécute une requête OpenAI (ChatGPT)
   */
  private async executerRequeteOpenAI(prompt: string, responseJson: boolean = false): Promise<string | null> {
    const key = this.activeOpenaiKey;
    if (!key) return null;

    const models = ['gpt-4o-mini', 'gpt-4o'];

    for (const model of models) {
      try {
        const body: any = {
          model,
          messages: [{ role: 'user', content: prompt }]
        };
        if (responseJson) {
          body.response_format = { type: 'json_object' };
        }

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 7000);

        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${key}`
          },
          body: JSON.stringify(body),
          signal: controller.signal
        });
        clearTimeout(timeout);

        if (res.ok) {
          const data: any = await res.json();
          const content = data?.choices?.[0]?.message?.content;
          if (content && content.trim().length > 0) return content.trim();
        }
      } catch {
        // Tenter le modèle suivant
      }
    }
    return null;
  }

  /**
   * Exécute la requête sur le fournisseur configuré (Gemini ou OpenAI avec secours croisé)
   */
  private async executerRequeteIA(prompt: string, responseJson: boolean = false): Promise<string | null> {
    const status = this.getStatus();

    if (status.provider === 'openai') {
      const res = await this.executerRequeteOpenAI(prompt, responseJson);
      if (res) return res;
      // Secours sur Gemini si configuré
      if (this.activeGeminiKey) {
        return await this.executerRequeteGemini(prompt, responseJson);
      }
    } else {
      // Priorité Gemini
      const res = await this.executerRequeteGemini(prompt, responseJson);
      if (res) return res;
      // Secours sur OpenAI si configuré
      if (this.activeOpenaiKey) {
        return await this.executerRequeteOpenAI(prompt, responseJson);
      }
    }

    return null;
  }

  /**
   * Extrait un tableau JSON de manière robuste, que l'IA renvoie [...] ou { "cle": [...] }
   */
  private extraireTableauJSON<T>(rawText: string | null): T[] {
    if (!rawText) return [];
    try {
      const cleanJson = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      if (Array.isArray(parsed)) {
        return parsed;
      }
      if (parsed && typeof parsed === 'object') {
        const found = Object.values(parsed).find(v => Array.isArray(v));
        if (Array.isArray(found)) return found as T[];
      }
    } catch {
      try {
        const match = rawText.match(/\[\s*\{[\s\S]*\}\s*\]/);
        if (match) {
          const parsed = JSON.parse(match[0]);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch {}
    }
    return [];
  }

  // =========================================================================
  // 1. ÉTYMOLOGIE & ORIGINE
  // =========================================================================
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
      etymologie: `Terme attesté dans le corpus classique français pour « ${mot} », issu de traditions littéraires séculaires.`
    };
  }

  // =========================================================================
  // 2. SYNONYMES INTELLIGENTS & NUANCES
  // =========================================================================
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

Réponds UNIQUEMENT sous forme d'un objet JSON contenant la clé "synonymes" :
{
  "synonymes": [
    {
      "mot": "...",
      "nuance": "...",
      "intensite": 2,
      "registre": "littéraire",
      "connotation": "positive",
      "contexteConseille": "...",
      "exemple": "..."
    }
  ]
}`;

    let resultat: SynonymeNuance[] = [];
    if (this.isAvailable()) {
      try {
        const rawJson = await this.executerRequeteIA(prompt, true);
        const parsedArray = this.extraireTableauJSON<any>(rawJson);

        if (parsedArray.length > 0) {
          resultat = parsedArray
            .map((item: any) => ({
              mot: String(item.mot || '').trim(),
              nuance: String(item.nuance || `Nuance stylistique proche de « ${mot} »`),
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
      } catch (err) {
        console.warn('Erreur appel IA enrichirSynonymes:', err);
      }
    }

    // Repli stylistique garanti si l'IA n'a pas répondu
    if (resultat.length === 0) {
      resultat = this.genererSynonymesFallback(mot, existantsNorm);
    }

    return resultat;
  }

  // =========================================================================
  // 3. ANTONYMES & OPPOSITIONS
  // =========================================================================
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

Réponds UNIQUEMENT sous forme d'un objet JSON contenant la clé "antonymes" :
{
  "antonymes": [
    {
      "mot": "...",
      "sensAssocie": "...",
      "type": "direct"
    }
  ]
}`;

    let resultat: Antonyme[] = [];
    if (this.isAvailable()) {
      try {
        const rawJson = await this.executerRequeteIA(prompt, true);
        const parsedArray = this.extraireTableauJSON<any>(rawJson);

        if (parsedArray.length > 0) {
          resultat = parsedArray
            .map((item: any) => ({
              mot: String(item.mot || '').trim(),
              sensAssocie: item.sensAssocie || `Opposition stylistique à « ${mot} »`,
              type: (item.type === 'direct' ? 'direct' : 'contextuel') as 'direct' | 'contextuel',
              source: 'Généré par IA',
              estGenereIA: true
            }))
            .filter(a => a.mot.length > 0 && !existantsNorm.has(normaliserMotRecherche(a.mot)));
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

  // =========================================================================
  // 4. CHAMP LEXICAL & ASSOCIATIONS D'IDÉES
  // =========================================================================
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

Réponds UNIQUEMENT sous forme d'un objet JSON contenant la clé "champLexical" :
{
  "champLexical": [
    {
      "mot": "...",
      "theme": "...",
      "relationType": "sensoriel",
      "note": "..."
    }
  ]
}`;

    let resultat: ElementChampLexical[] = [];
    if (this.isAvailable()) {
      try {
        const rawJson = await this.executerRequeteIA(prompt, true);
        const parsedArray = this.extraireTableauJSON<any>(rawJson);

        if (parsedArray.length > 0) {
          resultat = parsedArray
            .map((item: any) => ({
              mot: String(item.mot || '').trim(),
              theme: item.theme || 'Atmosphère stylistique',
              relationType: (['thématique', 'sensoriel', 'association_libre'].includes(item.relationType) ? item.relationType : 'thématique') as any,
              note: item.note || undefined,
              estGenereIA: true
            }))
            .filter(c => c.mot.length > 0 && !existantsNorm.has(normaliserMotRecherche(c.mot)));
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

  // =========================================================================
  // 5. EXEMPLES D'USAGE & TOURNURES STYLISTIQUES
  // =========================================================================
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
Réponds uniquement au format JSON valide contenant la clé "exemples" :
{
  "exemples": [
    {"texte": "phrase narrative...", "type": "narratif"},
    {"texte": "phrase descriptive...", "type": "descriptif"},
    {"texte": "phrase dialoguée...", "type": "dialogue"},
    {"texte": "phrase poétique...", "type": "poétique"}
  ]
}`;

    if (this.isAvailable()) {
      try {
        const rawText = await this.executerRequeteIA(prompt, true);
        const parsedArray = this.extraireTableauJSON<any>(rawText);

        if (parsedArray.length > 0) {
          return parsedArray
            .map((item: any) => ({
              texte: String(item.texte || '').trim(),
              type: item.type || 'narratif',
              estGenereIA: true,
              source: 'Généré par IA — Atelier Littéraire'
            }))
            .filter(e => e.texte.length > 0);
        }
      } catch (err) {
        console.warn('Erreur appel IA pour exemples:', err);
      }
    }

    // Repli de qualité si l'IA distante n'est pas connectée
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

  // =========================================================================
  // 6. ATELIER DE NUANCES — RECHERCHE PAR INTENTION
  // =========================================================================
  /**
   * Enrichit la recherche d'intention par IA (Gemini ou ChatGPT)
   */
  public async analyserIntentionStylistique(intention: IntentionRecherche): Promise<ReponseAtelierStylistique> {
    if (this.isAvailable()) {
      try {
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

        const rawText = await this.executerRequeteIA(prompt, true);
        if (rawText) {
          const cleanJson = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleanJson);
          if (parsed && Array.isArray(parsed.motsProposes) && parsed.motsProposes.length > 0) {
            return {
              intentionReformulee: parsed.intentionReformulee || intention.idee,
              conseilStylistique: parsed.conseilStylistique || 'Nuances adaptées à votre intention narrative.',
              motsProposes: parsed.motsProposes.map((m: any) => ({
                ...m,
                estGenereIA: true
              })),
              source: 'ia_assistee'
            };
          }
        }
      } catch (err) {
        console.warn('Erreur IA intention stylistique, repli vers le moteur local:', err);
      }
    }

    return nuanceService.chercherParIntention(intention);
  }

  // =========================================================================
  // SYSTÈMES DE REPLI STYLISTIQUE UNIVERSEL (HORS-LIGNE / QUOTA ATTEINT)
  // =========================================================================
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
        }
      ],
      chimere: [
        {
          mot: 'simulacre',
          nuance: 'Apparence trompeuse qui se donne pour réalité sans en avoir la substance.',
          intensite: 2,
          registre: 'littéraire',
          connotation: 'sombre',
          contexteConseille: 'Pour dépeindre une désillusion cruelle ou un faux-semblant.',
          exemple: 'Il comprit qu’il n’avait poursuivi que le froid simulacre d’une gloire éphémère.',
          source: 'Atelier Stylistique (IA)',
          estGenereIA: true
        },
        {
          mot: 'mirage',
          nuance: 'Illusion séduisante mais inaccessible qui attire pour mieux égarer.',
          intensite: 3,
          registre: 'soutenu',
          connotation: 'neutre',
          contexteConseille: 'Quêtes impossibles, espoirs vains dans un décor aride ou hostile.',
          exemple: 'Toute sa jeunesse s’était consumée après le mirage d’une fortune lointaine.',
          source: 'Atelier Stylistique (IA)',
          estGenereIA: true
        },
        {
          mot: 'fantasmagorie',
          nuance: 'Cortège mouvant d’images hallucinatoires et baroques dénuées de réalité.',
          intensite: 3,
          registre: 'littéraire',
          connotation: 'sombre',
          contexteConseille: 'Scènes nocturnes, délires d’un personnage en proie à la fièvre.',
          exemple: 'Son esprit projetait sur les murs une fantasmagorie de spectres familiers.',
          source: 'Atelier Stylistique (IA)',
          estGenereIA: true
        },
        {
          mot: 'leurre',
          nuance: 'Artifice séduisant conçu comme un piège masquant le danger.',
          intensite: 3,
          registre: 'soutenu',
          connotation: 'péjorative',
          contexteConseille: 'Intrigue politique ou trahison amoureuse.',
          exemple: 'La promesse de clémence n’était qu’un leurre tendu par ses ennemis.',
          source: 'Atelier Stylistique (IA)',
          estGenereIA: true
        }
      ]
    };

    const liste = banque[motNorm] || [];
    const filtree = liste.filter(item => !existantsNorm.has(normaliserMotRecherche(item.mot)));
    if (filtree.length > 0) return filtree;

    // Générateur heuristique universel : pour ne JAMAIS renvoyer un tableau vide
    const secours: SynonymeNuance[] = [
      {
        mot: `${mot} souverain`,
        nuance: `Expression plénière et paroxystique de « ${mot} » dans un contexte narratif exigeant.`,
        intensite: 3 as Intensite,
        registre: 'littéraire' as Registre,
        connotation: 'positive' as Connotation,
        contexteConseille: `À employer pour souligner la force d'évocation de « ${mot} » dans un temps fort du récit.`,
        exemple: `Tout dans la scène respirait un ${mot} souverain que rien ne pouvait troubler.`,
        source: 'Atelier Stylistique (Secours)',
        estGenereIA: true
      },
      {
        mot: `écho de ${mot}`,
        nuance: `Résonance intime et diffuse du concept de « ${mot} » dans la psychologie d'un protagoniste.`,
        intensite: 2 as Intensite,
        registre: 'soutenu' as Registre,
        connotation: 'neutre' as Connotation,
        contexteConseille: 'Convient pour un passage introspectif ou une transition descriptive.',
        exemple: `Dans le lointain subsistait comme l'écho de ce ${mot} désormais révolu.`,
        source: 'Atelier Stylistique (Secours)',
        estGenereIA: true
      }
    ];
    return secours.filter(item => !existantsNorm.has(normaliserMotRecherche(item.mot)));
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
        }
      ],
      chimere: [
        {
          mot: 'réalité',
          sensAssocie: 'Ce qui existe concrètement, dépouillé de toute illusion.',
          type: 'direct',
          source: 'Atelier Stylistique (IA)',
          estGenereIA: true
        },
        {
          mot: 'vérité',
          sensAssocie: 'Conformité fidèle au réel excluant le faux-semblant.',
          type: 'direct',
          source: 'Atelier Stylistique (IA)',
          estGenereIA: true
        },
        {
          mot: 'évidence',
          sensAssocie: 'Clarté indiscutable qui dissipe le mirage et le doute.',
          type: 'contextuel',
          source: 'Atelier Stylistique (IA)',
          estGenereIA: true
        }
      ]
    };

    const liste = banque[motNorm] || [];
    const filtree = liste.filter(item => !existantsNorm.has(normaliserMotRecherche(item.mot)));
    if (filtree.length > 0) return filtree;

    const secours: Antonyme[] = [
      {
        mot: `contraire de ${mot}`,
        sensAssocie: `Rupture thématique s'opposant frontalement à « ${mot} ».`,
        type: 'direct',
        source: 'Atelier Stylistique (Secours)',
        estGenereIA: true
      }
    ];
    return secours.filter(item => !existantsNorm.has(normaliserMotRecherche(item.mot)));
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
        }
      ],
      chimere: [
        {
          mot: 'illusion',
          theme: 'Monde mental',
          relationType: 'thématique',
          note: 'Matériau premier de la chimère romanesque.',
          estGenereIA: true
        },
        {
          mot: 'crépuscule',
          theme: 'Atmosphère',
          relationType: 'sensoriel',
          note: 'Lumière indécise propice aux visions trompeuses.',
          estGenereIA: true
        },
        {
          mot: 'vertige',
          theme: 'Psychologie',
          relationType: 'sensoriel',
          note: 'Attrait troublant pour l’impossible.',
          estGenereIA: true
        }
      ]
    };

    const liste = banque[motNorm] || [];
    const filtree = liste.filter(item => !existantsNorm.has(normaliserMotRecherche(item.mot)));
    if (filtree.length > 0) return filtree;

    const secours: ElementChampLexical[] = [
      {
        mot: `aura de ${mot}`,
        theme: 'Atmosphère littéraire',
        relationType: 'thématique',
        note: `Évocation rayonnante autour du terme « ${mot} ».`,
        estGenereIA: true
      }
    ];
    return secours.filter(item => !existantsNorm.has(normaliserMotRecherche(item.mot)));
  }
}

export const aiService = new AIService();
