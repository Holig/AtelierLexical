import React, { useState, useEffect } from 'react';
import { X, Sparkles, Key, Check, ExternalLink, ShieldCheck, Cpu, Trash2, CheckCircle2 } from 'lucide-react';
import { ApiClient } from '../services/api';

interface AIConfigModalProps {
  onClose: () => void;
  onConfigChange: () => void;
}

export const AIConfigModal: React.FC<AIConfigModalProps> = ({ onClose, onConfigChange }) => {
  const [provider, setProvider] = useState<'gemini' | 'openai'>('gemini');
  const [apiKey, setApiKey] = useState('');
  const [status, setStatus] = useState<{ isConfigured: boolean; provider: string; maskedKey?: string }>({ isConfigured: false, provider: 'none' });
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; latencyMs?: number } | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    // Charger le statut serveur
    ApiClient.getAiStatus().then(st => {
      setStatus(st);
      if (st.isConfigured && (st.provider === 'gemini' || st.provider === 'openai')) {
        setProvider(st.provider as 'gemini' | 'openai');
      }
    });

    const stored = localStorage.getItem(`atelier_ai_${provider}_key`);
    if (stored) {
      setApiKey(stored);
    } else {
      setApiKey('');
    }
  }, [provider]);

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    setNotice(null);
    try {
      const res = await ApiClient.testAiConnection();
      setTestResult(res);
    } catch (err: any) {
      setTestResult({ success: false, message: `Erreur: ${err.message}` });
    } finally {
      setIsTesting(false);
    }
  };

  const handleDisconnect = async () => {
    setIsSaving(true);
    setTestResult(null);
    setNotice(null);
    try {
      localStorage.removeItem(`atelier_ai_${provider}_key`);
      await ApiClient.setAiKey(provider, '');
      const newStatus = await ApiClient.getAiStatus();
      setStatus(newStatus);
      setApiKey('');
      setTestResult({ success: true, message: `La clé ${provider.toUpperCase()} a été retirée avec succès.` });
      onConfigChange();
    } catch (err: any) {
      setTestResult({ success: false, message: `Erreur lors de la déconnexion : ${err.message}` });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setTestResult(null);
    setNotice(null);

    const clean = apiKey.trim();

    // Si le champ est vide et qu'une clé est déjà configurée, ne pas écraser par du vide
    if (!clean && status.isConfigured && status.provider === provider) {
      setNotice(`Votre clé actuelle (${status.maskedKey}) est déjà conservée en mémoire et reste active.`);
      return;
    }

    if (!clean) {
      setNotice('Veuillez renseigner une clé API valide avant d\'enregistrer.');
      return;
    }

    setIsSaving(true);
    try {
      const ok = await ApiClient.setAiKey(provider, clean);
      if (ok) {
        localStorage.setItem(`atelier_ai_${provider}_key`, clean);
        const newStatus = await ApiClient.getAiStatus();
        setStatus(newStatus);
        setApiKey('');
        setSavedSuccess(true);
        onConfigChange();
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err: any) {
      setTestResult({ success: false, message: `Erreur sauvegarde : ${err.message}` });
    } finally {
      setIsSaving(false);
    }
  };

  const isCurrentProviderConfigured = status.isConfigured && status.provider === provider;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 250,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-xl)',
          maxWidth: '600px',
          maxHeight: '90vh',
          overflowY: 'auto',
          width: '100%',
          boxShadow: 'var(--shadow-lg)',
          padding: '28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px'
        }}
        onClick={e => e.stopPropagation()}
        className="animate-fade-in"
      >
        {/* Header modal */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Cpu size={22} className="text-accent" />
            <h2 style={{ fontFamily: 'var(--font-serif-display)', fontSize: '1.4rem', color: 'var(--text-main)' }}>
              Connexion IA & Moteur de Style
            </h2>
          </div>
          <button className="icon-btn" onClick={onClose} title="Fermer">
            <X size={20} />
          </button>
        </div>

        {/* État actuel & bouton de test */}
        <div
          style={{
            background: 'var(--bg-surface-elevated)',
            padding: '16px',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: status.isConfigured ? '#10b981' : 'var(--text-faint)',
                  boxShadow: status.isConfigured ? '0 0 8px rgba(16, 185, 129, 0.7)' : 'none'
                }}
              />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.92rem', color: 'var(--text-main)', fontWeight: 600 }}>
                  {status.isConfigured
                    ? `IA active : ${status.provider === 'gemini' ? 'Google Gemini' : 'OpenAI'}`
                    : 'Aucune clé d\'IA connectée'}
                </span>
                {status.isConfigured && status.maskedKey && (
                  <span style={{ fontSize: '0.78rem', color: 'var(--accent-gold)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                    Clé mémorisée : {status.maskedKey} (conservée en permanence)
                  </span>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {status.isConfigured && (
                <>
                  <button
                    type="button"
                    className="filter-chip active"
                    style={{ fontSize: '0.8rem', padding: '5px 12px' }}
                    onClick={handleTest}
                    disabled={isTesting}
                    title="Vérifier la connectivité auprès des serveurs"
                  >
                    {isTesting ? 'Test...' : 'Tester la connexion'}
                  </button>
                  <button
                    type="button"
                    className="filter-chip"
                    style={{ fontSize: '0.8rem', padding: '5px 10px', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                    onClick={handleDisconnect}
                    disabled={isSaving}
                    title="Supprimer la clé API active"
                  >
                    <Trash2 size={13} style={{ marginRight: '4px', display: 'inline' }} />
                    Déconnecter
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Message informatif ou avertissement */}
          {notice && (
            <div
              className="animate-fade-in"
              style={{
                fontSize: '0.84rem',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(217, 119, 6, 0.1)',
                color: 'var(--accent-gold)',
                border: '1px solid rgba(217, 119, 6, 0.3)'
              }}
            >
              ℹ️ {notice}
            </div>
          )}

          {/* Résultat du test */}
          {testResult && (
            <div
              className="animate-fade-in"
              style={{
                fontSize: '0.85rem',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                background: testResult.success ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                color: testResult.success ? '#10b981' : '#ef4444',
                border: `1px solid ${testResult.success ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
              }}
            >
              {testResult.success ? '✓ ' : '✕ '}
              {testResult.message}
            </div>
          )}
        </div>

        {/* Encadré explicatif : À quel moment l'IA est-elle sollicitée ? */}
        <div
          style={{
            background: 'rgba(217, 119, 6, 0.05)',
            border: '1px solid rgba(217, 119, 6, 0.25)',
            borderRadius: 'var(--radius-md)',
            padding: '14px',
            fontSize: '0.86rem',
            lineHeight: 1.5
          }}
        >
          <div style={{ fontWeight: 700, color: 'var(--accent-gold)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={14} />
            <span>À quels moments l'IA est-elle sollicitée ?</span>
          </div>
          <ul style={{ paddingLeft: '18px', margin: 0, color: 'var(--text-muted)' }}>
            <li style={{ marginBottom: '4px' }}>
              <strong>Variations stylistiques</strong> : En cliquant sur le bouton <em>« Variations stylistiques »</em> dans une fiche mot, l'IA génère 4 phrases d'auteurs inédites (narrative, descriptive, dialogue, poésie) estampillées du badge doré <em>✨ Généré par IA</em>.
            </li>
            <li style={{ marginBottom: '4px' }}>
              <strong>Atelier de Nuances (Recherche par intention)</strong> : Lorsque vous exprimez une intention d'écriture (ex: <em>« une peur paralysante »</em> ou <em>« remplacer le verbe dire dans un dialogue »</em>), l'IA formule des recommandations sur mesure et des conseils narratifs adaptés.
            </li>
            <li>
              <strong>Garantie d'intégrité</strong> : L'IA n'est <strong>jamais</strong> utilisée pour inventer des définitions ou des étymologies. Celles-ci proviennent rigoureusement des données réelles du Wiktionnaire.
            </li>
          </ul>
        </div>

        {/* Formulaire de configuration */}
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
              Fournisseur d'IA :
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                className={`filter-chip ${provider === 'gemini' ? 'active' : ''}`}
                style={{ flex: 1, padding: '8px', textAlign: 'center' }}
                onClick={() => setProvider('gemini')}
              >
                Google Gemini (Recommandé / Gratuit)
              </button>
              <button
                type="button"
                className={`filter-chip ${provider === 'openai' ? 'active' : ''}`}
                style={{ flex: 1, padding: '8px', textAlign: 'center' }}
                onClick={() => setProvider('openai')}
              >
                OpenAI (GPT-4o)
              </button>
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                {isCurrentProviderConfigured
                  ? `Modifier la clé API ${provider === 'gemini' ? 'Gemini' : 'OpenAI'} :`
                  : `Clé d'API ${provider === 'gemini' ? 'Gemini' : 'OpenAI'} :`}
              </label>
              {provider === 'gemini' && (
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: '0.78rem', color: 'var(--text-accent)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                >
                  <span>Obtenir une clé gratuite Google</span>
                  <ExternalLink size={11} />
                </a>
              )}
            </div>

            <input
              type="password"
              placeholder={
                isCurrentProviderConfigured && status.maskedKey
                  ? `Clé active : ${status.maskedKey} (Laisser vide pour la conserver)`
                  : provider === 'gemini'
                  ? 'Ex: AIzaSy...'
                  : 'Ex: sk-...'
              }
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              className="search-input"
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-medium)',
                background: 'var(--bg-input)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.85rem'
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-faint)' }}>
              <ShieldCheck size={14} className="text-accent" />
              <span>Persistance automatique locale : vous n'aurez plus à la resaisir.</span>
            </div>

            <button
              type="submit"
              className="search-submit-btn"
              disabled={isSaving}
              style={{ padding: '8px 20px', fontSize: '0.9rem' }}
            >
              {savedSuccess ? <Check size={16} /> : <Key size={16} />}
              <span>{savedSuccess ? 'Enregistrée !' : isSaving ? 'Connexion...' : isCurrentProviderConfigured && !apiKey ? 'Conserver' : 'Enregistrer'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
