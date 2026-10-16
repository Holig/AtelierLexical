import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import {
  DonationAdminConfig,
  DonationPublicConfig,
  PromptKey,
  PromptDefinition,
  PromptsConfigMap
} from '../../../shared/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const DEFAULT_PROMPTS: Record<PromptKey, { titre: string; description: string; variables: string[]; template: string }> = {
  etymologie: {
    titre: 'Étymologie & Origine',
    description: 'Analyse philologique, racine linguistique et phonétique du mot.',
    variables: ['{mot}'],
    template: `Tu es un éminent philologue et lexicographe français.
Pour le mot « {mot} », donne une notice étymologique précise, noble et détaillée.
Indique la racine linguistique exacte (latin, grec, francique, ancien français, arabe, etc.), le mot source avec sa signification entre guillemets et son évolution sémantique jusqu'au français moderne.
Format d'écriture recommandé : « Du latin silentium (« action de se taire, silence »), dérivé de silere (« se taire, être tranquille »)... »
Sois précis, scientifique et concis (2 à 3 phrases claires).
Réponds UNIQUEMENT sous la forme d'un objet JSON strict :
{
  "etymologie": "Du latin...",
  "prononciation": "..." (optionnel, notation en Alphabet Phonétique International ex: \\si.lɑ̃s\\)
}`
  },
  synonymes: {
    titre: 'Synonymes Intelligents & Nuances',
    description: 'Enrichissement des nuances et synonymes avec degré d’intensité et contexte.',
    variables: ['{mot}', '{existants}'],
    template: `Tu es un maître de style et lexicographe littéraire français.
Pour le mot « {mot} », propose 6 synonymes ou équivalents nuancés de haute tenue stylistique, qui ne figurent PAS dans cette liste existante : [{existants}].

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
}`
  },
  antonymes: {
    titre: 'Antonymes & Oppositions',
    description: 'Contraste dramatique et oppositions directes ou contextuelles.',
    variables: ['{mot}', '{existants}'],
    template: `Tu es un linguiste et auteur littéraire francophone.
Pour le mot « {mot} », propose 6 antonymes ou oppositions dramatiques/stylistiques fortes, qui ne figurent PAS dans : [{existants}].

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
}`
  },
  champLexical: {
    titre: 'Champ Lexical & Associations',
    description: 'Associations conceptuelles, atmosphères sensorielles et symboliques.',
    variables: ['{mot}', '{existants}'],
    template: `Tu es un poète et styliste pour auteurs de fiction.
Pour le mot « {mot} », propose 8 à 10 termes évocateurs de son champ lexical, sensoriel et symbolique, qui ne figurent PAS dans : [{existants}].

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
}`
  },
  exemples: {
    titre: 'Exemples d’Usage & Tournures',
    description: 'Génération de 4 phrases originales (narratif, descriptif, dialogue, poétique).',
    variables: ['{mot}', '{registre}'],
    template: `Tu es un maître de style littéraire français de haute volée. Pour le mot "{mot}", génère 4 phrases d'exemple distinctes et inspirantes (1 narrative, 1 descriptive, 1 de dialogue, 1 poétique) dans un registre {registre}.
Respecte scrupuleusement le sens du mot sans contresens.
Réponds uniquement au format JSON valide contenant la clé "exemples" :
{
  "exemples": [
    {"texte": "phrase narrative...", "type": "narratif"},
    {"texte": "phrase descriptive...", "type": "descriptif"},
    {"texte": "phrase dialoguée...", "type": "dialogue"},
    {"texte": "phrase poétique...", "type": "poétique"}
  ]
}`
  },
  intention: {
    titre: 'Atelier de Nuances (Intention Stylistique)',
    description: 'Aide à la recherche du mot juste à partir d’une intention narrative.',
    variables: ['{idee}', '{emotion}', '{contexteNarratif}', '{registre}'],
    template: `Tu es un assistant de style pour écrivains de langue française.
L'auteur a pour intention d'écriture : "{idee}".
Émotion : "{emotion}". Contexte : "{contexteNarratif}". Registre : "{registre}".
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
}`
  }
};

interface AppConfigFile {
  donation: DonationAdminConfig;
  prompts?: Partial<Record<PromptKey, string>>;
}

const DEFAULT_CONFIG: AppConfigFile = {
  donation: {
    enabled: false,
    url: null,
    label: 'Soutenir le projet',
    updatedAt: new Date().toISOString()
  },
  prompts: {}
};

class ConfigService {
  private configFilePath: string;
  private currentConfig: AppConfigFile;
  // Tokens de session actifs : token -> expirationTimestamp
  private activeTokens: Map<string, number> = new Map();

  constructor() {
    const dataDir = path.resolve(__dirname, '../data');
    if (!fs.existsSync(dataDir)) {
      try {
        fs.mkdirSync(dataDir, { recursive: true });
      } catch (e) {
        console.warn('Impossible de créer le dossier data:', e);
      }
    }
    this.configFilePath = path.join(dataDir, 'app-config.json');
    this.currentConfig = this.loadConfig();
  }

