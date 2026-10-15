import React, { useState, useEffect } from 'react';
import { X, Info, BookOpen, Cpu, Sparkles, Feather, ExternalLink, Compass, Split, GitBranch, Layers, CheckCircle2, ShieldCheck, Heart } from 'lucide-react';

interface AboutModalProps {
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ onClose }) => {
  const [activeSubTab, setActiveSubTab] = useState<'fonctionnel' | 'technique'>('fonctionnel');

  // Fermeture avec la touche Échap
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.72)',
        backdropFilter: 'blur(5px)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-xl)',
          maxWidth: '780px',
          maxHeight: '92vh',
          overflowY: 'auto',
          width: '100%',
          boxShadow: 'var(--shadow-lg)',
          padding: '28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}
        onClick={e => e.stopPropagation()}
        className="animate-fade-in"
      >
        {/* En-tête de la modale */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-pill)',
                background: 'var(--accent-gold-glow)',
                border: '1px solid var(--border-highlight)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-gold)'
              }}
            >
              <Feather size={20} />
            </div>
            <div>
              <h2 style={{ fontFamily: 'var(--font-serif-display)', fontSize: '1.45rem', color: 'var(--text-main)', margin: 0 }}>
                À Propos de l'Atelier Lexical
              </h2>
              <p style={{ margin: '2px 0 0', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                L'art du mot juste, des nuances stylistiques et de la résonance littéraire
              </p>
            </div>
          </div>
          <button className="icon-btn" onClick={onClose} title="Fermer (Échap)">
            <X size={20} />
          </button>
        </div>

        {/* Bannière de présentation & vocation */}
        <div
          style={{
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '16px 20px',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '4px', background: 'var(--accent-gold)' }} />
          <h3 style={{ fontSize: '1.02rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
            Pourquoi l'Atelier Lexical ?
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.55', margin: 0 }}>
            L'écriture littéraire ne consiste pas simplement à éviter les répétitions : elle exige de choisir le terme qui possède l'intensité exacte, la coloration stylistique adéquate et la juste résonance émotionnelle. L'<strong>Atelier Lexical</strong> a été conçu comme un véritable tablier d'artisan des mots, comblant le fossé entre les dictionnaires statiques et l'exigence des créateurs de récits.
          </p>
        </div>

        {/* Barre des 2 sous-onglets : Fonctionnel vs Technique */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '2px' }}>
          <button
            onClick={() => setActiveSubTab('fonctionnel')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              background: 'transparent',
              border: 'none',
              borderBottom: activeSubTab === 'fonctionnel' ? '2px solid var(--accent-gold)' : '2px solid transparent',
              color: activeSubTab === 'fonctionnel' ? 'var(--text-main)' : 'var(--text-muted)',
              fontFamily: 'var(--font-serif-display)',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all var(--transition-fast)'
            }}
          >
            <BookOpen size={17} className={activeSubTab === 'fonctionnel' ? 'text-accent' : ''} />
            <span>Guide Fonctionnel & Stylistique</span>
          </button>

          <button
            onClick={() => setActiveSubTab('technique')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              background: 'transparent',
              border: 'none',
              borderBottom: activeSubTab === 'technique' ? '2px solid var(--accent-gold)' : '2px solid transparent',
              color: activeSubTab === 'technique' ? 'var(--text-main)' : 'var(--text-muted)',
              fontFamily: 'var(--font-serif-display)',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all var(--transition-fast)'
            }}
          >
            <Cpu size={17} className={activeSubTab === 'technique' ? 'text-accent' : ''} />
            <span>Architecture & Conception Technique</span>
          </button>
        </div>

        {/* Contenu Sous-onglet 1 : FONCTIONNEL */}
        {activeSubTab === 'fonctionnel' && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '12px' }}>
              {/* Module 1 */}
              <div style={{ background: 'var(--bg-surface-elevated)', padding: '14px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                  <Sparkles size={16} className="text-accent" />
                  <span>Nuances & Échelle d'Intensité (1 à 4)</span>
                </div>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: '1.5', margin: 0 }}>
                  Contrairement aux listes plates de synonymes, chaque proposition est qualifiée : <em>Légère (1)</em>, <em>Modérée (2)</em>, <em>Intense (3)</em> ou <em>Extrême (4)</em>, avec filtre par registre (soutenu, familier, poétique) et explications contextuelles de distinction.
                </p>
              </div>

              {/* Module 2 */}
              <div style={{ background: 'var(--bg-surface-elevated)', padding: '14px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                  <GitBranch size={16} className="text-accent" />
                  <span>Famille Lexicale Morphologique</span>
                </div>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: '1.5', margin: 0 }}>
                  Arborescence des mots bâtis sur la même racine (préfixes, suffixes, dérivés directs qualifiés : adjectif, adverbe, verbe). Infobulles complètes avec exemples au survol et fil d'Ariane de provenance pour explorer sans perdre le fil.
                </p>
              </div>

              {/* Module 3 */}
              <div style={{ background: 'var(--bg-surface-elevated)', padding: '14px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                  <Split size={16} className="text-accent" />
                  <span>Antonymes & Oppositions</span>
                </div>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: '1.5', margin: 0 }}>
                  Oppositions directes et contextuelles pour façonner des contrastes stylistiques, des oxymores et des tensions dramatiques percutantes dans vos paragraphes.
                </p>
              </div>

              {/* Module 4 */}
              <div style={{ background: 'var(--bg-surface-elevated)', padding: '14px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                  <Compass size={16} className="text-accent" />
                  <span>Atelier de Nuances (Par Intention)</span>
                </div>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: '1.5', margin: 0 }}>
                  Partir d'une idée ou d'une émotion d'écriture (« <em>remplacer dire dans un dialogue tendu</em> ») pour recevoir des suggestions comparatives avec justification stylistique et exemples romanesques.
                </p>
              </div>
            </div>

            <div style={{ background: 'var(--bg-surface-elevated)', padding: '14px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                <Layers size={16} className="text-accent" />
                <span>Affichage Multi-colonnes & Carnet d'Écrivain</span>
              </div>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                <li><strong>Modes 1, 2, 3 ou 4 colonnes</strong> : disposition ultra-large et panoramique adaptée à votre écran pour comparer simultanément définitions, synonymes empilés, morphologie et champ lexical.</li>
                <li><strong>Déploiement à la demande</strong> : visualisez les définitions sans surcharge, et déroulez les citations littéraires attestées d'un simple clic.</li>
                <li><strong>Carnet & Projets</strong> : classez vos mots favoris par dossier thématique et exportez vos lexiques au format Markdown (compatible Obsidian, Scrivener, Notion).</li>
              </ul>
            </div>
          </div>
        )}

        {/* Contenu Sous-onglet 2 : TECHNIQUE */}
        {activeSubTab === 'technique' && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '12px' }}>
              {/* Technique 1 */}
              <div style={{ background: 'var(--bg-surface-elevated)', padding: '14px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                  <ShieldCheck size={16} className="text-accent" />
                  <span>Parseur Wiktionnaire CC BY-SA 4.0</span>
                </div>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: '1.5', margin: 0 }}>
                  Extraction dynamique du wikitexte officiel via MediaWiki API. Prise en charge des modèles modernes (<code>{'{{lien|mot|fr}}'}</code>, <code>{'{{m|fr}}'}</code>, <code>{'{{exemple}}'}</code>), normalisation des ligatures (<em>œ/æ</em>) et élisions (<em>l', d', s'</em>). Aucune invention de données factuelles.
                </p>
              </div>

              {/* Technique 2 */}
              <div style={{ background: 'var(--bg-surface-elevated)', padding: '14px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                  <Cpu size={16} className="text-accent" />
                  <span>Moteur Linguistique Autonome</span>
                </div>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: '1.5', margin: 0 }}>
                  Algorithme de <strong>Levenshtein</strong> pour la tolérance aux fautes de frappe et suggestions orthographiques. Moteur de conjugaison française déterministe (sans dépendance externe) couvrant tous les modes, temps et verbes irréguliers.
                </p>
              </div>

              {/* Technique 3 */}
              <div style={{ background: 'var(--bg-surface-elevated)', padding: '14px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                  <Layers size={16} className="text-accent" />
                  <span>Architecture Fullstack TypeScript</span>
                </div>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: '1.5', margin: 0 }}>
                  Client <strong>React 18</strong> + <strong>Vite</strong> avec Design System Vanilla CSS (tokens typographiques et chromatiques, mode sombre bibliothèque et papier vélin). Serveur <strong>Express</strong> modulaire avec cache LRU haute performance.
                </p>
              </div>

              {/* Technique 4 */}
              <div style={{ background: 'var(--bg-surface-elevated)', padding: '14px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                  <Sparkles size={16} className="text-accent" />
                  <span>Module IA Hybride & Éthique</span>
                </div>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: '1.5', margin: 0 }}>
                  Compatible Google Gemini et OpenAI. Totalement optionnel : le moteur lexical est 100% fonctionnel sans clé. Lorsqu'activée, l'IA est strictement limitée à la stimulation stylistique et chaque exemple est transparentement étiqueté.
                </p>
              </div>
            </div>

            <div style={{ background: 'var(--bg-surface-elevated)', padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.84rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} style={{ color: '#10b981' }} />
                <span>Suite de tests unitaires et d'intégration validée avec Vitest.</span>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-faint)' }}>v1.0.0 — Production Ready</span>
            </div>
          </div>
        )}

        {/* Pied de la modale */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
            <Heart size={14} style={{ color: 'var(--accent-gold)' }} />
            <span>Conçu pour enrichir la plume des écrivains francophones</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <a
              href="https://github.com/Holig/Atelier-Lexical"
              target="_blank"
              rel="noopener noreferrer"
              className="filter-chip"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', padding: '5px 12px' }}
            >
              <span>Code source GitHub</span>
              <ExternalLink size={12} />
            </a>

            <button
              className="filter-chip active"
              onClick={onClose}
              style={{ fontSize: '0.84rem', padding: '6px 16px' }}
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
