import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { Calendar, Search, Filter, Heart } from 'lucide-react'
import SearchModal from './components/SearchModal'
import { useEventsWithTags } from './hooks/useEvents'
import Header from './components/Header'
import Footer from './components/Footer'
import FloatingMenu from './components/FloatingMenu'
import Pagination from './components/Pagination'
import SEOHead from './components/SEOHead'
import EventCard from './components/EventCard'
import ViewToggle from './components/ViewToggle'
import EventRowCompact from './components/EventRowCompact'
import FilterModal from './components/FilterModal'
import useMediaQuery from './hooks/useMediaQuery'
import usePagination from './hooks/usePagination'
import useViewMode from './hooks/useViewMode'
import { isEventPast, isEventToday, sortEventsByDate } from './utils/eventDate'
import './App.css'

function App() {
  const {
    events,
    tagsMap: eventTagsMap,
    tags: allTags,
    loading,
    error,
    revalidate,
  } = useEventsWithTags()
  const agenda = useMemo(() => sortEventsByDate(events), [events])

  const [searchTerm, setSearchTerm] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [selectedTagId, setSelectedTagId] = useState('')
  const [showPastEvents, setShowPastEvents] = useState(false)
  const [showOnlyFavourites, setShowOnlyFavourites] = useState(false)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const isMobile = useMediaQuery('(max-width: 768px)')

  // Logica para os favs
  const [favourites, setFavourites] = useState(() => {
    try {
      const stored = localStorage.getItem('favourites')
      if (!stored) {
        return []
      }

      const parsed = JSON.parse(stored)
      // Ensure it's an array
      return Array.isArray(parsed) ? parsed : []
    } catch (error) {
      console.error('Failed to parse favourites from localStorage:', error)
      return []
    }
  })
  const favouriteIds = useMemo(() => new Set(favourites.map((fav) => fav?.id)), [favourites])
  const toggleFavourite = useCallback(
    (eventId) => {
      setFavourites((prev) => {
        const index = prev.findIndex((fav) => fav?.id === eventId)
        let newFavourites

        if (index === -1) {
          const eventToAdd = agenda.find((e) => e.id === eventId)
          // Only add if event exists in agenda
          if (!eventToAdd) {
            console.warn(`Event with id ${eventId} not found in agenda`)
            return prev
          }
          newFavourites = [...prev, eventToAdd]
        } else {
          newFavourites = prev.filter((fav) => fav?.id !== eventId)
        }

        try {
          localStorage.setItem('favourites', JSON.stringify(newFavourites))
        } catch (error) {
          console.error('Failed to save favourites to localStorage:', error)
        }

        return newFavourites
      })
    },
    [agenda]
  )

  // Filtra e ordena eventos client-side
  const filteredEvents = useMemo(() => {
    return agenda.filter((event) => {
      // Filtro de busca por nome/descricao
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch =
        !searchTerm ||
        event.nome?.toLowerCase().includes(searchLower) ||
        event.descricao?.toLowerCase().includes(searchLower)

      // Filtro por tag
      const matchesTag =
        !selectedTagId ||
        (eventTagsMap[event.id] || []).some((tag) => String(tag.id) === selectedTagId)

      // Filtro de eventos passados
      const matchesPastFilter = showPastEvents || !isEventPast(event.data_evento)

      // Filtro de favoritos
      const matchesFavourite = !showOnlyFavourites || favouriteIds.has(event.id)

      // Filtro por data (data_evento é DD/MM/YYYY, inputs retornam YYYY-MM-DD)
      let matchesDate = true
      if (dateFrom || dateTo) {
        const [d, m, y] = (event.data_evento || '').split('/')
        const eventDate = y && m && d ? new Date(`${y}-${m}-${d}`) : null
        if (eventDate) {
          if (dateFrom && dateTo) {
            // Duas datas: filtra o período entre elas
            matchesDate = eventDate >= new Date(dateFrom) && eventDate <= new Date(dateTo)
          } else if (dateFrom) {
            // Só data inicial: traz exatamente aquela data
            matchesDate = eventDate.getTime() === new Date(dateFrom).getTime()
          } else if (dateTo) {
            // Só data final: traz exatamente aquela data
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

  const { viewMode, changeViewMode } = useViewMode('grid')
  const [filterModalOpen, setFilterModalOpen] = useState(false)
  const [searchModalOpen, setSearchModalOpen] = useState(false)
  const searchInputRef = useRef(null)
  const filterActiveCount =
    (selectedTagId ? 1 : 0) + (showPastEvents ? 1 : 0) + (dateFrom ? 1 : 0) + (dateTo ? 1 : 0)

  const pageSize = isMobile ? 6 : 9
  const { currentPage, totalPages, pagedItems, goToPage } = usePagination(filteredEvents, pageSize)
  const pageOffset = (currentPage - 1) * pageSize

  useEffect(() => {
    // Rola a pagina para o topo sempre que a pagina atual mudar
    window.scrollTo(0, 0)
  }, [currentPage])

  useEffect(() => {
    const observerOptions = {
      threshold: 0.3,
      rootMargin: '-50px 0px',
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in')
        }
      })
    }, observerOptions)

    const sections = document.querySelectorAll('.animate-section')
    sections.forEach((section) => {
      observer.observe(section)
    })

    return () => observer.disconnect()
  }, [])

  return (
    <div className="App">
      <SEOHead
        title="Proximos Eventos"
        description="Confira os proximos eventos de tecnologia. Meetups, workshops, hackathons e conferencias indicados pela comunidade Cafe Bugado."
        url={`${window.location.origin}/eventos`}
      />
      <Header />

      {/* Main Content */}
      <main className="main-content">
        {/* Secao de Eventos */}
        <section id="eventos" className="eventos-section animate-section">
          <div className="section-header">
            <h2>Próximos eventos</h2>
            <p>
              Eventos de tecnologia que estão rolando ou vão acontecer em breve. Tudo indicado pela
              comunidade, com meetups, workshops, hackathons e conferências para quem quer aprender,
              trocar ideia e se aproximar da área.
            </p>
          </div>

          {/* Filtros */}
          <div className="eventos-filters">
            {/* Lupa: mobile abre modal, desktop expande inline */}
            <div className={`filter-search${searchOpen ? ' filter-search--open' : ''}`}>
              <button
                className={`search-toggle${searchTerm ? ' search-toggle--active' : ''}`}
                onClick={() => {
                  if (isMobile) {
                    setSearchModalOpen(true)
                  } else {
                    setSearchOpen((v) => {
                      if (!v) {
                        setTimeout(() => searchInputRef.current?.focus(), 50)
                      } else {
                        setSearchTerm('')
                      }
                      return !v
                    })
                  }
                }}
                aria-label="Abrir busca"
              >
                <Search size={18} />
              </button>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Buscar evento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onBlur={() => {
                  if (!searchTerm) {
                    setSearchOpen(false)
                  }
                }}
                className="search-input"
                tabIndex={searchOpen ? 0 : -1}
              />
            </div>

            <SearchModal
              isOpen={searchModalOpen}
              onClose={() => setSearchModalOpen(false)}
              value={searchTerm}
              onChange={setSearchTerm}
            />

            <button
              className={`filter-toggle${filterActiveCount > 0 ? ' active' : ''}`}
              onClick={() => setFilterModalOpen(true)}
              title="Filtros"
            >
              {filterActiveCount > 0 ? (
                <span className="filter-badge">{filterActiveCount}</span>
              ) : (
                <Filter size={18} />
              )}
              <span>Filtros</span>
            </button>

            <button
              className={`filter-toggle ${showOnlyFavourites ? 'active' : ''}`}
              onClick={() => setShowOnlyFavourites(!showOnlyFavourites)}
              title="Favoritos"
            >
              <Heart size={18} fill={showOnlyFavourites ? 'currentColor' : 'none'} />
              <span>Favoritos</span>
            </button>

            <ViewToggle
              viewMode={isMobile && viewMode === 'grid' ? 'list' : viewMode}
              onChange={changeViewMode}
              isMobile={isMobile}
            />
          </div>

          <FilterModal
            isOpen={filterModalOpen}
            onClose={() => setFilterModalOpen(false)}
            tags={allTags}
            selectedTagId={selectedTagId}
            onSelectTag={setSelectedTagId}
            showPastEvents={showPastEvents}
            onTogglePast={() => setShowPastEvents((v) => !v)}
            dateFrom={dateFrom}
            dateTo={dateTo}
            onDateFrom={setDateFrom}
            onDateTo={setDateTo}
          />

          {loading ? (
            <div
              className="eventos-grid"
              role="status"
              aria-busy="true"
              aria-label="Carregando eventos"
            >
              {Array.from({ length: pageSize }).map((_, index) => (
                <div key={`skeleton-${index}`} className="skeleton-card">
                  <div className="skeleton-image"></div>
                  <div className="skeleton-content">
                    <div className="skeleton-title"></div>
                    <div className="skeleton-text"></div>
                    <div className="skeleton-text"></div>
                    <div className="skeleton-text short"></div>
                    <div className="skeleton-info-grid">
                      <div className="skeleton-info"></div>
                      <div className="skeleton-info"></div>
                      <div className="skeleton-info"></div>
                    </div>
                    <div className="skeleton-button"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="error-container" role="alert" aria-live="polite">
              <div className="error-icon">
                <Calendar size={48} />
              </div>
              <h3>Erro ao carregar eventos</h3>
              <p>Não foi possível carregar os eventos. Verifique sua conexão e tente novamente.</p>
              <button onClick={revalidate} className="retry-button">
                Tentar novamente
              </button>
            </div>
          ) : filteredEvents.length > 0 ? (
            <>
              {viewMode === 'compact' ? (
                <div className="eventos-compact">
                  {pagedItems.map((item, index) => (
                    <EventRowCompact
                      key={item.id || `event-${pageOffset + index}`}
                      event={item}
                      style={{ animationDelay: `${index * 0.05}s` }}
                    />
                  ))}
                </div>
              ) : (
                <div className={viewMode === 'list' ? 'eventos-list' : 'eventos-grid'}>
                  {pagedItems.map((item, index) => {
                    const isPast = isEventPast(item.data_evento)
                    const isToday = isEventToday(item.data_evento)

                    return (
                      <EventCard
                        key={item.id || `event-${pageOffset + index}`}
                        event={item}
                        tags={eventTagsMap[item.id] || []}
                        variant="full"
                        isPast={isPast}
                        isToday={isToday}
                        showLocation
                        showActionButton
                        style={{ animationDelay: `${index * 0.1}s` }}
                        favouriteIds={favouriteIds}
                        toggleFavourite={toggleFavourite}
                      />
                    )
                  })}
                </div>
              )}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={goToPage}
              />
            </>
          ) : (
            <div className="no-events">
              <div className="empty-icon">
                <Calendar size={48} />
              </div>
              <h3>
                {agenda.length === 0 ? 'Nenhum evento no momento' : 'Nenhum evento encontrado'}
              </h3>
              <p>
                {agenda.length === 0
                  ? 'Estamos preparando eventos incriveis para voce. Volte em breve!'
                  : 'Tente ajustar os filtros de busca.'}
              </p>
            </div>
          )}
        </section>
      </main>

      <Footer />
      <FloatingMenu />
    </div>
  )
}

export default App
