// Componente Header: barra di navigazione principale dell'app
// Ho implementato un menu hamburger per la versione mobile
// con gestione della chiusura tramite tasto Escape e overlay

import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';

export default function Header() {
  // Stato per controllare se il menu mobile e' aperto o chiuso
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // useLocation mi permette di sapere in quale pagina mi trovo,
  // cosi' posso evidenziare il link attivo nella navigazione
  const location = useLocation();

  // Chiudo automaticamente il menu mobile quando l'utente cambia pagina
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  // Gestisco la chiusura del menu con il tasto Escape
  // e blocco lo scroll della pagina quando il menu e' aperto
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      // Quando il menu e' aperto, ascolto il tasto Escape e blocco lo scroll
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      // Quando e' chiuso, ripristino lo scroll normale
      document.body.style.overflow = '';
    }

    // Pulizia: rimuovo il listener e ripristino lo scroll quando il componente si smonta
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  // Funzione helper per determinare se un link e' attivo (pagina corrente)
  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo dell'app: cliccandolo si torna alla homepage */}
        <Link to="/" className="logo">
          <span className="logo-text">🌿 Leafy</span>
        </Link>

        {/* Menu di navigazione: su mobile si apre/chiude con il bottone hamburger */}
        <nav className={`nav ${isMenuOpen ? 'nav-open' : ''}`}>
          <Link 
            to="/recipes" 
            className={`nav-link ${isActive('/recipes') ? 'active' : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            Ricette
          </Link>
          <Link 
            to="/my-recipes" 
            className={`nav-link ${isActive('/my-recipes') ? 'active' : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            Le Mie Ricette
          </Link>
          <Link 
            to="/create" 
            className={`nav-link ${isActive('/create') ? 'active' : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            Crea Ricetta
          </Link>
        </nav>

        {/* Bottone hamburger: visibile solo su mobile (gestito via CSS) */}
        {/* Le tre <span> creano le tre linee dell'icona hamburger */}
        <button 
          className={`menu-toggle ${isMenuOpen ? 'open' : ''}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {/* Overlay semitrasparente: cliccandoci sopra si chiude il menu mobile */}
      {isMenuOpen && (
        <div 
          className="menu-overlay" 
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </header>
  );
}
