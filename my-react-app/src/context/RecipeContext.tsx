// Context globale per la gestione delle ricette
// Ho utilizzato il Context API di React per condividere lo stato delle ricette
// tra tutti i componenti dell'app senza dover passare props manualmente (prop drilling)

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { Recipe, UserRecipe } from '../types/recipe';
import { searchRecipes, getRecipeById, getAllRecipes } from '../services/api';

// Definisco l'interfaccia del contesto: tutti i dati e le funzioni
// che saranno disponibili ai componenti che useranno questo contesto
interface RecipeContextType {
  recipes: Recipe[];                                    // Ricette attualmente visualizzate (filtrate o tutte)
  allRecipes: Recipe[];                                 // Tutte le ricette caricate dalle API (non filtrate)
  currentRecipe: Recipe | null;                         // Ricetta attualmente selezionata per la pagina di dettaglio
  userRecipes: UserRecipe[];                            // Ricette create dall'utente e salvate nel localStorage
  loading: boolean;                                     // Stato di caricamento per mostrare spinner/loading
  error: string | null;                                 // Messaggio di errore da mostrare all'utente
  totalResults: number;                                 // Numero totale di ricette trovate
  searchRecipes: (query: string) => Promise<void>;      // Cerca ricette tramite le API
  getAllRecipes: () => Promise<void>;                    // Carica tutte le ricette disponibili
  getRecipeById: (id: number) => Promise<void>;         // Carica i dettagli di una singola ricetta
  filterRecipes: (query: string) => void;               // Filtra le ricette gia' caricate per nome (lato client)
  addUserRecipe: (recipe: UserRecipe) => void;          // Aggiunge una ricetta creata dall'utente
  updateUserRecipe: (id: number, recipe: UserRecipe) => void;  // Aggiorna una ricetta dell'utente
  deleteUserRecipe: (id: number) => void;               // Elimina una ricetta dell'utente
  clearError: () => void;                               // Pulisce l'errore corrente
  clearSearch: () => void;                              // Resetta i risultati della ricerca
}

// Creo il contesto con valore iniziale undefined
// Sarà valorizzato dal RecipeProvider che avvolge l'app
const RecipeContext = createContext<RecipeContextType | undefined>(undefined);

// Chiave usata per salvare e recuperare le ricette dell'utente dal localStorage
const STORAGE_KEY = 'leafy_user_recipes';

