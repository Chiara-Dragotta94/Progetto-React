// Componente SearchBar: barra di ricerca della homepage
// Quando l'utente invia una query, chiama l'API di ricerca
// e poi naviga alla homepage per mostrare i risultati.
// A differenza di SearchBarAllRecipes, questa effettua una chiamata API reale.

import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecipe } from '../context/RecipeContext';
import './SearchBar.css';

export default function SearchBar() {
  // Stato locale per il testo digitato dall'utente
  const [query, setQuery] = useState('');
  const { searchRecipes } = useRecipe();
  const navigate = useNavigate();

  // Gestisco l'invio del form: chiamo l'API di ricerca e navigo alla home
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault(); // Prevengo il comportamento default del form (ricaricamento pagina)
    if (query.trim()) {
      await searchRecipes(query); // Chiamo il servizio API con il sistema di fallback
      navigate('/');              // Navigo alla homepage dove i risultati vengono mostrati
    }
  };

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Cerca ricette vegetariane..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="search-input"
      />
      <button type="submit" className="search-button">
        🔍 Cerca
      </button>
    </form>
  );
}
