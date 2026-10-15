import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { LexicalCard } from './components/LexicalCard';
import { StylisticStudio } from './components/StylisticStudio';
import { WriterNotebook } from './components/WriterNotebook';
import { AIConfigModal } from './components/AIConfigModal';
import { AboutModal } from './components/AboutModal';
import { Footer } from './components/Footer';
import { ApiClient } from './services/api';
import { StorageService } from './services/storage.service';
import { FicheLexicale } from '../../shared/types';
import { Feather, Sparkles, BookOpen, AlertCircle, Compass, LayoutGrid, LayoutList, Columns2, Columns3 } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'lexique' | 'studio' | 'notebook'>('lexique');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [currentWord, setCurrentWord] = useState<string>('');
  const [currentFiche, setCurrentFiche] = useState<FicheLexicale | null>(null);
  const [columns, setColumns] = useState<1 | 2 | 3>(() => StorageService.getColumnsLayout());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorInfo, setErrorInfo] = useState<{ message: string; suggestions?: string[] } | null>(null);
  const [favoritesCount, setFavoritesCount] = useState<number>(0);
  const [showAiModal, setShowAiModal] = useState<boolean>(false);
  const [showAboutModal, setShowAboutModal] = useState<boolean>(false);
  const [aiStatus, setAiStatus] = useState<{ isConfigured: boolean; provider: string }>({ isConfigured: false, provider: 'none' });

  const [navigationTrail, setNavigationTrail] = useState<string[]>([]);

  const handleSetColumns = (cols: 1 | 2 | 3) => {
    setColumns(cols);
    StorageService.setColumnsLayout(cols);
  };

  // Initialisation du thème, du carnet et du statut IA
  useEffect(() => {
    const savedTheme = StorageService.getTheme();
    setTheme(savedTheme);
    StorageService.setTheme(savedTheme);
    setFavoritesCount(StorageService.getFavorites().length);
    ApiClient.getAiStatus().then(async st => {
      if (!st.isConfigured) {
        const geminiKey = localStorage.getItem('atelier_ai_gemini_key');
        if (geminiKey) {
          await ApiClient.setAiKey('gemini', geminiKey);
          const updated = await ApiClient.getAiStatus();
          setAiStatus(updated);
          return;
        }
        const openaiKey = localStorage.getItem('atelier_ai_openai_key');
        if (openaiKey) {
          await ApiClient.setAiKey('openai', openaiKey);
          const updated = await ApiClient.getAiStatus();
          setAiStatus(updated);
          return;
        }
      }
      setAiStatus(st);
    });
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    StorageService.setTheme(next);
  };

  const performSearch = async (mot: string, updateHistoryState: boolean = true) => {
    if (!mot || !mot.trim()) return;
    const clean = mot.trim();
    setCurrentWord(clean);
    setIsLoading(true);
    setErrorInfo(null);
    setActiveTab('lexique');

    if (updateHistoryState) {
      const url = new URL(window.location.href);
      url.searchParams.set('q', clean);
      window.history.pushState({ word: clean }, '', url.toString());
    }

    try {
      const fiche = await ApiClient.getFicheLexicale(clean);
      setCurrentFiche(fiche);
      StorageService.addToHistory(fiche.mot);
    } catch (err: any) {
      console.warn('Erreur recherche lexicale:', err);
      setCurrentFiche(null);
      setErrorInfo({
        message: err.message || `Le mot « ${clean} » est introuvable.`,
        suggestions: err.suggestions || []
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Recherche directe depuis la barre de recherche ou suggestions d'accueil (démarre un nouveau fil)
  const handleDirectSearch = async (mot: string) => {
    if (!mot || !mot.trim()) return;
    const clean = mot.trim();
    setNavigationTrail([clean]);
    await performSearch(clean);
  };

  // Navigation depuis un lien interne (ex: clic sur un mot de la famille lexicale, synonyme, etc.)
  const handleNavigateWord = async (mot: string) => {
    if (!mot || !mot.trim()) return;
    const clean = mot.trim();
    setNavigationTrail(prev => {
      const existingIdx = prev.findIndex(w => w.toLowerCase() === clean.toLowerCase());
      if (existingIdx !== -1) {
        // Si le mot est déjà dans l'historique, on coupe jusqu'à ce mot
        return prev.slice(0, existingIdx + 1);
      }
      return [...prev, clean];
    });
    await performSearch(clean);
  };

  // Revenir au mot précédent dans le fil
  const handleGoBack = async () => {
    if (navigationTrail.length <= 1) return;
    const newTrail = [...navigationTrail];
    newTrail.pop(); // Retire le mot actuel
    const prevWord = newTrail[newTrail.length - 1];
    setNavigationTrail(newTrail);
    await performSearch(prevWord);
  };

  // Cliquer directement sur une étape du fil d'Ariane
  const handleNavigateTrailIndex = async (index: number) => {
    if (index < 0 || index >= navigationTrail.length) return;
    const targetWord = navigationTrail[index];
    const newTrail = navigationTrail.slice(0, index + 1);
    setNavigationTrail(newTrail);
    await performSearch(targetWord);
  };

  // Initialisation du mot depuis l'URL au chargement
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    if (q) {
      setNavigationTrail([q]);
      performSearch(q, false);
    }
  }, []);

  // Écoute de l'historique du navigateur (boutons Précédent/Suivant)
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      const params = new URLSearchParams(window.location.search);
      const q = params.get('q') || e.state?.word;
      if (q) {
        setNavigationTrail(prev => {
          const idx = prev.findIndex(w => w.toLowerCase() === q.toLowerCase());
          if (idx !== -1) return prev.slice(0, idx + 1);
          return [q];
        });
        performSearch(q, false);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleToggleFavorite = () => {
    if (!currentFiche) return;
    StorageService.toggleFavorite(currentFiche.mot);
    setFavoritesCount(StorageService.getFavorites().length);
  };

  const isCurrentFavorite = Boolean(
    currentFiche && StorageService.isFavorite(currentFiche.mot)
  );

  return (
    <div className="app-container">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        theme={theme}
        toggleTheme={toggleTheme}
        favoritesCount={favoritesCount}
        onOpenAboutModal={() => setShowAboutModal(true)}
        onLogoClick={() => {
          setCurrentWord('');
          setCurrentFiche(null);
          setErrorInfo(null);
          setNavigationTrail([]);
          setActiveTab('lexique');
          const url = new URL(window.location.href);
          url.searchParams.delete('q');
          window.history.pushState({}, '', url.pathname);
        }}
        onOpenAiModal={() => setShowAiModal(true)}
        aiStatus={aiStatus}
      />

      <main className="main-content">
        {/* Barre principale : Titre + Recherche + Colonnes d'affichage tout sur une seule ligne */}
        <section className="search-master-bar" aria-label="Recherche de mot et disposition">
          <div className="search-master-left">
            <Feather size={20} className="text-accent" />
            <h2 className="search-master-title">Trouver le mot juste</h2>
          </div>

          <div className="search-master-center">
            <SearchBar
              onSearch={handleDirectSearch}
              initialValue={currentWord}
              isLoading={isLoading}
            />
          </div>

          {currentFiche && (
            <div className="search-master-right animate-fade-in">
              <div className="layout-switch-bar">
                <span className="layout-switch-label">
                  <LayoutGrid size={15} className="text-accent" />
                  <span>Colonnes d'affichage :</span>
                </span>
                <div className="layout-switch-group" role="group" aria-label="Choisir le nombre de colonnes">
                  <button
                    type="button"
                    className={`layout-switch-btn ${columns === 1 ? 'active' : ''}`}
                    onClick={() => handleSetColumns(1)}
                    title="1 colonne : Défilement vertical classique"
                  >
                    <LayoutList size={14} />
                    <span>1 col</span>
                  </button>
                  <button
                    type="button"
                    className={`layout-switch-btn ${columns === 2 ? 'active' : ''}`}
                    onClick={() => handleSetColumns(2)}
                    title="2 colonnes : Sens et Définitions à gauche, Synonymes et Nuances à droite"
                  >
                    <Columns2 size={14} />
                    <span>2 col</span>
                  </button>
                  <button
                    type="button"
                    className={`layout-switch-btn ${columns === 3 ? 'active' : ''}`}
                    onClick={() => handleSetColumns(3)}
                    title="3 colonnes : Vue d'ensemble panoramique complète"
                  >
                    <Columns3 size={14} />
                    <span>3 col</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Vue 1 : Exploration de la Fiche Lexicale */}
        {activeTab === 'lexique' && (
          <>
            {isLoading && (
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <Feather size={36} className="text-accent animate-spin" style={{ margin: '0 auto 16px' }} />
                <p style={{ fontFamily: 'var(--font-serif-display)', fontSize: '1.2rem', color: 'var(--text-main)' }}>
                  Consultation des sources lexicales en cours...
                </p>
                <p className="text-muted" style={{ fontSize: '0.9rem', marginTop: '6px' }}>
                  Analyse des définitions, nuances et exemples d'écriture
                </p>
              </div>
            )}

            {errorInfo && !isLoading && (
              <div
                className="section-panel animate-fade-in"
                style={{ textAlign: 'center', padding: '40px 20px', maxWidth: '680px', margin: '0 auto' }}
              >
                <AlertCircle size={36} className="text-accent" style={{ margin: '0 auto 12px' }} />
                <h3 style={{ fontFamily: 'var(--font-serif-display)', fontSize: '1.3rem', color: 'var(--text-main)', marginBottom: '8px' }}>
                  Mot non répertorié
                </h3>
                <p className="text-muted" style={{ marginBottom: '20px' }}>{errorInfo.message}</p>

                {errorInfo.suggestions && errorInfo.suggestions.length > 0 && (
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-faint)', marginBottom: '10px' }}>
                      Vouliez-vous chercher l'un de ces termes ?
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px' }}>
                      {errorInfo.suggestions.map(sug => (
                        <button
                          key={sug}
                          className="filter-chip active"
                          onClick={() => handleDirectSearch(sug)}
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {currentFiche && !isLoading && (
              <LexicalCard
                fiche={currentFiche}
                onNavigateWord={handleNavigateWord}
                isFavorite={isCurrentFavorite}
                onToggleFavorite={handleToggleFavorite}
                columns={columns}
                navigationTrail={navigationTrail}
                onGoBack={handleGoBack}
                onNavigateTrailIndex={handleNavigateTrailIndex}
              />
            )}

            {/* Écran d'accueil en attente d'une recherche réelle */}
            {!currentFiche && !isLoading && !errorInfo && (
              <div
                className="section-panel animate-fade-in"
                style={{ textAlign: 'center', padding: '50px 24px', maxWidth: '640px', margin: '40px auto 0' }}
              >
                <Compass size={40} className="text-accent" style={{ margin: '0 auto 16px' }} />
                <h3 style={{ fontFamily: 'var(--font-serif-display)', fontSize: '1.4rem', color: 'var(--text-main)', marginBottom: '8px' }}>
                  En attente de votre recherche
                </h3>
                <p className="text-muted" style={{ fontSize: '0.95rem', lineHeight: 1.6 }}>
                  Saisissez un mot ou une locution dans la barre ci-dessus pour consulter sa fiche lexicale complète issue du Wiktionnaire réel : définitions vérifiées, synonymes classés par intensité, antonymes, étymologie et expressions.
                </p>
                <div style={{ marginTop: '24px', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-faint)' }}>Exemples de recherches en direct :</span>
                  {['écrire', 'forêt', 'silence', 'peur', 'labyrinthe'].map(motExemple => (
                    <button
                      key={motExemple}
                      className="filter-chip"
                      onClick={() => handleDirectSearch(motExemple)}
                    >
                      {motExemple}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Vue 2 : Atelier de Nuances Stylistiques (Intention-based Studio) */}
        {activeTab === 'studio' && (
          <StylisticStudio onNavigateWord={handleNavigateWord} />
        )}

        {/* Vue 3 : Carnet d'Écrivain (Notebook & Projects) */}
        {activeTab === 'notebook' && (
          <WriterNotebook
            onNavigateWord={handleNavigateWord}
            onFavoritesChange={() => setFavoritesCount(StorageService.getFavorites().length)}
          />
        )}
      </main>

      <Footer />

      {showAiModal && (
        <AIConfigModal
          onClose={() => setShowAiModal(false)}
          onConfigChange={() => {
            ApiClient.getAiStatus().then(setAiStatus);
            if (currentWord) performSearch(currentWord);
          }}
        />
      )}

      {showAboutModal && (
        <AboutModal
          onClose={() => setShowAboutModal(false)}
        />
      )}
    </div>
  );
};
