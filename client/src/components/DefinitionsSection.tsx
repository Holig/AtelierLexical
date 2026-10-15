import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { DefinitionSens } from '../../../shared/types';
import { BookOpen, Quote, ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react';

interface DefinitionsSectionProps {
  definitions: DefinitionSens[];
}

interface HoveredTooltipData {
  sens: DefinitionSens;
  rect: DOMRect;
  placement: 'below' | 'above';
  maxHeight: number;
}

export const DefinitionsSection: React.FC<DefinitionsSectionProps> = ({ definitions }) => {
  const [expandedSensIds, setExpandedSensIds] = useState<Set<string | number>>(new Set());
  const [showAllExamples, setShowAllExamples] = useState<boolean>(false);
  const [hoveredData, setHoveredData] = useState<HoveredTooltipData | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const isInteractingRef = useRef<boolean>(false);

  // Fermeture automatique au défilement extérieur, mais JAMAIS si on scroll dans l'infobulle !
  useEffect(() => {
    if (!hoveredData) return;
    const handleScroll = (e: Event) => {
      const target = e.target as Node | null;
      if (tooltipRef.current && target && (tooltipRef.current === target || tooltipRef.current.contains(target))) {
        // Le scroll a lieu à l'intérieur de l'infobulle (ex: molette sur la liste de citations) -> on ne ferme pas !
        return;
      }
      setHoveredData(null);
    };
    window.addEventListener('scroll', handleScroll, { capture: true, passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll, { capture: true });
    };
  }, [hoveredData]);

  // Réinitialiser l'état d'interaction quand la souris se relâche globalement
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      isInteractingRef.current = false;
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, []);

  if (!definitions || definitions.length === 0) {
    return (
      <div className="section-panel">
        <div className="section-panel-header">
          <h2 className="section-title">
            <BookOpen size={20} className="text-accent" />
            <span>Définitions & Sens</span>
          </h2>
        </div>
        <p className="text-muted">Aucune définition répertoriée pour ce terme.</p>
      </div>
    );
  }

  const formatDomains = (domaine?: string): string[] => {
    if (!domaine) return [];
    return domaine
      .split('|')
      .map(d => d.trim())
      .filter(d => d && d !== 'fr' && d !== 'lang');
  };

  const totalExemplesCount = definitions.reduce((acc, d) => acc + (d.exemples?.length || 0), 0);

  const handleToggleSens = (id: string | number) => {
    setHoveredData(null);
    setExpandedSensIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleToggleAll = () => {
    setHoveredData(null);
    if (showAllExamples) {
      setExpandedSensIds(new Set());
      setShowAllExamples(false);
    } else {
      const allIds = new Set(definitions.map(d => d.id));
      setExpandedSensIds(allIds);
      setShowAllExamples(true);
    }
  };

  const handleButtonMouseEnter = (sens: DefinitionSens, e: React.MouseEvent<HTMLButtonElement>) => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom - 20;
    const spaceAbove = rect.top - 20;
    const placement: 'below' | 'above' = (spaceBelow < 280 && spaceAbove > spaceBelow) ? 'above' : 'below';
    const availableSpace = placement === 'below' ? spaceBelow : spaceAbove;
    // Laisser l'infobulle s'étendre naturellement pour afficher toutes les propositions
    const maxHeight = Math.max(220, Math.min(650, availableSpace));
    setHoveredData({ sens, rect, placement, maxHeight });
  };

  const handleButtonMouseLeave = () => {
    closeTimerRef.current = setTimeout(() => {
      setHoveredData(null);
    }, 160);
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

  return (
    <div className="section-panel definitions-panel animate-fade-in">
      <div className="section-panel-header">
        <h2 className="section-title">
          <BookOpen size={20} className="text-accent" />
          <span>Définitions & Sens</span>
          <span className="section-count-badge">{definitions.length}</span>
        </h2>

        {totalExemplesCount > 0 && (
          <button
            type="button"
            className="filter-chip"
            style={{ fontSize: '0.78rem', padding: '3px 10px', display: 'flex', alignItems: 'center', gap: '5px' }}
            onClick={handleToggleAll}
            title={showAllExamples ? "Masquer tous les exemples" : "Déployer tous les exemples"}
          >
            {showAllExamples ? <EyeOff size={13} /> : <Eye size={13} />}
            <span>{showAllExamples ? "Masquer exemples" : "Déployer exemples"}</span>
          </button>
        )}
      </div>

      <div className="definitions-list section-scroll-content">
        {definitions.map((sens) => {
          const hasExemples = sens.exemples && sens.exemples.length > 0;
          const isExpanded = showAllExamples || expandedSensIds.has(sens.id);
          const domainList = formatDomains(sens.domaine);
          const isHovered = hoveredData?.sens.id === sens.id;

          return (
            <div
              key={sens.id}
              className={`definition-item-compact animate-fade-in ${isHovered ? 'is-hovered' : ''}`}
            >
              {/* Ligne 1 : Numéro, tags et bouton d'exemples */}
              <div className="definition-header-row">
                <div className="definition-left-group">
                  <span className="definition-number">{sens.numero}</span>
                  <div className="definition-tags">
                    {sens.categorie && <span className="badge badge-gold">{sens.categorie}</span>}
                    {sens.genre && <span className="badge">{sens.genre}</span>}
                    {domainList.map((d, i) => (
                      <span key={i} className="badge">{d}</span>
                    ))}
                    {sens.registre && sens.registre !== 'courant' && (
                      <span className="badge">registre {sens.registre}</span>
                    )}
                    {sens.connotation && sens.connotation !== 'neutre' && (
                      <span className="badge">{sens.connotation}</span>
                    )}
                  </div>
                </div>

                {/* Bouton déploiement et déclencheur d'infobulle */}
                {hasExemples && (
                  <div className="definition-examples-toggle-wrapper">
                    <button
                      type="button"
                      className={`definition-toggle-btn ${isExpanded ? 'active' : ''}`}
                      onClick={() => handleToggleSens(sens.id)}
                      onMouseEnter={(e) => handleButtonMouseEnter(sens, e)}
                      onMouseLeave={handleButtonMouseLeave}
                      title={isExpanded ? "Replier les exemples" : "Cliquer pour déplier les exemples"}
                    >
                      <Quote size={12} />
                      <span>{sens.exemples.length} {sens.exemples.length > 1 ? 'exemples' : 'exemple'}</span>
                      {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>
                  </div>
                )}
              </div>

              {/* Ligne 2 : Texte de la définition (calibré sur 2 lignes) */}
              <div className="definition-text-row">
                <p
                  className={`definition-text ${!isExpanded ? 'clamp-2' : ''}`}
                  onClick={() => handleToggleSens(sens.id)}
                  style={{ cursor: 'pointer' }}
                  title={isExpanded ? "Cliquer pour replier" : "Cliquer pour déplier"}
                >
                  {sens.definition}
                </p>
              </div>

              {/* Exemples dépliés dans la carte */}
              {isExpanded && hasExemples && (
                <div className="definition-examples animate-fade-in">
                  {sens.exemples.map((ex, i) => (
                    <div key={i} className="example-quote">
                      « {ex.texte} »
                      {ex.source && <div className="example-source">— {ex.source}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Infobulle Portal affichée directement dans document.body : flotte au-dessus de tout sans être coupée */}
      {hoveredData && !expandedSensIds.has(hoveredData.sens.id) && !showAllExamples && createPortal(
        <div
          ref={tooltipRef}
          className={`definition-hover-tooltip-portal animate-fade-in ${hoveredData.placement === 'above' ? 'tooltip-above' : ''}`}
          style={{
            position: 'fixed',
            top: hoveredData.placement === 'below' ? hoveredData.rect.bottom + 8 : undefined,
            bottom: hoveredData.placement === 'above' ? (window.innerHeight - hoveredData.rect.top) + 8 : undefined,
            right: Math.max(16, window.innerWidth - hoveredData.rect.right),
            width: Math.min(420, window.innerWidth - 32),
            maxHeight: hoveredData.maxHeight,
            zIndex: 99999,
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
          }}
          role="tooltip"
        >
          <div className="tooltip-header">
            <Quote size={13} className="text-accent" />
            <span>Exemples & propositions ({hoveredData.sens.exemples.length}) • Sens #{hoveredData.sens.numero}</span>
          </div>
          <p className="tooltip-definition-preview">
            {hoveredData.sens.definition}
          </p>
          <div
            className="tooltip-quotes-list"
            onWheel={(e) => {
              e.stopPropagation();
            }}
          >
            {hoveredData.sens.exemples.map((ex, i) => (
              <div key={i} className="tooltip-quote-item">
                <p className="tooltip-quote-text">« {ex.texte} »</p>
                {ex.source && <span className="tooltip-quote-source">— {ex.source}</span>}
              </div>
            ))}
          </div>
          <div className="tooltip-footer">
            <span>💡 Cliquez sur le bouton pour déplier dans la fiche</span>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
