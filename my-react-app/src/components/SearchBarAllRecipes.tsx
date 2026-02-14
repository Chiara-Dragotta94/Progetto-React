// Componente SearchBarAllRecipes: barra di filtro per la pagina "Tutte le ricette"
// A differenza della SearchBar principale, questa NON chiama le API:
// filtra le ricette gia' caricate lato client in tempo reale mentre l'utente digita.
// Questo rende il filtro istantaneo senza attese di rete.

import { useState, useEffect } from 'react';
import { useRecipe } from '../context/RecipeContext';
import './SearchBar.css';

export default function SearchBarAllRecipes() {
  // Stato locale per il testo digitato dall'utente
  const [query, setQuery] = useState('');
  const { filterRecipes } = useRecipe();

  // Effetto che si attiva ad ogni cambio della query
  // Filtra le ricette in tempo reale mentre l'utente digita (ricerca live)
  useEffect(() => {
    filterRecipes(query);
  }, [query, filterRecipes]);

  // Funzione per pulire il campo di ricerca e ripristinare tutte le ricette
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
      {/* Mostro il bottone "Pulisci" solo quando c'e' del testo nel campo */}
      {query && (
        <button type="button" onClick={handleClear} className="search-button clear-button">
          ✕ Pulisci
        </button>
      )}
    </div>
  );
}
