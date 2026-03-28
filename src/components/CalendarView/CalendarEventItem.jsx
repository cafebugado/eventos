import { useNavigate } from 'react-router-dom'
import { Calendar, Clock, MapPin, Wifi, Video, Monitor, ArrowUpRight } from 'lucide-react'
import BgEventos from '../../assets/eventos.png'
import { FavouriteEventButton } from '../FavouriteEventButton'
import { isEventPast, isEventToday } from '../../utils/eventDate'

function ModalidadeIcon({ modalidade }) {
  if (modalidade === 'Online') {
    return <Wifi size={13} />
  }
  if (modalidade === 'Híbrido') {
    return <Video size={13} />
  }
  return <Monitor size={13} />
}

export default function CalendarEventItem({
  event,
  tags = [],
  favouriteIds,
  toggleFavourite,
  onNavigate,
}) {
  const navigate = useNavigate()
  const isPast = isEventPast(event?.data_evento)
  const isToday = isEventToday(event?.data_evento)

  function handleClick() {
    if (onNavigate) {
      onNavigate()
    }
    navigate(`/eventos/${event?.id}`)
  }

  const badgeText = isPast ? 'Encerrado' : isToday ? 'Hoje' : event?.periodo
  const badgeClass = `cei-badge${isPast ? ' cei-badge--past' : isToday ? ' cei-badge--today' : ''}`

  return (
    <div
      className={`cei-item${isPast ? ' cei-item--past' : ''}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleClick()}
    >
      <div className="cei-image">
        <img
          src={event?.imagem || BgEventos}
          alt={event?.nome ?? ''}
          loading="lazy"
          onError={(e) => {
            e.target.src = BgEventos
          }}
        />
        {badgeText && <span className={badgeClass}>{badgeText}</span>}
      </div>

      <div className="cei-content">
        <div className="cei-top">
          <h4 className="cei-title">{event?.nome ?? ''}</h4>
          {tags.length > 0 && (
            <div className="cei-tags">
              {tags.map((tag) => (
                <span
                  key={tag.id}
                  className="cei-tag"
                  style={{ '--tag-color': tag.cor || '#2563eb' }}
                >
                  {tag.nome}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="cei-info">
          <span className="cei-info-item cei-info-item--date">
            <Calendar size={12} />
            {event?.data_evento}
          </span>
          <span className="cei-info-item">
            <Clock size={12} />
            {event?.horario}
          </span>
          {event?.modalidade && (
            <span className="cei-info-item">
              <ModalidadeIcon modalidade={event.modalidade} />
              {event.modalidade}
            </span>
          )}
          {event?.cidade && event?.modalidade !== 'Online' && (
            <span className="cei-info-item">
              <MapPin size={12} />
              {[event.cidade, event.estado].filter(Boolean).join(' - ')}
            </span>
          )}
        </div>

        <div className="cei-actions" onClick={(e) => e.stopPropagation()}>
          {isPast ? (
            <button className="participate-button cei-participate disabled" onClick={handleClick}>
              Ver detalhes
            </button>
          ) : (
            <a
              href={event?.link}
              target="_blank"
              rel="noopener noreferrer"
              className="participate-button cei-participate"
            >
              Saber mais
              <ArrowUpRight size={15} />
            </a>
          )}
          <FavouriteEventButton
            event={event}
            isFavourite={favouriteIds.has(event?.id)}
            onToggle={toggleFavourite}
            isCard={true}
          />
        </div>
      </div>
    </div>
  )
}
