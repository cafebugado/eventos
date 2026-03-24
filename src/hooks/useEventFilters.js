import { useState, useMemo } from 'react'
import { isEventPast } from '../utils/eventDate'

export default function useEventFilters(agenda, eventTagsMap, favouriteIds) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTagId, setSelectedTagId] = useState('')
  const [showPastEvents, setShowPastEvents] = useState(false)
  const [showOnlyFavourites, setShowOnlyFavourites] = useState(false)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

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

      return matchesSearch && matchesTag && matchesPastFilter && matchesFavourite && matchesDate
    })
  }, [
    agenda,
    searchTerm,
    selectedTagId,
    eventTagsMap,
    showPastEvents,
    showOnlyFavourites,
    favouriteIds,
    dateFrom,
    dateTo,
  ])

  const filterActiveCount =
    (selectedTagId ? 1 : 0) + (showPastEvents ? 1 : 0) + (dateFrom ? 1 : 0) + (dateTo ? 1 : 0)

  return {
    searchTerm,
    setSearchTerm,
    selectedTagId,
    setSelectedTagId,
    showPastEvents,
    setShowPastEvents,
    showOnlyFavourites,
    setShowOnlyFavourites,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    filteredEvents,
    filterActiveCount,
  }
}
