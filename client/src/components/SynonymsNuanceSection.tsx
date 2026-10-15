import React, { useState, useMemo } from 'react';
import { SynonymeNuance, Intensite, Registre } from '../../../shared/types';
import { Sparkles, Compass, ArrowUpRight, Filter, Loader2 } from 'lucide-react';
import { ApiClient } from '../services/api';

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
  const [isEnriching, setIsEnriching] = useState(false);
  const [enrichError, setEnrichError] = useState<string | null>(null);

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
      if (nouveaux && nouveaux.length > 0 && onEnrichirSynonymes) {
        onEnrichirSynonymes(nouveaux);
      }
    } catch (err: any) {
      console.warn('Erreur enrichissement synonymes:', err);
      setEnrichError('Service IA momentanément indisponible.');
      setTimeout(() => setEnrichError(null), 3000);
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
      <div className="section-panel-header">
        <h2 className="section-title">
          <Sparkles size={20} className="text-accent" />
          <span>Synonymes Intelligents & Nuances</span>
          <span className="section-count-badge">{synonymes.length}</span>
        </h2>

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
      </div>

      {enrichError && (
        <div style={{ padding: '6px 12px', marginBottom: '12px', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-danger, #ef4444)', fontSize: '0.8rem' }}>
          {enrichError}
        </div>
      )}

      {/* Barre de filtres */}
      <div className="filters-bar">
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
    </div>
  );
};
