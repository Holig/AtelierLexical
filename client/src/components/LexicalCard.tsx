import React, { useState } from 'react';
import { FicheLexicale, SynonymeNuance, Antonyme, ElementChampLexical, ExempleUsage } from '../../../shared/types';
import { StorageService } from '../services/storage.service';
import { ApiClient } from '../services/api';
import { DefinitionsSection } from './DefinitionsSection';
import { SynonymsNuanceSection } from './SynonymsNuanceSection';
import { AntonymsSection } from './AntonymsSection';
import { LexicalFamilySection } from './LexicalFamilySection';
import { SemanticFieldSection } from './SemanticFieldSection';
import { ExpressionsSection } from './ExpressionsSection';
import { ExamplesWorkshopSection } from './ExamplesWorkshopSection';
import { ConjugationModal } from './ConjugationModal';
import {
  Volume2,
  Bookmark,
  Share2,
  Copy,
  Check,
  ExternalLink,
  BookCheck,
  History,
  LayoutList,
  Columns2,
  Columns3,
  LayoutGrid,
  ArrowLeft,
  Sparkles,
  Loader2
} from 'lucide-react';

interface LexicalCardProps {
  fiche: FicheLexicale;
  onNavigateWord: (mot: string) => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  columns?: 1 | 2 | 3 | 4;
  navigationTrail?: string[];
  onGoBack?: () => void;
  onNavigateTrailIndex?: (index: number) => void;
  onOpenAiModal?: () => void;
  onUpdateFiche?: (fiche: FicheLexicale) => void;
}

