// Configurazione di Vite per il progetto Leafy
// Ho utilizzato Vite come build tool per la sua velocità e semplicità di configurazione

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Abilito il plugin React per il supporto JSX e Fast Refresh durante lo sviluppo
  plugins: [react()],

  // Imposto il base path per GitHub Pages: il sito viene servito
  // sotto il percorso /Progetto-React/ e non dalla root del dominio
  base: '/Progetto-React/',

  resolve: {
    // Evito duplicazioni di React e ReactDOM nel bundle finale,
    // che potrebbero causare errori con gli hooks
    dedupe: ['react', 'react-dom'],
  },

  build: {
    // La cartella di output del build, che verrà pubblicata su GitHub Pages
    outDir: 'dist',
  },
})
