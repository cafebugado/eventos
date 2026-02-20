import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { getUpcomingEvents } from '../services/eventService'
import EventCard from './EventCard'
import './UpcomingEvents.css'

function UpcomingEvents() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate() // usado no botão CTA

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
              <EventCard key={event.id} event={event} />
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
