import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Calendar,
  Clock,
  CalendarDays,
  ArrowUpRight,
  MapPin,
  Monitor,
  Video,
  Wifi,
  Heart,
} from 'lucide-react'
import { getEventById } from '../services/eventService'
import { getEventTags } from '../services/tagService'
import Header from '../components/Header'
import Footer from '../components/Footer'
import FloatingMenu from '../components/FloatingMenu'
import RichText from '../components/RichText'
import SEOHead from '../components/SEOHead'
import ShareButtons from '../components/ShareButtons'
import BgEventos from '../assets/eventos.png'
import './EventDetails.css'

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

function EventDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [eventTags, setEventTags] = useState([])
  const [isFavourite, setFavourite] = useState()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [id])

  // Funcao para carregar evento do Supabase
  const loadEvent = async () => {
    setLoading(true)
    setError(null)
    try {
      const eventData = await getEventById(id)
      if (!eventData) {
        setError('NOT_FOUND')
      } else {
        setEvent(eventData)

        try {
          const tags = await getEventTags(eventData.id)
          setEventTags(tags)
        } catch {
          setEventTags([])
        }
      }
    } catch (err) {
      console.error('Erro ao carregar evento:', err)
      // Diferencia tipos de erro
      if (err.message?.includes('fetch') || err.message?.includes('network')) {
        setError('NETWORK_ERROR')
      } else if (err.code === 'PGRST116') {
        setError('NOT_FOUND')
      } else {
        setError('SERVER_ERROR')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEvent()
  }, [id])

  useEffect(() => {
    if (event) {
      // Check if this event is in the user's favourites
      const favourites = JSON.parse(localStorage.getItem('favourites'))
      const isFav = favourites.findIndex((fav) => fav.id === event.id)
      console.log(isFav)
      if (isFav != -1) {
        setFavourite(true)
      } else {
        setFavourite(false)
      }
    }
  }, [event])

  function handleFavourite() {
    const prev = JSON.parse(localStorage.getItem('favourites')) || []
    const index = prev.findIndex((fav) => fav.id === event.id)
    let newFavourites

    if (index === -1) {
      newFavourites = [...prev, event]
      console.log('Added to favourites')
      setFavourite(true)
    } else {
      newFavourites = prev.filter((fav) => fav.id !== event.id)
      console.log('Removed from favourites')
      setFavourite(false)
    }

    try {
      localStorage.setItem('favourites', JSON.stringify(newFavourites))
    } catch (error) {
      console.error('Failed to save favourites to localStorage:', error)
    }
  }

  if (loading) {
    return (
      <div className="event-details-page">
        <Header />
        <main className="details-main">
          <div className="details-container">
            <div className="skeleton-back-button"></div>
            <div
              className="skeleton-detail-card"
              role="status"
              aria-busy="true"
              aria-label="Carregando detalhes do evento"
            >
              <div className="skeleton-detail-image"></div>
              <div className="skeleton-detail-content">
                <div className="skeleton-detail-title"></div>
                <div className="skeleton-detail-description">
                  <div className="skeleton-text"></div>
                  <div className="skeleton-text"></div>
                  <div className="skeleton-text"></div>
                  <div className="skeleton-text short"></div>
                </div>
                <div className="skeleton-detail-info-grid">
                  <div className="skeleton-info-card"></div>
                  <div className="skeleton-info-card"></div>
                  <div className="skeleton-info-card"></div>
                </div>
                <div className="skeleton-button large"></div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error) {
    const errorMessages = {
      NOT_FOUND: {
        title: 'Evento não encontrado',
        message: 'O evento que você está procurando não existe ou foi removido.',
        showRetry: false,
      },
      NETWORK_ERROR: {
        title: 'Erro de conexão',
        message: 'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.',
        showRetry: true,
      },
      SERVER_ERROR: {
        title: 'Erro no servidor',
        message: 'Ocorreu um erro ao carregar o evento. Tente novamente em alguns instantes.',
        showRetry: true,
      },
    }

    const errorInfo = errorMessages[error] || errorMessages.SERVER_ERROR

    return (
      <div className="event-details-page">
        <Header />
        <main className="details-main">
          <div className="details-container">
            <button onClick={() => navigate('/eventos')} className="back-link">
              <ArrowLeft size={18} />
              <span>Voltar para Eventos</span>
            </button>
            <div className="error-container" role="alert" aria-live="polite">
              <div className="error-icon">
                <Calendar size={48} />
              </div>
              <h2>{errorInfo.title}</h2>
              <p>{errorInfo.message}</p>
              <div className="error-actions">
                {errorInfo.showRetry && (
                  <button onClick={loadEvent} className="retry-button">
                    Tentar novamente
                  </button>
                )}
                <button onClick={() => navigate('/eventos')} className="back-button">
                  <ArrowLeft size={18} />
                  Voltar para Eventos
                </button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const eventDate = parseEventDate(event.data_evento)
  const isPast = eventDate < today

  return (
    <div className="event-details-page">
      <SEOHead
        title={event.nome}
        description={event.descricao}
        image={event.imagem || BgEventos}
        url={`${window.location.origin}/eventos/${event.id}`}
        type="article"
        article={{
          publishedTime: event.created_at,
        }}
      />
      <Header />
      <main className="details-main">
        <div className="details-container">
          <button onClick={() => navigate('/eventos')} className="back-link">
            <ArrowLeft size={18} />
            <span>Voltar para Eventos</span>
          </button>

          <div className={`event-details-card ${isPast ? 'evento-encerrado' : ''}`}>
            <div className="event-image-container">
              <img src={event.imagem || BgEventos} alt={event.nome} />
              {isPast ? (
                <div className="event-badge card-badge-encerrado">Encerrado</div>
              ) : (
                <div className="event-badge">{event.periodo}</div>
              )}
              {eventTags.length > 0 && (
                <div className="card-image-tags">
                  {eventTags.map((tag) => (
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
            <div className="event-details-content">
              <h1>{event.nome}</h1>
              {event.descricao && (
                <div className="event-description-full">
                  <RichText content={event.descricao} />
                </div>
              )}
              <div className="event-info-grid">
                <div className="info-card">
                  <div className="info-icon">
                    <Calendar size={24} />
                  </div>
                  <div className="info-text">
                    <span className="info-label">Data</span>
                    <span className="info-value">{event.data_evento}</span>
                  </div>
                </div>

                <div className="info-card">
                  <div className="info-icon">
                    <Clock size={24} />
                  </div>
                  <div className="info-text">
                    <span className="info-label">Horario</span>
                    <span className="info-value">{event.horario}</span>
                  </div>
                </div>

                <div className="info-card">
                  <div className="info-icon">
                    <CalendarDays size={24} />
                  </div>
                  <div className="info-text">
                    <span className="info-label">Dia da Semana</span>
                    <span className="info-value">{event.dia_semana}</span>
                  </div>
                </div>

                {event.modalidade && (
                  <div className="info-card">
                    <div className="info-icon">
                      {event.modalidade === 'Online' ? (
                        <Wifi size={24} />
                      ) : event.modalidade === 'Híbrido' ? (
                        <Video size={24} />
                      ) : (
                        <Monitor size={24} />
                      )}
                    </div>
                    <div className="info-text">
                      <span className="info-label">Modalidade</span>
                      <span className="info-value">{event.modalidade}</span>
                    </div>
                  </div>
                )}
              </div>
              {event.endereco && event.modalidade !== 'Online' && (
                <div className="event-location">
                  <div className="location-info">
                    <MapPin size={20} />
                    <div className="location-text">
                      <span className="location-address">{event.endereco}</span>
                      {(event.cidade || event.estado) && (
                        <span className="location-city">
                          {[event.cidade, event.estado].filter(Boolean).join(' - ')}
                        </span>
                      )}
                    </div>
                  </div>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      [event.endereco, event.cidade, event.estado].filter(Boolean).join(', ')
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="location-map-link"
                  >
                    <MapPin size={16} />
                    Ver no Google Maps
                  </a>
                </div>
              )}
              {!event.endereco && event.cidade && event.modalidade !== 'Online' && (
                <div className="event-location">
                  <div className="location-info">
                    <MapPin size={20} />
                    <div className="location-text">
                      <span className="location-city">
                        {[event.cidade, event.estado].filter(Boolean).join(' - ')}
                      </span>
                    </div>
                  </div>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      [event.cidade, event.estado].filter(Boolean).join(', ')
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="location-map-link"
                  >
                    <MapPin size={16} />
                    Ver no Google Maps
                  </a>
                </div>
              )}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '20px',
                }}
              >
                <a
                  href={isPast ? undefined : event.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`participate-button ${isPast ? 'disabled' : ''}`}
                  onClick={(e) => isPast && e.preventDefault()}
                >
                  {isPast ? 'Evento Encerrado' : 'Participar do Evento'}
                  {!isPast && <ArrowUpRight size={20} />}
                </a>
                <button
                  onClick={handleFavourite}
                  className="participate-button"
                  style={{ backgroundColor: 'transparent', outline: '1px solid white' }}
                >
                  {isFavourite ? 'Remover dos favoritos' : 'Favoritar'}
                  <Heart
                    fill={isFavourite ? 'red' : 'transparent'}
                    style={{ color: isFavourite ? 'transparent' : 'white' }}
                  />
                </button>
              </div>
              {!isPast && (
                <ShareButtons
                  eventName={event.nome}
                  eventDate={event.data_evento}
                  eventTime={event.horario}
                  eventUrl={`${window.location.origin}/eventos/${event.id}`}
                />
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <FloatingMenu />
    </div>
  )
}

export default EventDetails
