'use client'

import { useCallback, useMemo } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { withUpdatedParams } from '../utils/urlSearchParams'

// Porta usePagination.js (app antigo, baseado em useSearchParams do
// react-router) para next/navigation. A página /eventos (app/eventos/page.jsx)
// deliberadamente NÃO lê a prop `searchParams` — por isso, navegações que só
// mudam a query string aqui ficam inteiramente client-side (Partial Rendering
// do App Router), sem round-trip ao servidor/Supabase a cada troca de página.
export function usePagination(items, pageSize) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentPage = useMemo(() => {
    const p = parseInt(searchParams.get('page') || '1', 10)
    return Number.isNaN(p) || p < 1 ? 1 : p
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

  const goToPage = useCallback(
    (page) => {
      const next = Math.min(Math.max(page, 1), totalPages)
      const query = withUpdatedParams(searchParams, { page: next === 1 ? '' : next })
      router.replace(`${pathname}${query ? `?${query}` : ''}`, { scroll: false })
    },
    [pathname, router, searchParams, totalPages]
  )

  return { currentPage, totalPages, pagedItems, goToPage }
}
