import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, Clock, CalendarDays, Search, Filter, Eye, EyeOff } from 'lucide-react'
import { getEvents } from './services/eventService'
import Header from './components/Header'
import Footer from './components/Footer'
import './App.css'
import BgEventos from '../public/eventos.png'

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
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPeriodo, setSelectedPeriodo] = useState('Todos')
  const [showPastEvents, setShowPastEvents] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // Carrega eventos do Supabase
    async function loadEvents() {
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
      } catch (error) {
        console.error('Erro ao carregar eventos:', error)
      } finally {
        setLoading(false)
      }
    }

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
      <Header />

      {/* Main Content */}
      <main className="main-content" style={{ paddingTop: '6rem' }}>
        {/* Secao de Eventos */}
        <section id="eventos" className="eventos-section animate-section">
          <div className="section-header">
            <h2>Proximos Eventos</h2>
            <p>
              Eventos de comunidades e empresas de tecnologia. Meetups, workshops, hackathons e
              conferencias — tudo compartilhado para voce nao perder nenhuma oportunidade.
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
            <div className="loading">
              <div className="spinner"></div>
              <p>Carregando eventos...</p>
            </div>
          ) : (
            <div className="eventos-grid">
              {filteredEvents.length > 0 ? (
                filteredEvents.map((item, index) => (
                  <div
                    key={item.id || index}
                    className="evento-card"
                    style={{ animationDelay: `${index * 0.1}s`, cursor: 'pointer' }}
                    onClick={() => navigate(`/eventos/${item.id}`)}
                  >
                    <div className="card-image">
                      <img src={item.imagem || BgEventos} alt={item.nome} />
                      <div className="card-badge">{item.periodo}</div>
                    </div>
                    <div className="card-content">
                      <h3>{item.nome}</h3>
                      {item.descricao && <p className="event-description">{item.descricao}</p>}
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
                      </div>
                      <div className="event-link-wrapper">
                        <button
                          className="event-link"
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/eventos/${item.id}`)
                          }}
                        >
                          Saber mais sobre o evento
                        </button>
                      </div>
                    </div>
                  </div>
                ))
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
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default App
