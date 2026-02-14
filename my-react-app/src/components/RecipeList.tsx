// Componente RecipeList: griglia paginata di card delle ricette
// Gestisce la suddivisione delle ricette in pagine e mostra
// il componente Pagination quando ci sono piu' pagine.
// Mostra anche stati di caricamento, errore e lista vuota.

import { useEffect, useState } from 'react';
import { useRecipe } from '../context/RecipeContext';
import RecipeCard from './RecipeCard';
import Pagination from './Pagination';
import './RecipeList.css';

// Props opzionali: posso personalizzare il numero di ricette per pagina
interface RecipeListProps {
  recipesPerPage?: number;
}

export default function RecipeList({ recipesPerPage = 12 }: RecipeListProps) {
  // Accedo ai dati delle ricette dal contesto globale
  const { recipes, loading, error, totalResults } = useRecipe();

  // Stato per la pagina corrente nella paginazione
  const [currentPage, setCurrentPage] = useState(1);

  // Calcolo la paginazione: quante pagine totali e quale sottoinsieme mostrare
  const totalPages = Math.ceil(recipes.length / recipesPerPage);
  const startIndex = (currentPage - 1) * recipesPerPage;
  const endIndex = startIndex + recipesPerPage;
  const currentRecipes = recipes.slice(startIndex, endIndex);

  // Resetto alla prima pagina ogni volta che cambia il numero di ricette
  // (ad esempio dopo una nuova ricerca o un filtro)
  useEffect(() => {
    setCurrentPage(1);
  }, [recipes.length]);

  // Stato di caricamento
  if (loading) {
    return (
      <div className="recipe-list-loading">
        <p>Caricamento ricette...</p>
      </div>
    );
  }

  // Stato di errore con suggerimento per la configurazione API
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

  // Stato lista vuota
  if (recipes.length === 0) {
    return (
      <div className="recipe-list-empty">
        <p>Nessuna ricetta trovata.</p>
      </div>
    );
  }

  return (
    <div className="recipe-list">
      {/* Contatore dei risultati trovati */}
      {totalResults > 0 && (
        <p className="recipe-list-count">
          {totalResults === 1 ? 'Trovata 1 ricetta' : `Trovate ${totalResults} ricette`}
        </p>
      )}

      {/* Griglia di RecipeCard per la pagina corrente */}
      <div className="recipe-grid">
        {currentRecipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>

      {/* Componente Pagination: mostrato solo se ci sono piu' pagine */}
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
