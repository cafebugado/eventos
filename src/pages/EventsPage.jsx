import { useEffect, useMemo } from 'react'
import { useEventsWithTags } from '../hooks/useEvents'
import { sortEventsByDate } from '../utils/eventDate'
import Layout from '../layout/Layout'
import Pagination from '../components/Pagination'
import SEOHead from '../components/SEOHead'
import EventsFilters from '../components/EventsFilters'
import EventsGrid from '../components/EventsGrid'
import useMediaQuery from '../hooks/useMediaQuery'
import usePagination from '../hooks/usePagination'
import useViewMode from '../hooks/useViewMode'
import useFavourites from '../hooks/useFavourites'
import useEventFilters from '../hooks/useEventFilters'
import '../App.css'

export default function EventsPage() {
  const {
    events,
    tagsMap: eventTagsMap,
    tags: allTags,
    loading,
    error,
    revalidate,
  } = useEventsWithTags()
  const agenda = useMemo(() => sortEventsByDate(events), [events])

  const { favouriteIds, toggleFavourite } = useFavourites(agenda)
  const {
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
  } = useEventFilters(agenda, eventTagsMap, favouriteIds)

  const { viewMode, changeViewMode } = useViewMode('grid')
  const isMobile = useMediaQuery('(max-width: 768px)')
  const pageSize = isMobile ? 6 : 9
  const { currentPage, totalPages, pagedItems, goToPage } = usePagination(filteredEvents, pageSize)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [currentPage])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in')
          }
        })
      },
      { threshold: 0.3, rootMargin: '-50px 0px' }
    )

    document.querySelectorAll('.animate-section').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <Layout className="App">
      <SEOHead
        title="Proximos Eventos"
        description="Confira os proximos eventos de tecnologia. Meetups, workshops, hackathons e conferencias indicados pela comunidade Cafe Bugado."
        url={`${window.location.origin}/eventos`}
      />

      <section id="eventos" className="eventos-section animate-section">
        <div className="section-header">
          <h2>Próximos eventos</h2>
          <p>
            Eventos de tecnologia que estão rolando ou vão acontecer em breve. Tudo indicado pela
            comunidade, com meetups, workshops, hackathons e conferências para quem quer aprender,
            trocar ideia e se aproximar da área.
          </p>
        </div>

        <EventsFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedTagId={selectedTagId}
          onSelectTag={setSelectedTagId}
          showPastEvents={showPastEvents}
          onTogglePast={() => setShowPastEvents((v) => !v)}
          dateFrom={dateFrom}
          dateTo={dateTo}
          onDateFrom={setDateFrom}
          onDateTo={setDateTo}
          filterActiveCount={filterActiveCount}
          showOnlyFavourites={showOnlyFavourites}
          onToggleFavourites={() => setShowOnlyFavourites((v) => !v)}
          favouriteIds={favouriteIds}
          viewMode={viewMode}
          onChangeViewMode={changeViewMode}
          tags={allTags}
          isMobile={isMobile}
        />

        <EventsGrid
          loading={loading}
          error={error}
          onRetry={revalidate}
          filteredEvents={pagedItems}
          allEvents={viewMode === 'calendar' ? filteredEvents : undefined}
          totalEvents={agenda.length}
          viewMode={viewMode}
          pageSize={pageSize}
          eventTagsMap={eventTagsMap}
          favouriteIds={favouriteIds}
          toggleFavourite={toggleFavourite}
        />

        {!loading && !error && filteredEvents.length > 0 && viewMode !== 'calendar' && (
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={goToPage} />
        )}
      </section>
    </Layout>
  )
}
