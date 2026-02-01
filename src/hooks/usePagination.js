import { useEffect, useMemo, useState } from 'react'

export default function usePagination(items, pageSize) {
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = useMemo(() => {
    if (pageSize <= 0) {
      return 1
    }
    return Math.max(1, Math.ceil(items.length / pageSize))
  }, [items.length, pageSize])

  useEffect(() => {
    setCurrentPage(1)
  }, [items, pageSize])

  const pagedItems = useMemo(() => {
    if (pageSize <= 0) {
      return items
    }
    const startIndex = (currentPage - 1) * pageSize
    return items.slice(startIndex, startIndex + pageSize)
  }, [items, currentPage, pageSize])

  const goToPage = (page) => {
    const nextPage = Math.min(Math.max(page, 1), totalPages)
    setCurrentPage(nextPage)
  }

  return {
    currentPage,
    totalPages,
    pagedItems,
    goToPage,
  }
}
