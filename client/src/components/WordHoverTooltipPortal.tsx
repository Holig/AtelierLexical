import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { BookOpen, Sparkles } from 'lucide-react';
import { ApiClient } from '../services/api';
import { FicheLexicale } from '../../../shared/types';

export interface HoveredWordData {
  mot: string;
  rect: DOMRect;
  placement: 'below' | 'above';
  maxHeight: number;
  badge?: string;
  note?: string;
  estGenereIA?: boolean;
}

export function useWordTooltip() {
  const [hoveredData, setHoveredData] = useState<HoveredWordData | null>(null);
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isInteractingRef = useRef(false);

  const handleWordMouseEnter = (
    wordInfo: { mot: string; badge?: string; note?: string; estGenereIA?: boolean },
    e: React.MouseEvent<HTMLElement>
  ) => {
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

    setHoveredData({
      mot: wordInfo.mot,
      badge: wordInfo.badge,
      note: wordInfo.note,
      estGenereIA: wordInfo.estGenereIA,
      rect,
      placement,
      maxHeight
    });
  };

  const handleWordMouseLeave = () => {
    closeTimerRef.current = setTimeout(() => {
      if (!isInteractingRef.current) {
        setHoveredData(null);
      }
    }, 180);
  };

  const closeTooltip = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setHoveredData(null);
  };

  return {
    hoveredData,
    handleWordMouseEnter,
    handleWordMouseLeave,
    closeTooltip,
    isInteractingRef,
    closeTimerRef
  };
}

interface WordHoverTooltipPortalProps {
  hoveredData: HoveredWordData | null;
  onNavigateWord: (mot: string) => void;
  onClose: () => void;
  icon?: React.ReactNode;
  fallbackDescription?: string;
}

export const WordHoverTooltipPortal: React.FC<WordHoverTooltipPortalProps> = ({
  hoveredData,
  onNavigateWord,
  onClose,
  icon = <BookOpen size={14} className="text-accent" />,
  fallbackDescription
}) => {
  const [cachedFiche, setCachedFiche] = useState<FicheLexicale | null | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const isInteractingRef = useRef(false);
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!hoveredData) {
      setCachedFiche(undefined);
      setIsLoading(false);
      return;
    }

    const wordKey = hoveredData.mot.toLowerCase().trim();
    const existing = ApiClient.getCachedFiche(wordKey);
    if (existing) {
      setCachedFiche(existing);
      setIsLoading(false);
    } else {
      setIsLoading(true);
      ApiClient.getFicheLexicale(hoveredData.mot)
        .then(fiche => {
          setCachedFiche(fiche);
        })
        .catch(() => {
          setCachedFiche(null);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [hoveredData?.mot]);

  // Écoute du défilement avec capture pour fermer immédiatement l'infobulle (y compris lors du défilement dans la modale)
  useEffect(() => {
    const handleScroll = () => {
      if (!isInteractingRef.current) {
        onClose();
      }
    };
    window.addEventListener('scroll', handleScroll, true);
    return () => {
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [onClose]);

  if (!hoveredData || typeof document === 'undefined') return null;

  const tooltipWidth = Math.min(420, window.innerWidth - 32);
  const targetCenter = hoveredData.rect.left + hoveredData.rect.width / 2;
  const tooltipLeft = Math.max(16, Math.min(hoveredData.rect.left, window.innerWidth - tooltipWidth - 16));
  const arrowLeft = Math.max(18, Math.min(tooltipWidth - 28, targetCenter - tooltipLeft));

  const handleMouseEnter = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const handleMouseLeave = () => {
    if (isInteractingRef.current) return;
    closeTimerRef.current = setTimeout(() => {
      if (!isInteractingRef.current) {
        onClose();
      }
    }, 200);
  };

  return createPortal(
    <div
      className={`definition-hover-tooltip-portal animate-fade-in ${hoveredData.placement === 'above' ? 'tooltip-above' : ''}`}
      style={{
        position: 'fixed',
        top: hoveredData.placement === 'below' ? hoveredData.rect.bottom + 8 : undefined,
        bottom: hoveredData.placement === 'above' ? (window.innerHeight - hoveredData.rect.top) + 8 : undefined,
        left: tooltipLeft,
        width: tooltipWidth,
        maxHeight: hoveredData.maxHeight,
        zIndex: 999999, // Très au-dessus de la modale de propositions (zIndex: 1000)
        ['--tooltip-arrow-left' as any]: `${arrowLeft}px`,
        ['--tooltip-arrow-right' as any]: 'auto',
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
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
        onClose();
        onNavigateWord(hoveredData.mot);
      }}
      role="tooltip"
    >
      {/* En-tête : Mot, phonétique et badges */}
      <div className="tooltip-header" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {icon}
          <span style={{ fontSize: '0.96rem', fontWeight: 700, color: 'var(--text-main)', textTransform: 'none', letterSpacing: 'normal' }}>
            {hoveredData.mot}
          </span>
          {hoveredData.estGenereIA && (
            <span className="badge badge-ai-gold" style={{ fontSize: '0.65rem' }}>IA</span>
          )}
        </div>
        {(cachedFiche?.phonetique || cachedFiche?.prononciationApi) && (
          <span className="word-phonetic-badge" style={{ fontSize: '0.75rem', padding: '1px 8px' }}>
            {cachedFiche.phonetique || `\\${cachedFiche.prononciationApi}\\`}
          </span>
        )}
      </div>

      {/* Badges de domaine / relation morphologique et nature grammaticale */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
        {hoveredData.badge && (
          <span className="badge badge-gold" style={{ fontSize: '0.72rem' }}>
            {hoveredData.badge}
          </span>
        )}
        {cachedFiche?.nature && (
          <span className="badge" style={{ fontSize: '0.72rem' }}>
            {cachedFiche.nature}
          </span>
        )}
        {hoveredData.note && (
          <span style={{ fontSize: '0.78rem', color: 'var(--text-accent)', fontStyle: 'italic' }}>
            « {hoveredData.note} »
          </span>
        )}
      </div>

      {/* Corps défilable : définitions et exemples */}
      {isLoading ? (
        <div style={{ padding: '12px 6px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
          <Sparkles size={14} className="text-accent animate-pulse" />
          <span>Consultation du dictionnaire pour « {hoveredData.mot} »...</span>
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
          {hoveredData.note
            ? `Association : ${hoveredData.note}. Terme relié à votre recherche.`
            : fallbackDescription || `Terme exploré dans l’Atelier Lexical.`}
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
  );
};
