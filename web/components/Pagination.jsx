'use client'

import MuiPagination from '@mui/material/Pagination'

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) {
    return null
  }

  return (
    <MuiPagination
      count={totalPages}
      page={currentPage}
      onChange={(event, page) => onPageChange(page)}
      color="primary"
      aria-label="Paginação de eventos"
      sx={{ my: { xs: 2.5, sm: 3 }, display: 'flex', justifyContent: 'center' }}
    />
  )
}
