// Punto di ingresso dell'applicazione React
// Qui monto il componente principale App nel DOM

import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Seleziono l'elemento root dall'HTML e ci monto l'intera applicazione React
// L'operatore "!" assicura a TypeScript che l'elemento esiste nel DOM
createRoot(document.getElementById('root')!).render(
  <App />
)
