import { MotSauvegarde, CollectionEcriture } from '../../../shared/types';

const STORAGE_KEYS = {
  THEME: 'atelier_lexical_theme',
  HISTORY: 'atelier_lexical_history',
  FAVORITES: 'atelier_lexical_favorites',
  COLLECTIONS: 'atelier_lexical_collections',
  COLUMNS: 'atelier_lexical_columns'
};

const DEFAULT_COLLECTIONS: CollectionEcriture[] = [
  {
    id: 'col-general',
    nom: 'Général',
    description: 'Mots favoris généraux',
    couleur: '#d97706',
    dateCreation: new Date().toISOString()
  },
  {
    id: 'col-roman',
    nom: 'Projet : Roman',
    description: 'Vocabulaire choisi pour l’intrigue principale',
    couleur: '#3b82f6',
    dateCreation: new Date().toISOString()
  },
  {
    id: 'col-emotions',
    nom: 'Émotions & Psychologie',
    description: 'Nuances des états d’âme et réactions',
    couleur: '#10b981',
    dateCreation: new Date().toISOString()
  }
];

export class StorageService {
  public static getTheme(): 'dark' | 'light' {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME);
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }

  public static setTheme(theme: 'dark' | 'light'): void {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
    document.documentElement.setAttribute('data-theme', theme);
  }

  public static getColumnsLayout(): 1 | 2 | 3 {
    const val = localStorage.getItem(STORAGE_KEYS.COLUMNS);
    if (val === '1' || val === '2' || val === '3') {
      return Number(val) as 1 | 2 | 3;
    }
    return 2;
  }

  public static setColumnsLayout(cols: 1 | 2 | 3): void {
    localStorage.setItem(STORAGE_KEYS.COLUMNS, String(cols));
  }

  public static getHistory(): string[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HISTORY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public static addToHistory(mot: string): void {
    if (!mot) return;
    const history = this.getHistory().filter(m => m.toLowerCase() !== mot.toLowerCase());
    history.unshift(mot);
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history.slice(0, 20)));
  }

  public static clearHistory(): void {
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
  }

  public static getFavorites(): MotSauvegarde[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public static isFavorite(mot: string): boolean {
    const favorites = this.getFavorites();
    return favorites.some(f => f.mot.toLowerCase() === mot.toLowerCase());
  }

  public static toggleFavorite(mot: string, collectionId: string = 'col-general'): boolean {
    const favorites = this.getFavorites();
    const index = favorites.findIndex(f => f.mot.toLowerCase() === mot.toLowerCase());

    if (index >= 0) {
      favorites.splice(index, 1);
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
      return false;
    } else {
      favorites.unshift({
        mot,
        dateAjout: new Date().toISOString(),
        collectionId
      });
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
      return true;
    }
  }

  public static updateNote(mot: string, note: string): void {
    const favorites = this.getFavorites();
    const item = favorites.find(f => f.mot.toLowerCase() === mot.toLowerCase());
    if (item) {
      item.notes = note;
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
    }
  }

  public static getCollections(): CollectionEcriture[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.COLLECTIONS);
      return data ? JSON.parse(data) : DEFAULT_COLLECTIONS;
    } catch {
      return DEFAULT_COLLECTIONS;
    }
  }

  public static addCollection(nom: string, description?: string): CollectionEcriture {
    const collections = this.getCollections();
    const nouvelle: CollectionEcriture = {
      id: `col-${Date.now()}`,
      nom: nom.trim(),
      description,
      couleur: '#d97706',
      dateCreation: new Date().toISOString()
    };
    collections.push(nouvelle);
    localStorage.setItem(STORAGE_KEYS.COLLECTIONS, JSON.stringify(collections));
    return nouvelle;
  }
}
