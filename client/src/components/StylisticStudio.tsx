import React, { useState } from 'react';
import { Sparkles, Compass, ArrowRight, Lightbulb, Send, Feather, Check, Copy } from 'lucide-react';
import { ApiClient } from '../services/api';
import { IntentionRecherche, ReponseAtelierStylistique, Intensite, Registre } from '../../../shared/types';

interface StylisticStudioProps {
  onNavigateWord: (mot: string) => void;
}

const EXEMPLES_INTENTIONS = [
  'Peur soudaine, intense, qui paralyse un personnage',
  'Remplacer le verbe dire dans un dialogue conflictuel et tendu',
  'Rendre une description de paysage plus sombre et funèbre',
  'Colère froide, enfouie, qui fermente avec les années',
  'Regard amoureux discret, timide et intense'
];

export const StylisticStudio: React.FC<StylisticStudioProps> = ({ onNavigateWord }) => {
  const [idee, setIdee] = useState('');
  const [emotion, setEmotion] = useState('');
  const [intensite, setIntensite] = useState<Intensite>(3);
  const [registre, setRegistre] = useState<Registre>('littéraire');
  const [contexteNarratif, setContexteNarratif] = useState<'description' | 'action' | 'dialogue' | 'poésie' | 'psychologique'>('psychologique');
  const [isLoading, setIsLoading] = useState(false);
  const [resultat, setResultat] = useState<ReponseAtelierStylistique | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleSearch = async (e?: React.FormEvent, customIdee?: string) => {
    if (e) e.preventDefault();
    const query = customIdee || idee;
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      const intention: IntentionRecherche = {
        idee: query.trim(),
        emotion: emotion || undefined,
        intensite,
        registre,
        contexteNarratif
      };
      const rep = await ApiClient.chercherIntentionStylistique(intention);
      setResultat(rep);
    } catch (err) {
      console.error('Erreur atelier stylistique:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectQuickIntent = (texte: string) => {
    setIdee(texte);
    handleSearch(undefined, texte);
  };

  const handleCopyPhrase = (texte: string, idx: number) => {
    navigator.clipboard.writeText(texte);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
      {/* Héro de l'Atelier */}
      <div className="studio-hero">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <Sparkles size={24} className="text-accent" />
          <h2 className="studio-hero-title">Atelier de Nuances Stylistiques</h2>
        </div>
        <p className="text-muted" style={{ fontSize: '1rem', maxWidth: '780px' }}>
          Partez de votre intention narrative pour trouver le mot exact, comprendre ses subtilités
          et découvrir comment l’intégrer avec élégance dans votre récit.
        </p>

        {/* Suggestions rapides d'intentions */}
        <div className="intent-quick-chips">
          {EXEMPLES_INTENTIONS.map((ex, i) => (
            <button
              key={i}
              className="quick-chip"
              onClick={() => handleSelectQuickIntent(ex)}
            >
              « {ex} »
            </button>
          ))}
        </div>
      </div>

      {/* Formulaire de recherche par intention */}
      <div className="section-panel">
        <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px', color: 'var(--text-main)' }}>
              Décrivez ce que vous souhaitez exprimer ou l'effet recherché sur le lecteur :
            </label>
            <textarea
              className="search-input"
              style={{
                width: '100%',
                minHeight: '80px',
                padding: '14px 16px',
                borderRadius: 'var(--radius-lg)',
                border: '1.5px solid var(--border-medium)',
                background: 'var(--bg-input)',
                resize: 'vertical',
                lineHeight: 1.5
              }}
              placeholder="Ex : Je cherche un mot pour qualifier un silence lourd et menaçant avant un drame..."
              value={idee}
              onChange={e => setIdee(e.target.value)}
            />
          </div>

          {/* Filtres contextuels */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-md)' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-muted)' }}>
                Intensité souhaitée
              </label>
              <select
                className="filter-chip"
                style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)' }}
                value={intensite}
                onChange={e => setIntensite(Number(e.target.value) as Intensite)}
              >
                <option value={1}>1 — Légère / Atténuée</option>
                <option value={2}>2 — Modérée / Équilibrée</option>
                <option value={3}>3 — Intense / Marquée</option>
                <option value={4}>4 — Paroxystique / Extrême</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-muted)' }}>
                Registre stylistique
              </label>
              <select
                className="filter-chip"
                style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)' }}
                value={registre}
                onChange={e => setRegistre(e.target.value as Registre)}
              >
                <option value="littéraire">Littéraire</option>
                <option value="soutenu">Soutenu</option>
                <option value="courant">Courant</option>
                <option value="poétique">Poétique</option>
                <option value="familier">Familier</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-muted)' }}>
                Contexte d'emploi
              </label>
              <select
                className="filter-chip"
                style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)' }}
                value={contexteNarratif}
                onChange={e => setContexteNarratif(e.target.value as any)}
              >
                <option value="psychologique">Monologue / Psychologie</option>
                <option value="description">Description de décor / scène</option>
                <option value="dialogue">Échange verbal / Dialogue</option>
                <option value="action">Scène d'action / Tension</option>
                <option value="poésie">Prose poétique</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              className="search-submit-btn"
              disabled={isLoading || !idee.trim()}
              style={{ padding: '12px 28px', fontSize: '1rem' }}
            >
              <span>{isLoading ? 'Analyse stylistique...' : 'Trouver les mots justes'}</span>
              <Send size={16} />
            </button>
          </div>
        </form>
      </div>

      {/* Résultats de l'Atelier */}
      {resultat && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
          {/* Conseil stylistique */}
          <div
            className="definition-item"
            style={{
              background: 'var(--bg-surface-elevated)',
              borderLeft: '4px solid var(--accent-gold)',
              alignItems: 'flex-start',
              gap: '12px'
            }}
          >
            <Lightbulb size={22} className="text-accent" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                Conseil d'atelier :
              </div>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                {resultat.conseilStylistique}
              </p>
            </div>
          </div>

          {/* Grille des mots proposés */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-lg)' }}>
            {resultat.motsProposes.map((prop, idx) => (
              <div
                key={`${prop.mot}-${idx}`}
                className="section-panel"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 'var(--space-md)',
                  transition: 'transform var(--transition-fast)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                      <span
                        style={{
                          fontFamily: 'var(--font-serif-display)',
                          fontSize: '1.5rem',
                          fontWeight: 700,
                          color: 'var(--text-main)',
                          cursor: 'pointer'
                        }}
                        onClick={() => onNavigateWord(prop.mot)}
                        title="Consulter la fiche complète"
                      >
                        {prop.mot}
                      </span>
                      <span className="badge badge-gold">{prop.categorie}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="badge">{prop.registre}</span>
                      <span className={`intensity-dot intensity-${prop.intensite}`} title={`Intensité ${prop.intensite}/4`} />
                    </div>
                  </div>

                  <div style={{ fontSize: '0.92rem', color: 'var(--text-main)', marginBottom: '8px', lineHeight: 1.4 }}>
                    <strong>Pourquoi ce mot :</strong> {prop.pourquoiCeMot}
                  </div>

                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px', lineHeight: 1.4 }}>
                    <strong>Nuance distinctive :</strong> {prop.nuanceDistinctive}
                  </div>
                </div>

                <div>
                  {/* Exemple de phrase */}
                  <div
                    className="example-quote"
                    style={{
                      fontSize: '0.98rem',
                      lineHeight: 1.4,
                      position: 'relative',
                      paddingRight: '30px'
                    }}
                  >
                    « {prop.exemplePhrase} »
                    <button
                      className="icon-btn"
                      style={{ position: 'absolute', top: 0, right: 0, width: '24px', height: '24px' }}
                      onClick={() => handleCopyPhrase(prop.exemplePhrase, idx)}
                      title="Copier la phrase"
                    >
                      {copiedIndex === idx ? <Check size={12} color="var(--color-intensity-1)" /> : <Copy size={12} />}
                    </button>
                  </div>

                  <div style={{ marginTop: '14px', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      className="filter-chip active"
                      style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                      onClick={() => onNavigateWord(prop.mot)}
                    >
                      <span>Voir la fiche</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
