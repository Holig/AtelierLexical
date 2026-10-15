import React, { useState } from 'react';
import { Bookmark, FolderPlus, Download, Trash2, Edit3, ArrowRight, BookOpen, Check } from 'lucide-react';
import { StorageService } from '../services/storage.service';
import { MotSauvegarde, CollectionEcriture } from '../../../shared/types';

interface WriterNotebookProps {
  onNavigateWord: (mot: string) => void;
  onFavoritesChange: () => void;
}

export const WriterNotebook: React.FC<WriterNotebookProps> = ({
  onNavigateWord,
  onFavoritesChange
}) => {
  const [favorites, setFavorites] = useState<MotSauvegarde[]>(StorageService.getFavorites());
  const [collections, setCollections] = useState<CollectionEcriture[]>(StorageService.getCollections());
  const [activeCollectionId, setActiveCollectionId] = useState<string>('all');
  const [newColName, setNewColName] = useState('');
  const [showAddCol, setShowAddCol] = useState(false);
  const [editingMot, setEditingMot] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const [exported, setExported] = useState(false);

  const handleToggleFav = (mot: string) => {
    StorageService.toggleFavorite(mot);
    const updated = StorageService.getFavorites();
    setFavorites(updated);
    onFavoritesChange();
  };

  const handleSaveNote = (mot: string) => {
    StorageService.updateNote(mot, noteText);
    setFavorites(StorageService.getFavorites());
    setEditingMot(null);
  };

  const handleCreateCollection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColName.trim()) return;
    const nouvelle = StorageService.addCollection(newColName.trim());
    setCollections(StorageService.getCollections());
    setActiveCollectionId(nouvelle.id);
    setNewColName('');
    setShowAddCol(false);
  };

  const filteredFavorites = favorites.filter(f => {
    if (activeCollectionId === 'all') return true;
    return f.collectionId === activeCollectionId;
  });

  const handleExportMarkdown = () => {
    let md = `# Carnet d'Écrivain — Atelier Lexical\n`;
    md += `*Exporté le ${new Date().toLocaleDateString('fr-FR')}*\n\n`;

    filteredFavorites.forEach(f => {
      md += `## ${f.mot}\n`;
      md += `- Date d'enregistrement : ${new Date(f.dateAjout).toLocaleDateString('fr-FR')}\n`;
      if (f.notes) {
        md += `- Notes d'écriture : ${f.notes}\n`;
      }
      md += '\n';
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `carnet-ecrivain-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);

    setExported(true);
    setTimeout(() => setExported(false), 2000);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
      {/* En-tête du carnet */}
      <div className="section-panel" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-serif-display)', fontSize: '1.8rem', color: 'var(--text-main)', marginBottom: '4px' }}>
            Carnet d'Écrivain
          </h2>
          <p className="text-muted" style={{ fontSize: '0.95rem' }}>
            Organisez vos trouvailles lexicales par projet d'écriture, ajoutez vos annotations et exportez votre lexique vers votre logiciel d'écriture.
          </p>
        </div>

        <button
          className="search-submit-btn"
          onClick={handleExportMarkdown}
          disabled={favorites.length === 0}
          title="Télécharger votre carnet au format Markdown (compatible Obsidian, Scrivener, Word, Notion)"
        >
          {exported ? <Check size={16} /> : <Download size={16} />}
          <span>{exported ? 'Fichier Markdown exporté !' : 'Exporter (.md)'}</span>
        </button>
      </div>

      <div className="notebook-grid">
        {/* Barre latérale des collections / projets */}
        <div className="collections-sidebar">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 12px 10px', borderBottom: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-faint)' }}>
              Projets & Listes
            </span>
            <button
              className="icon-btn"
              style={{ width: '26px', height: '26px' }}
              onClick={() => setShowAddCol(!showAddCol)}
              title="Créer une nouvelle collection"
            >
              <FolderPlus size={14} />
            </button>
          </div>

          {showAddCol && (
            <form onSubmit={handleCreateCollection} style={{ padding: '8px' }}>
              <input
                type="text"
                placeholder="Nom du projet..."
                value={newColName}
                onChange={e => setNewColName(e.target.value)}
                className="search-input"
                style={{
                  width: '100%',
                  padding: '6px 10px',
                  fontSize: '0.85rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-medium)',
                  marginBottom: '6px'
                }}
                autoFocus
              />
              <button
                type="submit"
                className="filter-chip active"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Créer
              </button>
            </form>
          )}

          <div
            className={`collection-item ${activeCollectionId === 'all' ? 'active' : ''}`}
            onClick={() => setActiveCollectionId('all')}
          >
            <span>Tous les mots</span>
            <span className="badge">{favorites.length}</span>
          </div>

          {collections.map(col => {
            const count = favorites.filter(f => f.collectionId === col.id).length;
            return (
              <div
                key={col.id}
                className={`collection-item ${activeCollectionId === col.id ? 'active' : ''}`}
                onClick={() => setActiveCollectionId(col.id)}
              >
                <span>{col.nom}</span>
                <span className="badge">{count}</span>
              </div>
            );
          })}
        </div>

        {/* Liste des mots enregistrés */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filteredFavorites.length > 0 ? (
            filteredFavorites.map(fav => (
              <div
                key={fav.mot}
                className="section-panel"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  padding: '18px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-serif-display)',
                        fontSize: '1.4rem',
                        fontWeight: 700,
                        color: 'var(--text-main)',
                        cursor: 'pointer'
                      }}
                      onClick={() => onNavigateWord(fav.mot)}
                      title="Explorer la fiche"
                    >
                      {fav.mot}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-faint)' }}>
                      Ajouté le {new Date(fav.dateAjout).toLocaleDateString('fr-FR')}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button
                      className="icon-btn"
                      onClick={() => onNavigateWord(fav.mot)}
                      title="Consulter la fiche lexicale"
                    >
                      <BookOpen size={16} />
                    </button>

                    <button
                      className="icon-btn"
                      onClick={() => {
                        setEditingMot(editingMot === fav.mot ? null : fav.mot);
                        setNoteText(fav.notes || '');
                      }}
                      title="Ajouter ou modifier une note"
                    >
                      <Edit3 size={16} />
                    </button>

                    <button
                      className="icon-btn"
                      onClick={() => handleToggleFav(fav.mot)}
                      title="Supprimer du carnet"
                    >
                      <Trash2 size={16} color="var(--color-intensity-4)" />
                    </button>
                  </div>
                </div>

                {/* Formulaire de modification de note */}
                {editingMot === fav.mot ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <textarea
                      value={noteText}
                      onChange={e => setNoteText(e.target.value)}
                      placeholder="Vos notes (ex : mot à placer dans le chapitre 4 lors de la dispute...)"
                      style={{
                        width: '100%',
                        minHeight: '60px',
                        padding: '10px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-medium)',
                        background: 'var(--bg-input)',
                        color: 'var(--text-main)',
                        fontSize: '0.9rem'
                      }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <button
                        className="filter-chip"
                        onClick={() => setEditingMot(null)}
                      >
                        Annuler
                      </button>
                      <button
                        className="filter-chip active"
                        onClick={() => handleSaveNote(fav.mot)}
                      >
                        Enregistrer la note
                      </button>
                    </div>
                  </div>
                ) : (
                  fav.notes && (
                    <div
                      style={{
                        background: 'var(--bg-surface-elevated)',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-md)',
                        borderLeft: '3px solid var(--accent-gold)',
                        fontSize: '0.9rem',
                        color: 'var(--text-muted)'
                      }}
                    >
                      <strong>Note personnelle :</strong> {fav.notes}
                    </div>
                  )
                )}
              </div>
            ))
          ) : (
            <div className="section-panel" style={{ textAlign: 'center', padding: '40px 20px' }}>
              <Bookmark size={36} className="text-faint" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ fontFamily: 'var(--font-serif-display)', fontSize: '1.2rem', marginBottom: '6px' }}>
                Votre carnet est encore vide
              </h3>
              <p className="text-muted" style={{ fontSize: '0.9rem', maxWidth: '420px', margin: '0 auto' }}>
                Cliquez sur l'icône de signet dans les fiches lexicales pour sauvegarder vos mots favoris et les organiser par projet d'écriture.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