  private loadConfig(): AppConfigFile {
    try {
      if (fs.existsSync(this.configFilePath)) {
        const raw = fs.readFileSync(this.configFilePath, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          donation: {
            enabled: Boolean(parsed.donation?.enabled),
            url: parsed.donation?.url ? String(parsed.donation.url).trim() : null,
            label: parsed.donation?.label ? String(parsed.donation.label).trim() : 'Soutenir le projet',
            updatedAt: parsed.donation?.updatedAt || new Date().toISOString()
          },
          prompts: parsed.prompts && typeof parsed.prompts === 'object' ? parsed.prompts : {}
        };
      }
    } catch (err) {
      console.warn('Erreur lecture app-config.json, utilisation des valeurs par défaut:', err);
    }
    return JSON.parse(JSON.stringify(DEFAULT_CONFIG));
  }

  /**
   * Retourne la liste des définitions de prompts avec templates actuels et par défaut
   */
  public getPrompts(): PromptDefinition[] {
    const keys = Object.keys(DEFAULT_PROMPTS) as PromptKey[];
    const stored = this.currentConfig.prompts || {};

    return keys.map(key => {
      const def = DEFAULT_PROMPTS[key];
      const custom = stored[key];
      const hasCustom = Boolean(custom && custom.trim().length > 0 && custom.trim() !== def.template.trim());

      return {
        key,
        titre: def.titre,
        description: def.description,
        variablesDisponibles: def.variables,
        template: hasCustom ? custom!.trim() : def.template.trim(),
        templateDefaut: def.template.trim(),
        estPersonnalise: hasCustom
      };
    });
  }

  /**
   * Retourne le template effectif pour un prompt donné
   */
  public getPromptTemplate(key: PromptKey): string {
    const stored = this.currentConfig.prompts?.[key];
    if (stored && stored.trim().length > 0) {
      return stored.trim();
    }
    return DEFAULT_PROMPTS[key]?.template.trim() || '';
  }

  /**
   * Interpole les variables {var} dans le prompt
   */
  public renderPrompt(key: PromptKey, variables: Record<string, string>): string {
    let tpl = this.getPromptTemplate(key);
    for (const [vKey, vVal] of Object.entries(variables)) {
      tpl = tpl.replace(new RegExp(`\\{${vKey}\\}`, 'g'), vVal);
    }
    return tpl;
  }

  /**
   * Met à jour un prompt personnalisé
   */
  public updatePrompt(key: PromptKey, template: string): { success: boolean; error?: string } {
    if (!DEFAULT_PROMPTS[key]) {
      return { success: false, error: `Clé de prompt inconnue : « ${key} »` };
    }
    if (!template || template.trim().length === 0) {
      return { success: false, error: 'Le prompt ne peut pas être vide.' };
    }

    if (!this.currentConfig.prompts) {
      this.currentConfig.prompts = {};
    }

    this.currentConfig.prompts[key] = template.trim();
    const ok = this.saveConfig();
    return { success: ok, error: ok ? undefined : 'Erreur lors de la sauvegarde du prompt.' };
  }

  /**
   * Met à jour plusieurs prompts à la fois
   */
  public updateAllPrompts(map: Partial<Record<PromptKey, string>>): { success: boolean; error?: string } {
    if (!this.currentConfig.prompts) {
      this.currentConfig.prompts = {};
    }

    for (const [k, v] of Object.entries(map)) {
      const key = k as PromptKey;
      if (DEFAULT_PROMPTS[key] && typeof v === 'string' && v.trim().length > 0) {
        this.currentConfig.prompts[key] = v.trim();
      }
    }

    const ok = this.saveConfig();
    return { success: ok, error: ok ? undefined : 'Erreur lors de la sauvegarde des prompts.' };
  }

  /**
   * Réinitialise un prompt spécifique ou tous les prompts aux valeurs par défaut
   */
  public resetPrompt(key?: PromptKey): { success: boolean } {
    if (!this.currentConfig.prompts) {
      this.currentConfig.prompts = {};
    }

    if (key) {
      delete this.currentConfig.prompts[key];
    } else {
      this.currentConfig.prompts = {};
    }

    const ok = this.saveConfig();
    return { success: ok };
  }

  private saveConfig(): boolean {
    try {
      fs.writeFileSync(this.configFilePath, JSON.stringify(this.currentConfig, null, 2), 'utf-8');
      return true;
    } catch (err) {
      console.error('Erreur écriture app-config.json:', err);
      return false;
    }
  }

