import { useEffect } from 'react';
import { useRecipe } from '../context/RecipeContext';
import SearchBarAllRecipes from '../components/SearchBarAllRecipes';
import RecipeList from '../components/RecipeList';
import './AllRecipes.css';

export default function AllRecipes() {
  const { getAllRecipes } = useRecipe();

  useEffect(() => {
    getAllRecipes();
  }, [getAllRecipes]);

  return (
    <div className="all-recipes">
      <div className="all-recipes-header">
        <h1>RICETTE VEGETARIANE</h1>
        <p>Esplora la nostra collezione completa di ricette vegetariane</p>
      </div>
      <div className="all-recipes-search">
        <SearchBarAllRecipes />
      </div>
      <RecipeList />
    </div>
  );
}
