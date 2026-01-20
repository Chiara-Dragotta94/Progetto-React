# Checklist Pre-Deploy GitHub Pages

## ⚠️ IMPORTANTE: Leggi prima di fare il deploy

### Step 1: Identifica il tipo di sito

**Domanda**: Qual è l'URL del tuo sito GitHub Pages?

- **Opzione A**: `https://tuousername.github.io` (senza percorso aggiuntivo)
  - ✅ Questo è un **User/Organization Site**
  - Il repository DEVE chiamarsi esattamente `tuousername.github.io`
  - Configurazione: `base: '/'` in vite.config.ts

- **Opzione B**: `https://tuousername.github.io/nome-repository`
  - ✅ Questo è un **Project Site** (più comune)
  - Il repository può avere qualsiasi nome
  - Configurazione: `base: '/nome-repository/'` in vite.config.ts

### Step 2: Configura i file

#### Se hai un PROJECT SITE (Opzione B):

1. **Apri `vite.config.ts`** e cambia:
   ```typescript
   base: '/NOME-ESATTO-DEL-TUO-REPOSITORY/',
   ```
   Esempio: se il repository si chiama `Progetto-React`, usa:
   ```typescript
   base: '/Progetto-React/',
   ```

2. **Apri `package.json`** e cambia:
   ```json
   "homepage": "https://TUO_USERNAME.github.io/NOME-REPOSITORY"
   ```
   Esempio: se sei `chiara` e il repo è `Progetto-React`:
   ```json
   "homepage": "https://chiara.github.io/Progetto-React"
   ```

#### Se hai un USER SITE (Opzione A):

1. **Mantieni `vite.config.ts`**:
   ```typescript
   base: '/',
   ```

2. **Apri `package.json`** e cambia:
   ```json
   "homepage": "https://TUO_USERNAME.github.io"
   ```

### Step 3: Esegui il deploy

```bash
npm run deploy
```

### Step 4: Configura GitHub Pages

1. Vai su GitHub → Il tuo repository
2. Settings → Pages
3. Source: "Deploy from a branch"
4. Branch: `gh-pages`
5. Folder: `/ (root)`
6. Salva

### Step 5: Verifica

1. Attendi 1-5 minuti
2. Vai sul branch `gh-pages` su GitHub
3. Verifica che ci sia `index.html` nella root
4. Apri il sito e verifica che funzioni

## ❌ Se vedi ancora 404

1. **Verifica il base path**: Deve corrispondere ESATTAMENTE al percorso del repository
2. **Verifica che index.html esista**: Controlla nel branch gh-pages
3. **Pulisci cache del browser**: Prova in modalità incognito
4. **Attendi più tempo**: A volte GitHub Pages impiega fino a 10 minuti

## 📝 Esempio Completo

Se il tuo repository è:
- Username: `chiara`
- Repository: `Progetto-React`
- URL finale: `https://chiara.github.io/Progetto-React`

Allora configura:
- `vite.config.ts`: `base: '/Progetto-React/'`
- `package.json`: `"homepage": "https://chiara.github.io/Progetto-React"`
