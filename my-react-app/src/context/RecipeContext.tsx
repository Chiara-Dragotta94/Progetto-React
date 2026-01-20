import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { Recipe, UserRecipe } from '../types/recipe';
import { searchRecipes, getRecipeById, getAllRecipes } from '../services/api';

interface RecipeContextType {
  recipes: Recipe[];
  allRecipes: Recipe[];
  currentRecipe: Recipe | null;
  userRecipes: UserRecipe[];
  loading: boolean;
  error: string | null;
  totalResults: number;
  searchRecipes: (query: string) => Promise<void>;
  getAllRecipes: () => Promise<void>;
  getRecipeById: (id: number) => Promise<void>;
  filterRecipes: (query: string) => void;
  addUserRecipe: (recipe: UserRecipe) => void;
  updateUserRecipe: (id: number, recipe: UserRecipe) => void;
  deleteUserRecipe: (id: number) => void;
  clearError: () => void;
  clearSearch: () => void;
}

const RecipeContext = createContext<RecipeContextType | undefined>(undefined);

const STORAGE_KEY = 'leafy_user_recipes';

export function RecipeProvider({ children }: { children: ReactNode }) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [allRecipes, setAllRecipes] = useState<Recipe[]>([]);
  const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(null);
  const [userRecipes, setUserRecipes] = useState<UserRecipe[]>(() => {
    // Carica ricette utente dal localStorage
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalResults, setTotalResults] = useState(0);

  // Salva ricette utente nel localStorage
  const saveUserRecipes = useCallback((recipes: UserRecipe[]) => {
    setUserRecipes(recipes);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
  }, []);

  const searchRecipesHandler = useCallback(async (query: string) => {
    if (!query.trim()) {
      setRecipes([]);
      setTotalResults(0);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const results = await searchRecipes(query);
      setRecipes(results);
      setTotalResults(results.length);
    } catch (err: any) {
      const errorMessage = err.message || 'Errore nella ricerca delle ricette';
      setError(errorMessage);
      setRecipes([]);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  }, []);

  const getAllRecipesHandler = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const results = await getAllRecipes();
      
      if (results && results.length > 0) {
        setAllRecipes(results);
        setRecipes(results); // Mostra tutte le ricette
        setTotalResults(results.length);
      } else {
        // Se non ci sono risultati, usa i mock data
        const { mockRecipes } = await import('../services/mockData');
        setAllRecipes(mockRecipes);
        setRecipes(mockRecipes);
        setTotalResults(mockRecipes.length);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Errore nel caricamento delle ricette';
      setError(errorMessage);
      
      // In caso di errore, usa sempre i mock data
      try {
        const { mockRecipes } = await import('../services/mockData');
        setAllRecipes(mockRecipes);
        setRecipes(mockRecipes);
        setTotalResults(mockRecipes.length);
      } catch (mockError) {
        setAllRecipes([]);
        setRecipes([]);
        setTotalResults(0);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const getRecipeByIdHandler = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);

    try {
      // Prima controlla se è una ricetta utente
      const userRecipe = userRecipes.find(r => r.id === id);
      if (userRecipe) {
        setCurrentRecipe(userRecipe);
        setLoading(false);
        return;
      }

      // Altrimenti cerca nelle API
      const recipe = await getRecipeById(id);
      if (recipe) {
        setCurrentRecipe(recipe);
      } else {
        setError('Ricetta non trovata');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Errore nel caricamento della ricetta';
      setError(errorMessage);
      setCurrentRecipe(null);
    } finally {
      setLoading(false);
    }
  }, [userRecipes]);

  const filterRecipes = useCallback((query: string) => {
    if (!query.trim()) {
      setRecipes(allRecipes);
      setTotalResults(allRecipes.length);
      return;
    }

    const filtered = allRecipes.filter(recipe =>
      recipe.title.toLowerCase().includes(query.toLowerCase())
    );
    setRecipes(filtered);
    setTotalResults(filtered.length);
  }, [allRecipes]);

  const addUserRecipe = useCallback((recipe: UserRecipe) => {
    const newRecipe: UserRecipe = {
      ...recipe,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      isUserCreated: true,
    };
    const updated = [...userRecipes, newRecipe];
    saveUserRecipes(updated);
  }, [userRecipes, saveUserRecipes]);

  const updateUserRecipe = useCallback((id: number, recipe: UserRecipe) => {
    const updated = userRecipes.map(r => r.id === id ? { ...recipe, id } : r);
    saveUserRecipes(updated);
  }, [userRecipes, saveUserRecipes]);

  const deleteUserRecipe = useCallback((id: number) => {
    const updated = userRecipes.filter(r => r.id !== id);
    saveUserRecipes(updated);
  }, [userRecipes, saveUserRecipes]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearSearch = useCallback(() => {
    setRecipes([]);
    setTotalResults(0);
  }, []);

  return (
    <RecipeContext.Provider
      value={{
        recipes,
        allRecipes,
        currentRecipe,
        userRecipes,
        loading,
        error,
        totalResults,
        searchRecipes: searchRecipesHandler,
        getAllRecipes: getAllRecipesHandler,
        getRecipeById: getRecipeByIdHandler,
        filterRecipes,
        addUserRecipe,
        updateUserRecipe,
        deleteUserRecipe,
        clearError,
        clearSearch,
      }}
    >
      {children}
    </RecipeContext.Provider>
  );
}

export function useRecipe() {
  const context = useContext(RecipeContext);
  if (!context) {
    throw new Error('useRecipe must be used within RecipeProvider');
  }
  return context;
}
