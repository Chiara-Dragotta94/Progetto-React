import axios from 'axios';
import type { Recipe } from '../types/recipe';
import { searchTheMealDB, getTheMealDBRecipeById, getAllTheMealDBRecipes } from './theMealDB';
import { mockRecipes, getMockRecipeById } from './mockData';

const SPOONACULAR_BASE_URL = 'https://api.spoonacular.com/recipes';

/**
 * Sistema di fallback per le API:
 * 1. Spoonacular API (se configurata con API key)
 * 2. TheMealDB API (completamente gratuita)
 * 3. Mock Data (dati di esempio)
 */

// Controlla se esiste una API key valida di Spoonacular nel file .env
const USE_SPOONACULAR = import.meta.env.VITE_SPOONACULAR_API_KEY && 
                        import.meta.env.VITE_SPOONACULAR_API_KEY !== 'YOUR_API_KEY_HERE';

/**
 * Crea un'istanza di axios configurata per Spoonacular
 * - Base URL predefinita
 * - API key come parametro di default per tutte le richieste
 */
function createSpoonacularClient() {
  const API_KEY = import.meta.env.VITE_SPOONACULAR_API_KEY;
  
  return axios.create({
    baseURL: SPOONACULAR_BASE_URL,
    params: {
      apiKey: API_KEY, // API key inclusa automaticamente in ogni richiesta
    },
    timeout: 10000,
  });
}

/**
 * Formatta una ricetta da Spoonacular nel formato standard dell'app
 */
function formatSpoonacularRecipe(recipe: any): Recipe {
  return {
    id: recipe.id,
    title: recipe.title,
    image: recipe.image,
    summary: recipe.summary?.replace(/<[^>]*>/g, '') || '',
    readyInMinutes: recipe.readyInMinutes,
    servings: recipe.servings,
    healthScore: recipe.healthScore,
    extendedIngredients: recipe.extendedIngredients?.map((ing: any, index: number) => ({
      id: index + 1,
      name: ing.name,
      amount: ing.amount,
      unit: ing.unit,
      original: ing.original,
    })),
    instructions: recipe.instructions?.replace(/<[^>]*>/g, '') || '',
    analyzedInstructions: recipe.analyzedInstructions,
    sourceUrl: recipe.sourceUrl,
    sourceName: recipe.sourceName,
    dishTypes: recipe.dishTypes,
    cuisines: recipe.cuisines,
    vegetarian: recipe.vegetarian,
    vegan: recipe.vegan,
  };
}

/**
 * Cerca ricette vegetariane usando il sistema di fallback
 */
export async function searchRecipes(query: string): Promise<Recipe[]> {
  if (!query || !query.trim()) {
    return [];
  }

  const allResults: Recipe[] = [];
  
  // PRIORITÀ 1: Spoonacular API (se configurato con API key)
  if (USE_SPOONACULAR) {
    try {
      const client = createSpoonacularClient();
      
      // Ricerca principale con la query
      const response = await client.get('/complexSearch', {
        params: {
          query: query.trim(),
          diet: 'vegetarian',
          number: 100, // Massimo permesso da Spoonacular
          addRecipeInformation: true,
        },
      });
      
      if (response.data?.results && response.data.results.length > 0) {
        const recipes = response.data.results.map(formatSpoonacularRecipe);
        allResults.push(...recipes);
      }
      
      // Se non abbiamo abbastanza risultati, cerca anche senza query specifica
      if (allResults.length < 20) {
        try {
          const popularResponse = await client.get('/complexSearch', {
            params: {
              diet: 'vegetarian',
              number: 50,
              addRecipeInformation: true,
              sort: 'popularity',
            },
          });
          
          if (popularResponse.data?.results) {
            const popularRecipes = popularResponse.data.results.map(formatSpoonacularRecipe);
            allResults.push(...popularRecipes);
          }
        } catch (e) {
          // Ignora errori secondari
        }
      }
      
      // Rimuovi duplicati e filtra per query se necessario
      const uniqueRecipes = allResults.filter((recipe, index, self) =>
        index === self.findIndex(r => r.id === recipe.id)
      );
      
      // Filtra per query se abbiamo molti risultati
      if (uniqueRecipes.length > 0) {
        const queryLower = query.toLowerCase();
        const filtered = uniqueRecipes.filter(recipe =>
          recipe.title.toLowerCase().includes(queryLower) ||
          (recipe.summary && recipe.summary.toLowerCase().includes(queryLower))
        );
        
        // Se il filtro ha risultati, restituiscili, altrimenti restituisci tutti
        return filtered.length > 0 ? filtered : uniqueRecipes.slice(0, 100);
      }
    } catch (error: any) {
      // Se l'errore è per API key non valida, passa al fallback
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.error('API Key non valida. Controlla la configurazione nel file .env');
      } else {
        console.error('Error searching recipes:', error);
      }
    }
  }
  
  // PRIORITÀ 2: TheMealDB
  try {
    const recipes = await searchTheMealDB(query);
    if (recipes.length > 0) {
      return recipes;
    }
  } catch (error) {
    // Ignora errori CORS
  }
  
  // PRIORITÀ 3: Mock Data
  const filteredMock = mockRecipes.filter(recipe =>
    recipe.title.toLowerCase().includes(query.toLowerCase())
  );
  
  return filteredMock;
}

