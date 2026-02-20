import { useState, useEffect, useMemo, useCallback } from 'react'
import { Calendar, Search, Filter, Eye, EyeOff, Heart } from 'lucide-react'
import { getEvents } from './services/eventService'
import { getAllEventTags } from './services/tagService'
import Header from './components/Header'
import Footer from './components/Footer'
import FloatingMenu from './components/FloatingMenu'
import Pagination from './components/Pagination'
import SEOHead from './components/SEOHead'
import EventCard from './components/EventCard'
import useMediaQuery from './hooks/useMediaQuery'
import usePagination from './hooks/usePagination'
import './App.css'

const PERIODOS = ['Todos', 'Matinal', 'Diurno', 'Vespertino', 'Noturno']

// Funcao para converter data no formato DD/MM/YYYY para objeto Date
function parseEventDate(dateStr) {
  if (!dateStr) {
    return new Date(0)
  }
  const parts = dateStr.split('/')
  if (parts.length === 3) {
    // Formato DD/MM/YYYY
    return new Date(parts[2], parts[1] - 1, parts[0])
  }
  // Tenta parse direto se estiver em outro formato
  return new Date(dateStr)
}

function App() {
  const [agenda, setAgenda] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPeriodo, setSelectedPeriodo] = useState('Todos')
  const [showPastEvents, setShowPastEvents] = useState(false)
  const [showOnlyFavourites, setShowOnlyFavourites] = useState(false)
  const [eventTagsMap, setEventTagsMap] = useState({})
  const isMobile = useMediaQuery('(max-width: 768px)')

  // Funcao para carregar eventos do Supabase
  const loadEvents = async () => {
    setLoading(true)
    setError(null)
    try {
      const events = await getEvents()
      // Ordena eventos por data mais proxima primeiro
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const sortedEvents = events.sort((a, b) => {
        const dateA = parseEventDate(a.data_evento)
        const dateB = parseEventDate(b.data_evento)

        // Eventos futuros vem primeiro, ordenados por proximidade
        const isAFuture = dateA >= today
        const isBFuture = dateB >= today

        if (isAFuture && !isBFuture) {
          return -1
        }
        if (!isAFuture && isBFuture) {
          return 1
        }

        // Ambos futuros: mais proximo primeiro
        if (isAFuture) {
          return dateA - dateB
        }
        // Ambos passados: mais recente primeiro
        return dateB - dateA
      })

      setAgenda(sortedEvents)

      // Carrega tags de todos os eventos
      try {
        const tagsMap = await getAllEventTags()
        setEventTagsMap(tagsMap)
      } catch {
        setEventTagsMap({})
      }
    } catch (error) {
      console.error('Erro ao carregar eventos:', error)
      setError('Não foi possível carregar os eventos. Verifique sua conexão e tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEvents()
  }, [])

  // Logica para os favs
  const [favourites, setFavourites] = useState(() => {
    try {
      const stored = localStorage.getItem('favourites')
      if (!stored) {
        return []
      } // Return empty array if nothing stored

      const parsed = JSON.parse(stored)
      // Ensure it's an array
      return Array.isArray(parsed) ? parsed : []
    } catch (error) {
      console.error('Failed to parse favourites from localStorage:', error)
      return [] // Return empty array on error
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
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return agenda.filter((event) => {
      // Filtro de busca por nome/descricao
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch =
        !searchTerm ||
        event.nome?.toLowerCase().includes(searchLower) ||
        event.descricao?.toLowerCase().includes(searchLower)

      // Filtro por periodo
      const matchesPeriodo = selectedPeriodo === 'Todos' || event.periodo === selectedPeriodo

      // Filtro de eventos passados
      const eventDate = parseEventDate(event.data_evento)
      const isPastEvent = eventDate < today
      const matchesPastFilter = showPastEvents || !isPastEvent

      // Filtro de favoritos
      const matchesFavourite = !showOnlyFavourites || favouriteIds.has(event.id)

      return matchesSearch && matchesPeriodo && matchesPastFilter && matchesFavourite
    })
  }, [agenda, searchTerm, selectedPeriodo, showPastEvents, showOnlyFavourites, favouriteIds])

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
            <div className="filter-search">
              <Search size={20} className="search-icon" />
              <input
                type="text"
                placeholder="Buscar por nome ou descricao..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="filter-periodo">
              <Filter size={18} />
              <select
                value={selectedPeriodo}
                onChange={(e) => setSelectedPeriodo(e.target.value)}
                className="periodo-select"
              >
                {PERIODOS.map((periodo) => (
                  <option key={periodo} value={periodo}>
                    {periodo}
                  </option>
                ))}
              </select>
            </div>

            <button
              className={`filter-toggle ${showPastEvents ? 'active' : ''}`}
              onClick={() => setShowPastEvents(!showPastEvents)}
              title={showPastEvents ? 'Ocultar eventos passados' : 'Mostrar eventos passados'}
            >
              {showPastEvents ? <Eye size={18} /> : <EyeOff size={18} />}
              <span>{showPastEvents ? 'Ocultando passados' : 'Mostrar passados'}</span>
            </button>

            <button
              className={`filter-toggle ${showOnlyFavourites ? 'active' : ''}`}
              onClick={() => setShowOnlyFavourites(!showOnlyFavourites)}
              title={showOnlyFavourites ? 'Mostrar todos eventos' : 'Mostrar apenas favoritos'}
            >
              <Heart size={18} fill={showOnlyFavourites ? 'currentColor' : 'none'} />
              <span>{showOnlyFavourites ? 'Apenas favoritos' : 'Favoritos'}</span>
            </button>
          </div>

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
              <p>{error}</p>
              <button onClick={loadEvents} className="retry-button">
                Tentar novamente
              </button>
            </div>
          ) : filteredEvents.length > 0 ? (
            <>
              <div className="eventos-grid">
                {pagedItems.map((item, index) => {
                  const today = new Date()
                  today.setHours(0, 0, 0, 0)
                  const eventDate = parseEventDate(item.data_evento)
                  const isToday = eventDate.getTime() === today.getTime()
                  const isPast = eventDate < today

                  return (
                    <EventCard
                      key={item.id || `event-${pageOffset + index}`}
                      event={item}
                      tags={eventTagsMap[item.id] || []}
                      variant="full"
                      isPast={isPast}
                      isToday={isToday}
                      showDescription
                      showLocation
                      showActionButton
                      style={{ animationDelay: `${index * 0.1}s` }}
                      favouriteIds={favouriteIds}
                      toggleFavourite={toggleFavourite}
                    />
                  )
                })}
              </div>
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
