import React from 'react';
import { FicheConjugaison } from '../../../shared/types';
import { X, BookCheck, Copy, Check } from 'lucide-react';

interface ConjugationModalProps {
  conjugaison: FicheConjugaison;
  onClose: () => void;
}

export const ConjugationModal: React.FC<ConjugationModalProps> = ({
  conjugaison,
  onClose
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopyAll = () => {
    const text = `Conjugaison du verbe « ${conjugaison.verbe} » (Groupe ${conjugaison.groupe}, Auxiliaire : ${conjugaison.auxiliaire})\n\n` +
      `[Indicatif Présent]\n${conjugaison.temps.indicatifPresent.join('\n')}\n\n` +
      `[Indicatif Imparfait]\n${conjugaison.temps.indicatifImparfait.join('\n')}\n\n` +
      `[Indicatif Passé Simple]\n${conjugaison.temps.indicatifPasseSimple.join('\n')}\n\n` +
      `[Indicatif Futur Simple]\n${conjugaison.temps.indicatifFuturSimple.join('\n')}\n\n` +
      `[Subjonctif Présent]\n${conjugaison.temps.subjonctifPresent.join('\n')}\n\n` +
      `[Conditionnel Présent]\n${conjugaison.temps.conditionnelPresent.join('\n')}\n\n` +
      `Participe Présent : ${conjugaison.temps.participePresent}\n` +
      `Participe Passé : ${conjugaison.temps.participePasse}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-xl)',
          maxWidth: '850px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: 'var(--shadow-lg)',
          padding: '28px'
        }}
        onClick={e => e.stopPropagation()}
        className="animate-fade-in"
      >
        {/* Header modal */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <BookCheck size={24} className="text-accent" />
              <h2 style={{ fontFamily: 'var(--font-serif-display)', fontSize: '1.8rem', color: 'var(--text-main)' }}>
                Conjugaison : {conjugaison.verbe}
              </h2>
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
              <span className="badge badge-gold">Verbe du {conjugaison.groupe}e groupe</span>
              <span className="badge">Auxiliaire : {conjugaison.auxiliaire}</span>
              <span className="badge">Participe : {conjugaison.temps.participePasse}</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button className="icon-btn" onClick={handleCopyAll} title="Copier tous les tableaux">
              {copied ? <Check size={16} color="var(--color-intensity-1)" /> : <Copy size={16} />}
            </button>
            <button className="icon-btn" onClick={onClose} title="Fermer">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Grille des temps de conjugaison */}
        <div className="conjugation-table-grid">
          <div className="tense-box">
            <h3 className="tense-title">Indicatif Présent</h3>
            <ul className="tense-forms-list">
              {conjugaison.temps.indicatifPresent.map((f, i) => (
                <li key={i} className="tense-form-item">{f}</li>
              ))}
            </ul>
          </div>

          <div className="tense-box">
            <h3 className="tense-title">Indicatif Imparfait</h3>
            <ul className="tense-forms-list">
              {conjugaison.temps.indicatifImparfait.map((f, i) => (
                <li key={i} className="tense-form-item">{f}</li>
              ))}
            </ul>
          </div>

          <div className="tense-box">
            <h3 className="tense-title">Indicatif Passé Simple</h3>
            <ul className="tense-forms-list">
              {conjugaison.temps.indicatifPasseSimple.map((f, i) => (
                <li key={i} className="tense-form-item">{f}</li>
              ))}
            </ul>
          </div>

          <div className="tense-box">
            <h3 className="tense-title">Indicatif Futur Simple</h3>
            <ul className="tense-forms-list">
              {conjugaison.temps.indicatifFuturSimple.map((f, i) => (
                <li key={i} className="tense-form-item">{f}</li>
              ))}
            </ul>
          </div>

          <div className="tense-box">
            <h3 className="tense-title">Subjonctif Présent</h3>
            <ul className="tense-forms-list">
              {conjugaison.temps.subjonctifPresent.map((f, i) => (
                <li key={i} className="tense-form-item">{f}</li>
              ))}
            </ul>
          </div>

          <div className="tense-box">
            <h3 className="tense-title">Subjonctif Imparfait</h3>
            <ul className="tense-forms-list">
              {conjugaison.temps.subjonctifImparfait.map((f, i) => (
                <li key={i} className="tense-form-item">{f}</li>
              ))}
            </ul>
          </div>

          <div className="tense-box">
            <h3 className="tense-title">Conditionnel Présent</h3>
            <ul className="tense-forms-list">
              {conjugaison.temps.conditionnelPresent.map((f, i) => (
                <li key={i} className="tense-form-item">{f}</li>
              ))}
            </ul>
          </div>

          <div className="tense-box">
            <h3 className="tense-title">Impératif Présent</h3>
            <ul className="tense-forms-list">
              {conjugaison.temps.imperatifPresent.map((f, i) => (
                <li key={i} className="tense-form-item">{f}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
