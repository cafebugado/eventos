'use client'

import { useMemo, useState } from 'react'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import ChevronLeftOutlinedIcon from '@mui/icons-material/ChevronLeftOutlined'
import ChevronRightOutlinedIcon from '@mui/icons-material/ChevronRightOutlined'
import { parseEventDate, getToday } from '../../utils/eventDate'
import CalendarDay from './CalendarDay'
import CalendarDayModal from './CalendarDayModal'

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

  const prevLastDay = new Date(year, month, 0).getDate()
  for (let i = startOffset - 1; i >= 0; i--) {
    cells.push({
      day: prevLastDay - i,
      currentMonth: false,
      date: new Date(year, month - 1, prevLastDay - i),
    })
  }

  for (let d = 1; d <= totalDays; d++) {
    cells.push({ day: d, currentMonth: true, date: new Date(year, month, d) })
  }

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
    <Box>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <IconButton onClick={prevMonth} aria-label="Mês anterior" size="small">
            <ChevronLeftOutlinedIcon />
          </IconButton>
          <Typography variant="h6" component="h3" sx={{ minWidth: 160, textAlign: 'center' }}>
            {MONTH_NAMES[currentMonth]} {currentYear}
          </Typography>
          <IconButton onClick={nextMonth} aria-label="Próximo mês" size="small">
            <ChevronRightOutlinedIcon />
          </IconButton>
        </Stack>
        <Button size="small" onClick={goToToday}>
          Hoje
        </Button>
      </Stack>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.75 }}>
        {DAY_HEADERS.map((d) => (
          <Typography
            key={d}
            variant="caption"
            color="text.secondary"
            sx={{ textAlign: 'center', fontWeight: 600 }}
          >
            {d}
          </Typography>
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
      </Box>

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
    </Box>
  )
}
