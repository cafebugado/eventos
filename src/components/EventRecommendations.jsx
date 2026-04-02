import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { getRecommendedEvents } from '../services/eventService'
import EventCard from './EventCard'
import './EventRecommendations.css'
import { parseEventDate } from '../utils/eventDate'
import SkeletonRecommendations from './skeletons/SkeletonRecommendations'

function EventRecommendations({ currentEvent, currentEventTags }) {
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(false)
  const [triggered, setTriggered] = useState(false)
  const sectionRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const el = sectionRef.current
    if (!el) {
      return
    }

    if (!('IntersectionObserver' in window)) {
      setTriggered(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !triggered) {
          setTriggered(true)
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [triggered])

  useEffect(() => {
    if (!triggered || !currentEvent) {
      return
    }

    let cancelled = false

    async function load() {
      setLoading(true)
      try {
        const currentEventDate = parseEventDate(currentEvent.data_evento)
        const results = await getRecommendedEvents(
          currentEvent.id,
          currentEventTags,
          currentEventDate,
          3
        )
        if (!cancelled) {
          setRecommendations(results)
        }
      } catch (err) {
        console.error('Erro ao carregar recomendações:', err)
        if (!cancelled) {
          setRecommendations([])
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [triggered, currentEvent, currentEventTags])

  if (!triggered && !loading) {
    return <div ref={sectionRef} className="event-recs-sentinel" aria-hidden="true" />
  }

  if (!loading && recommendations.length === 0) {
    return null
  }

  return (
    <section className="event-recs-section" ref={sectionRef}>
      <div className="event-recs-container">
        <div className="event-recs-header">
          <h2>Você também pode gostar</h2>
          <p>Eventos relacionados baseados nos seus interesses.</p>
        </div>

        <div className="event-recs-grid">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <SkeletonRecommendations key={`skeleton-${i}`} />
              ))
            : recommendations.map((rec) => (
                <EventCard key={rec.id} event={rec} tags={rec.tags || []} />
              ))}
        </div>

        <div className="event-recs-cta">
          <button onClick={() => navigate('/eventos')}>
            Ver todos os eventos
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </section>
  )
}

export default EventRecommendations
