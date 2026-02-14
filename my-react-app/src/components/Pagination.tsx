// Componente Pagination: gestisce la navigazione tra le pagine della lista ricette
// Mostra i numeri di pagina con un sistema intelligente di ellissi (...)
// per non sovraccaricare la UI quando ci sono molte pagine

import './Pagination.css';

// Props del componente: pagina corrente, totale pagine e callback per il cambio pagina
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  // Se c'e' solo una pagina, non mostro la paginazione
  if (totalPages <= 1) return null;

  // Calcolo quali numeri di pagina mostrare
  // Uso un sistema con ellissi per gestire grandi quantita' di pagine:
  // - Se ci sono poche pagine (<=5), le mostro tutte
  // - Se la pagina corrente e' vicina all'inizio, mostro le prime 4 + ... + ultima
  // - Se e' vicina alla fine, mostro prima + ... + ultime 4
  // - Altrimenti, mostro prima + ... + 3 pagine centrali + ... + ultima
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      // Poche pagine: le mostro tutte
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        // Pagina corrente vicina all'inizio
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Pagina corrente vicina alla fine
        pages.push(1);
        pages.push('ellipsis');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Pagina corrente nel mezzo
        pages.push(1);
        pages.push('ellipsis');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="pagination">
      {/* Bottone "Precedente": disabilitato quando siamo sulla prima pagina */}
      <button
        className="pagination-btn"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Precedente
      </button>

      {/* Numeri di pagina con eventuale ellissi */}
      <div className="pagination-numbers">
        {getPageNumbers().map((page, index) => {
          if (page === 'ellipsis') {
            return <span key={`ellipsis-${index}`} className="ellipsis">...</span>;
          }
          return (
            <button
              key={page}
              className={`pagination-number ${currentPage === page ? 'active' : ''}`}
              onClick={() => onPageChange(page as number)}
            >
              {page}
            </button>
          );
        })}
      </div>

      {/* Bottone "Successiva": disabilitato quando siamo sull'ultima pagina */}
      <button
        className="pagination-btn"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Successiva
      </button>
    </div>
  );
}
