import { useState } from 'react';
import { useRecipe } from '../context/RecipeContext';
import type { UserRecipe } from '../types/recipe';
import RecipeCard from '../components/RecipeCard';
import './MyRecipes.css';

export default function MyRecipes() {
  const { userRecipes, deleteUserRecipe } = useRecipe();
  const [selectedRecipe, setSelectedRecipe] = useState<UserRecipe | null>(null);

  if (userRecipes.length === 0) {
    return (
      <div className="my-recipes">
        <div className="my-recipes-empty">
          <h2>Le Mie Ricette</h2>
          <p>Non hai ancora creato nessuna ricetta.</p>
          <p>Crea la tua prima ricetta personalizzata!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-recipes">
      <h1>Le Mie Ricette</h1>
      <div className="my-recipes-content">
        <div className="my-recipes-list">
          {userRecipes.map((recipe) => (
            <div key={recipe.id} className="recipe-item-wrapper">
              <RecipeCard recipe={recipe} />
              <button
                className="delete-button"
                onClick={() => {
                  if (confirm('Sei sicuro di voler eliminare questa ricetta?')) {
                    deleteUserRecipe(recipe.id);
                    if (selectedRecipe?.id === recipe.id) {
                      setSelectedRecipe(null);
                    }
                  }
                }}
              >
                Elimina
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
