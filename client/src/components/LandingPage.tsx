import React, { useState, useEffect } from 'react';
import {
  Feather,
  Search,
  Sparkles,
  BookOpen,
  ArrowRight,
  GitBranch,
  Quote,
  ShieldCheck,
  MousePointerClick,
  Download,
  Heart,
  ExternalLink,
  Split,
  Layers,
  GraduationCap,
  PenTool,
  Bookmark,
  Sun,
  Moon,
  Info,
  CheckCircle2
} from 'lucide-react';
import { ApiClient } from '../services/api';
import { DonationPublicConfig } from '../../../shared/types';

interface LandingPageProps {
  onSearchWord: (word: string) => void;
  onOpenApp: () => void;
  onOpenAboutModal: () => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  onNavigateAdmin: () => void;
}

const INSPIRATIONAL_WORDS = [
  { mot: 'clair-obscur', label: 'Nuance visuelle & mystère' },
  { mot: 'silence', label: 'Graduation émotionnelle' },
  { mot: 'labyrinthe', label: 'Richesse morphologique' },
  { mot: 'crépuscule', label: 'Évocations poétiques' },
  { mot: 'chimère', label: 'Sens figurés & mythes' },
  { mot: 'mélancolie', label: 'Intensité stylistique' }
];

export const LandingPage: React.FC<LandingPageProps> = ({
  onSearchWord,
  onOpenApp,
  onOpenAboutModal,
  theme,
  toggleTheme,
  onNavigateAdmin
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [donationConfig, setDonationConfig] = useState<DonationPublicConfig>({
    enabled: false,
    url: null,
    label: 'Soutenir le projet'
  });
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  useEffect(() => {
    ApiClient.getDonationConfig().then(setDonationConfig);
  }, []);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onSearchWord(searchInput.trim());
    }
  };

  const handleDownloadExtension = () => {
    // Déclenche le téléchargement du package distribuable de l'extension
    const link = document.createElement('a');
    link.href = '/dist/atelier-lexical-extension.zip';
    link.download = 'atelier-lexical-extension.zip';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setDownloadNotice('L\'archive atelier-lexical-extension.zip est prête ! Consultez le guide ci-dessous pour l\'activer en 1 minute.');
    setTimeout(() => setDownloadNotice(null), 6000);
  };

  return (
    <div className="landing-wrapper">
      {/* Barre de navigation supérieure */}
      <header className="landing-nav">
        <div className="landing-nav-inner">
          <div className="brand-logo" onClick={onOpenApp} style={{ cursor: 'pointer' }}>
            <div className="logo-icon-wrapper">
              <Feather size={22} strokeWidth={2.2} />
            </div>
            <div className="brand-text">
              <span className="brand-name">Atelier Lexical</span>
              <span className="brand-tagline">L'art du mot juste</span>
            </div>
          </div>

          <nav className="landing-nav-links">
            <a href="#fonctionnalites" className="landing-nav-link">Fonctionnalités</a>
            <a href="#publics" className="landing-nav-link">Pour qui ?</a>
            <a href="#extension" className="landing-nav-link">Extension</a>
            {donationConfig.enabled && donationConfig.url && (
              <a href="#soutien" className="landing-nav-link text-accent">Soutenir</a>
            )}
            <button
              type="button"
              className="landing-nav-link-btn"
              onClick={onOpenAboutModal}
              title="À propos du projet"
            >
              <Info size={16} />
              <span>À propos</span>
            </button>
          </nav>

          <div className="landing-nav-actions">
            <button
              type="button"
              className="icon-btn"
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Basculer en mode clair' : 'Basculer en mode sombre'}
              aria-label="Basculer le thème"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <button
              type="button"
              className="btn-accent landing-cta-btn"
              onClick={onOpenApp}
            >
              <span>Ouvrir l'Atelier</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section : Immédiatement orientée vers la recherche */}
      <section className="landing-hero">
        <div className="landing-hero-bg-glow" />
        <div className="landing-container landing-hero-content">
          <div className="landing-badge animate-fade-in">
            <Sparkles size={14} className="text-accent" />
            <span>Assistant de vocabulaire, de nuances et de style pour les passionnés de mots</span>
          </div>

          <h1 className="landing-hero-title animate-fade-in">
            Ne cherchez plus seulement des synonymes.<br />
            <span className="text-gradient-gold">Sculptez vos nuances d'écriture.</span>
          </h1>

          <p className="landing-hero-description animate-fade-in">
            Conçu pour les auteurs, étudiants, enseignants et rédacteurs : accédez en un coup d'œil à des définitions fiables, des synonymes gradués par intensité, des champs lexicaux évocateurs et l'arbre morphologique complet de la langue française.
          </p>

          {/* Barre de recherche intégrée immédiatement au Hero */}
          <div className="landing-search-card animate-fade-in">
            <form onSubmit={handleHeroSearch} className="landing-search-form">
              <div className="landing-search-input-wrap">
                <Search size={22} className="landing-search-icon" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Saisissez un mot ou une locution (ex: clair-obscur, silence, écrire...)"
                  autoFocus
                  className="landing-search-input"
                />
              </div>
              <button type="submit" className="landing-search-submit-btn">
                <span>Explorer la fiche</span>
                <ArrowRight size={18} />
              </button>
            </form>

            {/* Suggestions interactives en 1 clic */}
            <div className="landing-suggestions-row">
              <span className="landing-suggestions-label">Suggestions rapides :</span>
              <div className="landing-suggestions-chips">
                {INSPIRATIONAL_WORDS.map(item => (
                  <button
                    key={item.mot}
                    type="button"
                    className="landing-word-chip"
                    onClick={() => onSearchWord(item.mot)}
                    title={item.label}
                  >
                    <span>{item.mot}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Boutons d'action complémentaires */}
          <div className="landing-hero-actions animate-fade-in">
            <button
              type="button"
              className="btn-accent landing-btn-large"
              onClick={onOpenApp}
            >
              <BookOpen size={18} />
              <span>Accéder à l'Atelier complet</span>
            </button>
            <a href="#fonctionnalites" className="btn-ghost landing-btn-large">
              <span>Découvrir toutes les fonctionnalités</span>
            </a>
          </div>
        </div>
      </section>

      {/* Section 2 : Pour qui est conçu l'Atelier ? */}
      <section id="publics" className="landing-section">
        <div className="landing-container">
          <div className="landing-section-header">
            <div className="section-eyebrow">Publics & Usages</div>
            <h2 className="section-heading">Un compagnon d'écriture pour chaque exigence littéraire</h2>
            <p className="section-subheading">
              Que vous composiez un roman, une thèse académique ou un texte poétique, l'Atelier Lexical vous délivre le mot exact au moment précis où votre texte l'exige.
            </p>
          </div>

          <div className="landing-audience-grid">
            <div className="audience-card">
              <div className="audience-icon-wrap">
                <PenTool size={26} className="text-accent" />
              </div>
              <h3>Écrivains & Romanciers</h3>
              <p>
                Échappez aux répétitions stériles. Trouvez la nuance sensorielle ou dramatique qui colore exactement l'atmosphère de votre scène sans alourdir le récit.
              </p>
              <ul className="audience-points">
                <li>Graduation des synonymes par intensité émotionnelle</li>
                <li>Atelier de nuances guidé par l'intention de l'auteur</li>
                <li>Carnet d'écrivain pour sauvegarder vos trésors de style</li>
              </ul>
            </div>

            <div className="audience-card highlighted">
              <div className="audience-icon-wrap">
                <GraduationCap size={26} className="text-accent" />
              </div>
              <h3>Étudiants, Enseignants & Chercheurs</h3>
              <p>
                Bénéficiez de données lexicales rigoureuses issues du Wiktionnaire sous licence libre (CC BY-SA 4.0). Définitions complètes, étymologies historiques et phonétique API.
              </p>
              <ul className="audience-points">
                <li>Fiches d'étymologie et d'histoire linguistique</li>
                <li>Conjugaisons intégrales des verbes français</li>
                <li>Sources vérifiables sans hallucination ni faux sens</li>
              </ul>
            </div>

            <div className="audience-card">
              <div className="audience-icon-wrap">
                <Layers size={26} className="text-accent" />
              </div>
              <h3>Rédacteurs & Passionnés de la Langue</h3>
              <p>
                Aiguisez la justesse de vos formules. Explorez les registres de langue (littéraire, soutenu, poétique, familier) et les locutions idiomatiques françaises.
              </p>
              <ul className="audience-points">
                <li>Expressions et locutions proverbiales attestées</li>
                <li>Champs lexicaux pour enrichir le décor narratif</li>
                <li>Disposition sur mesure (1, 2, 3 ou 4 colonnes)</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3 : Présentation des fonctionnalités phares */}
      <section id="fonctionnalites" className="landing-section landing-section-alt">
        <div className="landing-container">
          <div className="landing-section-header">
            <div className="section-eyebrow">Richesse Lexicale</div>
            <h2 className="section-heading">Une suite d'outils linguistiques sans équivalent</h2>
            <p className="section-subheading">
              Tout est réuni au même endroit pour nourrir votre imagination et enrichir votre palette de vocabulaire.
            </p>
          </div>

          <div className="landing-features-grid">
            <div className="feature-box" onClick={() => onSearchWord('colère')} style={{ cursor: 'pointer' }}>
              <div className="feature-icon">
                <Split size={24} />
              </div>
              <h4>Synonymes intelligents & nuances</h4>
              <p>
                Classés par intensité (faible, modérée, forte) et filtrables par registre pour sélectionner la résonance exacte souhaitée.
              </p>
              <span className="feature-action-hint">Essayer avec « colère » &rarr;</span>
            </div>

            <div className="feature-box" onClick={() => onSearchWord('silence')} style={{ cursor: 'pointer' }}>
              <div className="feature-icon">
                <Layers size={24} />
              </div>
              <h4>Champ lexical & associations d'idées</h4>
              <p>
                Explorez l'univers conceptuel, visuel et sonore qui orbite autour de votre mot pour déployer des métaphores originales.
              </p>
              <span className="feature-action-hint">Essayer avec « silence » &rarr;</span>
            </div>

            <div className="feature-box" onClick={() => onSearchWord('écrire')} style={{ cursor: 'pointer' }}>
              <div className="feature-icon">
                <GitBranch size={24} />
              </div>
              <h4>Famille lexicale & morphologie</h4>
              <p>
                Découvrez toutes les ramifications de la racine : préfixes, suffixes, dérivés verbaux et locutions nées du même étymon.
              </p>
              <span className="feature-action-hint">Essayer avec « écrire » &rarr;</span>
            </div>

            <div className="feature-box" onClick={() => onSearchWord('chimère')} style={{ cursor: 'pointer' }}>
              <div className="feature-icon">
                <Quote size={24} />
              </div>
              <h4>Étymologie & tournures stylistiques</h4>
              <p>
                Remontez à l'origine latine, grecque ou médiévale des termes et inspirez-vous de tournures littéraires élégantes.
              </p>
              <span className="feature-action-hint">Essayer avec « chimère » &rarr;</span>
            </div>

            <div className="feature-box" onClick={onOpenApp} style={{ cursor: 'pointer' }}>
              <div className="feature-icon">
                <Sparkles size={24} />
              </div>
              <h4>Atelier de Nuances d'Écriture</h4>
              <p>
                Décrivez votre intention narrative (« une peur diffuse dans la brume ») et laissez l'Atelier vous suggérer les mots les plus frappants.
              </p>
              <span className="feature-action-hint">Explorer l'Atelier &rarr;</span>
            </div>

            <div className="feature-box" onClick={onOpenApp} style={{ cursor: 'pointer' }}>
              <div className="feature-icon">
                <Bookmark size={24} />
              </div>
              <h4>Carnet de l'Écrivain & Projets</h4>
              <p>
                Épinglez vos trouvailles, classez-les par projet de roman ou par chapitre, et exportez vos collections d'un simple clic.
              </p>
              <span className="feature-action-hint">Gérer vos favoris &rarr;</span>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4 : Extension pour navigateur Chrome & Firefox */}
      <section id="extension" className="landing-section">
        <div className="landing-container">
          <div className="extension-showcase">
            <div className="extension-showcase-text">
              <div className="section-eyebrow">Extension Navigateur</div>
              <h2 className="section-heading" style={{ textAlign: 'left' }}>
                L'Atelier Lexical au bout du clic droit sur n'importe quel site web
              </h2>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '20px' }}>
                Vous lisez un roman en ligne, un article de presse ou une thèse ? Sélectionnez n'importe quel mot curieux, faites un clic droit, et accédez instantanément à sa fiche lexicale dans votre Atelier.
              </p>

              <div className="extension-steps">
                <div className="step-item">
                  <div className="step-number">1</div>
                  <div className="step-body">
                    <strong>Sélectionnez un mot</strong> sur n'importe quelle page web dans votre navigateur.
                  </div>
                </div>
                <div className="step-item">
                  <div className="step-number">2</div>
                  <div className="step-body">
                    <strong>Faites un clic droit</strong> pour afficher le menu contextuel « Rechercher dans l'Atelier Lexical ».
                  </div>
                </div>
                <div className="step-item">
                  <div className="step-number">3</div>
                  <div className="step-body">
                    <strong>Votre fiche s'ouvre aussitôt</strong> avec ses synonymes, nuances, exemples et famille morphologique.
                  </div>
                </div>
              </div>

              <div className="extension-cta-row">
                <button
                  type="button"
                  className="btn-accent"
                  onClick={handleDownloadExtension}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 22px' }}
                >
                  <Download size={18} />
                  <span>Télécharger l'extension (.zip)</span>
                </button>

                <a
                  href="/dist/atelier-lexical-extension.zip"
                  className="btn-ghost"
                  download="atelier-lexical-extension.zip"
                  style={{ fontSize: '0.88rem' }}
                >
                  Téléchargement direct
                </a>
              </div>

              {downloadNotice && (
                <div style={{ marginTop: '14px', padding: '10px 14px', borderRadius: '6px', background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', fontSize: '0.85rem' }}>
                  {downloadNotice}
                </div>
              )}

              <div style={{ marginTop: '20px', fontSize: '0.8rem', color: 'var(--text-faint)' }}>
                Compatible avec <strong>Google Chrome, Mozilla Firefox, Brave, Microsoft Edge et Opera</strong>. Installation locale en mode développeur en 3 clics, sans collecte de données personnelles.
              </div>
            </div>

            {/* Illustration visuelle du menu contextuel */}
            <div className="extension-mockup-wrapper">
              <div className="browser-mockup">
                <div className="browser-bar">
                  <span className="dot red" />
                  <span className="dot yellow" />
                  <span className="dot green" />
                  <span className="browser-url">https://revue-litteraire.fr/chroniques</span>
                </div>
                <div className="browser-body">
                  <p className="article-excerpt">
                    « ...Le poète marchait au cœur d'un <mark className="mockup-selection">clair-obscur</mark> silencieux, où chaque rayon semblait hésiter entre la mémoire et l'oubli... »
                  </p>

                  <div className="context-menu-mockup animate-fade-in">
                    <div className="context-menu-item dim">Copier</div>
                    <div className="context-menu-item dim">Rechercher avec Google</div>
                    <div className="context-menu-divider" />
                    <div className="context-menu-item active-highlight">
                      <Feather size={14} className="text-accent" />
                      <span>Rechercher « clair-obscur » dans l'Atelier Lexical</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5 : Soutien au projet & Financement participatif */}
      <section id="soutien" className="landing-section landing-section-soutien">
        <div className="landing-container">
          <div className="soutien-card">
            <div className="soutien-icon-wrap">
              <Heart size={36} fill="var(--accent-gold)" color="var(--accent-gold)" />
            </div>

            <h2 style={{ fontFamily: 'var(--font-serif-display)', fontSize: '1.8rem', color: 'var(--text-main)', margin: '0 0 12px 0' }}>
              Faire vivre l'Atelier Lexical
            </h2>

            <p style={{ maxWidth: '620px', margin: '0 auto 24px', color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '0.98rem' }}>
              L'Atelier Lexical est un projet indépendant, artisanal et gratuit, conçu avec passion pour célébrer la précision et la beauté de la langue française. Votre soutien permet de financer les serveurs, d'enrichir le moteur de nuances et de pérenniser cette ressource ouverte.
            </p>

            {donationConfig.enabled && donationConfig.url ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <a
                  href={donationConfig.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-accent landing-btn-large"
                  style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '10px' }}
                >
                  <Heart size={18} fill="currentColor" />
                  <span>{donationConfig.label || 'Soutenir le projet'}</span>
                  <ExternalLink size={16} />
                </a>
                <span className="text-faint" style={{ fontSize: '0.8rem' }}>
                  Redirection sécurisée vers notre plateforme de financement
                </span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  <ShieldCheck size={18} className="text-accent" />
                  <span>Projet libre et ouvert — Merci à tous nos lecteurs et contributeurs.</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Pied de page riche de la landing page */}
      <footer className="landing-footer">
        <div className="landing-container">
          <div className="landing-footer-grid">
            <div className="footer-col brand-col">
              <div className="brand-logo" onClick={onOpenApp} style={{ cursor: 'pointer' }}>
                <div className="logo-icon-wrapper">
                  <Feather size={20} strokeWidth={2.2} />
                </div>
                <div className="brand-text">
                  <span className="brand-name">Atelier Lexical</span>
                  <span className="brand-tagline">L'art du mot juste pour les écrivains</span>
                </div>
              </div>
              <p className="footer-desc">
                Un outil conçu avec exigence pour redonner à la langue française toute sa nuance, son relief et son souffle littéraire.
              </p>
            </div>

            <div className="footer-col">
              <h4>Navigation</h4>
              <ul>
                <li><button type="button" onClick={onOpenApp} className="footer-link-btn">Ouvrir l'Atelier</button></li>
                <li><a href="#fonctionnalites">Fonctionnalités</a></li>
                <li><a href="#extension">Extension Web</a></li>
                <li><button type="button" onClick={onOpenAboutModal} className="footer-link-btn">À propos du projet</button></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Recherches phares</h4>
              <ul>
                <li><button type="button" onClick={() => onSearchWord('labyrinthe')} className="footer-link-btn">Labyrinthe</button></li>
                <li><button type="button" onClick={() => onSearchWord('clair-obscur')} className="footer-link-btn">Clair-obscur</button></li>
                <li><button type="button" onClick={() => onSearchWord('silence')} className="footer-link-btn">Silence</button></li>
                <li><button type="button" onClick={() => onSearchWord('mélancolie')} className="footer-link-btn">Mélancolie</button></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Gouvernance & Éthique</h4>
              <ul>
                <li><a href="https://fr.wiktionary.org" target="_blank" rel="noopener noreferrer">Wiktionnaire (CC BY-SA 4.0)</a></li>
                <li><span className="text-muted" style={{ fontSize: '0.85rem' }}>Respect de la vie privée (zéro tracker)</span></li>
                <li><button type="button" onClick={onNavigateAdmin} className="footer-link-btn text-muted" title="Accès administration">Administration</button></li>
              </ul>
            </div>
          </div>

          <div className="landing-footer-bottom">
            <div>
              &copy; {new Date().getFullYear()} Atelier Lexical. Tous droits réservés. Données lexicales sous licence libre CC BY-SA 4.0.
            </div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <button type="button" onClick={onOpenAboutModal} className="footer-link-btn">Fonctionnement & But</button>
              <button type="button" onClick={onNavigateAdmin} className="footer-link-btn">Administration</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
