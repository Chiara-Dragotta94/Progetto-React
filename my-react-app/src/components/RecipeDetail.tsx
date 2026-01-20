import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRecipe } from '../context/RecipeContext';
import './RecipeDetail.css';

export default function RecipeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentRecipe, loading, error, getRecipeById } = useRecipe();

  useEffect(() => {
    if (id) {
      getRecipeById(parseInt(id));
    }
  }, [id, getRecipeById]);

  if (loading) {
    return (
      <div className="recipe-detail-loading">
        <p>Caricamento ricetta...</p>
      </div>
    );
  }

  if (error || !currentRecipe) {
    return (
      <div className="recipe-detail-error">
        <p>{error || 'Ricetta non trovata'}</p>
        <button onClick={() => navigate(-1)} className="back-button">
          Torna indietro
        </button>
      </div>
    );
  }

  // Processa le istruzioni: prima prova analyzedInstructions, poi instructions
  let instructions: string[] = [];
  
  // PRIORITÀ 1: analyzedInstructions (formato strutturato da Spoonacular)
  if (currentRecipe.analyzedInstructions && currentRecipe.analyzedInstructions.length > 0) {
    const firstInstructionSet = currentRecipe.analyzedInstructions[0];
    if (firstInstructionSet.steps && Array.isArray(firstInstructionSet.steps)) {
      instructions = firstInstructionSet.steps.map((step: any) => {
        if (typeof step === 'string') {
          return step;
        } else if (step.step) {
          return step.step;
        } else {
          return String(step);
        }
      });
    }
  }
  
  // PRIORITÀ 2: instructions (stringa semplice)
  if (instructions.length === 0 && currentRecipe.instructions) {
    const instructionsStr = currentRecipe.instructions.trim();
    if (instructionsStr) {
      // Splitta per newline, rimuovi righe vuote, e pulisci
      instructions = instructionsStr
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(line => {
          // Rimuovi numeri all'inizio se presenti (es. "1. passo" -> "passo")
          return line.replace(/^\d+[\.\)]\s*/, '').trim();
        });
    }
  }

  return (
    <div className="recipe-detail">
      <button onClick={() => navigate('/recipes')} className="back-button">
        ← Torna alle ricette
      </button>

      <div className="recipe-detail-header">
        <img 
          src={currentRecipe.image || '/placeholder-recipe.jpg'} 
          alt={currentRecipe.title}
          className="recipe-detail-image"
        />
        <div className="recipe-detail-info">
          <h1>{currentRecipe.title}</h1>
          <div className="recipe-detail-meta">
            {currentRecipe.readyInMinutes && (
              <span>⏱️ {currentRecipe.readyInMinutes} minuti</span>
            )}
            {currentRecipe.servings && (
              <span>🍽️ {currentRecipe.servings} porzioni</span>
            )}
            {currentRecipe.healthScore && (
              <span>💚 Punteggio salute: {currentRecipe.healthScore}</span>
            )}
          </div>
        </div>
      </div>

      {currentRecipe.summary && (
        <div className="recipe-detail-section">
          <h2>Descrizione</h2>
          <p>{currentRecipe.summary.replace(/<[^>]*>/g, '')}</p>
        </div>
      )}

      {currentRecipe.extendedIngredients && currentRecipe.extendedIngredients.length > 0 && (
        <div className="recipe-detail-section">
          <h2>Ingredienti</h2>
          <ul className="ingredients-list">
            {currentRecipe.extendedIngredients.map((ingredient, index) => (
              <li key={index}>
                <strong>{ingredient.name}</strong>
                {ingredient.amount && ingredient.unit && (
                  <span> - {ingredient.amount} {ingredient.unit}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {instructions.length > 0 && (
        <div className="recipe-detail-section">
          <h2>Istruzioni</h2>
          <ol className="instructions-list">
            {instructions.map((step: string, index: number) => (
              <li key={index}>
                {step.replace(/^\d+\.\s*/, '')}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
