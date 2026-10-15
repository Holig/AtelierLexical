import React, { useState } from 'react';
import { ExpressionLocution } from '../../../shared/types';
import { Scroll, Compass, BookOpen } from 'lucide-react';
import { TilePropositionsModal } from './TilePropositionsModal';

interface ExpressionsSectionProps {
  expressions: ExpressionLocution[];
}

export const ExpressionsSection: React.FC<ExpressionsSectionProps> = ({ expressions }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!expressions || expressions.length === 0) return null;

  return (
    <div className="section-panel animate-fade-in">
      <div className="section-panel-header">
        <h2 className="section-title">
          <Scroll size={20} className="text-accent" />
          <span>Expressions & Locutions Consacrées</span>
          <button
            type="button"
            className="section-count-badge clickable"
            onClick={() => setIsModalOpen(true)}
            title="Cliquer pour afficher la liste complète des expressions dans une modale"
          >
            {expressions.length}
          </button>
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

      {/* Modale affichant la totalité des expressions */}
      <TilePropositionsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Expressions & Locutions Consacrées"
        count={expressions.length}
        icon={<Scroll size={18} />}
        searchPlaceholder="Rechercher une expression..."
      >
        {(searchTerm) => {
          const list = expressions.filter(e =>
            !searchTerm ||
            e.expression.toLowerCase().includes(searchTerm) ||
            e.sens.toLowerCase().includes(searchTerm) ||
            (e.origine && e.origine.toLowerCase().includes(searchTerm))
          );

          if (list.length === 0) {
            return (
              <p className="text-muted" style={{ textAlign: 'center', padding: '24px 0' }}>
                Aucune expression ne correspond à « {searchTerm} ».
              </p>
            );
          }

          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {list.map((exp, idx) => (
                <div
                  key={`${exp.expression}-${idx}`}
                  className="definition-item"
                  style={{
                    flexDirection: 'column',
                    gap: '8px',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '16px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontFamily: 'var(--font-serif-display)', fontWeight: 700, fontSize: '1.15rem', color: 'var(--text-main)' }}>
                      {exp.expression}
                    </div>
                    {exp.registre && <span className="badge">{exp.registre}</span>}
                  </div>

                  <p style={{ fontSize: '0.92rem', color: 'var(--text-main)', lineHeight: 1.4, margin: '2px 0' }}>
                    {exp.sens}
                  </p>

                  {exp.origine && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                      <Compass size={14} style={{ marginTop: '2px', flexShrink: 0 }} />
                      <span>Origine : {exp.origine}</span>
                    </div>
                  )}

                  {exp.exemple && (
                    <div className="example-quote" style={{ fontSize: '0.88rem', marginTop: '4px' }}>
                      « {exp.exemple} »
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
