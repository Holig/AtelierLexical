import React from 'react';
import { Antonyme } from '../../../shared/types';
import { Split, ArrowUpRight } from 'lucide-react';

interface AntonymsSectionProps {
  antonymes: Antonyme[];
  onNavigateWord: (mot: string) => void;
}

export const AntonymsSection: React.FC<AntonymsSectionProps> = ({
  antonymes,
  onNavigateWord
}) => {
  if (!antonymes || antonymes.length === 0) return null;

  return (
    <div className="section-panel animate-fade-in">
      <div className="section-panel-header">
        <h2 className="section-title">
          <Split size={20} className="text-accent" />
          <span>Antonymes & Oppositions</span>
          <span className="section-count-badge">{antonymes.length}</span>
        </h2>
      </div>

      <div className="chips-cloud-wrap section-scroll-content" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignContent: 'flex-start' }}>
        {antonymes.map((ant, idx) => (
          <button
            key={`${ant.mot}-${idx}`}
            className="filter-chip"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', padding: '6px 14px' }}
            onClick={() => onNavigateWord(ant.mot)}
            title={`Explorer la fiche de « ${ant.mot} »`}
          >
            <span style={{ fontWeight: 600 }}>{ant.mot}</span>
            {ant.type === 'contextuel' && <span className="badge" style={{ fontSize: '0.7rem' }}>contexte</span>}
            <ArrowUpRight size={14} className="text-faint" />
          </button>
        ))}
      </div>
    </div>
  );
};
