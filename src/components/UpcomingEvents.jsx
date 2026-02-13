import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, Clock, CalendarDays, ArrowRight, Monitor, Wifi, Video } from 'lucide-react'
import { getUpcomingEvents } from '../services/eventService'
import BgEventos from '../assets/eventos.png'
import './UpcomingEvents.css'
import { FavouriteEventButton } from './favourite-event/favouriteEvent'

function UpcomingEvents() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    async function loadEvents() {
      try {
        const data = await getUpcomingEvents(3)
        setEvents(data)
      } catch (err) {
        console.error('Erro ao carregar próximos eventos:', err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    loadEvents()
  }, [])

  if (error || (!loading && events.length === 0)) {
    return null
  }

  const [favourites, setFavourites] = useState(() => {
    try {
      const stored = localStorage.getItem('favourites')
      if (!stored) return [] // Return empty array if nothing stored

      const parsed = JSON.parse(stored)
      // Ensure it's an array
      return Array.isArray(parsed) ? parsed : []
    } catch (error) {
      console.error('Failed to parse favourites from localStorage:', error)
      return [] // Return empty array on error
    }
  })

  const favouriteIds = useMemo(() => new Set(favourites.map((fav) => fav.id)), [favourites])
  const toggleFavourite = useCallback(
    (eventId) => {
      setFavourites((prev) => {
        const index = prev.findIndex((fav) => fav.id === eventId)
        let newFavourites

        if (index === -1) {
          const eventToAdd = events.find((e) => e.id === eventId)
          newFavourites = [...prev, eventToAdd]
          console.log('Added to favourites')
        } else {
          newFavourites = prev.filter((fav) => fav.id !== eventId)
          console.log('Removed from favourites')
        }

        try {
          localStorage.setItem('favourites', JSON.stringify(newFavourites))
        } catch (error) {
          console.error('Failed to save favourites to localStorage:', error)
        }

        return newFavourites
      })
    },
    [events]
  )

  return (
    <section className="upcoming-section">
      <div className="upcoming-container">
        <div className="upcoming-header">
          <h2>Próximos Eventos</h2>
          <p>Confira o que está chegando na comunidade tech.</p>
        </div>

        {loading ? (
          <div className="upcoming-grid">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={`skeleton-${i}`} className="upcoming-skeleton">
                <div className="upcoming-skeleton-image" />
                <div className="upcoming-skeleton-content">
                  <div className="upcoming-skeleton-title" />
                  <div className="upcoming-skeleton-text" />
                  <div className="upcoming-skeleton-text short" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="upcoming-grid">
            {events.map((event) => (
              <div style={{ position: 'relative' }}>
                <FavouriteEventButton
                  event={event}
                  isFavourite={favouriteIds.has(event.id)}
                  onToggle={toggleFavourite}
                />
                <div
                  key={event.id}
                  className="upcoming-card"
                  onClick={() => navigate(`/eventos/${event.id}`)}
                >
                  <div className="upcoming-card-image">
                    <img src={event.imagem || BgEventos} alt={event.nome} />
                    <div className="upcoming-card-badge">{event.periodo}</div>
                  </div>
                  <div className="upcoming-card-content">
                    <h3>{event.nome}</h3>
                    <div className="upcoming-card-info">
                      <div className="upcoming-info-item">
                        <Calendar size={14} />
                        <span>{event.data_evento}</span>
                      </div>
                      <div className="upcoming-info-item">
                        <Clock size={14} />
                        <span>{event.horario}</span>
                      </div>
                      <div className="upcoming-info-item">
                        <CalendarDays size={14} />
                        <span>{event.dia_semana}</span>
                      </div>
                      {event.modalidade && (
                        <div className="upcoming-info-item">
                          {event.modalidade === 'Online' ? (
                            <Wifi size={14} />
                          ) : event.modalidade === 'Híbrido' ? (
                            <Video size={14} />
                          ) : (
                            <Monitor size={14} />
                          )}
                          <span>{event.modalidade}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="upcoming-cta">
          <button onClick={() => navigate('/eventos')}>
            Ver todos os eventos
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </section>
  )
}

export default UpcomingEvents