  /**
   * Validation rigoureuse d'une URL de don
   * Accepte uniquement https:// (ou http://localhost en dev/test)
   * Rejette formellement javascript:, data:, vbscript:, et URLs relatives
   */
  public validateDonationUrl(urlStr: string | null | undefined): { isValid: boolean; error?: string } {
    if (!urlStr || urlStr.trim().length === 0) {
      return { isValid: true }; // Une URL vide ou nulle est valide (pour désactiver le lien)
    }

    const trimmed = urlStr.trim();

    // Rejet direct des protocoles dangereux
    const lower = trimmed.toLowerCase();
    if (lower.startsWith('javascript:') || lower.startsWith('data:') || lower.startsWith('vbscript:')) {
      return { isValid: false, error: 'Protocole non sécurisé rejeté.' };
    }

    try {
      const parsed = new URL(trimmed);
      const isHttps = parsed.protocol === 'https:';
      const isLocalHttp = parsed.protocol === 'http:' && (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1');

      if (!isHttps && !isLocalHttp) {
        return {
          isValid: false,
          error: 'Seules les adresses sécurisées HTTPS sont acceptées pour les liens de don externes.'
        };
      }

      if (!parsed.hostname || !parsed.hostname.includes('.')) {
        if (!isLocalHttp) {
          return { isValid: false, error: 'Le nom de domaine de l\'URL est invalide.' };
        }
      }

      return { isValid: true };
    } catch {
      return { isValid: false, error: 'Format d\'adresse URL invalide (doit commencer par https://).' };
    }
  }

  /**
   * Données publiques renvoyées aux visiteurs (page d'accueil)
   * Ne renvoie jamais de métadonnées internes ou de secrets
   */
  public getPublicDonationConfig(): DonationPublicConfig {
    const d = this.currentConfig.donation;
    return {
      enabled: Boolean(d.enabled && d.url),
      url: d.enabled && d.url ? d.url : null,
      label: d.label || 'Soutenir le projet'
    };
  }

  /**
   * Données complètes pour l'interface d'administration
   */
  public getAdminDonationConfig(): DonationAdminConfig {
    return { ...this.currentConfig.donation };
  }

  /**
   * Mise à jour de la configuration avec validation et persistance immédiate
   */
  public updateDonationConfig(data: {
    enabled?: boolean;
    url?: string | null;
    label?: string;
  }): { success: boolean; config?: DonationAdminConfig; error?: string } {
    const rawUrl = data.url !== undefined ? (data.url ? data.url.trim() : null) : this.currentConfig.donation.url;
    const urlValidation = this.validateDonationUrl(rawUrl);

    if (!urlValidation.isValid) {
      return { success: false, error: urlValidation.error };
    }

    const enabled = data.enabled !== undefined ? Boolean(data.enabled) : this.currentConfig.donation.enabled;

    // Si on active le don sans URL valide, on renvoie une erreur
    if (enabled && !rawUrl) {
      return { success: false, error: 'Une URL valide est requise pour activer le bouton de don.' };
    }

    const label = data.label !== undefined && data.label.trim()
      ? data.label.trim().slice(0, 80)
      : (this.currentConfig.donation.label || 'Soutenir le projet');

    this.currentConfig.donation = {
      enabled,
      url: rawUrl,
      label,
      updatedAt: new Date().toISOString()
    };

    const saved = this.saveConfig();
    if (!saved) {
      return { success: false, error: 'Erreur lors de la sauvegarde sur le serveur.' };
    }

    return { success: true, config: this.getAdminDonationConfig() };
  }

  /**
   * Réinitialisation ou suppression du lien
   */
  public resetDonationConfig(): DonationAdminConfig {
    this.currentConfig.donation = {
      enabled: false,
      url: null,
      label: 'Soutenir le projet',
      updatedAt: new Date().toISOString()
    };
    this.saveConfig();
    return this.getAdminDonationConfig();
  }

  /**
   * Vérification du mot de passe admin et émission d'un token sécurisé
   */
  public authenticateAdmin(password: string): { success: boolean; token?: string; error?: string } {
    const expectedPassword = process.env.ADMIN_PASSWORD || 'atelier-lexical-admin-2026';

    if (!password || typeof password !== 'string') {
      return { success: false, error: 'Mot de passe requis.' };
    }

    // Comparaison temporelle constante pour prévenir les attaques par timing
    const inputBuffer = Buffer.from(password);
    const expectedBuffer = Buffer.from(expectedPassword);

    const isMatch = inputBuffer.length === expectedBuffer.length &&
      crypto.timingSafeEqual(inputBuffer, expectedBuffer);

    if (!isMatch) {
      return { success: false, error: 'Mot de passe administrateur incorrect.' };
    }

    // Génération d'un token cryptographique aléatoire
    const token = crypto.randomBytes(32).toString('hex');
    // Expiration à 24h
    const expiration = Date.now() + 24 * 60 * 60 * 1000;
    this.activeTokens.set(token, expiration);

    // Nettoyage régulier des vieux tokens
    this.cleanExpiredTokens();

    return { success: true, token };
  }

  public verifyAdminToken(token: string | undefined): boolean {
    if (!token) return false;
    const expiration = this.activeTokens.get(token);
    if (!expiration) return false;
    if (Date.now() > expiration) {
      this.activeTokens.delete(token);
      return false;
    }
    return true;
  }

  public revokeToken(token: string): void {
    this.activeTokens.delete(token);
  }

  private cleanExpiredTokens(): void {
    const now = Date.now();
    for (const [token, exp] of this.activeTokens.entries()) {
      if (now > exp) {
        this.activeTokens.delete(token);
      }
    }
  }
}

export const configService = new ConfigService();