export const LexicalCard: React.FC<LexicalCardProps> = ({
  fiche,
  onNavigateWord,
  isFavorite,
  onToggleFavorite,
  columns = 2,
  navigationTrail,
  onGoBack,
  onNavigateTrailIndex,
  onOpenAiModal,
  onUpdateFiche
}) => {
  const [showConjugation, setShowConjugation] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Synthèse vocale française pour la prononciation
  const handlePronounce = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(fiche.mot);
      utterance.lang = 'fr-FR';
      utterance.rate = 0.9;
      utterance.onstart = () => setIsPlayingAudio(true);
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleCopyCard = () => {
    let text = `${fiche.mot.toUpperCase()} [${fiche.prononciationApi ? `\\${fiche.prononciationApi}\\` : ''}]\n`;
    text += `Catégories : ${fiche.categories.join(', ')}\n\n`;

    if (fiche.definitions.length > 0) {
      text += `DÉFINITIONS :\n`;
      fiche.definitions.forEach(d => {
        text += `${d.numero}. ${d.definition}\n`;
      });
      text += '\n';
    }

    if (fiche.synonymes.length > 0) {
      text += `SYNONYMES ET NUANCES :\n`;
      fiche.synonymes.forEach(s => {
        text += `• ${s.mot} (${s.nuance})\n`;
      });
    }

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEnrichirSynonymes = (nouveaux: SynonymeNuance[]) => {
    const updated: FicheLexicale = {
      ...fiche,
      synonymes: [...fiche.synonymes, ...nouveaux]
    };
    ApiClient.setCachedFiche(fiche.mot, updated);
    onUpdateFiche?.(updated);
  };

  const handleEnrichirAntonymes = (nouveaux: Antonyme[]) => {
    const updated: FicheLexicale = {
      ...fiche,
      antonymes: [...fiche.antonymes, ...nouveaux]
    };
    ApiClient.setCachedFiche(fiche.mot, updated);
    onUpdateFiche?.(updated);
  };

  const handleEnrichirChampLexical = (nouveaux: ElementChampLexical[]) => {
    const updated: FicheLexicale = {
      ...fiche,
      champLexical: [...fiche.champLexical, ...nouveaux]
    };
    ApiClient.setCachedFiche(fiche.mot, updated);
    onUpdateFiche?.(updated);
  };

  const handleEnrichirExemples = (nouveaux: ExempleUsage[]) => {
    const updated: FicheLexicale = {
      ...fiche,
      exemplesLitteraires: [...(fiche.exemplesLitteraires || []), ...nouveaux]
    };
    ApiClient.setCachedFiche(fiche.mot, updated);
    onUpdateFiche?.(updated);
  };

  const [isEnrichingWord, setIsEnrichingWord] = useState(false);
  const [wordEnrichError, setWordEnrichError] = useState<string | null>(null);

  const handleEnrichWordWithAi = async () => {
    if (!fiche.mot) return;
    setWordEnrichError(null);
    setIsEnrichingWord(true);
    try {
      const status = await ApiClient.getAiStatus();
      if (!status.isConfigured && onOpenAiModal) {
        setIsEnrichingWord(false);
        onOpenAiModal();
        return;
      }

      const res = await ApiClient.enrichirEtymologie(fiche.mot);
      if (res && res.etymologie) {
        const updated: FicheLexicale = {
          ...fiche,
          etymologie: res.etymologie,
          prononciationApi: (!fiche.prononciationApi && res.prononciation) ? res.prononciation : fiche.prononciationApi
        };
        ApiClient.setCachedFiche(fiche.mot, updated);
        onUpdateFiche?.(updated);
      } else {
        setWordEnrichError('Notice étymologique indisponible ou service IA saturé.');
        setTimeout(() => setWordEnrichError(null), 4000);
      }
    } catch (err: any) {
      console.warn('Erreur enrichissement mot:', err);
      setWordEnrichError('Service IA momentanément indisponible.');
      setTimeout(() => setWordEnrichError(null), 4000);
    } finally {
      setIsEnrichingWord(false);
    }
  };

  return (
    <div className={`lexical-card-container cols-${columns}`}>
      {/* Fil d'Ariane de provenance et bouton Retour */}
      {navigationTrail && navigationTrail.length > 1 && (
        <nav className="lexical-breadcrumb-bar animate-fade-in" aria-label="Fil d'exploration lexical">
          {onGoBack && (
            <button
              type="button"
              className="breadcrumb-back-btn"
              onClick={onGoBack}
              title={`Revenir au mot précédent : « ${navigationTrail[navigationTrail.length - 2]} »`}
            >
              <ArrowLeft size={15} />
              <span>
                Revenir à <strong>{navigationTrail[navigationTrail.length - 2]}</strong>
              </span>
            </button>
          )}

          <div className="breadcrumb-trail-group">
            <span className="breadcrumb-trail-label">Provenance :</span>
            <ol className="breadcrumb-trail-list">
              {navigationTrail.map((word, index) => {
                const isCurrent = index === navigationTrail.length - 1;
                return (
                  <li key={`${word}-${index}`} className="breadcrumb-trail-item">
                    {index > 0 && <span className="breadcrumb-separator" aria-hidden="true">›</span>}
                    {isCurrent ? (
                      <span className="breadcrumb-crumb current" aria-current="page">
                        {word}
                      </span>
                    ) : (
                      <button
                        type="button"
                        className="breadcrumb-crumb link"
                        onClick={() => onNavigateTrailIndex && onNavigateTrailIndex(index)}
                        title={`Retourner directement à « ${word} »`}
                      >
                        {word}
                      </button>
                    )}
                  </li>
                );
              })}
            </ol>
          </div>
        </nav>
      )}

      {/* Bannière d'information de forme fléchie ou correction */}
      {fiche.explicationForme && (
        <div
          className="definition-item animate-fade-in"
          style={{
            background: 'var(--bg-surface-elevated)',
            borderLeft: '4px solid var(--accent-gold)',
            padding: '12px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <span style={{ fontSize: '1.2rem' }}>✨</span>
          <div style={{ fontSize: '0.92rem', color: 'var(--text-main)' }}>
            <strong>{fiche.explicationForme}</strong>
            {fiche.motSaisiOriginal && fiche.motSaisiOriginal.toLowerCase() !== fiche.mot.toLowerCase() && (
              <span style={{ color: 'var(--text-muted)', marginLeft: '6px' }}>
                (terme recherché : « {fiche.motSaisiOriginal} »)
              </span>
            )}
          </div>
        </div>
      )}

      {/* En-tête du mot (Séparé en 2 colonnes : Informations lexicales à gauche, Actions & Étymologie à droite) */}
      <div className="word-header-card animate-fade-in">
        {/* Colonne Gauche : Titre du mot, phonétique, badges grammaticaux et source */}
        <div className="word-header-main">
          <div className="word-header-top">
            <div className="word-title-group">
              <h1 className="word-title">{fiche.mot}</h1>

              {fiche.prononciationApi && (
                <div className="word-phonetic-badge">
                  <span>\{fiche.prononciationApi}\</span>
                  <button
                    className="audio-btn"
                    onClick={handlePronounce}
                    title="Écouter la prononciation française"
                    aria-label="Écouter la prononciation"
                  >
                    <Volume2 size={16} className={isPlayingAudio ? 'text-accent' : ''} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Badges grammaticaux et provenance */}
          <div className="meta-badges-row">
            {fiche.categories.map((cat, idx) => (
              <span key={idx} className="badge badge-gold">
                {cat}
              </span>
            ))}

            {fiche.genres?.map((genre, idx) => (
              <span key={idx} className="badge">
                genre {genre}
              </span>
            ))}

            {fiche.sources[0] && (
              <a
                href={fiche.sources[0].url}
                target="_blank"
                rel="noopener noreferrer"
                className="badge"
                style={{ textDecoration: 'none' }}
                title="Consulter la notice source sur fr.wiktionary.org (licence CC BY-SA 4.0)"
              >
                <span>Source : Wiktionnaire (CC BY-SA 4.0)</span>
                <ExternalLink size={12} />
              </a>
            )}
          </div>
        </div>

        {/* Colonne Droite : Boutons d'actions et Encadré d'Étymologie */}
        <div className="word-header-side">
          <div className="word-header-actions">
            {fiche.conjugaison && (
              <button
                className="filter-chip active"
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                onClick={() => setShowConjugation(true)}
                title="Consulter les tableaux de conjugaison"
              >
                <BookCheck size={14} />
                <span>Conjuguer</span>
              </button>
            )}

            {/* Bouton "Compléter avec l'IA" placé juste avant l'ajout dans le carnet de l'écrivain */}
            <button
              type="button"
              className={`btn-ai-widget-enrich ${isEnrichingWord ? 'loading' : ''}`}
              onClick={handleEnrichWordWithAi}
              disabled={isEnrichingWord}
              title="Compléter l'étymologie et l'analyse lexicale du mot avec l'IA"
              style={{ fontSize: '0.82rem', padding: '6px 12px' }}
            >
              {isEnrichingWord ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Recherche IA...</span>
                </>
              ) : (
                <>
                  <Sparkles size={13} />
                  <span>Compléter avec l'IA</span>
                </>
              )}
            </button>

            <button
              className="icon-btn"
              onClick={onToggleFavorite}
              title={isFavorite ? 'Retirer du carnet d’écrivain' : 'Ajouter au carnet d’écrivain'}
              aria-label="Favori"
            >
              <Bookmark size={18} fill={isFavorite ? 'var(--accent-gold)' : 'none'} color={isFavorite ? 'var(--accent-gold)' : 'currentColor'} />
            </button>

            <button
              className="icon-btn"
              onClick={handleCopyCard}
              title="Copier la fiche de synthèse"
              aria-label="Copier"
            >
              {copied ? <Check size={18} color="var(--color-intensity-1)" /> : <Copy size={18} />}
            </button>
          </div>

          {wordEnrichError && (
            <div style={{ padding: '6px 12px', marginTop: '6px', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-danger, #ef4444)', fontSize: '0.8rem' }}>
              {wordEnrichError}
            </div>
          )}

          {fiche.etymologie ? (
            <div className="word-etymology-box">
              <div className="word-etymology-header">
                <History size={14} className="text-accent" />
                <span>Étymologie & Origine</span>
              </div>
              <p className="word-etymology-text">{fiche.etymologie}</p>
            </div>
          ) : (
            <div className="word-etymology-box empty">
              <div className="word-etymology-header" style={{ justifyContent: 'space-between', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <History size={14} className="text-accent" />
                  <span>Étymologie</span>
                </div>
                <button
                  type="button"
                  className="btn-ai-widget-enrich"
                  onClick={handleEnrichWordWithAi}
                  disabled={isEnrichingWord}
                  style={{ fontSize: '0.72rem', padding: '2px 8px' }}
                  title="Générer l'étymologie avec l'IA"
                >
                  <Sparkles size={11} />
                  <span>Renseigner par l'IA</span>
                </button>
              </div>
              <p className="word-etymology-text" style={{ color: 'var(--text-muted)' }}>
                Origine étymologique non documentée.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Grille des sections */}
      <div className={`lexical-sections-grid cols-${columns}`}>
        <DefinitionsSection definitions={fiche.definitions} />

        <div className="synonyms-antonyms-stack">
          <SynonymsNuanceSection
            synonymes={fiche.synonymes || []}
            onNavigateWord={onNavigateWord}
            motPrincipal={fiche.mot}
            onEnrichirSynonymes={handleEnrichirSynonymes}
            onOpenAiModal={onOpenAiModal}
          />

          <AntonymsSection
            antonymes={fiche.antonymes || []}
            onNavigateWord={onNavigateWord}
            motPrincipal={fiche.mot}
            onEnrichirAntonymes={handleEnrichirAntonymes}
            onOpenAiModal={onOpenAiModal}
          />
        </div>

        <LexicalFamilySection
          famille={fiche.familleLexicale}
          onNavigateWord={onNavigateWord}
        />

        <SemanticFieldSection
          champLexical={fiche.champLexical}
          onNavigateWord={onNavigateWord}
          motPrincipal={fiche.mot}
          onEnrichirChampLexical={handleEnrichirChampLexical}
          onOpenAiModal={onOpenAiModal}
        />

        <ExpressionsSection expressions={fiche.expressions} />

        <ExamplesWorkshopSection
          mot={fiche.mot}
          exemplesInitiaux={fiche.exemplesLitteraires}
          onOpenAiModal={onOpenAiModal}
          onEnrichirExemples={handleEnrichirExemples}
        />
      </div>

      {/* Modal de conjugaison si demandé */}
      {showConjugation && fiche.conjugaison && (
        <ConjugationModal
          conjugaison={fiche.conjugaison}
          onClose={() => setShowConjugation(false)}
        />
      )}
    </div>
  );
};
