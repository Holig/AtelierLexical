import React from 'react';
import { Feather, BookOpen, Sparkles, Bookmark, Sun, Moon, Info } from 'lucide-react';

interface HeaderProps {
  activeTab: 'lexique' | 'studio' | 'notebook';
  setActiveTab: (tab: 'lexique' | 'studio' | 'notebook') => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  favoritesCount: number;
  onLogoClick: () => void;
  onOpenAiModal: () => void;
  onOpenAboutModal: () => void;
  aiStatus: { isConfigured: boolean; provider: string };
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  theme,
  toggleTheme,
  favoritesCount,
  onLogoClick,
  onOpenAiModal,
  onOpenAboutModal,
  aiStatus
}) => {
  return (
    <header className="app-header">
      <div className="header-inner">
        {/* Logo & Identité */}
        <div className="brand-logo" onClick={onLogoClick} title="Retour à l'accueil de l'Atelier">
          <div className="logo-icon-wrapper">
            <Feather size={22} strokeWidth={2.2} />
          </div>
          <div className="brand-text">
            <h1>Atelier Lexical</h1>
            <div className="brand-subtitle">L'art du mot juste pour les écrivains</div>
          </div>
        </div>

        {/* Navigation principale */}
        <nav className="nav-tabs" aria-label="Navigation principale">
          <button
            className={`nav-tab-btn ${activeTab === 'lexique' ? 'active' : ''}`}
            onClick={() => setActiveTab('lexique')}
          >
            <BookOpen size={16} />
            <span>Fiche Lexicale</span>
          </button>

          <button
            className={`nav-tab-btn ${activeTab === 'studio' ? 'active' : ''}`}
            onClick={() => setActiveTab('studio')}
          >
            <Sparkles size={16} />
            <span>Atelier de Nuances</span>
          </button>

          <button
            className={`nav-tab-btn ${activeTab === 'notebook' ? 'active' : ''}`}
            onClick={() => setActiveTab('notebook')}
          >
            <Bookmark size={16} />
            <span>Carnet d'Écrivain {favoritesCount > 0 && `(${favoritesCount})`}</span>
          </button>
        </nav>

        {/* Actions header (IA & Thème) */}
        <div className="header-actions">
          <button
            className={`ai-badge-btn ${aiStatus.isConfigured ? 'active' : ''}`}
            onClick={onOpenAiModal}
            title={
              aiStatus.isConfigured
                ? `IA ${aiStatus.provider === 'gemini' ? 'Google Gemini' : 'OpenAI'} opérationnelle — Cliquez pour tester ou reconfigurer`
                : 'Connecter une clé IA (Gemini ou OpenAI) pour enrichir vos explorations'
            }
            aria-label="Configuration IA"
          >
            <Sparkles size={15} className={aiStatus.isConfigured ? 'text-accent' : 'text-muted'} />
            <span>
              {aiStatus.isConfigured
                ? `IA ${aiStatus.provider === 'gemini' ? 'Gemini' : 'OpenAI'} Active`
                : 'Connecter IA'}
            </span>
            <span className={`ai-status-dot ${aiStatus.isConfigured ? 'online' : 'offline'}`} />
          </button>

          <button
            className="icon-btn"
            onClick={onOpenAboutModal}
            title="À propos de l'Atelier Lexical (Fonctionnement & But)"
            aria-label="À propos de l'Atelier Lexical"
          >
            <Info size={18} />
          </button>

          <button
            className="icon-btn"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Basculer en mode clair (papier vélin)' : 'Basculer en mode sombre (bibliothèque nocturne)'}
            aria-label="Basculer le thème"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>
    </header>
  );
};
