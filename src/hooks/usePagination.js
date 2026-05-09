import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

export default function usePagination(items, pageSize) {
  const [searchParams, setSearchParams] = useSearchParams()

  const currentPage = useMemo(() => {
    const p = parseInt(searchParams.get('page') || '1', 10)
    return isNaN(p) || p < 1 ? 1 : p
  }, [searchParams])

  const totalPages = useMemo(() => {
    if (pageSize <= 0) {
      return 1
    }
    return Math.max(1, Math.ceil(items.length / pageSize))
  }, [items.length, pageSize])

  const pagedItems = useMemo(() => {
    if (pageSize <= 0) {
      return items
    }
    const page = Math.min(currentPage, totalPages)
    const startIndex = (page - 1) * pageSize
    return items.slice(startIndex, startIndex + pageSize)
  }, [items, currentPage, totalPages, pageSize])

  const goToPage = (page) => {
    const next = Math.min(Math.max(page, 1), totalPages)
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev)
      params.set('page', String(next))
      return params
    })
  }

  return {
    currentPage,
    totalPages,
    pagedItems,
    goToPage,
  }
}
