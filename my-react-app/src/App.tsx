import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { RecipeProvider } from './context/RecipeContext';
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
    <RecipeProvider>
      <Router>
        <div className="app">
          <Header />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/recipes" element={<AllRecipes />} />
              <Route path="/my-recipes" element={<MyRecipes />} />
              <Route path="/create" element={<CreateRecipe />} />
              <Route path="/recipe/:id" element={<RecipeDetail />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </RecipeProvider>
  );
}

export default App;
