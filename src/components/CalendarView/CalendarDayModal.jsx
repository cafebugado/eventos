import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import CalendarEventItem from './CalendarEventItem'
import './CalendarEventItem.css'

const DAY_NAMES = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
]
const MONTH_NAMES = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
]

function formatModalDate(date) {
  return `${DAY_NAMES[date.getDay()]}, ${date.getDate()} de ${MONTH_NAMES[date.getMonth()]} de ${date.getFullYear()}`
}

export default function CalendarDayModal({
  date,
  events,
  eventTagsMap,
  favouriteIds,
  toggleFavourite,
  onClose,
}) {
  const onCloseRef = useRef(onClose)
  const closeBtnRef = useRef(null)
  const triggerRef = useRef(typeof document !== 'undefined' ? document.activeElement : null)

  useEffect(() => {
    onCloseRef.current = onClose
  })

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') {
        onCloseRef.current()
      }
    }
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    closeBtnRef.current?.focus()
    const trigger = triggerRef.current
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
      if (trigger && typeof trigger.focus === 'function') {
        trigger.focus()
      }
    }
  }, [])

  const modal = (
    <div className="cal-modal-overlay" onClick={onClose}>
      <div
        className="cal-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`Eventos de ${formatModalDate(date)}`}
      >
        <div className="cal-modal-header">
          <div>
            <h4 className="cal-modal-title">
              {events.length} evento{events.length > 1 ? 's' : ''} neste dia
            </h4>
            <p className="cal-modal-date">{formatModalDate(date)}</p>
          </div>
          <button
            ref={closeBtnRef}
            className="cal-modal-close"
            onClick={onClose}
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        </div>

        <div className="cal-modal-body">
          {events.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '1.5rem 0' }}>
              Nenhum evento neste dia.
            </p>
          ) : (
            events.map((event) => {
              const tags = eventTagsMap?.[String(event.id)] || []
              return (
                <CalendarEventItem
                  key={event.id}
                  event={event}
                  tags={tags}
                  favouriteIds={favouriteIds ?? new Set()}
                  toggleFavourite={toggleFavourite ?? (() => {})}
                  onNavigate={onClose}
                />
              )
            })
          )}
        </div>
      </div>
    </div>
  )

  return createPortal(modal, document.body)
}
