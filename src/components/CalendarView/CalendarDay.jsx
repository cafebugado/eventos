import { isEventPast, isEventToday } from '../../utils/eventDate'

const MAX_DOTS_DESKTOP = 3
const MAX_DOTS_MOBILE = 2

function renderDots(events, maxDots) {
  const count = Math.min(events.length, maxDots)
  const dots = Array.from({ length: count }).map((_, i) => {
    const isPast = isEventPast(events[i].data_evento)
    return <span key={i} className={`cal-dot${isPast ? ' cal-dot--past' : ''}`} />
  })
  const extra = events.length - maxDots
  return (
    <>
      {dots}
      {extra > 0 && <span className="cal-dot-more">+{extra}</span>}
    </>
  )
}

export default function CalendarDay({ day, currentMonth, isToday, events, onClick }) {
  const hasEvents = events.length > 0
  const allPast = hasEvents && events.every((e) => isEventPast(e.data_evento))
  const hasLive = hasEvents && events.some((e) => isEventToday(e.data_evento))

  const classNames = [
    'cal-day',
    !currentMonth && 'cal-day--other-month',
    isToday && 'cal-day--today',
    hasEvents && 'cal-day--has-events',
    hasEvents && !allPast && 'cal-day--upcoming',
    allPast && 'cal-day--past-events',
    hasLive && 'cal-day--live',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      className={classNames}
      onClick={hasEvents ? onClick : undefined}
      role={hasEvents ? 'button' : undefined}
      tabIndex={hasEvents ? 0 : undefined}
      onKeyDown={hasEvents ? (e) => (e.key === 'Enter' || e.key === ' ') && onClick() : undefined}
      aria-label={
        hasEvents ? `${day}, ${events.length} evento${events.length > 1 ? 's' : ''}` : String(day)
      }
    >
      <span className="cal-day-number">{day}</span>

      {hasEvents && (
        <>
          <div className="cal-day-dots cal-day-dots--desktop">
            {renderDots(events, MAX_DOTS_DESKTOP)}
          </div>
          <div className="cal-day-dots cal-day-dots--mobile">
            {renderDots(events, MAX_DOTS_MOBILE)}
          </div>
        </>
      )}
    </div>
  )
}
