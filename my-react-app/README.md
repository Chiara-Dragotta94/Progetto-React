# Leafy - App di Ricette Vegetariane

Un'applicazione web moderna sviluppata con React e TypeScript per scoprire, creare e gestire ricette vegetariane e vegane. Leafy promuove un'alimentazione sostenibile e rispettosa dell'ambiente attraverso una piattaforma intuitiva e completa.

## Indice

- [Caratteristiche](#caratteristiche)
- [Tecnologie Utilizzate](#tecnologie-utilizzate)
- [Installazione](#installazione)
- [Uso](#uso)
- [Struttura del Progetto](#struttura-del-progetto)
- [API e Integrazioni](#api-e-integrazioni)
- [Funzionalità Principali](#funzionalità-principali)
- [Sviluppo](#sviluppo)

## Caratteristiche

- **Ricerca Avanzata**: Sistema di ricerca potente che permette di trovare ricette per ingredienti, nome o descrizione
- **Collezione Vastissima**: Accesso a migliaia di ricette vegetariane e vegane da fonti multiple
- **Creazione Personalizzata**: Crea e salva le tue ricette personalizzate con un'interfaccia intuitiva
- **Salvataggio Locale**: Le tue ricette vengono salvate automaticamente nel browser (LocalStorage)
- **Design Responsive**: Perfettamente funzionante su desktop, tablet e mobile
- **Sensibilizzazione**: Informazioni su Veganuary e promozione di uno stile di vita sostenibile
- **Performance Ottimizzate**: Caricamento rapido e navigazione fluida

## Tecnologie Utilizzate

- **React 19.2** - Libreria JavaScript per interfacce utente
- **TypeScript** - Superset di JavaScript con type safety
- **React Router DOM v7** - Routing per applicazioni React
- **Vite 7.2** - Build tool veloce e moderno
- **Axios** - Client HTTP per chiamate API
- **React Context API** - Gestione dello stato globale
- **CSS Modulare** - Styling organizzato per componente
- **LocalStorage** - Persistenza dati lato client

## Installazione

### Prerequisiti

- Node.js (versione 18 o superiore)
- npm o yarn

### Passaggi

1. Clona il repository o scarica il progetto
2. Naviga nella directory del progetto:
   ```bash
   cd my-react-app
   ```

3. Installa le dipendenze:
   ```bash
   npm install
   ```

4. (Opzionale) Configura l'API key di Spoonacular:
   - Crea un file `.env` nella root del progetto
   - Aggiungi la tua API key:
     ```
     VITE_SPOONACULAR_API_KEY=your_api_key_here
     ```
   - Nota: L'app funziona anche senza API key grazie al sistema di fallback

5. Avvia il server di sviluppo:
   ```bash
   npm run dev
   ```

6. Apri il browser su `http://localhost:5173` (o la porta indicata nel terminale)

## Uso

### Comandi Disponibili

- `npm run dev` - Avvia il server di sviluppo
- `npm run build` - Crea una build di produzione
- `npm run preview` - Anteprima della build di produzione
- `npm run lint` - Esegue il linter per controllare il codice

### Navigazione

- **Homepage**: Visualizza ricette popolari e informazioni su Veganuary
- **Tutte le Ricette**: Esplora l'intera collezione di ricette vegetariane
- **Le Mie Ricette**: Gestisci le ricette personalizzate create
- **Crea Ricetta**: Crea nuove ricette personalizzate

## Struttura del Progetto

```
my-react-app/
├── public/                 # File statici
│   └── favicon.svg
├── src/
│   ├── components/         # Componenti riutilizzabili
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── RecipeCard.tsx
│   │   ├── RecipeList.tsx
│   │   ├── RecipeDetail.tsx
│   │   ├── SearchBar.tsx
│   │   └── Pagination.tsx
│   ├── pages/              # Pagine principali
│   │   ├── Home.tsx
│   │   ├── AllRecipes.tsx
│   │   ├── MyRecipes.tsx
│   │   └── CreateRecipe.tsx
│   ├── context/            # Context API
│   │   └── RecipeContext.tsx
│   ├── services/           # Servizi e API
│   │   ├── api.ts
│   │   ├── theMealDB.ts
│   │   └── mockData.ts
│   ├── types/              # Definizioni TypeScript
│   │   └── recipe.ts
│   ├── App.tsx             # Componente principale
│   └── main.tsx            # Entry point
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## API e Integrazioni

Leafy implementa un sistema intelligente di fallback a tre livelli:

1. **Spoonacular API** (Priorità alta)
   - API premium con ricette dettagliate
   - Richiede API key (opzionale)
   - Informazioni nutrizionali complete

2. **TheMealDB API** (Priorità media)
   - API completamente gratuita
   - Ricette vegetariane accuratamente filtrate
   - Nessuna autenticazione richiesta

3. **Mock Data** (Fallback)
   - Dati di esempio sempre disponibili
   - Garantisce funzionamento anche offline

L'app funziona sempre, anche senza connessione internet o API key configurata.

## Funzionalità Principali

### Esplorazione Ricette
- Visualizzazione di migliaia di ricette vegetariane
- Ricerca in tempo reale per ingredienti o nome
- Sistema di paginazione per navigazione fluida
- Dettagli completi con ingredienti, istruzioni e informazioni nutrizionali

### Creazione Ricette
- Form intuitivo con selezione ingredienti per categorie
- Interfaccia con emoji per identificazione rapida
- Salvataggio automatico nella collezione personale
- Gestione completa delle proprie creazioni

### Gestione Collezione
- Visualizzazione di tutte le ricette personali
- Accesso rapido ai dettagli
- Eliminazione semplice
- Persistenza automatica con LocalStorage

### Design e UX
- Design responsive per tutti i dispositivi
- Menu hamburger su mobile
- Navigazione intuitiva
- Supporto per accessibilità (tastiera e screen reader)

## Sviluppo

### TypeScript
Il progetto utilizza TypeScript per garantire type safety e prevenire errori durante lo sviluppo.

### State Management
Lo stato globale è gestito tramite React Context API, eliminando il problema del prop drilling e rendendo i dati accessibili ovunque servano.

### Styling
Ogni componente ha il proprio file CSS modulare per mantenere il codice organizzato e manutenibile.

### Performance
- Code splitting per caricamento lazy dei componenti
- Lazy loading delle immagini
- Caching delle API per ridurre chiamate ridondanti
- Debouncing per ottimizzare la ricerca
- Memoization con useCallback e useMemo

## Note

- Le ricette create dall'utente vengono salvate nel LocalStorage del browser
- Non è richiesta autenticazione per utilizzare l'app
- L'app funziona anche senza connessione internet grazie ai dati mock
- Per ottenere il massimo dalle API, si consiglia di configurare una Spoonacular API key

## Sostenibilità

Leafy promuove un'alimentazione sostenibile e rispettosa dell'ambiente, incoraggiando scelte alimentari che rispettano il pianeta e i suoi abitanti. L'app include informazioni su Veganuary, il movimento globale che incoraggia le persone a provare un'alimentazione vegana.


