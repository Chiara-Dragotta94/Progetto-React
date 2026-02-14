// Servizio per l'API TheMealDB
// TheMealDB e' un'API completamente gratuita per le ricette, la uso come
// secondo livello di fallback quando Spoonacular non e' disponibile.
// Non richiede API key, ma puo' avere problemi di CORS in alcuni ambienti

import axios from 'axios';
import type { Recipe, Ingredient } from '../types/recipe';

// URL base dell'API TheMealDB (versione gratuita)
const BASE_URL = 'https://www.themealdb.com/api/json/v1/1';

// Categorie di TheMealDB che contengono ricette vegetariane
const VEGETARIAN_CATEGORIES = ['Vegetarian', 'Vegan', 'Side', 'Dessert'];

// Parole chiave che indicano una ricetta potenzialmente vegetariana
const VEGETARIAN_KEYWORDS = ['vegetable', 'salad', 'pasta', 'rice', 'quinoa', 'tofu', 'bean', 'lentil', 'chickpea'];

// Flag globale per tracciare errori CORS con TheMealDB
// Una volta rilevato un errore CORS, evito ulteriori chiamate inutili
let corsErrorDetected = false;

// Funzione helper per identificare errori di tipo CORS
// Gli errori CORS si manifestano come errori di rete senza risposta dal server
function isCorsError(error: any): boolean {
  return error?.code === 'ERR_NETWORK' || 
         error?.message?.includes('CORS') ||
         error?.response === undefined;
}

// Verifica se una ricetta di TheMealDB e' vegetariana
// TheMealDB non ha un filtro "vegetariano" nativo, quindi devo controllare
// manualmente il nome, la categoria e gli ingredienti della ricetta
function isVegetarianRecipe(meal: any): boolean {
  const name = (meal.strMeal || '').toLowerCase();
  const category = (meal.strCategory || '').toLowerCase();
  
  // Lista di ingredienti non vegetariani da escludere
  const nonVegetarian = ['chicken', 'beef', 'pork', 'fish', 'meat', 'lamb', 'turkey', 'bacon', 'sausage'];
  
  // Verifico se il nome o le istruzioni contengono ingredienti non vegetariani
  const hasNonVegetarian = nonVegetarian.some(ing => 
    name.includes(ing) || 
    (meal.strInstructions && meal.strInstructions.toLowerCase().includes(ing))
  );
  
  // Se trovo ingredienti non vegetariani, escludo subito la ricetta
  if (hasNonVegetarian) return false;
  
  // Verifico se la ricetta appartiene a una categoria vegetariana
  const isVegetarianCategory = VEGETARIAN_CATEGORIES.some(cat => 
    category === cat.toLowerCase()
  );
  
  // Verifico se il nome contiene parole chiave vegetariane
  const hasVegetarianKeyword = VEGETARIAN_KEYWORDS.some(keyword => 
    name.includes(keyword)
  );
  
  // La ricetta e' considerata vegetariana se appartiene a una categoria vegetariana
  // OPPURE contiene parole chiave vegetariane nel nome
  return isVegetarianCategory || hasVegetarianKeyword;
}

// Converte una ricetta dal formato TheMealDB al formato standard dell'app
// TheMealDB ha una struttura diversa da Spoonacular: gli ingredienti
// sono in campi separati (strIngredient1, strIngredient2, ... fino a 20)
function formatMealAsRecipe(meal: any): Recipe {
  const ingredients: Ingredient[] = [];
  
  // Estraggo gli ingredienti dai campi numerati di TheMealDB
  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    
    // Aggiungo solo gli ingredienti non vuoti
    if (ingredient && ingredient.trim()) {
      ingredients.push({
        id: i,
        name: ingredient,
        amount: 1,                                          // TheMealDB non fornisce quantita' numeriche
        unit: measure || '',                                // L'unita' di misura puo' essere vuota
        original: `${measure || ''} ${ingredient}`.trim(),  // Ricostruisco la stringa originale
      });
    }
  }
  
  // Formatto le istruzioni: le divido per riga e aggiungo la numerazione
  let instructions = '';
  if (meal.strInstructions) {
    instructions = meal.strInstructions
      .split('\r\n')
      .filter((line: string) => line.trim())                          // Rimuovo righe vuote
      .map((line: string, index: number) => `${index + 1}. ${line.trim()}`)  // Aggiungo numerazione
      .join('\n\n');
  }
  
  // Restituisco la ricetta nel formato standard dell'app
  return {
    id: parseInt(meal.idMeal) || 0,
    title: meal.strMeal || 'Ricetta senza nome',
    image: meal.strMealThumb || '',
    summary: meal.strInstructions ? meal.strInstructions.substring(0, 200) + '...' : '', // Prendo i primi 200 caratteri come sommario
    readyInMinutes: 30,    // Valore di default (TheMealDB non fornisce questo dato)
    servings: 4,           // Valore di default
    healthScore: 75,       // Valore di default
    extendedIngredients: ingredients,
    instructions: instructions,
    sourceUrl: meal.strSource || '',
    sourceName: 'TheMealDB',
    vegetarian: true,
    vegan: false,
  };
}

