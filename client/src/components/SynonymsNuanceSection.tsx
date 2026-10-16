import React, { useState, useMemo } from 'react';
import { SynonymeNuance, Intensite, Registre } from '../../../shared/types';
import { Sparkles, Compass, ArrowUpRight, Filter, Loader2, ChevronDown } from 'lucide-react';
import { ApiClient } from '../services/api';
import { TilePropositionsModal } from './TilePropositionsModal';
import { WordHoverTooltipPortal, useWordTooltip } from './WordHoverTooltipPortal';

interface SynonymsNuanceSectionProps {
  synonymes: SynonymeNuance[];
  onNavigateWord: (mot: string) => void;
  motPrincipal?: string;
  onEnrichirSynonymes?: (nouveaux: SynonymeNuance[]) => void;
  onOpenAiModal?: () => void;
}

export const SynonymsNuanceSection: React.FC<SynonymsNuanceSectionProps> = ({
  synonymes,
  onNavigateWord,
  motPrincipal,
  onEnrichirSynonymes,
  onOpenAiModal
}) => {
  const [selectedIntensity, setSelectedIntensity] = useState<number | 'all'>('all');
  const [selectedRegister, setSelectedRegister] = useState<Registre | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEnriching, setIsEnriching] = useState(false);
  const [enrichError, setEnrichError] = useState<string | null>(null);

  // Hook unifié d'infobulle au survol pour la modale
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

      const existants = synonymes.map(s => s.mot);
      const nouveaux = await ApiClient.enrichirSynonymes(motPrincipal, existants);
      if (nouveaux && nouveaux.length > 0) {
        onEnrichirSynonymes?.(nouveaux);
      } else {
        setEnrichError('Aucune nouvelle nuance trouvée ou service IA momentanément saturé.');
        setTimeout(() => setEnrichError(null), 4000);
      }
    } catch (err: any) {
      console.warn('Erreur enrichissement synonymes:', err);
      setEnrichError('Service IA momentanément indisponible.');
      setTimeout(() => setEnrichError(null), 4000);
    } finally {
      setIsEnriching(false);
    }
  };

  const filteredSynonyms = useMemo(() => {
    return synonymes.filter(syn => {
      const matchIntensity = selectedIntensity === 'all' || syn.intensite === selectedIntensity;
      const matchRegister = selectedRegister === 'all' || syn.registre === selectedRegister;
      return matchIntensity && matchRegister;
    });
  }, [synonymes, selectedIntensity, selectedRegister]);

  // Registres disponibles parmi les synonymes
  const availableRegisters = useMemo(() => {
    const set = new Set<Registre>();
    synonymes.forEach(s => set.add(s.registre));
    return Array.from(set);
  }, [synonymes]);

  if (!synonymes || synonymes.length === 0) {
    return null;
  }

  const getIntensityLabel = (lvl: Intensite): string => {
    switch (lvl) {
      case 1: return 'Légère / Atténuée';
      case 2: return 'Modérée / Usuelle';
      case 3: return 'Intense / Marquée';
      case 4: return 'Paroxystique / Extrême';
    }
  };

  return (
    <div className="section-panel animate-fade-in">
      {/* En-tête avec titre, compteur cliquable et bouton IA juste en dessous */}
      <div className="section-panel-header" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <h2 className="section-title">
            <Sparkles size={20} className="text-accent" />
            <span>Synonymes Intelligents & Nuances</span>
            <button
              type="button"
              className="section-count-badge clickable"
              onClick={() => setIsModalOpen(true)}
              title="Cliquer pour afficher la liste complète des synonymes dans une modale"
            >
              {synonymes.length}
            </button>
          </h2>
        </div>

        {/* Boutons d'action juste en dessous du titre */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {motPrincipal && (
            <button
              type="button"
              className={`btn-ai-widget-enrich ${isEnriching ? 'loading' : ''}`}
              onClick={handleEnrichWithAi}
              disabled={isEnriching}
              title="Enrichir automatiquement les nuances et synonymes avec l'IA"
            >
              {isEnriching ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Analyse IA...</span>
                </>
              ) : (
                <>
                  <Sparkles size={13} />
                  <span>Compléter avec l'IA</span>
                </>
              )}
            </button>
          )}

          <button
            type="button"
            className="btn-toggle-filters"
            onClick={() => setShowFilters(!showFilters)}
            title={showFilters ? "Masquer les filtres d'intensité et de registre" : "Afficher les filtres d'intensité et de registre"}
          >
            <Filter size={12} />
            <span>{showFilters ? 'Masquer filtres' : 'Filtrer nuances'}</span>
            {(selectedIntensity !== 'all' || selectedRegister !== 'all') && (
              <span className="active-filter-indicator">•</span>
            )}
            <ChevronDown
              size={13}
              style={{
                transform: showFilters ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.2s'
              }}
            />
          </button>
        </div>
      </div>

      {enrichError && (
        <div style={{ padding: '6px 12px', marginBottom: '12px', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-danger, #ef4444)', fontSize: '0.8rem' }}>
          {enrichError}
        </div>
      )}

      {/* Barre de filtres (masquable pour gagner de la place) */}
      {showFilters && (
        <div className="filters-bar animate-fade-in" style={{ marginTop: '4px', marginBottom: '12px' }}>
          <span className="badge">
            <Filter size={12} />
            Intensité :
          </span>
          <button
            className={`filter-chip ${selectedIntensity === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedIntensity('all')}
          >
            Toutes
          </button>
          {[1, 2, 3, 4].map(lvl => (
            <button
              key={lvl}
              className={`filter-chip ${selectedIntensity === lvl ? 'active' : ''}`}
              onClick={() => setSelectedIntensity(lvl as any)}
            >
              <span className={`intensity-dot intensity-${lvl}`} style={{ display: 'inline-block', marginRight: '5px' }} />
              {getIntensityLabel(lvl as Intensite)}
            </button>
          ))}

          {availableRegisters.length > 1 && (
            <>
              <span className="badge" style={{ marginLeft: '12px' }}>Registre :</span>
              <button
                className={`filter-chip ${selectedRegister === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedRegister('all')}
              >
                Tous
              </button>
              {availableRegisters.map(reg => (
                <button
                  key={reg}
                  className={`filter-chip ${selectedRegister === reg ? 'active' : ''}`}
                  onClick={() => setSelectedRegister(reg)}
                >
                  {reg}
                </button>
              ))}
            </>
          )}
        </div>
      )}

      {/* Grille de cartes de nuances */}
      {filteredSynonyms.length > 0 ? (
        <div className="synonyms-nuance-grid section-scroll-content">
          {filteredSynonyms.map((syn, idx) => (
            <div
              key={`${syn.mot}-${idx}`}
              className="synonym-nuance-card"
              onClick={() => onNavigateWord(syn.mot)}
              title={`Consulter la fiche complète de « ${syn.mot} »`}
            >
              <div>
                <div className="synonym-card-top">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <div className="synonym-word">{syn.mot}</div>
                    {syn.estGenereIA && (
                      <span className="badge badge-ai-gold" title="Nuance générée par intelligence stylistique">
                        IA
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="badge">{syn.registre}</span>
                    <span
                      className={`intensity-dot intensity-${syn.intensite}`}
                      title={`Intensité ${syn.intensite}/4 : ${getIntensityLabel(syn.intensite)}`}
                    />
                    <ArrowUpRight size={16} className="text-faint" />
                  </div>
                </div>

                <p className="synonym-nuance-desc">{syn.nuance}</p>
              </div>

              <div>
                {syn.contexteConseille && (
                  <div className="synonym-context-box">
                    <Compass size={14} className="text-accent" style={{ flexShrink: 0 }} />
                    <span>{syn.contexteConseille}</span>
                  </div>
                )}

                {syn.exemple && (
                  <div className="synonym-example-text">
                    « {syn.exemple} »
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted" style={{ padding: '20px 0' }}>
          Aucun synonyme ne correspond aux filtres sélectionnés.
        </p>
      )}

      {/* Infobulle Portal pour les synonymes survolés dans la modale */}
      <WordHoverTooltipPortal
        hoveredData={hoveredData}
        onNavigateWord={(mot) => {
          closeTooltip();
          setIsModalOpen(false);
          onNavigateWord(mot);
        }}
        onClose={closeTooltip}
        icon={<Sparkles size={14} className="text-accent" />}
        fallbackDescription="Synonyme exprimant une nuance stylistique précise."
      />

      {/* Modale affichant la totalité des synonymes et nuances */}
      <TilePropositionsModal
        isOpen={isModalOpen}
        onClose={() => {
          closeTooltip();
          setIsModalOpen(false);
        }}
        title="Synonymes Intelligents & Nuances"
        count={synonymes.length}
        icon={<Sparkles size={18} />}
        motPrincipal={motPrincipal}
        searchPlaceholder="Rechercher parmi les synonymes..."
      >
        {(searchTerm) => {
          const list = synonymes.filter(s =>
            !searchTerm ||
            s.mot.toLowerCase().includes(searchTerm) ||
            s.nuance.toLowerCase().includes(searchTerm) ||
            s.registre.toLowerCase().includes(searchTerm)
          );

          if (list.length === 0) {
            return (
              <p className="text-muted" style={{ textAlign: 'center', padding: '24px 0' }}>
                Aucun synonyme ne correspond à votre recherche « {searchTerm} ».
              </p>
            );
          }

          return (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
              {list.map((syn, idx) => (
                <div
                  key={`${syn.mot}-${idx}`}
                  className="synonym-nuance-card"
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    closeTooltip();
                    setIsModalOpen(false);
                    onNavigateWord(syn.mot);
                  }}
                  onMouseEnter={(e) => handleWordMouseEnter({
                    mot: syn.mot,
                    badge: `Synonyme (${syn.registre})`,
                    note: syn.nuance,
                    estGenereIA: syn.estGenereIA
                  }, e)}
                  onMouseLeave={handleWordMouseLeave}
                >
                  <div>
                    <div className="synonym-card-top">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <strong className="synonym-word">{syn.mot}</strong>
                        {syn.estGenereIA && (
                          <span className="badge badge-ai-gold" style={{ fontSize: '0.65rem' }}>IA</span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className="badge">{syn.registre}</span>
                        <span className={`intensity-dot intensity-${syn.intensite}`} />
                        <ArrowUpRight size={15} className="text-faint" />
                      </div>
                    </div>
                    <p className="synonym-nuance-desc">{syn.nuance}</p>
                  </div>
                  {syn.contexteConseille && (
                    <div className="synonym-context-box" style={{ marginTop: '8px' }}>
                      <Compass size={13} className="text-accent" style={{ flexShrink: 0 }} />
                      <span style={{ fontSize: '0.8rem' }}>{syn.contexteConseille}</span>
                    </div>
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
