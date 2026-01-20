import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>🌿 Leafy</h3>
          <p>
            Leafy è la tua piattaforma completa per scoprire, creare e gestire ricette vegetariane e vegane. 
            Esplora migliaia di ricette da fonti affidabili, crea le tue ricette personalizzate e costruisci 
            una collezione culinaria che rispetta l'ambiente e promuove un'alimentazione sana e sostenibile.
          </p>
        </div>

        <div className="footer-section">
          <h4>Navigazione</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/recipes">Ricette</Link></li>
            <li><Link to="/my-recipes">Le Mie Ricette</Link></li>
            <li><Link to="/create">Crea Ricetta</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Contatti</h4>
          <ul>
            <li className="contact-item">
              <span className="contact-icon">📍</span>
              <span>Via della Salute 15, 20144 Milano, Italia</span>
            </li>
            <li className="contact-item">
              <span className="contact-icon">📞</span>
              <a href="tel:+390212345678">+39 02 1234 5678</a>
            </li>
            <li className="contact-item">
              <span className="contact-icon">✉️</span>
              <a href="mailto:info@leafy.it">info@leafy.it</a>
            </li>
            <li className="contact-item">
              <span className="contact-icon">🌐</span>
              <a href="mailto:partnership@leafy.it">partnership@leafy.it</a>
            </li>
            <li className="contact-social">
              <a href="https://instagram.com/leafy_recipes" target="_blank" rel="noopener noreferrer" className="social-link">
                <span className="social-icon">📷</span> Instagram
              </a>
              <a href="https://facebook.com/leafyrecipes" target="_blank" rel="noopener noreferrer" className="social-link">
                <span className="social-icon">👥</span> Facebook
              </a>
              <a href="https://pinterest.com/leafyrecipes" target="_blank" rel="noopener noreferrer" className="social-link">
                <span className="social-icon">📌</span> Pinterest
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2026 Leafy. Tutti i diritti riservati.</p>
      </div>
    </footer>
  );
}
