// Definizione dei tipi TypeScript per le ricette
// Ho creato questi tipi per garantire la coerenza dei dati in tutta l'app
// e per sfruttare il type-checking di TypeScript

// Tipo per un singolo ingrediente di una ricetta
export type Ingredient = {
  id: number;        // Identificativo univoco dell'ingrediente
  name: string;      // Nome dell'ingrediente (es. "Pomodori")
  amount: number;    // Quantità necessaria (es. 200)
  unit: string;      // Unità di misura (es. "g", "ml", "pezzi")
  original: string;  // Stringa originale completa (es. "200g Pomodori")
};

// Tipo principale per una ricetta, compatibile sia con i dati delle API
// (Spoonacular e TheMealDB) sia con le ricette create dall'utente
export type Recipe = {
  id: number;                      // ID univoco della ricetta
  title: string;                   // Titolo della ricetta
  image: string;                   // URL dell'immagine della ricetta
  summary?: string;                // Descrizione/riassunto (opzionale)
  readyInMinutes?: number;         // Tempo di preparazione in minuti
  servings?: number;               // Numero di porzioni
  healthScore?: number;            // Punteggio salute (da Spoonacular, 0-100)
  extendedIngredients?: Ingredient[]; // Lista degli ingredienti
  instructions?: string;           // Istruzioni come stringa di testo
  analyzedInstructions?: Array<{   // Istruzioni strutturate (formato Spoonacular)
    steps: Array<{
      number: number;              // Numero del passaggio
      step: string;                // Descrizione del passaggio
    }>;
  }>;
  sourceUrl?: string;              // URL della fonte originale della ricetta
  sourceName?: string;             // Nome della fonte (es. "TheMealDB")
  dishTypes?: string[];            // Tipi di piatto (es. "antipasto", "primo")
  cuisines?: string[];             // Cucine di appartenenza (es. "italiana")
  vegetarian?: boolean;            // Se la ricetta è vegetariana
  vegan?: boolean;                 // Se la ricetta è vegana
};

// Tipo esteso per le ricette create dall'utente
// Eredita tutti i campi di Recipe e aggiunge campi specifici
export type UserRecipe = Recipe & {
  createdAt?: string;       // Data di creazione in formato ISO
  isUserCreated?: boolean;  // Flag per distinguere le ricette utente da quelle delle API
};
