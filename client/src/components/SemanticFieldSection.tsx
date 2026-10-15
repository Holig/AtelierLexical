import React from 'react';
import { ElementChampLexical } from '../../../shared/types';
import { Network, ArrowUpRight, Info } from 'lucide-react';

interface SemanticFieldSectionProps {
  champLexical: ElementChampLexical[];
  onNavigateWord: (mot: string) => void;
}

export const SemanticFieldSection: React.FC<SemanticFieldSectionProps> = ({
  champLexical,
  onNavigateWord
}) => {
  if (!champLexical || champLexical.length === 0) return null;

  return (
    <div className="section-panel animate-fade-in">
      <div className="section-panel-header">
        <h2 className="section-title">
          <Network size={20} className="text-accent" />
          <span>Champ Lexical & Associations d'Idées</span>
          <span className="section-count-badge">{champLexical.length}</span>
        </h2>
      </div>

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
            {elem.note && <span style={{ fontSize: '0.75rem', color: 'var(--text-faint)' }}>({elem.note})</span>}
            <ArrowUpRight size={14} className="text-faint" />
          </button>
        ))}
      </div>
    </div>
  );
};