/**
 * Ottiene i dettagli di una ricetta specifica
 */
export async function getRecipeById(id: number): Promise<Recipe | null> {
  // Prova entrambe le API in parallelo per maggiore efficienza
  const promises: Promise<Recipe | null>[] = [];
  
  // PRIORITÀ 1: Spoonacular API
  if (USE_SPOONACULAR) {
    promises.push(
      (async () => {
        try {
          const client = createSpoonacularClient();
          const response = await client.get(`/${id}/information`, {
            params: {
              includeNutrition: false,
            },
          });
          return formatSpoonacularRecipe(response.data);
        } catch (error: any) {
          if (error.response?.status === 401 || error.response?.status === 403) {
            throw new Error('API Key non valida. Controlla la configurazione nel file .env');
          }
          // Se è un 404 o altro errore, ritorna null per provare altre API
          return null;
        }
      })()
    );
  }
  
  // PRIORITÀ 2: TheMealDB (solo se non ci sono problemi CORS)
  promises.push(
    (async () => {
      try {
        return await getTheMealDBRecipeById(id);
      } catch (error) {
        // Non loggare errori CORS, sono gestiti internamente
        return null;
      }
    })()
  );
  
  // Attendi che almeno una delle API risponda
  const results = await Promise.allSettled(promises);
  
  // Restituisci la prima ricetta trovata
  for (const result of results) {
    if (result.status === 'fulfilled' && result.value) {
      return result.value;
    }
  }
  
  // PRIORITÀ 3: Mock Data
  return getMockRecipeById(id);
}

/**
 * Ottiene tutte le ricette disponibili
 */
export async function getAllRecipes(): Promise<Recipe[]> {
  const allRecipes: Recipe[] = [];
  
  // PRIORITÀ 1: Spoonacular API
  if (USE_SPOONACULAR) {
    try {
      const client = createSpoonacularClient();
      
      // Prima prova una richiesta semplice per vedere se funziona
      const simpleRequest = await client.get('/complexSearch', {
        params: {
          diet: 'vegetarian',
          number: 100,
          addRecipeInformation: true,
          sort: 'popularity',
        },
      });
      
      if (simpleRequest.data?.results && simpleRequest.data.results.length > 0) {
        const recipes = simpleRequest.data.results.map(formatSpoonacularRecipe);
        allRecipes.push(...recipes);
      }
      
      // Se abbiamo risultati, prova a ottenere di più con query specifiche
      if (allRecipes.length > 0) {
        const specificQueries = [
          'pasta', 'salad', 'rice', 'quinoa', 'tofu', 'vegetable', 
          'soup', 'curry', 'burger', 'pizza', 'lasagna', 'risotto'
        ];
        
        // Limita a 5 query per non fare troppe richieste
        for (const query of specificQueries.slice(0, 5)) {
          try {
            const response = await client.get('/complexSearch', {
              params: {
                query: query,
                diet: 'vegetarian',
                number: 50,
                addRecipeInformation: true,
              },
            });
            
            if (response.data?.results) {
              const recipes = response.data.results.map(formatSpoonacularRecipe);
              allRecipes.push(...recipes);
            }
            
            // Piccola pausa tra le richieste
            await new Promise(resolve => setTimeout(resolve, 300));
          } catch (e) {
            // Continua con la prossima query se questa fallisce
            continue;
          }
        }
      }
      
      // Rimuovi duplicati
      const uniqueRecipes = allRecipes.filter((recipe, index, self) =>
        index === self.findIndex(r => r.id === recipe.id)
      );
      
      if (uniqueRecipes.length > 0) {
        return uniqueRecipes;
      }
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.error('API Key non valida. Usando dati di fallback.');
      } else {
        console.error('Error fetching all recipes from Spoonacular:', error);
      }
    }
  }
  
  // PRIORITÀ 2: TheMealDB
  try {
    const mealDBRecipes = await getAllTheMealDBRecipes();
    if (mealDBRecipes.length > 0) {
      return mealDBRecipes;
    }
  } catch (error) {
    // Ignora errori CORS
  }
  
  // PRIORITÀ 3: Mock Data (sempre disponibile)
      return mockRecipes;
}
