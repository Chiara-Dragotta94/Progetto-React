// Componente RecipeDetail: pagina di dettaglio di una singola ricetta
// Mostra tutte le informazioni complete: immagine, metadati, descrizione,
// ingredienti e istruzioni passo-passo.
// Gestisce sia ricette delle API che ricette create dall'utente.

import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRecipe } from '../context/RecipeContext';
import './RecipeDetail.css';

export default function RecipeDetail() {
  // Estraggo l'ID della ricetta dall'URL (parametro dinamico :id)
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentRecipe, loading, error, getRecipeById } = useRecipe();

  // Al montaggio del componente, carico i dettagli della ricetta tramite l'ID
  useEffect(() => {
    if (id) {
      getRecipeById(parseInt(id));
    }
  }, [id, getRecipeById]);

  // Mostro un messaggio di caricamento mentre attendo i dati
  if (loading) {
    return (
      <div className="recipe-detail-loading">
        <p>Caricamento ricetta...</p>
      </div>
    );
  }

  // Mostro un messaggio di errore con bottone per tornare indietro
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

  // Processo le istruzioni della ricetta
  // Le istruzioni possono arrivare in due formati diversi dalle API:
  let instructions: string[] = [];
  
  // FORMATO 1: analyzedInstructions (Spoonacular) - struttura con array di step numerati
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
  
  // FORMATO 2: instructions (stringa semplice) - usato da TheMealDB e ricette utente
  if (instructions.length === 0 && currentRecipe.instructions) {
    const instructionsStr = currentRecipe.instructions.trim();
    if (instructionsStr) {
      // Divido per riga, rimuovo righe vuote e pulisco la numerazione eventuale
      instructions = instructionsStr
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(line => {
          // Rimuovo numeri iniziali tipo "1. " o "1) " se presenti
          return line.replace(/^\d+[\.\)]\s*/, '').trim();
        });
    }
  }

  return (
    <div className="recipe-detail">
      {/* Bottone per tornare alla lista delle ricette */}
      <button onClick={() => navigate('/recipes')} className="back-button">
        ← Torna alle ricette
      </button>

      {/* Intestazione: immagine grande e metadati principali */}
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

      {/* Sezione descrizione: rimuovo eventuali tag HTML residui */}
      {currentRecipe.summary && (
        <div className="recipe-detail-section">
          <h2>Descrizione</h2>
          <p>{currentRecipe.summary.replace(/<[^>]*>/g, '')}</p>
        </div>
      )}

      {/* Sezione ingredienti: lista con nome, quantita' e unita' di misura */}
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

      {/* Sezione istruzioni: lista ordinata dei passaggi */}
      {instructions.length > 0 && (
        <div className="recipe-detail-section">
          <h2>Istruzioni</h2>
          <ol className="instructions-list">
            {instructions.map((step: string, index: number) => (
              <li key={index}>
                {/* Rimuovo eventuali numeri duplicati all'inizio del passaggio */}
                {step.replace(/^\d+\.\s*/, '')}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
