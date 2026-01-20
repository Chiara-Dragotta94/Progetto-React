import { useState, useEffect } from 'react';
import { useRecipe } from '../context/RecipeContext';
import './SearchBar.css';

export default function SearchBarAllRecipes() {
  const [query, setQuery] = useState('');
  const { filterRecipes } = useRecipe();

  useEffect(() => {
    // Filtra le ricette in tempo reale mentre l'utente digita
    filterRecipes(query);
  }, [query, filterRecipes]);

  const handleClear = () => {
    setQuery('');
    filterRecipes('');
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Cerca ricetta"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="search-input"
      />
      {query && (
        <button type="button" onClick={handleClear} className="search-button clear-button">
          ✕ Pulisci
        </button>
      )}
    </div>
  );
}
