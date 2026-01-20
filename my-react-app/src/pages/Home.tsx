import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useRecipe } from '../context/RecipeContext';
import RecipeCard from '../components/RecipeCard';
import './Home.css';

export default function Home() {
  const { recipes, loading, getAllRecipes } = useRecipe();

  useEffect(() => {
    // Carica alcune ricette popolari all'avvio
    if (recipes.length === 0) {
      getAllRecipes();
    }
  }, [getAllRecipes, recipes.length]);

  // Ricette popolari (prime 6)
  const popularRecipes = recipes.slice(0, 6);

  return (
    <div className="home">
      <section className="hero-section">
        <h1>Benvenuto su Leafy</h1>
        <p>Scopri migliaia di ricette vegetariane e vegane</p>
        <Link to="/recipes" className="cta-button hero-cta">
          Esplora le ricette
        </Link>
      </section>

      {/* Sezione articolo Veganuary */}
      <section className="veganuary-article-section fade-in">
        <a 
          href="https://www.informacibo.it/veganuary-cos-e-ricette/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="veganuary-article-link"
        >
          <div className="veganuary-container">
            <div className="veganuary-image">
              <img src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=500&fit=crop" alt="Veganuary" />
            </div>
            <div className="veganuary-content">
              <h2>🌱 Scopri il Veganuary</h2>
              <p>
                Veganuary è un movimento globale che incoraggia le persone a provare 
                un'alimentazione vegana per il mese di gennaio e oltre. Scopri come 
                un'alimentazione a base vegetale può migliorare la tua salute, 
                ridurre l'impatto ambientale e aiutare il pianeta.
              </p>
              <p>
                Partecipa alla sfida di gennaio e scopri migliaia di ricette deliziose 
                che rispettano l'ambiente e gli animali. Unisciti a milioni di persone 
                in tutto il mondo che hanno già scelto un'alimentazione più sostenibile.
              </p>
              <span className="veganuary-link">
                Leggi l'articolo completo sul Veganuary →
              </span>
            </div>
          </div>
        </a>
      </section>

      {/* Sezione ricette popolari */}
      <section className="popular-recipes-section fade-in" id="ricette-popolari">
        <div className="section-header">
          <h2>⭐ Ricette Più Popolari</h2>
          <p className="section-subtitle">Le ricette più amate dalla nostra community</p>
        </div>
        {loading && recipes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p>Caricamento ricette...</p>
          </div>
        ) : popularRecipes.length > 0 ? (
          <>
            <div className="popular-recipes-grid">
              {popularRecipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
            <div className="popular-recipes-footer">
              <Link to="/recipes" className="cta-button">
                Vedi tutte le ricette
              </Link>
              <p className="recipes-count">
                {recipes.length > 0 && `${recipes.length}+ ricette disponibili`}
              </p>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p>Nessuna ricetta disponibile al momento</p>
          </div>
        )}
      </section>

      <section className="cta-section fade-in">
        <h2>Hai una ricetta da condividere?</h2>
        <p>Crea la tua ricetta personalizzata e aggiungila alla tua collezione</p>
        <Link to="/create" className="cta-button">
          Crea una ricetta
        </Link>
      </section>
    </div>
  );
}
