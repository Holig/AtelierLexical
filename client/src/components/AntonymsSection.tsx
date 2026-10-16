import React, { useState } from 'react';
import { Antonyme } from '../../../shared/types';
import { Split, ArrowUpRight, Sparkles, Loader2 } from 'lucide-react';
import { ApiClient } from '../services/api';
import { TilePropositionsModal } from './TilePropositionsModal';
import { WordHoverTooltipPortal, useWordTooltip } from './WordHoverTooltipPortal';

interface AntonymsSectionProps {
  antonymes: Antonyme[];
  onNavigateWord: (mot: string) => void;
  motPrincipal?: string;
  onEnrichirAntonymes?: (nouveaux: Antonyme[]) => void;
  onOpenAiModal?: () => void;
}

export const AntonymsSection: React.FC<AntonymsSectionProps> = ({
  antonymes,
  onNavigateWord,
  motPrincipal,
  onEnrichirAntonymes,
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

      const existants = antonymes.map(a => a.mot);
      const nouveaux = await ApiClient.enrichirAntonymes(motPrincipal, existants);
      if (nouveaux && nouveaux.length > 0) {
        onEnrichirAntonymes?.(nouveaux);
      } else {
        setEnrichError('Aucun nouvel antonyme trouvé ou service IA momentanément saturé.');
        setTimeout(() => setEnrichError(null), 4000);
      }
    } catch (err: any) {
      console.warn('Erreur enrichissement antonymes:', err);
      setEnrichError('Service IA momentanément indisponible.');
      setTimeout(() => setEnrichError(null), 4000);
    } finally {
      setIsEnriching(false);
    }
  };

  return (
    <div className="section-panel animate-fade-in">
      <div className="section-panel-header" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <h2 className="section-title">
            <Split size={20} className="text-accent" />
            <span>Antonymes & Oppositions</span>
            <button
              type="button"
              className="section-count-badge clickable"
              onClick={() => {
                closeTooltip();
                setIsModalOpen(true);
              }}
              title="Cliquer pour afficher la liste complète des antonymes dans une modale"
            >
              {antonymes.length}
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
              title="Trouver d'autres antonymes et contrastes stylistiques avec l'IA"
            >
              {isEnriching ? (
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
          </div>
        )}
      </div>

      {enrichError && (
        <div style={{ padding: '6px 12px', marginBottom: '12px', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-danger, #ef4444)', fontSize: '0.8rem' }}>
          {enrichError}
        </div>
      )}

      {antonymes.length > 0 ? (
        <div className="chips-cloud-wrap section-scroll-content" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignContent: 'flex-start' }}>
          {antonymes.map((ant, idx) => {
            const isHovered = hoveredData?.mot === ant.mot;

            return (
              <button
                key={`${ant.mot}-${idx}`}
                className={`filter-chip ${isHovered ? 'active' : ''}`}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', padding: '6px 14px' }}
                onClick={() => {
                  closeTooltip();
                  onNavigateWord(ant.mot);
                }}
                onMouseEnter={(e) => handleWordMouseEnter({
                  mot: ant.mot,
                  badge: ant.type === 'contextuel' ? 'Antonyme contextuel' : 'Antonyme',
                  note: ant.sensAssocie,
                  estGenereIA: ant.estGenereIA
                }, e)}
                onMouseLeave={handleWordMouseLeave}
              >
                <span style={{ fontWeight: 600 }}>{ant.mot}</span>
                {ant.estGenereIA && (
                  <span className="badge badge-ai-gold" style={{ fontSize: '0.65rem' }}>
                    IA
                  </span>
                )}
                {ant.type === 'contextuel' && <span className="badge" style={{ fontSize: '0.7rem' }}>contexte</span>}
                <ArrowUpRight size={14} className="text-faint" />
              </button>
            );
          })}
        </div>
      ) : (
        <div className="empty-section-ai-prompt" style={{
          padding: '24px 16px',
          textAlign: 'center',
          background: 'var(--bg-surface-elevated)',
          borderRadius: 'var(--radius-md)',
          border: '1px dashed var(--border-medium)'
        }}>
          <p className="text-muted" style={{ fontSize: '0.88rem', margin: '0 0 14px 0' }}>
            Aucun antonyme direct n'est répertorié pour ce mot dans la base lexicale.
          </p>
          {motPrincipal && (
            <button
              type="button"
              className={`btn-ai-widget-enrich ${isEnriching ? 'loading' : ''}`}
              onClick={handleEnrichWithAi}
              disabled={isEnriching}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', margin: '0 auto' }}
            >
              {isEnriching ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Recherche des oppositions IA...</span>
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  <span>Compléter avec l'IA</span>
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* Infobulle Portal flottante avec les détails lexicaux de l'antonyme (tuile & modale) */}
      <WordHoverTooltipPortal
        hoveredData={hoveredData}
        onNavigateWord={(mot) => {
          closeTooltip();
          setIsModalOpen(false);
          onNavigateWord(mot);
        }}
        onClose={closeTooltip}
        icon={<Split size={14} className="text-accent" />}
        fallbackDescription={`Antonyme ou contraste sémantique opposé à « ${motPrincipal || 'votre recherche'} ».'`}
      />

      {/* Modale affichant la liste complète des antonymes */}
      <TilePropositionsModal
        isOpen={isModalOpen}
        onClose={() => {
          closeTooltip();
          setIsModalOpen(false);
        }}
        title="Antonymes & Oppositions"
        count={antonymes.length}
        icon={<Split size={18} />}
        motPrincipal={motPrincipal}
        searchPlaceholder="Rechercher un antonyme..."
      >
        {(searchTerm) => {
          const list = antonymes.filter(a =>
            !searchTerm ||
            a.mot.toLowerCase().includes(searchTerm) ||
            (a.sensAssocie && a.sensAssocie.toLowerCase().includes(searchTerm))
          );

          if (list.length === 0) {
            return (
              <p className="text-muted" style={{ textAlign: 'center', padding: '24px 0' }}>
                Aucun antonyme ne correspond à « {searchTerm} ».
              </p>
            );
          }

          return (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              {list.map((ant, idx) => {
                const isHovered = hoveredData?.mot === ant.mot;

                return (
                  <button
                    key={`${ant.mot}-${idx}`}
                    className={`filter-chip ${isHovered ? 'active' : ''}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '0.95rem',
                      padding: '8px 16px',
                      cursor: 'pointer'
                    }}
                    onClick={() => {
                      closeTooltip();
                      setIsModalOpen(false);
                      onNavigateWord(ant.mot);
                    }}
                    onMouseEnter={(e) => handleWordMouseEnter({
                      mot: ant.mot,
                      badge: ant.type === 'contextuel' ? 'Antonyme contextuel' : 'Antonyme',
                      note: ant.sensAssocie,
                      estGenereIA: ant.estGenereIA
                    }, e)}
                    onMouseLeave={handleWordMouseLeave}
                  >
                    <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{ant.mot}</span>
                    {ant.estGenereIA && (
                      <span className="badge badge-ai-gold" style={{ fontSize: '0.65rem' }}>IA</span>
                    )}
                    {ant.type === 'contextuel' && (
                      <span className="badge" style={{ fontSize: '0.7rem' }}>contexte</span>
                    )}
                    {ant.sensAssocie && (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>— {ant.sensAssocie}</span>
                    )}
                    <ArrowUpRight size={14} className="text-faint" />
                  </button>
                );
              })}
            </div>
          );
        }}
      </TilePropositionsModal>
    </div>
  );
};
