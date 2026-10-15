import React, { useState } from 'react';
import { MotMorphologique } from '../../../shared/types';
import { GitBranch, ArrowUpRight } from 'lucide-react';
import { TilePropositionsModal } from './TilePropositionsModal';
import { WordHoverTooltipPortal, useWordTooltip } from './WordHoverTooltipPortal';

interface LexicalFamilySectionProps {
  famille: MotMorphologique[];
  onNavigateWord: (mot: string) => void;
}

export const LexicalFamilySection: React.FC<LexicalFamilySectionProps> = ({
  famille,
  onNavigateWord
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Hook unifié d'infobulle au survol (partagé pour la tuile et pour la modale)
  const {
    hoveredData,
    handleWordMouseEnter,
    handleWordMouseLeave,
    closeTooltip
  } = useWordTooltip();

  if (!famille || famille.length === 0) return null;

  return (
    <div className="section-panel animate-fade-in">
      <div className="section-panel-header">
        <h2 className="section-title">
          <GitBranch size={20} className="text-accent" />
          <span>Famille Lexicale (Morphologie)</span>
          <button
            type="button"
            className="section-count-badge clickable"
            onClick={() => {
              closeTooltip();
              setIsModalOpen(true);
            }}
            title="Cliquer pour afficher la liste complète de la famille lexicale dans une modale"
          >
            {famille.length}
          </button>
        </h2>
      </div>

      <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '14px' }}>
        Mots partageant la même racine morphologique (dérivés par préfixation, suffixation ou dérivation lexicale).
      </p>

      <div className="family-grid section-scroll-content">
        {famille.map((item, idx) => {
          const isHovered = hoveredData?.mot === item.mot;

          return (
            <div
              key={`${item.mot}-${idx}`}
              className={`family-card-item animate-fade-in ${isHovered ? 'is-hovered' : ''}`}
              onClick={() => {
                closeTooltip();
                onNavigateWord(item.mot);
              }}
              onMouseEnter={(e) => handleWordMouseEnter({
                mot: item.mot,
                badge: item.relation || 'Dérivé morphologique',
                note: item.categorie
              }, e)}
              onMouseLeave={handleWordMouseLeave}
            >
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span className="family-card-word">
                    {item.mot}
                  </span>
                  {item.categorie && (
                    <span className="badge" style={{ fontSize: '0.7rem' }}>
                      {item.categorie}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {item.relation}
                </div>
              </div>
              <ArrowUpRight size={15} className="family-card-arrow text-faint" />
            </div>
          );
        })}
      </div>

      {/* Infobulle Portal flottante avec les détails lexicaux du mot survolé (tuile & modale) */}
      <WordHoverTooltipPortal
        hoveredData={hoveredData}
        onNavigateWord={(mot) => {
          closeTooltip();
          setIsModalOpen(false);
          onNavigateWord(mot);
        }}
        onClose={closeTooltip}
        icon={<GitBranch size={14} className="text-accent" />}
        fallbackDescription="Mots partageant la même racine morphologique (dérivés par préfixation, suffixation ou dérivation lexicale)."
      />

      {/* Modale affichant la totalité des dérivés morphologiques */}
      <TilePropositionsModal
        isOpen={isModalOpen}
        onClose={() => {
          closeTooltip();
          setIsModalOpen(false);
        }}
        title="Famille Lexicale (Morphologie)"
        count={famille.length}
        icon={<GitBranch size={18} />}
        searchPlaceholder="Rechercher un terme dérivé..."
      >
        {(searchTerm) => {
          const list = famille.filter(f =>
            !searchTerm ||
            f.mot.toLowerCase().includes(searchTerm) ||
            (f.relation && f.relation.toLowerCase().includes(searchTerm)) ||
            (f.categorie && f.categorie.toLowerCase().includes(searchTerm))
          );

          if (list.length === 0) {
            return (
              <p className="text-muted" style={{ textAlign: 'center', padding: '24px 0' }}>
                Aucun dérivé ne correspond à « {searchTerm} ».
              </p>
            );
          }

          return (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
              {list.map((item, idx) => {
                const isHovered = hoveredData?.mot === item.mot;

                return (
                  <div
                    key={`${item.mot}-${idx}`}
                    className={`family-card-item ${isHovered ? 'is-hovered' : ''}`}
                    style={{ cursor: 'pointer', padding: '12px 14px' }}
                    onClick={() => {
                      closeTooltip();
                      setIsModalOpen(false);
                      onNavigateWord(item.mot);
                    }}
                    onMouseEnter={(e) => handleWordMouseEnter({
                      mot: item.mot,
                      badge: item.relation || 'Dérivé morphologique',
                      note: item.categorie
                    }, e)}
                    onMouseLeave={handleWordMouseLeave}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main)', textTransform: 'uppercase' }}>
                        {item.mot}
                      </span>
                      <ArrowUpRight size={14} className="text-faint" />
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {item.relation || 'mot dérivé'}
                    </span>
                  </div>
                );
              })}
            </div>
          );
        }}
      </TilePropositionsModal>
    </div>
  );
};
