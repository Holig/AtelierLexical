import React, { useState } from 'react';
import { ExempleUsage } from '../../../shared/types';
import { Feather, RefreshCw, Sparkles, Quote, Copy, Check } from 'lucide-react';
import { ApiClient } from '../services/api';

interface ExamplesWorkshopSectionProps {
  mot: string;
  exemplesInitiaux: ExempleUsage[];
}

export const ExamplesWorkshopSection: React.FC<ExamplesWorkshopSectionProps> = ({
  mot,
  exemplesInitiaux
}) => {
  const [exemples, setExemples] = useState<ExempleUsage[]>(exemplesInitiaux || []);
  const [filterType, setFilterType] = useState<string>('all');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (texte: string, idx: number) => {
    navigator.clipboard.writeText(texte);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleGenererVariations = async () => {
    setIsGenerating(true);
    try {
      const nouveaux = await ApiClient.genererExemples(mot, 'littéraire');
      if (nouveaux && nouveaux.length > 0) {
        setExemples(prev => [...prev, ...nouveaux]);
      }
    } catch (err) {
      console.warn('Erreur génération variations:', err);
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
      <div className="section-panel-header">
        <h2 className="section-title">
          <Feather size={20} className="text-accent" />
          <span>Exemples d'Usage & Tournures Stylistiques</span>
          <span className="section-count-badge">{exemples.length}</span>
        </h2>

        <button
          className="filter-chip"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          onClick={handleGenererVariations}
          disabled={isGenerating}
          title="Générer des exemples d'usage littéraires complémentaires"
        >
          <RefreshCw size={14} className={isGenerating ? 'animate-spin' : ''} />
          <span>{isGenerating ? 'Génération...' : 'Variations stylistiques'}</span>
        </button>
      </div>

      {exemples.length === 0 ? (
        <div style={{ padding: '24px 0', textAlign: 'center' }}>
          <p className="text-muted" style={{ fontSize: '0.92rem' }}>
            Aucune citation littéraire n'est répertoriée dans la notice du Wiktionnaire pour ce terme.
          </p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-faint)', marginTop: '8px' }}>
            Vous pouvez cliquer sur « Variations stylistiques » ci-dessus ou configurer une clé IA (Gemini ou OpenAI) pour générer des exemples littéraires originaux.
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
