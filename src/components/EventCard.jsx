import { useNavigate } from 'react-router-dom'
import {
  Calendar,
  Clock,
  CalendarDays,
  MapPin,
  Monitor,
  Wifi,
  Video,
  ArrowUpRight,
} from 'lucide-react'
import RichText from './RichText'
import BgEventos from '../assets/eventos.png'
import './EventCard.css'
import { FavouriteEventButton } from './favourite-event/favouriteEventButton'

function ModalidadeIcon({ modalidade, size }) {
  if (modalidade === 'Online') {
    return <Wifi size={size} />
  }
  if (modalidade === 'Híbrido') {
    return <Video size={size} />
  }
  return <Monitor size={size} />
}

function EventCard({
  event,
  tags = [],
  variant = 'compact',
  isPast = false,
  isToday = false,
  showDescription = false,
  showLocation = false,
  showActionButton = false,
  actionLabel,
  onClick,
  style,
  favouriteIds,
  toggleFavourite,
}) {
  const navigate = useNavigate()

  const handleClick = onClick ?? (() => navigate(`/eventos/${event.id}`))
  const isFull = variant === 'full'
  const iconSize = isFull ? 16 : 14

  const badgeClass = isPast
    ? 'ec-badge ec-badge-encerrado'
    : isToday
      ? 'ec-badge ec-badge-today'
      : 'ec-badge'
  const badgeText = isPast ? 'Encerrado' : isToday ? 'Hoje' : event.periodo

  const defaultActionLabel = isPast ? 'Ver detalhes do evento' : 'Saber mais sobre o evento'

  return (
    <div
      className={`ec-card ec-card--${variant}${isPast ? ' ec-card--past' : ''}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      style={style}
    >
      <div className="ec-image">
        <img src={event.imagem || BgEventos} alt={event.nome} />
        <div className={badgeClass}>{badgeText}</div>
        {tags.length > 0 && (
          <div className="card-image-tags">
            {tags.map((tag) => (
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

      <div className="ec-content">
        <div className={isFull ? 'ec-top' : undefined}>
          <h3>{event.nome}</h3>

          {showDescription && event.descricao && (
            <RichText className="ec-description" content={event.descricao} stopPropagationOnLinks />
          )}
        </div>
        <div className="ec-info">
          <div className="ec-info-item">
            <Calendar size={iconSize} />
            <span>{event.data_evento}</span>
          </div>
          <div className="ec-info-item">
            <Clock size={iconSize} />
            <span>{event.horario}</span>
          </div>
          <div className="ec-info-item">
            <CalendarDays size={iconSize} />
            <span>{event.dia_semana}</span>
          </div>
          {event.modalidade && (
            <div className="ec-info-item">
              <ModalidadeIcon modalidade={event.modalidade} size={iconSize} />
              <span>{event.modalidade}</span>
            </div>
          )}
          {showLocation && event.cidade && event.modalidade !== 'Online' && (
            <div className="ec-info-item">
              <MapPin size={iconSize} />
              <span>{[event.cidade, event.estado].filter(Boolean).join(' - ')}</span>
            </div>
          )}
        </div>
        {showActionButton && (
          <div
            className="ec-action"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '20px',
            }}
          >
            {isFull ? (
              <button
                className="event-link"
                onClick={(e) => {
                  e.stopPropagation()
                  handleClick()
                }}
              >
                {actionLabel ?? defaultActionLabel}
              </button>
            ) : (
              <a
                href={isPast ? undefined : event.link}
                target="_blank"
                rel="noopener noreferrer"
                className={`participate-button${isPast ? ' disabled' : ''}`}
                onClick={(e) => {
                  e.stopPropagation()
                  isPast && e.preventDefault()
                }}
                style={{ marginTop: '1rem', fontSize: '0.875rem', padding: '0.75rem 1.25rem' }}
              >
                {actionLabel ?? defaultActionLabel}
                {!isPast && <ArrowUpRight size={16} />}
              </a>
            )}
            <FavouriteEventButton
              event={event}
              isFavourite={favouriteIds.has(event.id)}
              onToggle={toggleFavourite}
              isCard={true}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default EventCard
