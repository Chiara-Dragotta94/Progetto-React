import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecipe } from '../context/RecipeContext';
import './SearchBar.css';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const { searchRecipes } = useRecipe();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      await searchRecipes(query);
      navigate('/');
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
