import { Router, Request, Response } from 'express';
import { lexiconService } from '../services/lexicon.service';
import { wiktionaryService } from '../services/wiktionary.service';
import { conjugationService } from '../services/conjugation.service';
import { nuanceService } from '../services/nuance.service';
import { aiService } from '../services/ai.service';
import { normaliserMotRecherche } from '../utils/french';

export const lexiqueRouter = Router();

/**
 * GET /api/lexique/:word
 * Récupère la fiche lexicale complète d'un mot ou d'une locution
 */
lexiqueRouter.get('/lexique/:word', async (req: Request, res: Response) => {
  try {
    const rawWord = req.params.word;
    if (!rawWord || rawWord.trim().length === 0) {
      res.status(400).json({ error: 'Le paramètre de mot est requis.' });
      return;
    }

    const fiche = await lexiconService.getFicheLexicale(rawWord);
    if (!fiche) {
      // Proposer des suggestions proches
      const suggestions = await wiktionaryService.getSuggestions(rawWord);
      res.status(404).json({
        error: `Le mot « ${rawWord} » est introuvable dans les données lexicales.`,
        motRecherche: rawWord,
        suggestions
      });
      return;
    }

    res.json(fiche);
  } catch (err: any) {
    console.error('Erreur /api/lexique:', err);
    res.status(500).json({ error: 'Erreur interne lors de la consultation lexicale.' });
  }
});

/**
 * GET /api/search/suggestions?q=...
 * Autocomplétion dynamique et tolérante
 */
lexiqueRouter.get('/search/suggestions', async (req: Request, res: Response) => {
  try {
    const q = req.query.q as string;
    if (!q || q.trim().length === 0) {
      res.json([]);
      return;
    }

    const suggestions = await wiktionaryService.getSuggestions(q);
    res.json(suggestions);
  } catch (err) {
    console.error('Erreur /api/search/suggestions:', err);
    res.status(500).json({ error: 'Erreur lors de la recherche de suggestions.' });
  }
});

/**
 * GET /api/conjugaison/:verb
 * Tableaux de conjugaison française
 */
lexiqueRouter.get('/conjugaison/:verb', (req: Request, res: Response) => {
  try {
    const verb = req.params.verb;
    const conjugaison = conjugationService.conjuguer(verb);
    if (!conjugaison) {
      res.status(404).json({
        error: `Conjugaison indisponible pour le terme « ${verb} ». Assurez-vous qu'il s'agit d'un verbe à l'infinitif.`
      });
      return;
    }

    res.json(conjugaison);
  } catch (err) {
    console.error('Erreur /api/conjugaison:', err);
    res.status(500).json({ error: 'Erreur interne de conjugaison.' });
  }
});

/**
 * POST /api/stylistique/intention
 * Recherche d'expression par intention stylistique
 */
lexiqueRouter.post('/stylistique/intention', async (req: Request, res: Response) => {
  try {
    const { idee, emotion, intensite, registre, contexteNarratif, effetRecherche } = req.body;
    if (!idee || typeof idee !== 'string') {
      res.status(400).json({ error: 'Le champ « idee » est obligatoire.' });
      return;
    }

    const intention = {
      idee: idee.trim(),
      emotion: emotion ? String(emotion).trim() : undefined,
      intensite: intensite ? Number(intensite) as any : undefined,
      registre: registre ? String(registre) as any : undefined,
      contexteNarratif: contexteNarratif ? String(contexteNarratif) as any : undefined,
      effetRecherche: effetRecherche ? String(effetRecherche).trim() : undefined
    };

    // Utilise l'IA si configurée, sinon le moteur de nuances déterministe
    const resultat = await aiService.analyserIntentionStylistique(intention);
    res.json(resultat);
  } catch (err) {
    console.error('Erreur /api/stylistique/intention:', err);
    res.status(500).json({ error: 'Erreur lors du traitement de l’intention stylistique.' });
  }
});

/**
 * GET /api/stylistique/exemples?mot=...&registre=...
 * Générateur d'exemples littéraires typés
 */
lexiqueRouter.get('/stylistique/exemples', async (req: Request, res: Response) => {
  try {
    const mot = req.query.mot as string;
    const registre = (req.query.registre as string) || 'littéraire';
    if (!mot) {
      res.status(400).json({ error: 'Le paramètre « mot » est requis.' });
      return;
    }

    const exemples = await aiService.genererExemplesStylistiques(mot, registre);
    res.json(exemples);
  } catch (err) {
    console.error('Erreur /api/stylistique/exemples:', err);
    res.status(500).json({ error: 'Erreur lors de la génération d’exemples.' });
  }
});

/**
 * GET /api/config/ai-status
 * Retourne l'état de configuration de l'IA (sans révéler la clé)
 */
lexiqueRouter.get('/config/ai-status', (_req: Request, res: Response) => {
  res.json(aiService.getStatus());
});

/**
 * POST /api/config/ai-key
 * Permet à l'écrivain de renseigner sa clé API directement depuis l'interface
 */
lexiqueRouter.post('/config/ai-key', (req: Request, res: Response) => {
  try {
    const { provider, apiKey } = req.body;
    if (!provider || !['gemini', 'openai'].includes(provider)) {
      res.status(400).json({ error: 'Fournisseur invalide (gemini ou openai attendu).' });
      return;
    }

    aiService.setApiKey(provider, apiKey || '');
    res.json({
      success: true,
      message: `Clé API ${provider} configurée avec succès.`,
      status: aiService.getStatus()
    });
  } catch (err) {
    console.error('Erreur configuration clé API:', err);
    res.status(500).json({ error: 'Erreur lors de la configuration de la clé API.' });
  }
});

/**
 * POST /api/config/ai-test
 * Effectue un test de connectivité réel avec le fournisseur d'IA
 */
lexiqueRouter.post('/config/ai-test', async (_req: Request, res: Response) => {
  try {
    const resultat = await aiService.testConnection();
    res.json(resultat);
  } catch (err: any) {
    console.error('Erreur test connexion IA:', err);
    res.status(500).json({ success: false, message: `Erreur serveur : ${err.message}` });
  }
});

/**
 * GET /api/health
 */
lexiqueRouter.get('/health', (_req: Request, res: Response) => {
  res.json({
    statut: 'ok',
    version: '1.0.0',
    service: 'Atelier Lexical API',
    sources: {
      wiktionnaire: 'en ligne (CC BY-SA 4.0)',
      moteurNuances: 'actif',
      conjugueur: 'actif',
      iaOptionnelle: aiService.isAvailable() ? 'activée' : 'mode autonome (sans IA)'
    }
  });
});
