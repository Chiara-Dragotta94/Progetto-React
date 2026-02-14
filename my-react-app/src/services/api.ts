// Servizio API principale per il recupero delle ricette
// Ho implementato un sistema di fallback a 3 livelli per garantire
// che l'app funzioni sempre, anche senza connessione o API key:
// 1. Spoonacular API (richiede API key, dati ricchi e dettagliati)
// 2. TheMealDB API (completamente gratuita, nessuna chiave necessaria)
// 3. Mock Data (dati statici di esempio, sempre disponibili offline)

import axios from 'axios';
import type { Recipe } from '../types/recipe';
import { searchTheMealDB, getTheMealDBRecipeById, getAllTheMealDBRecipes } from './theMealDB';
import { mockRecipes, getMockRecipeById } from './mockData';

// URL base dell'API Spoonacular per le ricette
const SPOONACULAR_BASE_URL = 'https://api.spoonacular.com/recipes';

// Verifico se esiste una API key valida di Spoonacular nel file .env
// Se la chiave non e' configurata o e' il placeholder, uso direttamente i fallback
const USE_SPOONACULAR = import.meta.env.VITE_SPOONACULAR_API_KEY && 
                        import.meta.env.VITE_SPOONACULAR_API_KEY !== 'YOUR_API_KEY_HERE';

// Creo un client Axios preconfigurato per Spoonacular
// Questo mi evita di ripetere la configurazione in ogni chiamata API
function createSpoonacularClient() {
  const API_KEY = import.meta.env.VITE_SPOONACULAR_API_KEY;
  
  return axios.create({
    baseURL: SPOONACULAR_BASE_URL,
    params: {
      apiKey: API_KEY, // La chiave viene aggiunta automaticamente a ogni richiesta
    },
    timeout: 10000, // Timeout di 10 secondi per evitare attese troppo lunghe
  });
}

// Converte una ricetta dal formato Spoonacular al formato standard dell'app
// Spoonacular restituisce HTML nel summary e nelle istruzioni,
// quindi uso una regex per rimuovere tutti i tag HTML
function formatSpoonacularRecipe(recipe: any): Recipe {
  return {
    id: recipe.id,
    title: recipe.title,
    image: recipe.image,
    summary: recipe.summary?.replace(/<[^>]*>/g, '') || '',       // Rimuovo tag HTML dal sommario
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
    instructions: recipe.instructions?.replace(/<[^>]*>/g, '') || '', // Rimuovo tag HTML dalle istruzioni
    analyzedInstructions: recipe.analyzedInstructions,
    sourceUrl: recipe.sourceUrl,
    sourceName: recipe.sourceName,
    dishTypes: recipe.dishTypes,
    cuisines: recipe.cuisines,
    vegetarian: recipe.vegetarian,
    vegan: recipe.vegan,
  };
}

// Cerca ricette vegetariane usando il sistema di fallback a 3 livelli
// Questa funzione viene chiamata dalla SearchBar nella homepage
export async function searchRecipes(query: string): Promise<Recipe[]> {
  // Validazione: se la query e' vuota, restituisco un array vuoto
  if (!query || !query.trim()) {
    return [];
  }

  const allResults: Recipe[] = [];
  
  // LIVELLO 1: Provo con Spoonacular (se la chiave API e' configurata)
  if (USE_SPOONACULAR) {
    try {
      const client = createSpoonacularClient();
      
      // Ricerca principale: cerco ricette vegetariane che corrispondono alla query
      const response = await client.get('/complexSearch', {
        params: {
          query: query.trim(),
          diet: 'vegetarian',
          number: 100,                // Richiedo fino a 100 risultati (massimo di Spoonacular)
          addRecipeInformation: true,  // Includo i dettagli completi della ricetta
        },
      });
      
      if (response.data?.results && response.data.results.length > 0) {
        const recipes = response.data.results.map(formatSpoonacularRecipe);
        allResults.push(...recipes);
      }
      
      // Se ho pochi risultati, integro con ricette popolari generiche
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
          // Ignoro errori su questa richiesta secondaria, non e' critica
        }
      }
      
      // Rimuovo eventuali ricette duplicate (stesso ID)
      const uniqueRecipes = allResults.filter((recipe, index, self) =>
        index === self.findIndex(r => r.id === recipe.id)
      );
      
      // Filtro ulteriormente per pertinenza alla query
      if (uniqueRecipes.length > 0) {
        const queryLower = query.toLowerCase();
        const filtered = uniqueRecipes.filter(recipe =>
          recipe.title.toLowerCase().includes(queryLower) ||
          (recipe.summary && recipe.summary.toLowerCase().includes(queryLower))
        );
        
        // Se il filtro ha risultati li restituisco, altrimenti restituisco tutti (max 100)
        return filtered.length > 0 ? filtered : uniqueRecipes.slice(0, 100);
      }
    } catch (error: any) {
      // Gestisco errori di autenticazione separatamente dagli altri errori
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.error('API Key non valida. Controlla la configurazione nel file .env');
      } else {
        console.error('Error searching recipes:', error);
      }
      // Non faccio throw: passo al livello di fallback successivo
    }
  }
  
  // LIVELLO 2: Provo con TheMealDB (gratuita, nessuna chiave necessaria)
  try {
    const recipes = await searchTheMealDB(query);
    if (recipes.length > 0) {
      return recipes;
    }
  } catch (error) {
    // Ignoro errori CORS che possono verificarsi con TheMealDB
  }
  
  // LIVELLO 3: Uso i dati mock come ultimo fallback
  // Filtro i mock data in base alla query dell'utente
  const filteredMock = mockRecipes.filter(recipe =>
    recipe.title.toLowerCase().includes(query.toLowerCase())
  );
  
  return filteredMock;
}

