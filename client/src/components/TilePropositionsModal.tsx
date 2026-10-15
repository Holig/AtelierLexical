import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Search } from 'lucide-react';

interface TilePropositionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  count: number;
  icon?: React.ReactNode;
  motPrincipal?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  children: (searchTerm: string) => React.ReactNode;
}

export const TilePropositionsModal: React.FC<TilePropositionsModalProps> = ({
  isOpen,
  onClose,
  title,
  count,
  icon,
  motPrincipal,
  searchable = true,
  searchPlaceholder = 'Filtrer les propositions...',
  children
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Fermeture avec la touche Échap
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="modal-backdrop animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Liste complète : ${title}`}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
    >
      <div
        className="tile-propositions-modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-xl)',
          width: '100%',
          maxWidth: '760px',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-xl)',
          overflow: 'hidden',
          animation: 'modalSlideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* En-tête de la modale */}
        <div
          style={{
            padding: '16px 22px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            background: 'var(--bg-surface-elevated)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {icon && <span style={{ color: 'var(--accent-gold)' }}>{icon}</span>}
            <h3
              style={{
                fontFamily: 'var(--font-serif-display)',
                fontSize: '1.25rem',
                fontWeight: 700,
                color: 'var(--text-main)',
                margin: 0
              }}
            >
              {title}
            </h3>
            <span className="section-count-badge" style={{ fontSize: '0.82rem', padding: '2px 9px' }}>
              {count}
            </span>
            {motPrincipal && (
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                pour « <strong>{motPrincipal}</strong> »
              </span>
            )}
          </div>

          <button
            type="button"
            className="icon-btn"
            onClick={onClose}
            title="Fermer (Échap)"
            aria-label="Fermer"
            style={{ padding: '6px', borderRadius: '50%' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Barre de recherche interne si demandée */}
        {searchable && count > 4 && (
          <div
            style={{
              padding: '10px 22px',
              borderBottom: '1px solid var(--border-subtle)',
              background: 'var(--bg-surface)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Search size={15} style={{ color: 'var(--text-faint)', flexShrink: 0 }} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={searchPlaceholder}
              autoFocus
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: '0.88rem',
                color: 'var(--text-main)'
              }}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--text-faint)',
                  cursor: 'pointer',
                  fontSize: '0.78rem'
                }}
              >
                Effacer
              </button>
            )}
          </div>
        )}

        {/* Corps défilable avec les propositions */}
        <div
          className="section-scroll-content"
          style={{
            padding: '20px 22px',
            overflowY: 'auto',
            flex: 1
          }}
        >
          {children(searchTerm.trim().toLowerCase())}
        </div>
      </div>
    </div>,
    document.body
  );
};
