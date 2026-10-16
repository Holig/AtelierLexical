import { Router, Request, Response, NextFunction } from 'express';
import { configService } from '../services/config.service';

export const donationRouter = Router();

/**
 * Middleware de protection des routes d'administration
 * Vérifie le Bearer token dans le header Authorization ou X-Admin-Token
 */
export const requireAdminAuth = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  let token: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (req.headers['x-admin-token']) {
    token = String(req.headers['x-admin-token']).trim();
  }

  if (!token || !configService.verifyAdminToken(token)) {
    res.status(401).json({
      error: 'Accès non autorisé. Veuillez vous connecter en tant qu\'administrateur.'
    });
    return;
  }

  next();
};

/**
 * GET /api/donation
 * Route publique : retourne l'état et l'URL du bouton de don pour la page d'accueil
 */
donationRouter.get('/donation', (_req: Request, res: Response) => {
  const config = configService.getPublicDonationConfig();
  res.json(config);
});

/**
 * POST /api/admin/auth/login
 * Authentification de l'administrateur avec mot de passe
 */
donationRouter.post('/admin/auth/login', (req: Request, res: Response) => {
  try {
    const { password } = req.body;
    const authResult = configService.authenticateAdmin(password);

    if (!authResult.success) {
      res.status(401).json({ error: authResult.error || 'Identifiants invalides.' });
      return;
    }

    res.json({
      success: true,
      token: authResult.token,
      message: 'Authentification administrateur réussie.'
    });
  } catch (err) {
    console.error('Erreur login admin:', err);
    res.status(500).json({ error: 'Erreur interne lors de la connexion.' });
  }
});

/**
 * GET /api/admin/auth/verify
 * Vérifie si le token d'administration actuel est encore valide
 */
donationRouter.get('/admin/auth/verify', requireAdminAuth, (_req: Request, res: Response) => {
  res.json({ valid: true });
});

/**
 * POST /api/admin/auth/logout
 * Révocation de session admin
 */
donationRouter.post('/admin/auth/logout', (req: Request, res: Response) => {
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    configService.revokeToken(authHeader.substring(7).trim());
  }
  res.json({ success: true, message: 'Déconnexion effectuée.' });
});

/**
 * GET /api/admin/donation
 * Route protégée : consultation complète de la configuration du lien de don
 */
donationRouter.get('/admin/donation', requireAdminAuth, (_req: Request, res: Response) => {
  const config = configService.getAdminDonationConfig();
  res.json(config);
});

/**
 * PUT /api/admin/donation
 * Route protégée : mise à jour et validation de l'URL et du statut du don
 */
donationRouter.put('/admin/donation', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const { enabled, url, label } = req.body;
    const updateResult = configService.updateDonationConfig({
      enabled,
      url,
      label
    });

    if (!updateResult.success) {
      res.status(400).json({ error: updateResult.error });
      return;
    }

    res.json({
      success: true,
      message: 'Configuration du don enregistrée avec succès.',
      config: updateResult.config
    });
  } catch (err) {
    console.error('Erreur mise à jour configuration don:', err);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la configuration.' });
  }
});

/**
 * DELETE /api/admin/donation
 * Route protégée : réinitialisation et suppression du lien de don
 */
donationRouter.delete('/admin/donation', requireAdminAuth, (_req: Request, res: Response) => {
  try {
    const resetConfig = configService.resetDonationConfig();
    res.json({
      success: true,
      message: 'Lien de don réinitialisé et désactivé.',
      config: resetConfig
    });
  } catch (err) {
    console.error('Erreur réinitialisation configuration don:', err);
    res.status(500).json({ error: 'Erreur lors de la réinitialisation.' });
  }
});

/**
 * =========================================================================
 * GESTION & ÉDITION DES PROMPTS IA (ADMINISTRATION)
 * =========================================================================
 */

/**
 * GET /api/admin/prompts
 * Route protégée : consultation des prompts actuels, templates par défaut et variables
 */
donationRouter.get('/admin/prompts', requireAdminAuth, (_req: Request, res: Response) => {
  try {
    const prompts = configService.getPrompts();
    res.json({
      success: true,
      prompts
    });
  } catch (err) {
    console.error('Erreur récupération prompts admin:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des prompts.' });
  }
});

/**
 * PUT /api/admin/prompts
 * Route protégée : mise à jour d'un ou de plusieurs prompts personnalisés
 */
donationRouter.put('/admin/prompts', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const { key, template, prompts } = req.body;

    if (key && typeof template === 'string') {
      const updateResult = configService.updatePrompt(key, template);
      if (!updateResult.success) {
        res.status(400).json({ error: updateResult.error });
        return;
      }
    } else if (prompts && typeof prompts === 'object') {
      const updateResult = configService.updateAllPrompts(prompts);
      if (!updateResult.success) {
        res.status(400).json({ error: updateResult.error });
        return;
      }
    } else {
      res.status(400).json({ error: 'Paramètres manquants : spécifiez "key" et "template" ou un dictionnaire "prompts".' });
      return;
    }

    res.json({
      success: true,
      message: 'Prompt(s) mis à jour avec succès.',
      prompts: configService.getPrompts()
    });
  } catch (err) {
    console.error('Erreur mise à jour prompts admin:', err);
    res.status(500).json({ error: 'Erreur lors de la mise à jour des prompts.' });
  }
});

/**
 * POST /api/admin/prompts/reset
 * Route protégée : réinitialisation d'un prompt ciblé ou de tous les prompts aux valeurs usine
 */
donationRouter.post('/admin/prompts/reset', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const { key } = req.body || {};
    configService.resetPrompt(key);
    res.json({
      success: true,
      message: key ? `Le prompt « ${key} » a été réinitialisé à sa valeur d'origine.` : 'Tous les prompts ont été réinitialisés aux valeurs par défaut.',
      prompts: configService.getPrompts()
    });
  } catch (err) {
    console.error('Erreur réinitialisation prompts admin:', err);
    res.status(500).json({ error: 'Erreur lors de la réinitialisation des prompts.' });
  }
});

