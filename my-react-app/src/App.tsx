// Componente principale dell'applicazione Leafy
// Qui definisco la struttura generale dell'app e tutte le rotte di navigazione

// Uso HashRouter al posto di BrowserRouter per la compatibilità con GitHub Pages,
// che non supporta il routing lato server. Con HashRouter gli URL hanno il formato /#/pagina
import { HashRouter as Router, Routes, Route } from 'react-router-dom';

// Il RecipeProvider avvolge tutta l'app per rendere disponibile lo stato globale
// delle ricette a tutti i componenti tramite il Context API di React
import { RecipeProvider } from './context/RecipeContext';

// Importo i componenti di layout (Header e Footer) e le pagine dell'app
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import AllRecipes from './pages/AllRecipes';
import MyRecipes from './pages/MyRecipes';
import CreateRecipe from './pages/CreateRecipe';
import RecipeDetail from './components/RecipeDetail';
import './App.css';

function App() {
  return (
    // RecipeProvider: fornisce il contesto globale delle ricette a tutta l'app
    <RecipeProvider>
      {/* Router: gestisce la navigazione tra le pagine senza ricaricare il browser */}
      <Router>
        <div className="app">
          {/* Header fisso in alto con la navigazione */}
          <Header />

          {/* Area principale dove vengono renderizzate le pagine in base alla rotta */}
          <main className="main-content">
            <Routes>
              {/* Homepage con hero section, articolo Veganuary e ricette popolari */}
              <Route path="/" element={<Home />} />

              {/* Pagina con tutte le ricette disponibili e barra di ricerca/filtro */}
              <Route path="/recipes" element={<AllRecipes />} />

              {/* Pagina con le ricette create dall'utente, salvate nel localStorage */}
              <Route path="/my-recipes" element={<MyRecipes />} />

              {/* Form per creare una nuova ricetta personalizzata */}
              <Route path="/create" element={<CreateRecipe />} />

              {/* Pagina di dettaglio di una singola ricetta, il parametro :id è dinamico */}
              <Route path="/recipe/:id" element={<RecipeDetail />} />
            </Routes>
          </main>

          {/* Footer con informazioni, navigazione e contatti */}
          <Footer />
        </div>
      </Router>
    </RecipeProvider>
  );
}

export default App;
