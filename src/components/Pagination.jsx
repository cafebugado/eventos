import './Pagination.css'

function buildVisiblePages(currentPage, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const pages = [1]
  const start = Math.max(2, currentPage - 1)
  const end = Math.min(totalPages - 1, currentPage + 1)

  if (start > 2) {
    pages.push('ellipsis-start')
  }

  for (let page = start; page <= end; page += 1) {
    pages.push(page)
  }

  if (end < totalPages - 1) {
    pages.push('ellipsis-end')
  }

  pages.push(totalPages)
  return pages
}

function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) {
    return null
  }

  const pages = buildVisiblePages(currentPage, totalPages)

  return (
    <nav className="pagination" aria-label="Paginacao de eventos">
      <button
        type="button"
        className="pagination-button pagination-control"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Anterior
      </button>

      {pages.map((page) =>
        typeof page === 'number' ? (
          <button
            key={page}
            type="button"
            className={`pagination-button ${page === currentPage ? 'active' : ''}`}
            onClick={() => onPageChange(page)}
            aria-current={page === currentPage ? 'page' : undefined}
          >
            {page}
          </button>
        ) : (
          <span key={page} className="pagination-ellipsis" aria-hidden="true">
            ...
          </span>
        )
      )}

      <button
        type="button"
        className="pagination-button pagination-control"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Proxima
      </button>
    </nav>
  )
}

export default Pagination
