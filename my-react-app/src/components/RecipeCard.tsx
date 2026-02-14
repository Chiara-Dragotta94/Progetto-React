// Componente RecipeCard: card per visualizzare una singola ricetta nella griglia
// Mostra l'immagine, il titolo, il livello di difficolta' e i metadati principali.
// L'intera card e' un link che porta alla pagina di dettaglio della ricetta.

import { Link } from 'react-router-dom';
import type { Recipe } from '../types/recipe';
import './RecipeCard.css';

// Props del componente: riceve un oggetto Recipe
interface RecipeCardProps {
  recipe: Recipe;
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
  // Calcolo il livello di difficolta' in base al tempo di preparazione
  // Meno di 20 minuti = Facile, meno di 45 = Intermedio, oltre = Stimolante
  const getDifficulty = () => {
    if (!recipe.readyInMinutes) return null;
    if (recipe.readyInMinutes <= 20) return { text: 'Facile', color: '#4caf50' };      // Verde
    if (recipe.readyInMinutes <= 45) return { text: 'Intermedio', color: '#ff9800' };   // Arancione
    return { text: 'Stimolante', color: '#f44336' };                                     // Rosso
  };

  const difficulty = getDifficulty();

  return (
    // L'intera card e' un Link che porta alla pagina di dettaglio (/recipe/:id)
    <Link to={`/recipe/${recipe.id}`} className="recipe-card">
      {/* Sezione immagine con badge di difficolta' sovrapposto */}
      <div className="recipe-card-image">
        <img src={recipe.image || '/placeholder-recipe.jpg'} alt={recipe.title} />
        {/* Badge colorato con il livello di difficolta', mostrato solo se disponibile */}
        {difficulty && (
          <div className="recipe-card-badge" style={{ backgroundColor: difficulty.color }}>
            {difficulty.text}
          </div>
        )}
      </div>

      {/* Sezione contenuto: titolo e metadati */}
      <div className="recipe-card-content">
        <h3 className="recipe-card-title">{recipe.title}</h3>
        <div className="recipe-card-meta">
          {/* Tempo di preparazione */}
          {recipe.readyInMinutes && (
            <span className="meta-item">
              <span className="meta-icon">⏱️</span>
              <span className="meta-text">Durata {recipe.readyInMinutes} MIN</span>
            </span>
          )}
          {/* Numero di porzioni */}
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
