import React from 'react';
import { Feather, ExternalLink, ShieldCheck } from 'lucide-react';

interface FooterProps {
  onNavigateAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigateAdmin }) => {
  return (
    <footer className="app-footer">
      <div className="footer-inner">
        <div className="footer-attribution">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Feather size={18} className="text-accent" />
            <span style={{ fontFamily: 'var(--font-serif-display)', fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)' }}>
              Atelier Lexical
            </span>
            <span>— L'assistant de vocabulaire et de style pour les écrivains</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <a
              href="https://fr.wiktionary.org"
              target="_blank"
              rel="noopener noreferrer"
              className="license-link"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              <span>Données : Wiktionnaire (CC BY-SA 4.0)</span>
              <ExternalLink size={12} />
            </a>

            {onNavigateAdmin && (
              <button
                type="button"
                onClick={onNavigateAdmin}
                className="license-link"
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
                title="Gérer le lien de soutien et les paramètres d'administration"
              >
                <span>Administration</span>
              </button>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.8rem', color: 'var(--text-faint)' }}>
          <ShieldCheck size={16} className="text-accent" style={{ flexShrink: 0, marginTop: '2px' }} />
          <span>
            <strong>Charte de fiabilité & éthique :</strong> Les définitions, phonétiques, dérivations et expressions proviennent des données ouvertes du Wiktionnaire francophone. L'analyse par intensité et nuances stylistiques est assurée par le moteur de l'Atelier. Tout contenu généré par intelligence artificielle est explicitement étiqueté et ne saurait se substituer aux données lexicales attestées.
          </span>
        </div>
      </div>
    </footer>
  );
};
