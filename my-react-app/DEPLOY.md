# Come pubblicare su GitHub Pages

## Prerequisiti

1. Installa `gh-pages` come dipendenza di sviluppo:
   ```bash
   npm install --save-dev gh-pages
   ```

2. Assicurati che il tuo repository GitHub sia configurato correttamente.

## Passaggi per il Deploy

### Opzione 1: Usando lo script npm (Consigliato)

1. Esegui il comando:
   ```bash
   npm run deploy
   ```

2. Questo comando:
   - Esegue il build dell'app (`npm run build`)
   - Pubblica la cartella `dist` sul branch `gh-pages` del tuo repository

3. Vai su GitHub → Settings → Pages e seleziona il branch `gh-pages` come sorgente.

### Opzione 2: Deploy Manuale

1. Esegui il build:
   ```bash
   npm run build
   ```

2. Copia il contenuto della cartella `dist` nel branch `gh-pages` del tuo repository.

## Configurazione GitHub Pages

1. Vai su GitHub nel tuo repository
2. Settings → Pages
3. Source: seleziona "Deploy from a branch"
4. Branch: seleziona `gh-pages` e la cartella `/ (root)`
5. Salva

## Nota Importante

Se il tuo repository NON è nella root di GitHub (es. `username.github.io/repository-name`), devi aggiornare `vite.config.ts`:

```typescript
base: '/repository-name/',
```

Sostituisci `repository-name` con il nome effettivo del tuo repository.

## Risoluzione Problemi

- **404 Error**: Assicurati che il file `404.html` sia nella cartella `public` e che `.nojekyll` sia presente
- **Routing non funziona**: Verifica che il file `404.html` sia stato copiato nella cartella `dist` dopo il build
- **Risorse non caricate**: Controlla che il `base` in `vite.config.ts` corrisponda al percorso del tuo repository