// Recupera i dettagli di una singola ricetta dato il suo ID
// Provo entrambe le API in parallelo per maggiore velocita'
export async function getRecipeById(id: number): Promise<Recipe | null> {
  const promises: Promise<Recipe | null>[] = [];
  
  // LIVELLO 1: Spoonacular - recupero i dettagli completi della ricetta
  if (USE_SPOONACULAR) {
    promises.push(
      (async () => {
        try {
          const client = createSpoonacularClient();
          const response = await client.get(`/${id}/information`, {
            params: {
              includeNutrition: false, // Non mi servono i dati nutrizionali
            },
          });
          return formatSpoonacularRecipe(response.data);
        } catch (error: any) {
          if (error.response?.status === 401 || error.response?.status === 403) {
            throw new Error('API Key non valida. Controlla la configurazione nel file .env');
          }
          return null;
        }
      })()
    );
  }
  
  // LIVELLO 2: TheMealDB - provo in parallelo con Spoonacular
  promises.push(
    (async () => {
      try {
        return await getTheMealDBRecipeById(id);
      } catch (error) {
        return null;
      }
    })()
  );
  
  // Attendo tutte le risposte e prendo la prima ricetta trovata
  // Uso Promise.allSettled per non fallire se una delle API non risponde
  const results = await Promise.allSettled(promises);
  
  for (const result of results) {
    if (result.status === 'fulfilled' && result.value) {
      return result.value;
    }
  }
  
  // LIVELLO 3: Cerco nei dati mock come ultimo tentativo
  return getMockRecipeById(id);
}

// Carica tutte le ricette vegetariane disponibili
// Questa funzione viene chiamata al caricamento della pagina "Tutte le ricette"
export async function getAllRecipes(): Promise<Recipe[]> {
  const allRecipes: Recipe[] = [];
  
  // LIVELLO 1: Spoonacular - carico ricette popolari + ricette per categoria
  if (USE_SPOONACULAR) {
    try {
      const client = createSpoonacularClient();
      
      // Prima richiesta: 100 ricette vegetariane ordinate per popolarita'
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
      
      // Se ho ricette, provo ad arricchire con query specifiche per categoria
      if (allRecipes.length > 0) {
        const specificQueries = [
          'pasta', 'salad', 'rice', 'quinoa', 'tofu', 'vegetable', 
          'soup', 'curry', 'burger', 'pizza', 'lasagna', 'risotto'
        ];
        
        // Limito a 5 query per non consumare troppi crediti API
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
            
            // Pausa di 300ms tra le richieste per non sovraccaricare l'API
            await new Promise(resolve => setTimeout(resolve, 300));
          } catch (e) {
            // Se una query fallisce, continuo con la successiva
            continue;
          }
        }
      }
      
      // Rimuovo i duplicati: le stesse ricette possono apparire in query diverse
      // Il numero finale di ricette dipende da quante sono uniche tra tutte le risposte
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
  
  // LIVELLO 2: TheMealDB - carico ricette da categorie vegetariane
  try {
    const mealDBRecipes = await getAllTheMealDBRecipes();
    if (mealDBRecipes.length > 0) {
      return mealDBRecipes;
    }
  } catch (error) {
    // Ignoro errori CORS
  }
  
  // LIVELLO 3: Mock Data - restituisco sempre i dati di esempio come ultimo fallback
  return mockRecipes;
}
