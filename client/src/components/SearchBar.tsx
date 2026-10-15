import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Clock, ArrowRight, CornerDownLeft } from 'lucide-react';
import { ApiClient } from '../services/api';
import { StorageService } from '../services/storage.service';

interface SearchBarProps {
  onSearch: (mot: string) => void;
  initialValue?: string;
  isLoading?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  initialValue = '',
  isLoading = false
}) => {
  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setQuery(initialValue);
  }, [initialValue]);

  useEffect(() => {
    setHistory(StorageService.getHistory());
  }, []);

  // Suggestions automatiques debouncées
  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const results = await ApiClient.getSuggestions(query.trim());
        setSuggestions(results);
      } catch (err) {
        setSuggestions([]);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Fermer le menu lors d'un clic extérieur
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const mot = query.trim();
    if (!mot) return;

    setIsOpen(false);
    StorageService.addToHistory(mot);
    setHistory(StorageService.getHistory());
    onSearch(mot);
  };

  const handleSelectSuggestion = (mot: string) => {
    setQuery(mot);
    setIsOpen(false);
    StorageService.addToHistory(mot);
    setHistory(StorageService.getHistory());
    onSearch(mot);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const totalItems = suggestions.length > 0 ? suggestions.length : history.slice(0, 5).length;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < totalItems - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : totalItems - 1));
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0) {
        e.preventDefault();
        const selectedMot =
          suggestions.length > 0
            ? suggestions[selectedIndex]
            : history.slice(0, 5)[selectedIndex];
        if (selectedMot) {
          handleSelectSuggestion(selectedMot);
        }
      } else {
        handleSubmit();
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className="search-bar-wrapper" ref={wrapperRef}>
      <form onSubmit={handleSubmit} className="search-input-box">
        <Search size={20} className="search-icon" />

        <input
          ref={inputRef}
          type="text"
          className="search-input"
          placeholder="Explorer un mot, une nuance... (ex: forêt, écrire)"
          value={query}
          onChange={e => {
            setQuery(e.target.value);
            setIsOpen(true);
            setSelectedIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          spellCheck="false"
        />

        {query && (
          <button
            type="button"
            className="search-clear-btn"
            onClick={() => {
              setQuery('');
              setSuggestions([]);
              inputRef.current?.focus();
            }}
            title="Effacer la saisie"
          >
            <X size={18} />
          </button>
        )}

        <button type="submit" className="search-submit-btn" disabled={isLoading}>
          <span>{isLoading ? 'Recherche...' : 'Explorer'}</span>
          <CornerDownLeft size={16} />
        </button>
      </form>

      {/* Menu déroulant de suggestions et historique */}
      {isOpen && (suggestions.length > 0 || (query.length === 0 && history.length > 0)) && (
        <div className="suggestions-dropdown animate-fade-in">
          {suggestions.length > 0 ? (
            <>
              <div className="dropdown-section-title">Suggestions lexicales</div>
              {suggestions.map((mot, index) => (
                <div
                  key={mot}
                  className={`suggestion-item ${selectedIndex === index ? 'selected' : ''}`}
                  onClick={() => handleSelectSuggestion(mot)}
                >
                  <div className="suggestion-item-left">
                    <Search size={14} className="text-muted" />
                    <span>{mot}</span>
                  </div>
                  <ArrowRight size={14} className="text-faint" />
                </div>
              ))}
            </>
          ) : (
            query.length === 0 &&
            history.length > 0 && (
              <>
                <div className="dropdown-section-title">Recherches récentes</div>
                {history.slice(0, 5).map((mot, index) => (
                  <div
                    key={mot}
                    className={`suggestion-item ${selectedIndex === index ? 'selected' : ''}`}
                    onClick={() => handleSelectSuggestion(mot)}
                  >
                    <div className="suggestion-item-left">
                      <Clock size={14} className="text-muted" />
                      <span>{mot}</span>
                    </div>
                    <ArrowRight size={14} className="text-faint" />
                  </div>
                ))}
              </>
            )
          )}
        </div>
      )}
    </div>
  );
};
