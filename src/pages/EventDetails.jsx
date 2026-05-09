import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Calendar, Clock, CalendarDays, ArrowUpRight, Monitor, Video, Wifi } from 'lucide-react'
import { getEventBySlugOrId } from '../services/eventService'
import { getEventTags } from '../services/tagService'
import BackButton from '../components/BackButton'
import EventLocation from '../components/EventLocation'
import RichText from '../components/RichText'
import Layout from '../layout/Layout'
import SEOHead from '../components/SEOHead'
import ShareButtons from '../components/ShareButtons'
import EventRecommendations from '../components/EventRecommendations'
import BgEventos from '../assets/eventos.png'
import './EventDetails.css'
import { FavouriteEventButton } from '../components/FavouriteEventButton'
import { isEventPast } from '../utils/eventDate'
import AddToCalendarButton from '../components/AddToCalendarButton'

function EventDetails() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [eventTags, setEventTags] = useState([])
  const [isFavourite, setFavourite] = useState()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [slug])
  useEffect(() => {
    const stored = localStorage.getItem('favourites')
    if (!stored) {
      localStorage.setItem('favourites', '[]')
    }
  }, [])

  // Funcao para carregar evento do Supabase
  const loadEvent = async () => {
    setLoading(true)
    setError(null)
    try {
      const eventData = await getEventBySlugOrId(slug)
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
  }, [slug])

  useEffect(() => {
    if (event) {
      // Check if this event is in the user's favourites
      const favourites = JSON.parse(localStorage.getItem('favourites'))
      const isFav = favourites.findIndex((fav) => fav?.id === event.id)
      if (isFav !== -1) {
        setFavourite(true)
      } else {
        setFavourite(false)
      }
    }
  }, [event])

  function handleFavourite() {
    const prev = JSON.parse(localStorage.getItem('favourites')) || []
    const index = prev.findIndex((fav) => fav?.id === event.id)
    let newFavourites

    if (index === -1) {
      newFavourites = [...prev, event]
      setFavourite(true)
    } else {
      newFavourites = prev.filter((fav) => fav?.id !== event.id)
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
      <Layout>
        <main className="details-main">
          <div className="details-container">
            <BackButton onClick={() => navigate(-1)} label="Voltar para Eventos" />
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
                <BackButton onClick={() => navigate(-1)} label="Voltar para Eventos" />
              </div>
            </div>
          </div>
        </main>
      </Layout>
    )
  }

  const isPast = isEventPast(event.data_evento)

  return (
    <Layout>
      <SEOHead
        title={event.nome}
        description={event.descricao}
        image={event.imagem || BgEventos}
        url={`${window.location.origin}/eventos/${event.slug || event.id}`}
        type="article"
        article={{
          publishedTime: event.created_at,
        }}
      />

      <main className="details-main">
        <div className="details-container">
          <BackButton onClick={() => navigate(-1)} label="Voltar para Eventos" />

          <div className={`event-details-card ${isPast ? 'evento-encerrado' : ''}`}>
            <div className="event-image-container">
              <img
                src={event.imagem || BgEventos}
                alt={event.nome}
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  e.target.src = BgEventos
                }}
              />
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

              <EventLocation
                endereco={event.endereco}
                cidade={event.cidade}
                estado={event.estado}
                modalidade={event.modalidade}
              />

              <div className="event-actions">
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
                <FavouriteEventButton
                  event={event}
                  isFavourite={isFavourite}
                  onToggle={handleFavourite}
                  isCard={false}
                />
              </div>
              {!isPast && (
                <div className="event-calendar-share">
                  <AddToCalendarButton event={event} />
                </div>
              )}
              {!isPast && (
                <ShareButtons
                  eventName={event.nome}
                  eventDate={event.data_evento}
                  eventTime={event.horario}
                  eventUrl={`${window.location.origin}/eventos/${event.slug || event.id}`}
                />
              )}
            </div>
          </div>
        </div>
      </main>

      <EventRecommendations currentEvent={event} currentEventTags={eventTags} />
    </Layout>
  )
}

export default EventDetails
