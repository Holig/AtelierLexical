import React from 'react';
import { ExpressionLocution } from '../../../shared/types';
import { Scroll, Compass, BookOpen } from 'lucide-react';

interface ExpressionsSectionProps {
  expressions: ExpressionLocution[];
}

export const ExpressionsSection: React.FC<ExpressionsSectionProps> = ({ expressions }) => {
  if (!expressions || expressions.length === 0) return null;

  return (
    <div className="section-panel animate-fade-in">
      <div className="section-panel-header">
        <h2 className="section-title">
          <Scroll size={20} className="text-accent" />
          <span>Expressions & Locutions Consacrées</span>
          <span className="section-count-badge">{expressions.length}</span>
        </h2>
      </div>

      <div className="expressions-grid section-scroll-content">
        {expressions.map((exp, idx) => (
          <div key={`${exp.expression}-${idx}`} className="definition-item" style={{ flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontFamily: 'var(--font-serif-display)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-main)' }}>
                {exp.expression}
              </div>
              {exp.registre && <span className="badge">{exp.registre}</span>}
            </div>

            <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
              {exp.sens}
            </p>

            {exp.origine && (
              <div style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                <Compass size={14} style={{ marginTop: '2px', flexShrink: 0 }} />
                <span>Origine : {exp.origine}</span>
              </div>
            )}

            {exp.exemple && (
              <div className="example-quote" style={{ fontSize: '0.9rem', marginTop: '4px' }}>
                « {exp.exemple} »
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