// Cerca ricette su TheMealDB in base a una query testuale
export async function searchTheMealDB(query: string): Promise<Recipe[]> {
  // Se ho gia' rilevato errori CORS, non provo nemmeno
  if (corsErrorDetected) {
    return [];
  }

  try {
    const response = await axios.get(`${BASE_URL}/search.php?s=${encodeURIComponent(query)}`, {
      timeout: 5000, // Timeout di 5 secondi
    });
    
    if (!response.data.meals) {
      return [];
    }
    
    // Filtro solo le ricette che risultano vegetariane
    const vegetarianMeals = response.data.meals.filter(isVegetarianRecipe);
    
    return vegetarianMeals.map(formatMealAsRecipe);
  } catch (error: any) {
    if (isCorsError(error)) {
      corsErrorDetected = true;
      return [];
    }
    return [];
  }
}

// Recupera i dettagli di una singola ricetta da TheMealDB dato il suo ID
export async function getTheMealDBRecipeById(id: number): Promise<Recipe | null> {
  if (corsErrorDetected) {
    return null;
  }

  try {
    const response = await axios.get(`${BASE_URL}/lookup.php?i=${id}`, {
      timeout: 5000,
    });
    
    if (!response.data.meals || response.data.meals.length === 0) {
      return null;
    }
    
    const meal = response.data.meals[0];
    
    // Verifico che sia una ricetta vegetariana prima di restituirla
    if (!isVegetarianRecipe(meal)) {
      return null;
    }
    
    return formatMealAsRecipe(meal);
  } catch (error: any) {
    if (isCorsError(error)) {
      corsErrorDetected = true;
      return null;
    }
    if (error?.response?.status !== 404) {
      console.error('Error fetching recipe from TheMealDB:', error);
    }
    return null;
  }
}

// Carica le ricette di una specifica categoria da TheMealDB
// L'API filter restituisce solo ID e immagine, quindi devo fare
// una seconda chiamata per ogni ricetta per ottenere i dettagli completi
export async function getTheMealDBRecipesByCategory(category: string): Promise<Recipe[]> {
  if (corsErrorDetected) {
    return [];
  }

  try {
    // Prima chiamata: ottengo la lista delle ricette nella categoria
    const response = await axios.get(`${BASE_URL}/filter.php?c=${encodeURIComponent(category)}`, {
      timeout: 5000,
    });
    
    if (!response.data.meals) {
      return [];
    }
    
    // Limito a 20 ricette per categoria per evitare troppe chiamate API
    const allMeals = response.data.meals.slice(0, 20);
    
    // Seconda chiamata: per ogni ricetta, carico i dettagli completi
    const recipePromises = allMeals.map((meal: any) => getTheMealDBRecipeById(parseInt(meal.idMeal)));
    
    // Uso Promise.allSettled per non interrompere tutto se alcune ricette falliscono
    const results = await Promise.allSettled(recipePromises);
    
    // Filtro solo le ricette caricate con successo e non null
    const recipes = results
      .filter((result): result is PromiseFulfilledResult<Recipe> => 
        result.status === 'fulfilled' && result.value !== null
      )
      .map(result => result.value);
    
    return recipes;
  } catch (error: any) {
    if (isCorsError(error)) {
      corsErrorDetected = true;
      return [];
    }
    return [];
  }
}

// Carica tutte le ricette vegetariane da TheMealDB
// Itera sulle 4 categorie principali e raccoglie tutte le ricette
export async function getAllTheMealDBRecipes(): Promise<Recipe[]> {
  if (corsErrorDetected) {
    return [];
  }

  try {
    const categories = [
      'Vegetarian', 
      'Vegan', 
      'Side', 
      'Dessert'
    ];
    const allRecipes: Recipe[] = [];
    
    // Carico le ricette da ogni categoria, una alla volta
    for (const category of categories) {
      if (corsErrorDetected) break; // Interrompo se rilevo errori CORS
      
      const recipes = await getTheMealDBRecipesByCategory(category);
      allRecipes.push(...recipes);
      
      // Pausa di 200ms tra le richieste per non sovraccaricare l'API
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    // Rimuovo ricette duplicate (la stessa ricetta puo' apparire in piu' categorie)
    const uniqueRecipes = allRecipes.filter((recipe, index, self) =>
      index === self.findIndex(r => r.id === recipe.id)
    );
    
    return uniqueRecipes;
  } catch (error: any) {
    if (isCorsError(error)) {
      corsErrorDetected = true;
      return [];
    }
    return [];
  }
}
