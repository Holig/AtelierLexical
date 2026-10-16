import React, { useState, useEffect } from 'react';
import { ApiClient } from '../services/api';
import { DonationAdminConfig } from '../../../shared/types';
import {
  Lock,
  Unlock,
  Heart,
  Save,
  RotateCcw,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Eye,
  LogOut,
  ShieldCheck,
  Globe
} from 'lucide-react';

interface AdminDonationPageProps {
  onBackToApp: () => void;
  onBackToHome: () => void;
}

export const AdminDonationPage: React.FC<AdminDonationPageProps> = ({
  onBackToApp,
  onBackToHome
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);
  const [password, setPassword] = useState<string>('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  // Configuration du don
  const [config, setConfig] = useState<DonationAdminConfig | null>(null);
  const [enabled, setEnabled] = useState<boolean>(false);
  const [url, setUrl] = useState<string>('');
  const [label, setLabel] = useState<string>('Soutenir le projet');

  // Messages de statut
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [urlValidationError, setUrlValidationError] = useState<string | null>(null);

  // Vérifier la session existante
  useEffect(() => {
    ApiClient.verifyAdminAuth().then(isValid => {
      setIsAuthenticated(isValid);
      setIsCheckingAuth(false);
      if (isValid) {
        loadConfig();
      }
    });
  }, []);

  const loadConfig = async () => {
    try {
      const cfg = await ApiClient.getAdminDonationConfig();
      setConfig(cfg);
      setEnabled(cfg.enabled);
      setUrl(cfg.url || '');
      setLabel(cfg.label || 'Soutenir le projet');
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Erreur lors du chargement de la configuration.' });
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);

    try {
      const res = await ApiClient.adminLogin(password);
      if (res.success) {
        setIsAuthenticated(true);
        setPassword('');
        await loadConfig();
      } else {
        setLoginError(res.message || 'Mot de passe incorrect.');
      }
    } catch {
      setLoginError('Erreur de connexion au serveur.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await ApiClient.adminLogout();
    setIsAuthenticated(false);
    setConfig(null);
    setFeedback(null);
  };

  // Validation client temps réel de l'URL
  const validateUrlLocally = (candidateUrl: string): boolean => {
    if (!candidateUrl.trim()) {
      setUrlValidationError(null);
      return true;
    }
    const trimmed = candidateUrl.trim();
    if (trimmed.toLowerCase().startsWith('javascript:') || trimmed.toLowerCase().startsWith('data:')) {
      setUrlValidationError('Protocole non sécurisé formellement interdit.');
      return false;
    }
    try {
      const parsed = new URL(trimmed);
      const isHttps = parsed.protocol === 'https:';
      const isLocalHttp = parsed.protocol === 'http:' && (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1');

      if (!isHttps && !isLocalHttp) {
        setUrlValidationError('L\'adresse doit débuter par https:// pour garantir la sécurité des visiteurs.');
        return false;
      }
      setUrlValidationError(null);
      return true;
    } catch {
      setUrlValidationError('Format d\'adresse URL invalide (ex: https://votre-plateforme.org/don).');
      return false;
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUrl(val);
    validateUrlLocally(val);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (enabled && !url.trim()) {
      setFeedback({ type: 'error', message: 'Veuillez saisir une URL de don pour pouvoir activer le bouton.' });
      return;
    }

    if (!validateUrlLocally(url)) {
      setFeedback({ type: 'error', message: 'Veuillez corriger l\'URL avant d\'enregistrer.' });
      return;
    }

    setIsSaving(true);
    try {
      const res = await ApiClient.updateAdminDonationConfig({
        enabled,
        url: url.trim() || null,
        label: label.trim() || 'Soutenir le projet'
      });

      if (res.success && res.config) {
        setConfig(res.config);
        setEnabled(res.config.enabled);
        setUrl(res.config.url || '');
        setLabel(res.config.label || 'Soutenir le projet');
        setFeedback({
          type: 'success',
          message: '✓ Configuration du lien de don enregistrée avec succès. La page d\'accueil est immédiatement à jour.'
        });
      } else {
        setFeedback({ type: 'error', message: res.error || 'Erreur lors de la sauvegarde.' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Erreur réseau.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (config) {
      setEnabled(config.enabled);
      setUrl(config.url || '');
      setLabel(config.label || 'Soutenir le projet');
      setUrlValidationError(null);
      setFeedback({ type: 'success', message: 'Modifications réinitialisées à la valeur enregistrée.' });
    }
  };

  const handleDeleteOrDisable = async () => {
    if (!window.confirm('Voulez-vous réinitialiser et désactiver le bouton de soutien ?')) {
      return;
    }
    setIsSaving(true);
    try {
      const res = await ApiClient.resetAdminDonationConfig();
      if (res.success && res.config) {
        setConfig(res.config);
        setEnabled(false);
        setUrl('');
        setLabel('Soutenir le projet');
        setUrlValidationError(null);
        setFeedback({ type: 'success', message: 'Le bouton de don a été désactivé et l\'URL réinitialisée.' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Erreur lors de la réinitialisation.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', color: 'var(--text-muted)' }}>
        <p>Vérification des droits d'administration...</p>
      </div>
    );
  }

  // Écran de Connexion Administrateur
  if (!isAuthenticated) {
    return (
      <div className="admin-container" style={{ maxWidth: '440px', margin: '60px auto', padding: '0 20px' }}>
        <div className="section-panel animate-fade-in" style={{ padding: '36px 28px', border: '1px solid var(--border-medium)' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(212, 163, 89, 0.12)',
              color: 'var(--accent-gold)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <Lock size={28} />
            </div>
            <h2 style={{ fontFamily: 'var(--font-serif-display)', fontSize: '1.4rem', color: 'var(--text-main)', margin: '0 0 8px 0' }}>
              Administration Atelier Lexical
            </h2>
            <p className="text-muted" style={{ fontSize: '0.85rem' }}>
              Veuillez saisir le mot de passe administrateur pour gérer le lien de don et les paramètres du serveur.
            </p>
          </div>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
                Mot de passe administrateur
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                autoFocus
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-medium)',
                  background: 'var(--bg-surface)',
                  color: 'var(--text-main)',
                  boxSizing: 'border-box',
                  fontSize: '0.95rem'
                }}
              />
              <span className="text-faint" style={{ fontSize: '0.75rem', display: 'block', marginTop: '6px' }}>
                Configurable via la variable <code>ADMIN_PASSWORD</code> du fichier <code>.env</code>.
              </span>
            </div>

            {loginError && (
              <div style={{
                padding: '10px 14px',
                borderRadius: '6px',
                background: 'rgba(239, 68, 68, 0.15)',
                color: 'var(--color-danger, #ef4444)',
                fontSize: '0.82rem',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <AlertTriangle size={16} />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="btn-accent"
              style={{
                width: '100%',
                padding: '11px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontWeight: 600
              }}
            >
              <Unlock size={16} />
              <span>{isLoggingIn ? 'Connexion en cours...' : 'Se connecter'}</span>
            </button>
          </form>

          <div style={{ marginTop: '24px', textAlign: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
            <button
              type="button"
              onClick={onBackToHome}
              className="btn-ghost"
              style={{ fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <ArrowLeft size={14} />
              <span>Retour à l'accueil du site</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Écran du Tableau de Bord d'Administration du Don
  return (
    <div className="admin-container" style={{ maxWidth: '780px', margin: '40px auto', padding: '0 20px' }}>
      {/* Barre de navigation haute de l'admin */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            type="button"
            onClick={onBackToHome}
            className="btn-ghost"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
          >
            <ArrowLeft size={16} />
            <span>Page d'accueil</span>
          </button>
          <span className="text-faint">|</span>
          <button
            type="button"
            onClick={onBackToApp}
            className="btn-ghost"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
          >
            <Globe size={16} />
            <span>Ouvrir l'Atelier Lexical</span>
          </button>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="btn-ghost"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--color-danger, #ef4444)' }}
          title="Fermer la session administrateur"
        >
          <LogOut size={16} />
          <span>Déconnexion</span>
        </button>
      </div>

      <div className="section-panel animate-fade-in" style={{ padding: '32px 30px', border: '1px solid var(--border-medium)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '24px', borderBottom: '1px solid var(--border-subtle)', pb: '20px', paddingBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Heart size={24} className="text-accent" />
              <h1 style={{ fontFamily: 'var(--font-serif-display)', fontSize: '1.5rem', color: 'var(--text-main)', margin: 0 }}>
                Gestion du Bouton de Don & Soutien
              </h1>
            </div>
            <p className="text-muted" style={{ fontSize: '0.88rem', marginTop: '6px' }}>
              Configurez l'adresse externe vers laquelle redirige le bouton de soutien de la page d'accueil (Tipeee, Ko-fi, HelloAsso, etc.).
            </p>
          </div>

          <div style={{
            padding: '6px 12px',
            borderRadius: 'var(--radius-pill)',
            background: enabled ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.12)',
            color: enabled ? '#4ade80' : 'var(--text-muted)',
            fontSize: '0.8rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            flexShrink: 0
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: enabled ? '#4ade80' : 'var(--text-muted)'
            }} />
            <span>{enabled ? 'Bouton visible' : 'Bouton inactif'}</span>
          </div>
        </div>

        {feedback && (
          <div style={{
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            background: feedback.type === 'success' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            color: feedback.type === 'success' ? '#4ade80' : '#f87171',
            border: feedback.type === 'success' ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
            fontSize: '0.88rem',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
            <span>{feedback.message}</span>
          </div>
        )}

        <form onSubmit={handleSave}>
          {/* Interrupteur Activation */}
          <div style={{
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px'
          }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                Afficher le bouton de soutien sur la page d'accueil
              </div>
              <div className="text-muted" style={{ fontSize: '0.8rem', marginTop: '2px' }}>
                Si désactivé, aucun bouton de paiement ne sera visible pour les visiteurs.
              </div>
            </div>
            <label style={{ position: 'relative', display: 'inline-block', width: '48px', height: '26px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: enabled ? 'var(--accent-gold)' : 'var(--border-medium)',
                borderRadius: '26px',
                transition: '0.2s'
              }} />
              <span style={{
                position: 'absolute',
                content: '""',
                height: '20px',
                width: '20px',
                left: enabled ? '25px' : '3px',
                bottom: '3px',
                backgroundColor: 'white',
                borderRadius: '50%',
                transition: '0.2s'
              }} />
            </label>
          </div>

          {/* Champ URL de destination */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
              URL de redirection du soutien (HTTPS obligatoire)
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={url}
                onChange={handleUrlChange}
                placeholder="https://ko-fi.com/votre-projet ou https://fr.tipeee.com/..."
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: urlValidationError ? '1px solid var(--color-danger, #ef4444)' : '1px solid var(--border-medium)',
                  background: 'var(--bg-surface)',
                  color: 'var(--text-main)',
                  boxSizing: 'border-box',
                  fontSize: '0.95rem'
                }}
              />
            </div>
            {urlValidationError && (
              <span style={{ color: 'var(--color-danger, #ef4444)', fontSize: '0.78rem', display: 'block', marginTop: '4px' }}>
                {urlValidationError}
              </span>
            )}
            <span className="text-muted" style={{ fontSize: '0.78rem', display: 'block', marginTop: '6px' }}>
              Protocole accepté : <code>https://</code> uniquement. Les scripts ou schémas dangereux sont strictement rejetés.
            </span>
          </div>

          {/* Champ Libellé du bouton */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
              Libellé affiché sur le bouton
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Soutenir le projet"
              maxLength={80}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-medium)',
                background: 'var(--bg-surface)',
                color: 'var(--text-main)',
                boxSizing: 'border-box',
                fontSize: '0.95rem'
              }}
            />
          </div>

          {/* Aperçu direct du bouton tel qu'il apparaîtra sur la landing page */}
          <div style={{
            background: 'var(--bg-surface-elevated)',
            border: '1px dashed var(--border-medium)',
            borderRadius: 'var(--radius-md)',
            padding: '16px 20px',
            marginBottom: '26px'
          }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
              Aperçu en direct sur la page d'accueil
            </div>
            {enabled && url.trim() ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                <a
                  href={url.trim()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-accent"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', textDecoration: 'none' }}
                >
                  <Heart size={16} fill="currentColor" />
                  <span>{label || 'Soutenir le projet'}</span>
                  <ExternalLink size={14} />
                </a>
                <span className="text-muted" style={{ fontSize: '0.8rem' }}>
                  Cliquer testera la redirection vers votre page de financement dans un nouvel onglet.
                </span>
              </div>
            ) : (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                Le bouton est actuellement masqué (aucun lien n'apparaîtra aux visiteurs).
              </div>
            )}
          </div>

          {/* Actions d'enregistrement et annulation */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', borderTop: '1px solid var(--border-subtle)', paddingTop: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                type="submit"
                disabled={isSaving || Boolean(urlValidationError)}
                className="btn-accent"
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '11px 22px', fontWeight: 600 }}
              >
                <Save size={16} />
                <span>{isSaving ? 'Enregistrement...' : 'Enregistrer la configuration'}</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                disabled={isSaving}
                className="btn-ghost"
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                title="Annuler les modifications non enregistrées"
              >
                <RotateCcw size={15} />
                <span>Annuler</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleDeleteOrDisable}
              disabled={isSaving}
              className="btn-ghost"
              style={{ color: 'var(--color-danger, #ef4444)', fontSize: '0.82rem' }}
            >
              Supprimer le lien / Désactiver
            </button>
          </div>
        </form>

        {config?.updatedAt && (
          <div style={{ marginTop: '20px', fontSize: '0.75rem', color: 'var(--text-faint)', textAlign: 'right' }}>
            Dernière mise à jour : {new Date(config.updatedAt).toLocaleString('fr-FR')}
          </div>
        )}
      </div>

      {/* Note de sécurité */}
      <div style={{ marginTop: '20px', padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'rgba(212, 163, 89, 0.06)', border: '1px solid rgba(212, 163, 89, 0.15)', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
        <ShieldCheck size={18} className="text-accent" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
          <strong>Sécurité serveur garantie :</strong> La modification de ce paramètre nécessite un jeton administrateur vérifié cryptographiquement par le serveur Express. La configuration est immédiatement persistée dans <code>server/src/data/app-config.json</code> et survit aux redémarrages sans aucun redéploiement requis.
        </div>
      </div>
    </div>
  );
};
