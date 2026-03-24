import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useUpcomingEvents } from '../hooks/useEvents'
import EventCard from './EventCard'
import './UpcomingEvents.css'

function UpcomingEvents() {
  const { events, loading, error } = useUpcomingEvents(3)
  const navigate = useNavigate()

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
