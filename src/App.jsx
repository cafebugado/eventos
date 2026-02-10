import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Calendar,
  Clock,
  CalendarDays,
  Search,
  Filter,
  Eye,
  EyeOff,
  MapPin,
  Monitor,
  Wifi,
  Video,
} from 'lucide-react'
import { getEvents } from './services/eventService'
import { getAllEventTags } from './services/tagService'
import Header from './components/Header'
import Footer from './components/Footer'
import FloatingMenu from './components/FloatingMenu'
import Pagination from './components/Pagination'
import RichText from './components/RichText'
import SEOHead from './components/SEOHead'
import useMediaQuery from './hooks/useMediaQuery'
import usePagination from './hooks/usePagination'
import './App.css'
import BgEventos from './assets/eventos.png'

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
  const [eventTagsMap, setEventTagsMap] = useState({})
  const navigate = useNavigate()
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

      return matchesSearch && matchesPeriodo && matchesPastFilter
    })
  }, [agenda, searchTerm, selectedPeriodo, showPastEvents])

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
                    <div
                      key={item.id || `event-${pageOffset + index}`}
                      className={`evento-card ${isPast ? 'evento-encerrado' : ''}`}
                      style={{ animationDelay: `${index * 0.1}s`, cursor: 'pointer' }}
                      onClick={() => navigate(`/eventos/${item.id}`)}
                    >
                      <div className="card-image">
                        <img src={item.imagem || BgEventos} alt={item.nome} />
                        {isPast ? (
                          <div className="card-badge card-badge-encerrado">Encerrado</div>
                        ) : isToday ? (
                          <div className="card-badge card-badge-today">Hoje</div>
                        ) : (
                          <div className="card-badge">{item.periodo}</div>
                        )}
                        {eventTagsMap[item.id] && eventTagsMap[item.id].length > 0 && (
                          <div className="card-image-tags">
                            {eventTagsMap[item.id].map((tag) => (
                              <span
                                key={tag.id}
                                className="card-image-tag"
                                style={{ '--tag-color': tag.cor || '#2563eb' }}
                              >
                                {tag.nome}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="card-content">
                        <h3>{item.nome}</h3>
                        {item.descricao && (
                          <RichText
                            className="event-description"
                            content={item.descricao}
                            stopPropagationOnLinks
                          />
                        )}
                        <div className="event-info">
                          <div className="info-item">
                            <span className="icon">
                              <Calendar size={16} />
                            </span>
                            <span>{item.data_evento}</span>
                          </div>
                          <div className="info-item">
                            <span className="icon">
                              <Clock size={16} />
                            </span>
                            <span>{item.horario}</span>
                          </div>
                          <div className="info-item">
                            <span className="icon">
                              <CalendarDays size={16} />
                            </span>
                            <span>{item.dia_semana}</span>
                          </div>
                          {item.modalidade && (
                            <div className="info-item">
                              <span className="icon">
                                {item.modalidade === 'Online' ? (
                                  <Wifi size={16} />
                                ) : item.modalidade === 'Híbrido' ? (
                                  <Video size={16} />
                                ) : (
                                  <Monitor size={16} />
                                )}
                              </span>
                              <span>{item.modalidade}</span>
                            </div>
                          )}
                          {item.cidade && item.modalidade !== 'Online' && (
                            <div className="info-item">
                              <span className="icon">
                                <MapPin size={16} />
                              </span>
                              <span>{[item.cidade, item.estado].filter(Boolean).join(' - ')}</span>
                            </div>
                          )}
                        </div>
                        <div className="event-link-wrapper">
                          <button
                            className="event-link"
                            onClick={(e) => {
                              e.stopPropagation()
                              navigate(`/eventos/${item.id}`)
                            }}
                          >
                            {isPast ? 'Ver detalhes do evento' : 'Saber mais sobre o evento'}
                          </button>
                        </div>
                      </div>
                    </div>
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
