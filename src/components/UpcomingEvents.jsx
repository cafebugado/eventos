import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useUpcomingEvents } from '../hooks/useEvents'
import BgEventos from '../assets/eventos.png'
import './UpcomingEvents.css'

function parseDataBadge(dataEvento) {
  if (!dataEvento) {
    return null
  }
  const parts = dataEvento.split('/')
  if (parts.length !== 3) {
    return null
  }
  const months = [
    'JAN',
    'FEV',
    'MAR',
    'ABR',
    'MAI',
    'JUN',
    'JUL',
    'AGO',
    'SET',
    'OUT',
    'NOV',
    'DEZ',
  ]
  const day = parts[0]
  const month = months[parseInt(parts[1], 10) - 1]
  return `${day} ${month}`
}

function UpcomingEvents() {
  const { events, loading, error } = useUpcomingEvents(3)
  const navigate = useNavigate()
  const [tagsMap, setTagsMap] = useState({})

  useEffect(() => {
    if (events.length === 0) {
      return
    }
    import('../services/tagService').then(({ getAllEventTags }) => {
      getAllEventTags()
        .then(setTagsMap)
        .catch(() => {})
    })
  }, [events])

  if (error || (!loading && events.length === 0)) {
    return null
  }

  return (
    <section className="upcoming-section">
      <div className="upcoming-container">
        <div className="upcoming-header">
          <div className="upcoming-header-left">
            <span className="upcoming-label">PRÓXIMAS EXPERIÊNCIAS</span>
            <h2>Eventos em Destaque</h2>
          </div>
          <button className="upcoming-explore-link" onClick={() => navigate('/eventos')}>
            Explorar todos <ArrowRight size={16} />
          </button>
        </div>

        {loading ? (
          <div className="upcoming-grid">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={`skeleton-${i}`} className="upcoming-skeleton">
                <div className="upcoming-skeleton-image" />
                <div className="upcoming-skeleton-content">
                  <div className="upcoming-skeleton-tag" />
                  <div className="upcoming-skeleton-title" />
                  <div className="upcoming-skeleton-text" />
                  <div className="upcoming-skeleton-text short" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="upcoming-grid">
            {events.map((event) => {
              const dataBadge = parseDataBadge(event.data_evento)
              return (
                <div
                  key={event.id}
                  className="upcoming-card"
                  onClick={() => navigate(`/eventos/${event.slug || event.id}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) =>
                    e.key === 'Enter' && navigate(`/eventos/${event.slug || event.id}`)
                  }
                >
                  <div className="upcoming-card-image">
                    <img
                      src={event.imagem || BgEventos}
                      alt={event.nome}
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        e.target.src = BgEventos
                      }}
                    />
                    {dataBadge && <span className="upcoming-date-badge">{dataBadge}</span>}
                  </div>
                  <div className="upcoming-card-body">
                    {(tagsMap[event.id] || []).length > 0 && (
                      <div className="upcoming-card-tags">
                        {(tagsMap[event.id] || []).map((tag) => (
                          <span
                            key={tag.id}
                            className="upcoming-card-tag"
                            style={{ '--tag-color': tag.cor || '#2563eb' }}
                          >
                            {tag.nome}
                          </span>
                        ))}
                      </div>
                    )}
                    <h3>{event.nome}</h3>
                    {event.descricao && (
                      <p className="upcoming-card-desc">
                        {event.descricao.replace(/<[^>]*>/g, '').slice(0, 90)}
                        {event.descricao.replace(/<[^>]*>/g, '').length > 90 ? '…' : ''}
                      </p>
                    )}
                    <button
                      className="upcoming-card-btn"
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(`/eventos/${event.slug || event.id}`)
                      }}
                    >
                      Ver evento
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}

export default UpcomingEvents
