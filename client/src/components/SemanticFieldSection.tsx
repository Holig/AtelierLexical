import React, { useState } from 'react';
import { ElementChampLexical } from '../../../shared/types';
import { Network, ArrowUpRight, Info, Sparkles, Loader2 } from 'lucide-react';
import { ApiClient } from '../services/api';
import { TilePropositionsModal } from './TilePropositionsModal';
import { WordHoverTooltipPortal, useWordTooltip } from './WordHoverTooltipPortal';

interface SemanticFieldSectionProps {
  champLexical: ElementChampLexical[];
  onNavigateWord: (mot: string) => void;
  motPrincipal?: string;
  onEnrichirChampLexical?: (nouveaux: ElementChampLexical[]) => void;
  onOpenAiModal?: () => void;
}

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

  // Hook unifié d'infobulle au survol (partagé pour la tuile et pour la modale)
  const {
    hoveredData,
    handleWordMouseEnter,
    handleWordMouseLeave,
    closeTooltip
  } = useWordTooltip();

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

  if (!champLexical || champLexical.length === 0) return null;

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
              onClick={() => {
                closeTooltip();
                setIsModalOpen(true);
              }}
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
          const isHovered = hoveredData?.mot === elem.mot;

          return (
            <button
              key={`${elem.mot}-${idx}`}
              className={`filter-chip ${isHovered ? 'active' : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', fontSize: '0.9rem' }}
              onClick={() => {
                closeTooltip();
                onNavigateWord(elem.mot);
              }}
              onMouseEnter={(e) => handleWordMouseEnter({
                mot: elem.mot,
                badge: elem.theme || elem.relationType || 'Champ lexical',
                note: elem.note,
                estGenereIA: elem.estGenereIA
              }, e)}
              onMouseLeave={handleWordMouseLeave}
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

      {/* Infobulle flottante unifiée pour les éléments de la tuile et de la modale */}
      <WordHoverTooltipPortal
        hoveredData={hoveredData}
        onNavigateWord={(mot) => {
          closeTooltip();
          setIsModalOpen(false);
          onNavigateWord(mot);
        }}
        onClose={closeTooltip}
        icon={<Network size={14} className="text-accent" />}
        fallbackDescription={`Terme du champ lexical associé à l’univers de « ${motPrincipal || 'votre recherche'} ».'`}
      />

      {/* Modale affichant la totalité des associations du champ lexical */}
      <TilePropositionsModal
        isOpen={isModalOpen}
        onClose={() => {
          closeTooltip();
          setIsModalOpen(false);
        }}
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
              {list.map((item, idx) => {
                const isHovered = hoveredData?.mot === item.mot;

                return (
                  <div
                    key={`${item.mot}-${idx}`}
                    className={`filter-chip ${isHovered ? 'active' : ''}`}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      gap: '4px',
                      padding: '12px 14px',
                      cursor: 'pointer'
                    }}
                    onClick={() => {
                      closeTooltip();
                      setIsModalOpen(false);
                      onNavigateWord(item.mot);
                    }}
                    onMouseEnter={(e) => handleWordMouseEnter({
                      mot: item.mot,
                      badge: item.theme || 'Champ lexical',
                      note: item.note,
                      estGenereIA: item.estGenereIA
                    }, e)}
                    onMouseLeave={handleWordMouseLeave}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>{item.mot}</span>
                      <ArrowUpRight size={14} className="text-faint" />
                    </div>
                    {item.theme && (
                      <span className="badge badge-gold" style={{ fontSize: '0.7rem' }}>{item.theme}</span>
                    )}
                    {item.note && (
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{item.note}</span>
                    )}
                  </div>
                );
              })}
            </div>
          );
        }}
      </TilePropositionsModal>
    </div>
  );
};
