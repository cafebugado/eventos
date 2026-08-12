'use client'

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { isEventPast, sortEventsByDate } from '../../utils/eventDate'
import { getLocationOptions } from '../../utils/eventLocationOptions'
import { useFavouritesStore } from '../../store/useFavouritesStore'
import { useEventFilters } from '../../hooks/useEventFilters'
import { usePagination } from '../../hooks/usePagination'
import { useViewMode } from '../../hooks/useViewMode'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import EventsFilters from '../../components/EventsFilters'
import EventsGrid from '../../components/EventsGrid'
import Pagination from '../../components/Pagination'

// Client Component: recebe os dados já buscados no servidor (app/eventos/page.jsx)
// e cuida de toda a interação (filtros, paginação, view mode, favoritos). Os
// filtros e a página atual vivem na URL (ver hooks/useEventFilters.js e
// hooks/usePagination.js). A busca atualiza `q` só no submit e filtra a lista
// carregada, já que a API atual rejeita parâmetros de busca no endpoint.
export default function EventsPageClient({ events, tagsMap, tags, error }) {
  const router = useRouter()
  const agenda = useMemo(
    () => sortEventsByDate(events).filter((event) => !isEventPast(event.data_evento)),
    [events]
  )
  const locationOptions = useMemo(() => getLocationOptions(agenda), [agenda])

  const favouriteIds = useFavouritesStore((state) => state.favouriteIds)
  const toggleFavouriteInStore = useFavouritesStore((state) => state.toggleFavourite)
  const toggleFavourite = (eventId) => toggleFavouriteInStore(eventId, agenda)

  const {
    searchTerm,
    setSearchTerm,
    selectedTagId,
    setSelectedTagId,
    selectedLocation,
    setSelectedLocation,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    setFilters,
    clearFilters,
    filteredEvents,
    filterActiveCount,
  } = useEventFilters(agenda, tagsMap, favouriteIds)

  const { viewMode, changeViewMode } = useViewMode('grid')
  const isMobile = useMediaQuery('(max-width: 768px)')
  const pageSize = isMobile ? 6 : 9
  const { currentPage, totalPages, pagedItems, goToPage } = usePagination(filteredEvents, pageSize)

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
      <Stack spacing={4} sx={{ mb: 4, alignItems: 'center' }}>
        <Typography
          variant="h3"
          component="h1"
          sx={{ fontSize: { xs: '1.85rem', md: '2.25rem' }, textAlign: 'center' }}
        >
          Próximos eventos
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ fontSize: '1.05rem', maxWidth: 760, width: '100%', textAlign: 'justify' }}
        >
          Eventos de tecnologia que estão rolando ou vão acontecer em breve. Tudo indicado pela
          comunidade, com meetups, workshops, hackathons e conferências para quem quer aprender,
          trocar ideia e se aproximar da área.
        </Typography>
      </Stack>

      <EventsFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedTagId={selectedTagId}
        onSelectTag={setSelectedTagId}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateFrom={setDateFrom}
        onDateTo={setDateTo}
        onApplyFilters={setFilters}
        onClearFilters={clearFilters}
        locationOptions={locationOptions}
        selectedLocation={selectedLocation}
        onSelectLocation={setSelectedLocation}
        filterActiveCount={filterActiveCount}
        viewMode={viewMode}
        onChangeViewMode={changeViewMode}
        tags={tags}
        isMobile={isMobile}
      />

      <EventsGrid
        loading={false}
        error={error}
        onRetry={() => router.refresh()}
        filteredEvents={pagedItems}
        allEvents={viewMode === 'calendar' ? agenda : undefined}
        totalEvents={agenda.length}
        viewMode={viewMode}
        pageSize={pageSize}
        eventTagsMap={tagsMap}
        favouriteIds={favouriteIds}
        toggleFavourite={toggleFavourite}
      />

      {!error && filteredEvents.length > 0 && viewMode !== 'calendar' && (
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={goToPage} />
      )}
    </Container>
  )
}
