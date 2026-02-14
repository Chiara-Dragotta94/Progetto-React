// Pagina MyRecipes: mostra le ricette create dall'utente
// Le ricette sono salvate nel localStorage tramite il RecipeContext,
// quindi persistono anche dopo la chiusura del browser.
// L'utente puo' eliminare le proprie ricette con un bottone dedicato.

import { useState } from 'react';
import { useRecipe } from '../context/RecipeContext';
import type { UserRecipe } from '../types/recipe';
import RecipeCard from '../components/RecipeCard';
import './MyRecipes.css';

export default function MyRecipes() {
  const { userRecipes, deleteUserRecipe } = useRecipe();

  // Stato per tracciare la ricetta selezionata (per eventuale modifica futura)
  const [selectedRecipe, setSelectedRecipe] = useState<UserRecipe | null>(null);

  // Se l'utente non ha ancora creato ricette, mostro un messaggio di benvenuto
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
          {/* Mostro ogni ricetta con la sua card e un bottone per eliminarla */}
          {userRecipes.map((recipe) => (
            <div key={recipe.id} className="recipe-item-wrapper">
              {/* Riutilizzo il componente RecipeCard per coerenza visiva */}
              <RecipeCard recipe={recipe} />

              {/* Bottone per eliminare la ricetta con conferma di sicurezza */}
              <button
                className="delete-button"
                onClick={() => {
                  if (confirm('Sei sicuro di voler eliminare questa ricetta?')) {
                    deleteUserRecipe(recipe.id);
                    // Se la ricetta eliminata era quella selezionata, resetto la selezione
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