// Provider del contesto: avvolge l'intera app e fornisce stato e funzioni
// a tutti i componenti figli tramite il Context API
export function RecipeProvider({ children }: { children: ReactNode }) {
  // Stato per le ricette attualmente visualizzate (possono essere filtrate)
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  // Stato per tutte le ricette caricate (serve come riferimento per il filtro client-side)
  const [allRecipes, setAllRecipes] = useState<Recipe[]>([]);

  // Stato per la ricetta attualmente visualizzata nella pagina di dettaglio
  const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(null);

  // Stato per le ricette create dall'utente, inizializzato dal localStorage
  // Uso una funzione nel useState per caricare i dati solo al primo render
  const [userRecipes, setUserRecipes] = useState<UserRecipe[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Stato per il caricamento e gli errori
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalResults, setTotalResults] = useState(0);

  // Funzione helper per salvare le ricette dell'utente sia nello stato React
  // che nel localStorage, cosi' persistono anche dopo la chiusura del browser
  const saveUserRecipes = useCallback((recipes: UserRecipe[]) => {
    setUserRecipes(recipes);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
  }, []);

  // Gestisce la ricerca di ricette tramite le API esterne
  // Viene chiamata dalla SearchBar nella homepage
  const searchRecipesHandler = useCallback(async (query: string) => {
    // Se la query e' vuota, resetto i risultati
    if (!query.trim()) {
      setRecipes([]);
      setTotalResults(0);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Chiamo il servizio API che gestisce il sistema di fallback
      // (Spoonacular -> TheMealDB -> Mock Data)
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

  // Carica tutte le ricette disponibili dalle API
  // Viene chiamata al montaggio della pagina AllRecipes e della Home
  const getAllRecipesHandler = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const results = await getAllRecipes();
      
      if (results && results.length > 0) {
        setAllRecipes(results);
        setRecipes(results);
        setTotalResults(results.length);
      } else {
        // Se le API non restituiscono risultati, uso i dati mock come fallback
        const { mockRecipes } = await import('../services/mockData');
        setAllRecipes(mockRecipes);
        setRecipes(mockRecipes);
        setTotalResults(mockRecipes.length);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Errore nel caricamento delle ricette';
      setError(errorMessage);
      
      // In caso di errore, garantisco che l'app funzioni comunque con i dati mock
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

  // Carica i dettagli di una singola ricetta per la pagina di dettaglio
  // Prima controlla se e' una ricetta dell'utente, poi cerca nelle API
  const getRecipeByIdHandler = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);

    try {
      // Controllo prima se e' una ricetta creata dall'utente (salvata nel localStorage)
      const userRecipe = userRecipes.find(r => r.id === id);
      if (userRecipe) {
        setCurrentRecipe(userRecipe);
        setLoading(false);
        return;
      }

      // Se non e' una ricetta utente, la cerco nelle API esterne
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

  // Filtra le ricette gia' caricate per nome (filtro lato client, senza chiamate API)
  // Viene usata dalla SearchBarAllRecipes nella pagina "Tutte le ricette"
  const filterRecipes = useCallback((query: string) => {
    if (!query.trim()) {
      // Se la query e' vuota, mostro tutte le ricette
      setRecipes(allRecipes);
      setTotalResults(allRecipes.length);
      return;
    }

    // Filtro case-insensitive per titolo della ricetta
    const filtered = allRecipes.filter(recipe =>
      recipe.title.toLowerCase().includes(query.toLowerCase())
    );
    setRecipes(filtered);
    setTotalResults(filtered.length);
  }, [allRecipes]);

  // Aggiunge una nuova ricetta creata dall'utente
  // Assegno un ID basato sul timestamp e salvo nel localStorage
  const addUserRecipe = useCallback((recipe: UserRecipe) => {
    const newRecipe: UserRecipe = {
      ...recipe,
      id: Date.now(),                          // Uso il timestamp come ID univoco
      createdAt: new Date().toISOString(),      // Data di creazione
      isUserCreated: true,                      // Flag per identificare le ricette utente
    };
    const updated = [...userRecipes, newRecipe];
    saveUserRecipes(updated);
  }, [userRecipes, saveUserRecipes]);

  // Aggiorna una ricetta esistente dell'utente
  const updateUserRecipe = useCallback((id: number, recipe: UserRecipe) => {
    const updated = userRecipes.map(r => r.id === id ? { ...recipe, id } : r);
    saveUserRecipes(updated);
  }, [userRecipes, saveUserRecipes]);

  // Elimina una ricetta dell'utente dal localStorage
  const deleteUserRecipe = useCallback((id: number) => {
    const updated = userRecipes.filter(r => r.id !== id);
    saveUserRecipes(updated);
  }, [userRecipes, saveUserRecipes]);

  // Funzioni utility per pulire lo stato
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearSearch = useCallback(() => {
    setRecipes([]);
    setTotalResults(0);
  }, []);

  // Fornisco tutti i dati e le funzioni ai componenti figli tramite il Provider
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

// Hook personalizzato per accedere al contesto delle ricette
// Ogni componente che ha bisogno dei dati delle ricette chiama useRecipe()
// invece di usare useContext(RecipeContext) direttamente
export function useRecipe() {
  const context = useContext(RecipeContext);
  if (!context) {
    throw new Error('useRecipe must be used within RecipeProvider');
  }
  return context;
}
