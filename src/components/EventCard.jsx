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
  Timer,
  Radio,
} from 'lucide-react'
import RichText from './RichText'
import BgEventos from '../assets/eventos.png'
import './EventCard.css'
import { FavouriteEventButton } from './FavouriteEventButton'
import { useEventCountdown } from '../hooks/useEventCountdown'

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

  const { isHappening, isWithin24h, countdown } = useEventCountdown(
    event.data_evento,
    event.horario
  )

  const isNew =
    !!event.created_at && Date.now() - new Date(event.created_at).getTime() < 48 * 60 * 60 * 1000

  const badgeClass = isPast
    ? 'ec-badge ec-badge-encerrado'
    : isHappening
      ? 'ec-badge ec-badge-happening'
      : isToday
        ? 'ec-badge ec-badge-today ec-badge-today--pulse'
        : 'ec-badge'
  const badgeText = isPast
    ? 'Encerrado'
    : isHappening
      ? 'Acontecendo agora'
      : isToday
        ? 'Hoje'
        : event.periodo

  const defaultActionLabel = isPast ? 'Ver detalhes do evento' : 'Saber mais sobre o evento'

  return (
    <div
      className={`ec-card ec-card--${variant}${isPast ? ' ec-card--past' : ''}${isNew && !isPast ? ' ec-card--new' : ''}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      style={style}
    >
      <div className="ec-image-wrapper">
        <div className="ec-image">
          <img
            src={event.imagem || BgEventos}
            alt={event.nome}
            loading="lazy"
            decoding="async"
            onError={(e) => {
              e.target.src = BgEventos
            }}
          />
          {!isWithin24h && !isHappening && <div className={badgeClass}>{badgeText}</div>}
          {isNew && !isPast && <div className="ec-badge-new">Novo</div>}
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

          {isHappening && (
            <div className="ec-countdown ec-countdown--happening">
              <Radio size={13} />
              <span>Acontecendo agora!</span>
            </div>
          )}

          {!isHappening && isWithin24h && countdown && (
            <div className="ec-countdown">
              <Timer size={13} />
              <span>Começa em {countdown}</span>
            </div>
          )}
        </div>
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
