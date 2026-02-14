// Pagina AllRecipes: mostra tutte le ricette vegetariane disponibili
// Include una barra di ricerca per filtrare le ricette per nome (filtro lato client)
// e il componente RecipeList che gestisce la paginazione automaticamente.
// Al montaggio della pagina, carico tutte le ricette dalle API.

import { useEffect } from 'react';
import { useRecipe } from '../context/RecipeContext';
import SearchBarAllRecipes from '../components/SearchBarAllRecipes';
import RecipeList from '../components/RecipeList';
import './AllRecipes.css';

export default function AllRecipes() {
  const { getAllRecipes } = useRecipe();

  // Carico tutte le ricette al montaggio del componente
  // useEffect con getAllRecipes come dipendenza garantisce che venga chiamato una volta
  useEffect(() => {
    getAllRecipes();
  }, [getAllRecipes]);

  return (
    <div className="all-recipes">
      {/* Intestazione della pagina */}
      <div className="all-recipes-header">
        <h1>RICETTE VEGETARIANE</h1>
        <p>Esplora la nostra collezione completa di ricette vegetariane</p>
      </div>

      {/* Barra di filtro: filtra le ricette gia' caricate in tempo reale */}
      <div className="all-recipes-search">
        <SearchBarAllRecipes />
      </div>

      {/* Lista paginata delle ricette (12 per pagina di default) */}
      <RecipeList />
    </div>
  );
}
