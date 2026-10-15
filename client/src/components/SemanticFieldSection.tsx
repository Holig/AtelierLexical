import React, { useState } from 'react';
import { ElementChampLexical } from '../../../shared/types';
import { Network, ArrowUpRight, Info, Sparkles, Loader2 } from 'lucide-react';
import { ApiClient } from '../services/api';

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
      <div className="section-panel-header">
        <h2 className="section-title">
          <Network size={20} className="text-accent" />
          <span>Champ Lexical & Associations d'Idées</span>
          <span className="section-count-badge">{champLexical.length}</span>
        </h2>

        {motPrincipal && (
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
        )}
      </div>

      {enrichError && (
        <div style={{ padding: '6px 12px', marginBottom: '12px', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-danger, #ef4444)', fontSize: '0.8rem' }}>
          {enrichError}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
        <Info size={16} className="text-accent" style={{ flexShrink: 0 }} />
        <span>
          Ces associations conceptuelles ou sensorielles enrichissent l’univers du texte sans être pour autant des synonymes stricts.
        </span>
      </div>

      <div className="chips-cloud-wrap section-scroll-content" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignContent: 'flex-start' }}>
        {champLexical.map((elem, idx) => (
          <button
            key={`${elem.mot}-${idx}`}
            className="filter-chip"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', fontSize: '0.9rem' }}
            onClick={() => onNavigateWord(elem.mot)}
            title={elem.note || `Explorer « ${elem.mot} »`}
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
        ))}
      </div>
    </div>
  );
};
