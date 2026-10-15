import {
  FicheLexicale,
  FicheConjugaison,
  IntentionRecherche,
  ReponseAtelierStylistique,
  ExempleUsage
} from '../../../shared/types';

export class ApiClient {
  public static async getFicheLexicale(mot: string): Promise<FicheLexicale> {
    const res = await fetch(`/api/lexique/${encodeURIComponent(mot)}`);
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      const message = errData.error || `Erreur ${res.status}: mot introuvable`;
      const error: any = new Error(message);
      error.suggestions = errData.suggestions || [];
      throw error;
    }
    return res.json();
  }

  public static async getSuggestions(query: string): Promise<string[]> {
    if (!query.trim()) return [];
    const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}`);
    if (!res.ok) return [];
    return res.json();
  }

  public static async getConjugaison(verbe: string): Promise<FicheConjugaison> {
    const res = await fetch(`/api/conjugaison/${encodeURIComponent(verbe)}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Erreur lors de la récupération de la conjugaison');
    }
    return res.json();
  }

  public static async chercherIntentionStylistique(
    intention: IntentionRecherche
  ): Promise<ReponseAtelierStylistique> {
    const res = await fetch('/api/stylistique/intention', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(intention)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Erreur lors de l’analyse d’intention stylistique');
    }
    return res.json();
  }

  public static async genererExemples(mot: string, registre: string = 'littéraire'): Promise<ExempleUsage[]> {
    const res = await fetch(`/api/stylistique/exemples?mot=${encodeURIComponent(mot)}&registre=${encodeURIComponent(registre)}`);
    if (!res.ok) return [];
    return res.json();
  }

  public static async getAiStatus(): Promise<{ isConfigured: boolean; provider: 'gemini' | 'openai' | 'none'; maskedKey?: string }> {
    const res = await fetch('/api/config/ai-status');
    if (!res.ok) return { isConfigured: false, provider: 'none' };
    return res.json();
  }

  public static async setAiKey(provider: 'gemini' | 'openai', apiKey: string): Promise<boolean> {
    const res = await fetch('/api/config/ai-key', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider, apiKey })
    });
    return res.ok;
  }

  public static async testAiConnection(): Promise<{ success: boolean; message: string; latencyMs?: number }> {
    const res = await fetch('/api/config/ai-test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) {
      return { success: false, message: `Erreur HTTP ${res.status}` };
    }
    return res.json();
  }
}
