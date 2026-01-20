import { Link } from 'react-router-dom';
import type { Recipe } from '../types/recipe';
import './RecipeCard.css';

interface RecipeCardProps {
  recipe: Recipe;
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
  const getDifficulty = () => {
    if (!recipe.readyInMinutes) return null;
    if (recipe.readyInMinutes <= 20) return { text: 'Facile', color: '#4caf50' };
    if (recipe.readyInMinutes <= 45) return { text: 'Intermedio', color: '#ff9800' };
    return { text: 'Stimolante', color: '#f44336' };
  };

  const difficulty = getDifficulty();

  return (
    <Link to={`/recipe/${recipe.id}`} className="recipe-card">
      <div className="recipe-card-image">
        <img src={recipe.image || '/placeholder-recipe.jpg'} alt={recipe.title} />
        {difficulty && (
          <div className="recipe-card-badge" style={{ backgroundColor: difficulty.color }}>
            {difficulty.text}
          </div>
        )}
      </div>
      <div className="recipe-card-content">
        <h3 className="recipe-card-title">{recipe.title}</h3>
        <div className="recipe-card-meta">
          {recipe.readyInMinutes && (
            <span className="meta-item">
              <span className="meta-icon">⏱️</span>
              <span className="meta-text">Durata {recipe.readyInMinutes} MIN</span>
            </span>
          )}
          {recipe.servings && (
            <span className="meta-item">
              <span className="meta-icon">🍽️</span>
              <span className="meta-text">{recipe.servings} porzioni</span>
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
