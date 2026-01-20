# Configurazione GitHub Pages - Guida Completa

## IMPORTANTE: Prima di fare il deploy

### 1. Determina il tipo di sito GitHub Pages

**User/Organization Site** (es. `username.github.io`):
- Il repository DEVE chiamarsi esattamente `username.github.io`
- Il `base` in `vite.config.ts` deve essere `'/'`
- Il sito sarà disponibile su `https://username.github.io`

**Project Site** (es. `username.github.io/repository-name`):
- Il repository può avere qualsiasi nome
- Il `base` in `vite.config.ts` deve essere `'/repository-name/'`
- Il sito sarà disponibile su `https://username.github.io/repository-name`

### 2. Configurazione per Project Site (MOST COMMON)

Se il tuo repository NON si chiama `username.github.io`, segui questi passaggi:

1. **Aggiorna `vite.config.ts`**:
   ```typescript
   base: '/NOME-DEL-TUO-REPOSITORY/',
   ```
   Sostituisci `NOME-DEL-TUO-REPOSITORY` con il nome effettivo del tuo repository GitHub.

2. **Aggiorna `package.json`**:
   ```json
   "homepage": "https://TUO_USERNAME.github.io/NOME-DEL-TUO-REPOSITORY"
   ```
   Sostituisci `TUO_USERNAME` e `NOME-DEL-TUO-REPOSITORY` con i valori corretti.

### 3. Configurazione per User Site

Se il tuo repository si chiama `username.github.io`:

1. **Mantieni `vite.config.ts`**:
   ```typescript
   base: '/',
   ```

2. **Aggiorna `package.json`**:
   ```json
   "homepage": "https://TUO_USERNAME.github.io"
   ```

## Passaggi per il Deploy

1. **Configura i file come sopra**

2. **Esegui il deploy**:
   ```bash
   npm run deploy
   ```

3. **Configura GitHub Pages**:
   - Vai su GitHub → Il tuo repository → Settings → Pages
   - Source: "Deploy from a branch"
   - Branch: `gh-pages`
   - Folder: `/ (root)`
   - Salva

4. **Attendi qualche minuto** per la pubblicazione (può richiedere 1-5 minuti)

5. **Verifica**:
   - Se è un project site: `https://username.github.io/repository-name`
   - Se è un user site: `https://username.github.io`

## Verifica che il deploy sia andato a buon fine

1. Vai sul branch `gh-pages` del tuo repository su GitHub
2. Verifica che ci sia un file `index.html` nella root del branch
3. Verifica che ci siano tutti i file necessari (assets, CSS, JS)

## Risoluzione Problemi Comuni

### Errore 404 "File not found"

**Causa**: Il `base` in `vite.config.ts` non corrisponde al percorso del repository.

**Soluzione**:
- Se il repository è `username.github.io/repo-name`, il base deve essere `'/repo-name/'`
- Se il repository è `username.github.io`, il base deve essere `'/'`

### Le risorse (CSS, JS) non si caricano

**Causa**: Il `base` è configurato male.

**Soluzione**: Verifica che il `base` corrisponda esattamente al percorso del repository.

### Il routing non funziona

**Causa**: BrowserRouter non funziona su GitHub Pages senza configurazioni aggiuntive.

**Soluzione**: L'app usa HashRouter, quindi gli URL avranno `#` (es. `/#/recipes`). Questo è normale e funziona correttamente.

## Note Finali

- Il file `404.html` nella cartella `public` viene copiato automaticamente durante il build
- Il file `.nojekyll` nella cartella `public` disabilita Jekyll su GitHub Pages
- HashRouter è la soluzione più semplice e affidabile per GitHub Pages
