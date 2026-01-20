# Come pubblicare su GitHub Pages

## Prerequisiti

1. `gh-pages` è già installato come dipendenza di sviluppo
2. Assicurati che il tuo repository GitHub sia configurato correttamente

## Passaggi per il Deploy

1. Esegui il comando:
   ```bash
   npm run deploy
   ```

2. Questo comando:
   - Esegue il build dell'app (`npm run build`)
   - Pubblica la cartella `dist` sul branch `gh-pages` del tuo repository

3. Vai su GitHub → Settings → Pages e seleziona il branch `gh-pages` come sorgente

## Configurazione GitHub Pages

1. Vai su GitHub nel tuo repository
2. Settings → Pages
3. Source: seleziona "Deploy from a branch"
4. Branch: seleziona `gh-pages` e la cartella `/ (root)`
5. Salva

## Nota Importante

L'app usa **HashRouter** invece di BrowserRouter per compatibilità con GitHub Pages. Gli URL avranno un hash (es. `/#/recipes` invece di `/recipes`), ma questo garantisce che il routing funzioni correttamente su GitHub Pages.

Se il tuo repository NON è nella root di GitHub (es. `username.github.io/repository-name`), devi aggiornare `vite.config.ts`:

```typescript
base: '/repository-name/',
```

Sostituisci `repository-name` con il nome effettivo del tuo repository.

## Risoluzione Problemi

- **404 Error**: Verifica che il branch `gh-pages` contenga i file dalla cartella `dist`
- **Routing non funziona**: L'app usa HashRouter, quindi gli URL avranno `#` (es. `/#/recipes`)
- **Risorse non caricate**: Controlla che il `base` in `vite.config.ts` corrisponda al percorso del tuo repository
