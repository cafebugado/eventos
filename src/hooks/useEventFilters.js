'use client'

import { useCallback, useMemo } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { isEventPast } from '../utils/eventDate'
import { withUpdatedParams } from '../utils/urlSearchParams'

// Porta useEventFilters.js (app antigo, estado local via useState) para
// next/navigation — cada filtro agora vive na URL (?q=&tag=&past=&fav=&from=&to=),
// tornando a listagem filtrada compartilhável/"voltar" funcional. Qualquer
// mudança de filtro reseta a página para 1 (mesmo comportamento do app antigo,
// que chamava goToPage(1) manualmente antes de cada setter).
//
// Ver comentário em usePagination.js sobre por que isso não gera round-trip
// ao servidor a cada troca de filtro.
export function useEventFilters(agenda, eventTagsMap, favouriteIds) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const searchTerm = searchParams.get('q') || ''
  const selectedTagId = searchParams.get('tag') || ''
  const showPastEvents = searchParams.get('past') === '1'
  const showOnlyFavourites = searchParams.get('fav') === '1'
  const dateFrom = searchParams.get('from') || ''
  const dateTo = searchParams.get('to') || ''
  const selectedLocation = searchParams.get('local') || ''

  const updateFilter = useCallback(
    (patch) => {
      const query = withUpdatedParams(searchParams, patch, { resetPage: true })
      router.replace(`${pathname}${query ? `?${query}` : ''}`, { scroll: false })
    },
    [pathname, router, searchParams]
  )

  const setSearchTerm = useCallback((value) => updateFilter({ q: value }), [updateFilter])
  const setSelectedTagId = useCallback((value) => updateFilter({ tag: value }), [updateFilter])

  const setShowPastEvents = useCallback(
    (value) => {
      const next = typeof value === 'function' ? value(showPastEvents) : value
      updateFilter({ past: next })
    },
    [updateFilter, showPastEvents]
  )

  const setShowOnlyFavourites = useCallback(
    (value) => {
      const next = typeof value === 'function' ? value(showOnlyFavourites) : value
      updateFilter({ fav: next })
    },
    [updateFilter, showOnlyFavourites]
  )

  const setDateFrom = useCallback((value) => updateFilter({ from: value }), [updateFilter])
  const setDateTo = useCallback((value) => updateFilter({ to: value }), [updateFilter])

  const setSelectedLocation = useCallback((value) => updateFilter({ local: value }), [updateFilter])

  const filteredEvents = useMemo(() => {
    return agenda.filter((event) => {
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch =
        !searchTerm ||
        event.nome?.toLowerCase().includes(searchLower) ||
        event.descricao?.toLowerCase().includes(searchLower)

      const matchesTag =
        !selectedTagId ||
        (eventTagsMap[event.id] || []).some((tag) => String(tag.id) === selectedTagId)

      const matchesPastFilter = showPastEvents || !isEventPast(event.data_evento)

      const matchesFavourite = !showOnlyFavourites || favouriteIds.has(event.id)

      const matchesLocation =
        !selectedLocation ||
        (selectedLocation === 'Online'
          ? event.modalidade === 'Online'
          : event.cidade === selectedLocation)

      let matchesDate = true
      if (dateFrom || dateTo) {
        const [d, m, y] = (event.data_evento || '').split('/')
        const eventDate = y && m && d ? new Date(`${y}-${m}-${d}`) : null
        if (eventDate) {
          if (dateFrom && dateTo) {
            matchesDate = eventDate >= new Date(dateFrom) && eventDate <= new Date(dateTo)
          } else if (dateFrom) {
            matchesDate = eventDate.getTime() === new Date(dateFrom).getTime()
          } else if (dateTo) {
            matchesDate = eventDate.getTime() === new Date(dateTo).getTime()
          }
        }
      }

      return (
        matchesSearch &&
        matchesTag &&
        matchesPastFilter &&
        matchesFavourite &&
        matchesLocation &&
        matchesDate
      )
    })
  }, [
    agenda,
    searchTerm,
    selectedTagId,
    eventTagsMap,
    showPastEvents,
    showOnlyFavourites,
    favouriteIds,
    selectedLocation,
    dateFrom,
    dateTo,
  ])

  const filterActiveCount =
    (selectedTagId ? 1 : 0) +
    (showPastEvents ? 1 : 0) +
    (selectedLocation ? 1 : 0) +
    (dateFrom ? 1 : 0) +
    (dateTo ? 1 : 0)

  return {
    searchTerm,
    setSearchTerm,
    selectedTagId,
    setSelectedTagId,
    showPastEvents,
    setShowPastEvents,
    showOnlyFavourites,
    setShowOnlyFavourites,
    selectedLocation,
    setSelectedLocation,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    filteredEvents,
    filterActiveCount,
  }
}
