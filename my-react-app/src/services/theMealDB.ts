import axios from 'axios';
import type { Recipe, Ingredient } from '../types/recipe';

const BASE_URL = 'https://www.themealdb.com/api/json/v1/1';

// Categorie vegetariane comuni
const VEGETARIAN_CATEGORIES = ['Vegetarian', 'Vegan', 'Side', 'Dessert'];

// Parole chiave vegetariane da filtrare
const VEGETARIAN_KEYWORDS = ['vegetable', 'salad', 'pasta', 'rice', 'quinoa', 'tofu', 'bean', 'lentil', 'chickpea'];

function isVegetarianRecipe(meal: any): boolean {
  const name = (meal.strMeal || '').toLowerCase();
  const category = (meal.strCategory || '').toLowerCase();
  const area = (meal.strArea || '').toLowerCase();
  
  // Controlla se contiene ingredienti non vegetariani
  const nonVegetarian = ['chicken', 'beef', 'pork', 'fish', 'meat', 'lamb', 'turkey', 'bacon', 'sausage'];
  const hasNonVegetarian = nonVegetarian.some(ing => 
    name.includes(ing) || 
    (meal.strInstructions && meal.strInstructions.toLowerCase().includes(ing))
  );
  
  if (hasNonVegetarian) return false;
  
  // Controlla se è in una categoria vegetariana o contiene parole chiave vegetariane
  const isVegetarianCategory = VEGETARIAN_CATEGORIES.some(cat => 
    category === cat.toLowerCase()
  );
  
  const hasVegetarianKeyword = VEGETARIAN_KEYWORDS.some(keyword => 
    name.includes(keyword)
  );
  
  return isVegetarianCategory || hasVegetarianKeyword;
}

function formatMealAsRecipe(meal: any): Recipe {
  const ingredients: Ingredient[] = [];
  
  // Estrae gli ingredienti (TheMealDB ha ingredienti fino a ingredient20)
  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    
    if (ingredient && ingredient.trim()) {
      ingredients.push({
        id: i,
        name: ingredient,
        amount: 1,
        unit: measure || '',
        original: `${measure || ''} ${ingredient}`.trim(),
      });
    }
  }
  
  // Formatta le istruzioni
  let instructions = '';
  if (meal.strInstructions) {
    instructions = meal.strInstructions
      .split('\r\n')
      .filter((line: string) => line.trim())
      .map((line: string, index: number) => `${index + 1}. ${line.trim()}`)
      .join('\n\n');
  }
  
  return {
    id: parseInt(meal.idMeal) || 0,
    title: meal.strMeal || 'Ricetta senza nome',
    image: meal.strMealThumb || '',
    summary: meal.strInstructions ? meal.strInstructions.substring(0, 200) + '...' : '',
    readyInMinutes: 30, // Default
    servings: 4, // Default
    healthScore: 75, // Default
    extendedIngredients: ingredients,
    instructions: instructions,
    sourceUrl: meal.strSource || '',
    sourceName: 'TheMealDB',
    vegetarian: true,
    vegan: false,
  };
}

export async function searchTheMealDB(query: string): Promise<Recipe[]> {
  // Se abbiamo già rilevato errori CORS, non provare più
  if (corsErrorDetected) {
    return [];
  }

  try {
    const response = await axios.get(`${BASE_URL}/search.php?s=${encodeURIComponent(query)}`, {
      timeout: 5000,
    });
    
    if (!response.data.meals) {
      return [];
    }
    
    // Filtra solo ricette vegetariane
    const vegetarianMeals = response.data.meals.filter(isVegetarianRecipe);
    
    return vegetarianMeals.map(formatMealAsRecipe);
  } catch (error: any) {
    if (isCorsError(error)) {
      corsErrorDetected = true;
      return [];
    }
    // Non loggare errori di ricerca se sono CORS
    return [];
  }
}

// Flag per tracciare se TheMealDB ha problemi CORS
let corsErrorDetected = false;

function isCorsError(error: any): boolean {
  return error?.code === 'ERR_NETWORK' || 
         error?.message?.includes('CORS') ||
         error?.response === undefined;
}

export async function getTheMealDBRecipeById(id: number): Promise<Recipe | null> {
  // Se abbiamo già rilevato errori CORS, non provare più
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
    
    if (!isVegetarianRecipe(meal)) {
      return null;
    }
    
    return formatMealAsRecipe(meal);
  } catch (error: any) {
    if (isCorsError(error)) {
      corsErrorDetected = true;
      // Non loggare ogni singolo errore CORS, solo il primo
      return null;
    }
    // Logga solo errori non-CORS
    if (error?.response?.status !== 404) {
      console.error('Error fetching recipe from TheMealDB:', error);
    }
    return null;
  }
}

export async function getTheMealDBRecipesByCategory(category: string): Promise<Recipe[]> {
  // Se abbiamo già rilevato errori CORS, non provare più
  if (corsErrorDetected) {
    return [];
  }

  try {
    const response = await axios.get(`${BASE_URL}/filter.php?c=${encodeURIComponent(category)}`, {
      timeout: 5000,
    });
    
    if (!response.data.meals) {
      return [];
    }
    
    // Riduci il numero di ricette per categoria per evitare troppe chiamate
    const allMeals = response.data.meals.slice(0, 20);
    const recipePromises = allMeals.map((meal: any) => getTheMealDBRecipeById(parseInt(meal.idMeal)));
    
    // Usa Promise.allSettled per non fallire se alcune ricette non sono vegetariane
    const results = await Promise.allSettled(recipePromises);
    
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
    // Non loggare errori di categoria se sono CORS
    return [];
  }
}

export async function getAllTheMealDBRecipes(): Promise<Recipe[]> {
  // Se abbiamo già rilevato errori CORS, non provare più
  if (corsErrorDetected) {
    return [];
  }

  try {
    // Cerca ricette solo da categorie principali (ridotto per evitare troppe chiamate)
    const categories = [
      'Vegetarian', 
      'Vegan', 
      'Side', 
      'Dessert'
    ];
    const allRecipes: Recipe[] = [];
    
    // Carica da categorie (solo le prime 4 per ridurre chiamate)
    for (const category of categories) {
      if (corsErrorDetected) break; // Esci se CORS è stato rilevato
      const recipes = await getTheMealDBRecipesByCategory(category);
      allRecipes.push(...recipes);
      
      // Pausa più lunga per non sovraccaricare
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    // Rimuovi duplicati
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
