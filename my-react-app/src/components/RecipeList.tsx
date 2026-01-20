import { useEffect, useState } from 'react';
import { useRecipe } from '../context/RecipeContext';
import RecipeCard from './RecipeCard';
import Pagination from './Pagination';
import './RecipeList.css';

interface RecipeListProps {
  recipesPerPage?: number;
}

export default function RecipeList({ recipesPerPage = 12 }: RecipeListProps) {
  const { recipes, loading, error, totalResults } = useRecipe();
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(recipes.length / recipesPerPage);
  const startIndex = (currentPage - 1) * recipesPerPage;
  const endIndex = startIndex + recipesPerPage;
  const currentRecipes = recipes.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [recipes.length]);

  if (loading) {
    return (
      <div className="recipe-list-loading">
        <p>Caricamento ricette...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="recipe-list-error">
        <p>{error}</p>
        {error.includes('API Key') && (
          <p className="error-help">
            Assicurati di aver configurato la tua API key di Spoonacular nel file{' '}
            <code>.env</code> nella cartella <code>my-react-app</code>
          </p>
        )}
      </div>
    );
  }

  if (recipes.length === 0) {
    return (
      <div className="recipe-list-empty">
        <p>Nessuna ricetta trovata.</p>
      </div>
    );
  }

  return (
    <div className="recipe-list">
      {totalResults > 0 && (
        <p className="recipe-list-count">
          {totalResults === 1 ? 'Trovata 1 ricetta' : `Trovate ${totalResults} ricette`}
        </p>
      )}
      <div className="recipe-grid">
        {currentRecipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}
