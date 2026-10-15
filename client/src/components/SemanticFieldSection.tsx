import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ElementChampLexical, FicheLexicale } from '../../../shared/types';
import { Network, ArrowUpRight, Info, Sparkles, Loader2, BookOpen } from 'lucide-react';
import { ApiClient } from '../services/api';
import { TilePropositionsModal } from './TilePropositionsModal';

interface SemanticFieldSectionProps {
  champLexical: ElementChampLexical[];
  onNavigateWord: (mot: string) => void;
  motPrincipal?: string;
  onEnrichirChampLexical?: (nouveaux: ElementChampLexical[]) => void;
  onOpenAiModal?: () => void;
}

interface HoveredFieldData {
  elem: ElementChampLexical;
  rect: DOMRect;
  placement: 'below' | 'above';
  maxHeight: number;
}

// Cache mémoire des fiches chargées au survol
const fieldWordsCache = new Map<string, FicheLexicale | null>();

export const SemanticFieldSection: React.FC<SemanticFieldSectionProps> = ({
  champLexical,
  onNavigateWord,
  motPrincipal,
  onEnrichirChampLexical,
  onOpenAiModal
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEnriching, setIsEnriching] = useState(false);
  const [enrichError, setEnrichError] = useState<string | null>(null);

  // Gestion de l'infobulle au survol
  const [hoveredData, setHoveredData] = useState<HoveredFieldData | null>(null);
  const [loadingWord, setLoadingWord] = useState<string | null>(null);
  const [, setCacheVersion] = useState(0);

  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const isInteractingRef = useRef<boolean>(false);

  // Fermeture automatique au défilement extérieur, mais jamais lors du scroll dans l'infobulle
  useEffect(() => {
    if (!hoveredData) return;
    const handleScroll = (e: Event) => {
      const target = e.target as Node | null;
      if (tooltipRef.current && target && (tooltipRef.current === target || tooltipRef.current.contains(target))) {
        return;
      }
      setHoveredData(null);
    };
    window.addEventListener('scroll', handleScroll, { capture: true, passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll, { capture: true });
    };
  }, [hoveredData]);

  // Réinitialisation au relâchement global de la souris
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      isInteractingRef.current = false;
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, []);

  const handleEnrichWithAi = async () => {
    if (!motPrincipal) return;
    setEnrichError(null);
    setIsEnriching(true);
    try {
      const status = await ApiClient.getAiStatus();
      if (!status.isConfigured && onOpenAiModal) {
        setIsEnriching(false);
        onOpenAiModal();
        return;
      }

      const existants = champLexical.map(c => c.mot);
      const nouveaux = await ApiClient.enrichirChampLexical(motPrincipal, existants);
      if (nouveaux && nouveaux.length > 0 && onEnrichirChampLexical) {
        onEnrichirChampLexical(nouveaux);
      }
    } catch (err: any) {
      console.warn('Erreur enrichissement champ lexical:', err);
      setEnrichError('Service IA momentanément indisponible.');
      setTimeout(() => setEnrichError(null), 3000);
    } finally {
      setIsEnriching(false);
    }
  };

  const handleChipMouseEnter = (elem: ElementChampLexical, e: React.MouseEvent<HTMLButtonElement>) => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom - 20;
    const spaceAbove = rect.top - 20;
    const placement: 'below' | 'above' = (spaceBelow < 280 && spaceAbove > spaceBelow) ? 'above' : 'below';
    const availableSpace = placement === 'below' ? spaceBelow : spaceAbove;
    const maxHeight = Math.max(220, Math.min(550, availableSpace));

    setHoveredData({ elem, rect, placement, maxHeight });

    const wordKey = elem.mot.toLowerCase().trim();
    const alreadyCached = fieldWordsCache.get(wordKey) ?? ApiClient.getCachedFiche(wordKey);
    if (alreadyCached) {
      if (!fieldWordsCache.has(wordKey)) {
        fieldWordsCache.set(wordKey, alreadyCached);
      }
    } else if (!fieldWordsCache.has(wordKey)) {
      setLoadingWord(wordKey);
      ApiClient.getFicheLexicale(elem.mot)
        .then(fiche => {
          fieldWordsCache.set(wordKey, fiche);
        })
        .catch(() => {
          fieldWordsCache.set(wordKey, null);
        })
        .finally(() => {
          setLoadingWord(null);
          setCacheVersion(v => v + 1);
        });
    }
  };

  const handleChipMouseLeave = () => {
    closeTimerRef.current = setTimeout(() => {
      if (!isInteractingRef.current) {
        setHoveredData(null);
      }
    }, 180);
  };

  const handleTooltipMouseEnter = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const handleTooltipMouseLeave = () => {
    if (isInteractingRef.current) return;
    closeTimerRef.current = setTimeout(() => {
      if (!isInteractingRef.current) {
        setHoveredData(null);
      }
    }, 200);
  };

  if (!champLexical || champLexical.length === 0) return null;

  // Calcul positionnement de l'infobulle
  let tooltipLeft = 16;
  let arrowLeft = 24;
  if (hoveredData) {
    const tooltipWidth = Math.min(420, window.innerWidth - 32);
    const targetCenter = hoveredData.rect.left + hoveredData.rect.width / 2;
    tooltipLeft = Math.max(16, Math.min(hoveredData.rect.left, window.innerWidth - tooltipWidth - 16));
    arrowLeft = Math.max(18, Math.min(tooltipWidth - 28, targetCenter - tooltipLeft));
  }

  const activeWordKey = hoveredData?.elem.mot.toLowerCase().trim() || '';
  const cachedFiche = hoveredData ? (fieldWordsCache.get(activeWordKey) ?? ApiClient.getCachedFiche(activeWordKey)) : undefined;
  const isLoading = loadingWord === activeWordKey && cachedFiche === undefined;

  return (
    <div className="section-panel animate-fade-in">
      <div className="section-panel-header" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <h2 className="section-title">
            <Network size={20} className="text-accent" />
            <span>Champ Lexical & Associations d'Idées</span>
            <button
              type="button"
              className="section-count-badge clickable"
              onClick={() => setIsModalOpen(true)}
              title="Cliquer pour afficher la liste complète des associations dans une modale"
            >
              {champLexical.length}
            </button>
          </h2>
        </div>

        {motPrincipal && (
          <div>
            <button
              type="button"
              className={`btn-ai-widget-enrich ${isEnriching ? 'loading' : ''}`}
              onClick={handleEnrichWithAi}
              disabled={isEnriching}
              title="Enrichir le champ lexical et les associations d'idées avec l'IA"
            >
              {isEnriching ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Exploration IA...</span>
                </>
              ) : (
                <>
                  <Sparkles size={13} />
                  <span>Compléter avec l'IA</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {enrichError && (
        <div style={{ padding: '6px 12px', marginBottom: '12px', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-danger, #ef4444)', fontSize: '0.8rem' }}>
          {enrichError}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
        <Info size={16} className="text-accent" style={{ flexShrink: 0 }} />
        <span>
          Ces associations conceptuelles ou sensorielles enrichissent l’univers du texte sans être pour autant des synonymes stricts.
        </span>
      </div>

      <div className="chips-cloud-wrap section-scroll-content" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignContent: 'flex-start' }}>
        {champLexical.map((elem, idx) => {
          const isHovered = hoveredData?.elem.mot === elem.mot;

          return (
            <button
              key={`${elem.mot}-${idx}`}
              className={`filter-chip ${isHovered ? 'active' : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', fontSize: '0.9rem' }}
              onClick={() => onNavigateWord(elem.mot)}
              onMouseEnter={(e) => handleChipMouseEnter(elem, e)}
              onMouseLeave={handleChipMouseLeave}
            >
              <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{elem.mot}</span>
              {elem.estGenereIA && (
                <span className="badge badge-ai-gold" style={{ fontSize: '0.65rem' }}>
                  IA
                </span>
              )}
              {elem.note && <span style={{ fontSize: '0.75rem', color: 'var(--text-faint)' }}>({elem.note})</span>}
              <ArrowUpRight size={14} className="text-faint" />
            </button>
          );
        })}
      </div>

      {/* Infobulle élégante au survol (créée via Portal) */}
      {hoveredData && typeof document !== 'undefined' && createPortal(
        <div
          ref={tooltipRef}
          className={`definition-hover-tooltip-portal animate-fade-in ${hoveredData.placement === 'above' ? 'tooltip-above' : ''}`}
          style={{
            position: 'fixed',
            top: hoveredData.placement === 'below' ? hoveredData.rect.bottom + 8 : undefined,
            bottom: hoveredData.placement === 'above' ? (window.innerHeight - hoveredData.rect.top) + 8 : undefined,
            left: tooltipLeft,
            width: Math.min(420, window.innerWidth - 32),
            maxHeight: hoveredData.maxHeight,
            zIndex: 99999,
            ['--tooltip-arrow-left' as any]: `${arrowLeft}px`,
            ['--tooltip-arrow-right' as any]: 'auto',
          }}
          onMouseEnter={handleTooltipMouseEnter}
          onMouseLeave={handleTooltipMouseLeave}
          onMouseDown={(e) => {
            e.stopPropagation();
            isInteractingRef.current = true;
            if (closeTimerRef.current) {
              clearTimeout(closeTimerRef.current);
              closeTimerRef.current = null;
            }
          }}
          onMouseUp={(e) => {
            e.stopPropagation();
            isInteractingRef.current = false;
          }}
          onClick={(e) => {
            e.stopPropagation();
            onNavigateWord(hoveredData.elem.mot);
            setHoveredData(null);
          }}
          role="tooltip"
        >
          {/* En-tête de l'infobulle : mot, phonétique et badge */}
          <div className="tooltip-header" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Network size={14} className="text-accent" />
              <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', textTransform: 'none', letterSpacing: 'normal' }}>
                {hoveredData.elem.mot}
              </span>
              {hoveredData.elem.estGenereIA && (
                <span className="badge badge-ai-gold" style={{ fontSize: '0.65rem' }}>IA</span>
              )}
            </div>
            {cachedFiche?.phonetique && (
              <span className="word-phonetic-badge" style={{ fontSize: '0.75rem', padding: '1px 8px' }}>
                {cachedFiche.phonetique}
              </span>
            )}
          </div>

          {/* Badges de domaine / relation et catégorie grammaticale */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
            <span className="badge badge-gold" style={{ fontSize: '0.72rem' }}>
              {hoveredData.elem.theme || hoveredData.elem.relationType || 'Champ lexical'}
            </span>
            {cachedFiche?.nature && (
              <span className="badge" style={{ fontSize: '0.72rem' }}>
                {cachedFiche.nature}
              </span>
            )}
            {hoveredData.elem.note && (
              <span style={{ fontSize: '0.78rem', color: 'var(--text-accent)', fontStyle: 'italic' }}>
                « {hoveredData.elem.note} »
              </span>
            )}
          </div>

          {/* Corps défilable : définitions et exemples */}
          {isLoading ? (
            <div style={{ padding: '12px 6px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
              <Sparkles size={14} className="text-accent animate-pulse" />
              <span>Consultation du dictionnaire pour « {hoveredData.elem.mot} »...</span>
            </div>
          ) : cachedFiche && cachedFiche.definitions && cachedFiche.definitions.length > 0 ? (
            <div className="tooltip-quotes-list" onWheel={(e) => e.stopPropagation()}>
              {cachedFiche.definitions.slice(0, 3).map((def, idx) => (
                <div key={def.id || idx} className="tooltip-quote-item">
                  <p className="tooltip-quote-text" style={{ fontStyle: 'normal', color: 'var(--text-main)', fontSize: '0.86rem' }}>
                    <strong style={{ color: 'var(--accent-gold)', marginRight: '5px' }}>{idx + 1}.</strong>
                    {def.categorie && (
                      <span className="badge" style={{ fontSize: '0.65rem', padding: '1px 5px', marginRight: '5px', verticalAlign: 'middle' }}>
                        {def.categorie}
                      </span>
                    )}
                    <span>{def.definition}</span>
                  </p>
                  {def.exemples && def.exemples[0] && (
                    <p className="tooltip-quote-text" style={{ marginTop: '4px', fontStyle: 'italic', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      « {def.exemples[0].texte} »
                      {def.exemples[0].source && (
                        <span className="tooltip-quote-source">— {def.exemples[0].source}</span>
                      )}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="tooltip-definition-preview">
              {hoveredData.elem.note
                ? `Association : ${hoveredData.elem.note}. Terme relié à l’univers de « ${motPrincipal || 'votre recherche'} ».'`
                : `Terme du champ lexical associé à l’univers de « ${motPrincipal || 'votre recherche'} ».'`}
            </p>
          )}

          {/* Pied interactif */}
          <div className="tooltip-footer" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--text-accent)' }}>
              <BookOpen size={12} />
              <span>Consulter la fiche complète</span>
            </span>
            <span>💡 Cliquer pour explorer ↗</span>
          </div>
        </div>,
        document.body
      )}

      {/* Modale affichant la totalité des associations du champ lexical */}
      <TilePropositionsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Champ Lexical & Associations d'Idées"
        count={champLexical.length}
        icon={<Network size={18} />}
        motPrincipal={motPrincipal}
        searchPlaceholder="Rechercher une association..."
      >
        {(searchTerm) => {
          const list = champLexical.filter(c =>
            !searchTerm ||
            c.mot.toLowerCase().includes(searchTerm) ||
            (c.theme && c.theme.toLowerCase().includes(searchTerm)) ||
            (c.note && c.note.toLowerCase().includes(searchTerm))
          );

          if (list.length === 0) {
            return (
              <p className="text-muted" style={{ textAlign: 'center', padding: '24px 0' }}>
                Aucune association ne correspond à « {searchTerm} ».
              </p>
            );
          }

          return (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
              {list.map((item, idx) => (
                <div
                  key={`${item.mot}-${idx}`}
                  className="filter-chip"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: '4px',
                    padding: '10px 14px',
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    setIsModalOpen(false);
                    onNavigateWord(item.mot);
                  }}
                  title={`Explorer « ${item.mot} »`}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>{item.mot}</span>
                    <ArrowUpRight size={14} className="text-faint" />
                  </div>
                  {item.theme && (
                    <span className="badge" style={{ fontSize: '0.7rem' }}>{item.theme}</span>
                  )}
                  {item.note && (
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{item.note}</span>
                  )}
                </div>
              ))}
            </div>
          );
        }}
      </TilePropositionsModal>
    </div>
  );
};

