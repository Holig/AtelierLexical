import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { DonationAdminConfig, DonationPublicConfig } from '../../../shared/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface AppConfigFile {
  donation: DonationAdminConfig;
}

const DEFAULT_CONFIG: AppConfigFile = {
  donation: {
    enabled: false,
    url: null,
    label: 'Soutenir le projet',
    updatedAt: new Date().toISOString()
  }
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
          }
        };
      }
    } catch (err) {
      console.warn('Erreur lecture app-config.json, utilisation des valeurs par défaut:', err);
    }
    return JSON.parse(JSON.stringify(DEFAULT_CONFIG));
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
