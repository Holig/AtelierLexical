import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MotMorphologique, FicheLexicale } from '../../../shared/types';
import { GitBranch, ArrowUpRight, BookOpen, Sparkles } from 'lucide-react';
import { ApiClient } from '../services/api';
import { TilePropositionsModal } from './TilePropositionsModal';

interface LexicalFamilySectionProps {
  famille: MotMorphologique[];
  onNavigateWord: (mot: string) => void;
}

interface HoveredFamilyData {
  item: MotMorphologique;
  rect: DOMRect;
  placement: 'below' | 'above';
  maxHeight: number;
}

// Cache persistant en mémoire de session pour les fiches déjà chargées au survol
const familyWordsCache = new Map<string, FicheLexicale | null>();

export const LexicalFamilySection: React.FC<LexicalFamilySectionProps> = ({
  famille,
  onNavigateWord
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hoveredData, setHoveredData] = useState<HoveredFamilyData | null>(null);
  const [loadingWord, setLoadingWord] = useState<string | null>(null);
  const [, setCacheVersion] = useState(0); // Déclencheur de re-render lors de la résolution du cache

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

  // Réinitialisation de l'état d'interaction au relâchement global
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      isInteractingRef.current = false;
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, []);

  if (!famille || famille.length === 0) return null;

  const handleWordMouseEnter = (item: MotMorphologique, e: React.MouseEvent<HTMLDivElement>) => {
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

    setHoveredData({ item, rect, placement, maxHeight });

    // Récupération asynchrone des détails lexicaux du mot s'il n'est pas encore en cache
    const wordKey = item.mot.toLowerCase().trim();
    const alreadyCached = familyWordsCache.get(wordKey) ?? ApiClient.getCachedFiche(wordKey);
    if (alreadyCached) {
      if (!familyWordsCache.has(wordKey)) {
        familyWordsCache.set(wordKey, alreadyCached);
      }
    } else if (!familyWordsCache.has(wordKey)) {
      setLoadingWord(wordKey);
      ApiClient.getFicheLexicale(item.mot)
        .then(fiche => {
          familyWordsCache.set(wordKey, fiche);
        })
        .catch(() => {
          familyWordsCache.set(wordKey, null);
        })
        .finally(() => {
          setLoadingWord(null);
          setCacheVersion(v => v + 1);
        });
    }
  };

  const handleWordMouseLeave = () => {
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

  // Calcul du positionnement horizontal de l'infobulle et de sa flèche
  let tooltipLeft = 16;
  let arrowLeft = 24;
  if (hoveredData) {
    const tooltipWidth = Math.min(420, window.innerWidth - 32);
    const targetCenter = hoveredData.rect.left + hoveredData.rect.width / 2;
    tooltipLeft = Math.max(16, Math.min(hoveredData.rect.left, window.innerWidth - tooltipWidth - 16));
    arrowLeft = Math.max(18, Math.min(tooltipWidth - 28, targetCenter - tooltipLeft));
  }

  const activeWordKey = hoveredData?.item.mot.toLowerCase().trim() || '';
  const cachedFiche = hoveredData ? (familyWordsCache.get(activeWordKey) ?? ApiClient.getCachedFiche(activeWordKey)) : undefined;
  const isLoading = loadingWord === activeWordKey && cachedFiche === undefined;

  return (
    <div className="section-panel animate-fade-in">
      <div className="section-panel-header">
        <h2 className="section-title">
          <GitBranch size={20} className="text-accent" />
          <span>Famille Lexicale (Morphologie)</span>
          <button
            type="button"
            className="section-count-badge clickable"
            onClick={() => setIsModalOpen(true)}
            title="Cliquer pour afficher la liste complète de la famille lexicale dans une modale"
          >
            {famille.length}
          </button>
        </h2>
      </div>

      <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '14px' }}>
        Mots partageant la même racine morphologique (dérivés par préfixation, suffixation ou dérivation lexicale).
      </p>

      <div className="family-grid section-scroll-content">
        {famille.map((item, idx) => {
          const isHovered = hoveredData?.item.mot === item.mot;

          return (
            <div
              key={`${item.mot}-${idx}`}
              className={`family-card-item animate-fade-in ${isHovered ? 'is-hovered' : ''}`}
              onClick={() => onNavigateWord(item.mot)}
              onMouseEnter={(e) => handleWordMouseEnter(item, e)}
              onMouseLeave={handleWordMouseLeave}
              title={`Explorer la fiche morphologique de « ${item.mot} »`}
            >
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span className="family-card-word">
                    {item.mot}
                  </span>
                  {item.categorie && (
                    <span className="badge" style={{ fontSize: '0.7rem' }}>
                      {item.categorie}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {item.relation}
                </div>
              </div>
              <ArrowUpRight size={15} className="family-card-arrow text-faint" />
            </div>
          );
        })}
      </div>

      {/* Infobulle Portal flottante avec les détails lexicaux du mot survolé */}
      {hoveredData && createPortal(
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
            onNavigateWord(hoveredData.item.mot);
            setHoveredData(null);
          }}
          role="tooltip"
        >
          {/* En-tête : Mot, phonétique et catégorie */}
          <div className="tooltip-header" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookOpen size={14} className="text-accent" />
              <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', textTransform: 'none', letterSpacing: 'normal' }}>
                {hoveredData.item.mot}
              </span>
            </div>
            {cachedFiche?.phonetique && (
              <span className="word-phonetic-badge" style={{ fontSize: '0.75rem', padding: '1px 8px' }}>
                {cachedFiche.phonetique}
              </span>
            )}
          </div>

          {/* Badges de relation morphologique et catégorie */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
            {(cachedFiche?.nature || hoveredData.item.categorie) && (
              <span className="badge badge-gold" style={{ fontSize: '0.72rem' }}>
                {cachedFiche?.nature || hoveredData.item.categorie}
              </span>
            )}
            <span className="badge" style={{ fontSize: '0.72rem' }}>
              {hoveredData.item.relation}
            </span>
            {cachedFiche?.etymologie && (
              <span className="badge" style={{ fontSize: '0.7rem', color: 'var(--text-faint)' }}>
                {cachedFiche.etymologie.length > 25 ? `${cachedFiche.etymologie.slice(0, 25)}...` : cachedFiche.etymologie}
              </span>
            )}
          </div>

          {/* Contenu : Définitions et exemple d'usage */}
          {isLoading ? (
            <div style={{ padding: '12px 6px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
              <Sparkles size={14} className="text-accent animate-pulse" />
              <span>Consultation du dictionnaire pour « {hoveredData.item.mot} »...</span>
            </div>
          ) : cachedFiche && cachedFiche.definitions && cachedFiche.definitions.length > 0 ? (
            <div className="tooltip-quotes-list" onWheel={(e) => e.stopPropagation()}>
              {cachedFiche.definitions.slice(0, 2).map((def, i) => (
                <div key={i} className="tooltip-quote-item">
                  <p className="tooltip-quote-text" style={{ fontStyle: 'normal', color: 'var(--text-main)', fontSize: '0.88rem' }}>
                    <strong style={{ color: 'var(--accent-gold)', marginRight: '4px' }}>{i + 1}.</strong>
                    {def.definition}
                  </p>
                  {def.exemples && def.exemples[0] && (
                    <p className="tooltip-quote-text" style={{ marginTop: '4px', fontStyle: 'italic', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
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
              Mots partageant la même racine morphologique (dérivés par préfixation, suffixation ou dérivation lexicale).
            </p>
          )}

          {/* Pied de l'infobulle interactif */}
          <div className="tooltip-footer" style={{ cursor: 'pointer' }}>
            <span>💡 Cliquer pour explorer la fiche complète ↗</span>
          </div>
        </div>,
        document.body
      )}

      {/* Modale affichant la totalité des dérivés morphologiques */}
      <TilePropositionsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Famille Lexicale (Morphologie)"
        count={famille.length}
        icon={<GitBranch size={18} />}
        searchPlaceholder="Rechercher un terme dérivé..."
      >
        {(searchTerm) => {
          const list = famille.filter(f =>
            !searchTerm ||
            f.mot.toLowerCase().includes(searchTerm) ||
            (f.relation && f.relation.toLowerCase().includes(searchTerm)) ||
            (f.categorie && f.categorie.toLowerCase().includes(searchTerm))
          );

          if (list.length === 0) {
            return (
              <p className="text-muted" style={{ textAlign: 'center', padding: '24px 0' }}>
                Aucun dérivé ne correspond à « {searchTerm} ».
              </p>
            );
          }

          return (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
              {list.map((item, idx) => (
                <div
                  key={`${item.mot}-${idx}`}
                  className="family-card-item"
                  style={{ cursor: 'pointer', padding: '12px 14px' }}
                  onClick={() => {
                    setIsModalOpen(false);
                    onNavigateWord(item.mot);
                  }}
                  title={`Explorer la fiche de « ${item.mot} »`}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main)', textTransform: 'uppercase' }}>
                      {item.mot}
                    </span>
                    <ArrowUpRight size={14} className="text-faint" />
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {item.relation || 'mot dérivé'}
                  </span>
                </div>
              ))}
            </div>
          );
        }}
      </TilePropositionsModal>
    </div>
  );
};
