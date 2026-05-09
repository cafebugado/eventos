import { useNavigate } from 'react-router-dom'
import { Calendar, Clock, ArrowUpRight } from 'lucide-react'
import { isEventPast } from '../utils/eventDate'
import './EventRowCompact.css'

export default function EventRowCompact({ event, style }) {
  const navigate = useNavigate()
  const past = isEventPast(event.data_evento)

  return (
    <div
      className={`erc-row${past ? ' erc-row--past' : ''}`}
      onClick={() => navigate(`/eventos/${event.slug || event.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/eventos/${event.slug || event.id}`)}
      style={style}
    >
      <span className="erc-name">{event.nome}</span>
      <span className="erc-meta">
        <Calendar size={13} />
        {event.data_evento}
      </span>
      <span className="erc-meta">
        <Clock size={13} />
        {event.horario}
      </span>
      <a
        href={past ? undefined : event.link}
        target="_blank"
        rel="noopener noreferrer"
        className={`erc-link${past ? ' erc-link--disabled' : ''}`}
        onClick={(e) => {
          e.stopPropagation()
          if (past) {
            e.preventDefault()
          }
        }}
        aria-disabled={past}
      >
        {past ? 'Encerrado' : 'Acessar'}
        {!past && <ArrowUpRight size={12} />}
      </a>
    </div>
  )
}
