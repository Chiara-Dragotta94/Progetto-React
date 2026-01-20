export type Ingredient = {
  id: number;
  name: string;
  amount: number;
  unit: string;
  original: string;
};

export type Recipe = {
  id: number;
  title: string;
  image: string;
  summary?: string;
  readyInMinutes?: number;
  servings?: number;
  healthScore?: number;
  extendedIngredients?: Ingredient[];
  instructions?: string;
  analyzedInstructions?: Array<{
    steps: Array<{
      number: number;
      step: string;
    }>;
  }>;
  sourceUrl?: string;
  sourceName?: string;
  dishTypes?: string[];
  cuisines?: string[];
  vegetarian?: boolean;
  vegan?: boolean;
};

export type UserRecipe = Recipe & {
  createdAt?: string;
  isUserCreated?: boolean;
};
