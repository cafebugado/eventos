import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { parseEventDate, getToday } from '../../utils/eventDate'
import CalendarDay from './CalendarDay'
import CalendarDayModal from './CalendarDayModal'
import './CalendarView.css'

const MONTH_NAMES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]
const DAY_HEADERS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

function buildCalendarGrid(year, month) {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startOffset = firstDay.getDay()
  const totalDays = lastDay.getDate()

  const cells = []

  // Dias do mês anterior
  const prevLastDay = new Date(year, month, 0).getDate()
  for (let i = startOffset - 1; i >= 0; i--) {
    cells.push({
      day: prevLastDay - i,
      currentMonth: false,
      date: new Date(year, month - 1, prevLastDay - i),
    })
  }

  // Dias do mês atual
  for (let d = 1; d <= totalDays; d++) {
    cells.push({ day: d, currentMonth: true, date: new Date(year, month, d) })
  }

  // Dias do próximo mês para completar a grade
  const remaining = 42 - cells.length
  for (let d = 1; d <= remaining; d++) {
    cells.push({ day: d, currentMonth: false, date: new Date(year, month + 1, d) })
  }

  return cells
}

function dateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export default function CalendarView({ events, eventTagsMap, favouriteIds, toggleFavourite }) {
  const today = getToday()
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [selectedDay, setSelectedDay] = useState(null)

  const eventsByDate = useMemo(() => {
    const map = {}
    events.forEach((event) => {
      const date = parseEventDate(event.data_evento)
      if (!date) {
        return
      }
      const key = dateKey(date)
      if (!map[key]) {
        map[key] = []
      }
      map[key].push(event)
    })
    return map
  }, [events])

  const grid = useMemo(
    () => buildCalendarGrid(currentYear, currentMonth),
    [currentYear, currentMonth]
  )

  function prevMonth() {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear((y) => y - 1)
    } else {
      setCurrentMonth((m) => m - 1)
    }
  }

  function nextMonth() {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear((y) => y + 1)
    } else {
      setCurrentMonth((m) => m + 1)
    }
  }

  function goToToday() {
    setCurrentYear(today.getFullYear())
    setCurrentMonth(today.getMonth())
  }

  function handleDayClick(cell) {
    const key = dateKey(cell.date)
    const dayEvents = eventsByDate[key] || []
    if (dayEvents.length > 0) {
      setSelectedDay({ date: cell.date, events: dayEvents })
    }
  }

  const todayKey = dateKey(today)

  return (
    <div className="calendar-view">
      <div className="calendar-inner">
        <div className="calendar-header">
          <div className="calendar-nav">
            <button className="calendar-nav-btn" onClick={prevMonth} aria-label="Mês anterior">
              <ChevronLeft size={18} />
            </button>
            <h3 className="calendar-title">
              {MONTH_NAMES[currentMonth]} {currentYear}
            </h3>
            <button className="calendar-nav-btn" onClick={nextMonth} aria-label="Próximo mês">
              <ChevronRight size={18} />
            </button>
          </div>
          <button className="calendar-today-btn" onClick={goToToday}>
            Hoje
          </button>
        </div>

        <div className="calendar-grid">
          {DAY_HEADERS.map((d) => (
            <div key={d} className="calendar-day-header">
              {d}
            </div>
          ))}

          {grid.map((cell) => {
            const key = dateKey(cell.date)
            const dayEvents = eventsByDate[key] || []
            const isToday = key === todayKey
            return (
              <CalendarDay
                key={key}
                day={cell.day}
                currentMonth={cell.currentMonth}
                isToday={isToday}
                events={dayEvents}
                onClick={() => handleDayClick(cell)}
              />
            )
          })}
        </div>
      </div>

      {selectedDay && (
        <CalendarDayModal
          date={selectedDay.date}
          events={selectedDay.events}
          eventTagsMap={eventTagsMap}
          favouriteIds={favouriteIds}
          toggleFavourite={toggleFavourite}
          onClose={() => setSelectedDay(null)}
        />
      )}
    </div>
  )
}
