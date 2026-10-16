import React, { useState, useEffect } from 'react';
import { ExempleUsage } from '../../../shared/types';
import { Feather, Sparkles, Loader2, Copy, Check } from 'lucide-react';
import { ApiClient } from '../services/api';

interface ExamplesWorkshopSectionProps {
  mot: string;
  exemplesInitiaux: ExempleUsage[];
  onOpenAiModal?: () => void;
  onEnrichirExemples?: (nouveaux: ExempleUsage[]) => void;
}

export const ExamplesWorkshopSection: React.FC<ExamplesWorkshopSectionProps> = ({
  mot,
  exemplesInitiaux,
  onOpenAiModal,
  onEnrichirExemples
}) => {
  const [exemples, setExemples] = useState<ExempleUsage[]>(exemplesInitiaux || []);
  const [filterType, setFilterType] = useState<string>('all');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    setExemples(exemplesInitiaux || []);
  }, [exemplesInitiaux, mot]);

  const handleCopy = (texte: string, idx: number) => {
    navigator.clipboard.writeText(texte);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleGenererVariations = async () => {
    if (!mot) return;
    setGenerateError(null);
    setIsGenerating(true);
    try {
      const status = await ApiClient.getAiStatus();
      if (!status.isConfigured && onOpenAiModal) {
        setIsGenerating(false);
        onOpenAiModal();
        return;
      }

      const nouveaux = await ApiClient.genererExemples(mot, 'littéraire');
      if (nouveaux && nouveaux.length > 0) {
        setExemples(prev => [...prev, ...nouveaux]);
        onEnrichirExemples?.(nouveaux);
      } else {
        setGenerateError('Aucun nouvel exemple généré ou service IA momentanément saturé.');
        setTimeout(() => setGenerateError(null), 4000);
      }
    } catch (err) {
      console.warn('Erreur génération variations:', err);
      setGenerateError('Service IA momentanément indisponible.');
      setTimeout(() => setGenerateError(null), 4000);
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredExemples = exemples.filter(ex => {
    if (filterType === 'all') return true;
    return ex.type === filterType;
  });

  const typesDisponibles = Array.from(new Set(exemples.map(e => e.type || 'narratif')));

  return (
    <div className="section-panel examples-workshop-panel animate-fade-in">
      <div className="section-panel-header" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <h2 className="section-title">
            <Feather size={20} className="text-accent" />
            <span>Exemples d'Usage & Tournures Stylistiques</span>
            <span className="section-count-badge">{exemples.length}</span>
          </h2>
        </div>

        {mot && (
          <div>
            <button
              type="button"
              className={`btn-ai-widget-enrich ${isGenerating ? 'loading' : ''}`}
              onClick={handleGenererVariations}
              disabled={isGenerating}
              title="Générer de nouveaux exemples d'usage littéraires avec l'IA"
            >
              {isGenerating ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Génération IA...</span>
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

      {generateError && (
        <div style={{ padding: '6px 12px', marginBottom: '12px', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-danger, #ef4444)', fontSize: '0.8rem' }}>
          {generateError}
        </div>
      )}

      {exemples.length === 0 ? (
        <div style={{ padding: '24px 0', textAlign: 'center' }}>
          <p className="text-muted" style={{ fontSize: '0.92rem' }}>
            Aucune citation littéraire n'est répertoriée dans la notice du Wiktionnaire pour ce terme.
          </p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-faint)', marginTop: '8px' }}>
            Vous pouvez cliquer sur « Compléter avec l'IA » ci-dessus pour générer des exemples littéraires originaux.
          </p>
        </div>
      ) : (
        <>
          {/* Filtres de types d'exemples */}
          <div className="filters-bar">
            <span className="badge">Type de phrase :</span>
            <button
              className={`filter-chip ${filterType === 'all' ? 'active' : ''}`}
              onClick={() => setFilterType('all')}
            >
              Toutes ({exemples.length})
            </button>
            {typesDisponibles.map(t => (
              <button
                key={t}
                className={`filter-chip ${filterType === t ? 'active' : ''}`}
                onClick={() => setFilterType(t)}
              >
                Phrase {t}
              </button>
            ))}
          </div>

          {/* Cartes d'exemples */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredExemples.map((ex, idx) => (
              <div
                key={idx}
                className="definition-item"
                style={{
                  flexDirection: 'column',
                  gap: '8px',
                  borderLeft: ex.estGenereIA ? '3px solid var(--accent-gold)' : undefined
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="badge badge-gold">
                      {ex.type ? `Phrase ${ex.type}` : 'Exemple d’écriture'}
                    </span>
                    {ex.estGenereIA && (
                      <span className="badge" style={{ color: 'var(--accent-gold)' }}>
                        <Sparkles size={12} />
                        Généré par IA
                      </span>
                    )}
                  </div>

                  <button
                    className="icon-btn"
                    style={{ width: '28px', height: '28px' }}
                    onClick={() => handleCopy(ex.texte, idx)}
                    title="Copier cet exemple pour votre manuscrit"
                  >
                    {copiedIndex === idx ? <Check size={14} color="var(--color-intensity-1)" /> : <Copy size={14} />}
                  </button>
                </div>

                <div className="example-quote" style={{ fontSize: '1.08rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
                  « {ex.texte} »
                </div>

                {ex.source && (
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-faint)' }}>
                    Source : {ex.source}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
