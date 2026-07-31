'use client'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { isEventPast, isEventToday } from '../../utils/eventDate'

const MAX_DOTS = 3

function EventDots({ events }) {
  const count = Math.min(events.length, MAX_DOTS)
  const extra = events.length - MAX_DOTS

  return (
    <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, alignItems: 'center', flexWrap: 'wrap' }}>
      {Array.from({ length: count }).map((_, i) => (
        <Box
          key={i}
          sx={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            bgcolor: isEventPast(events[i].data_evento) ? 'text.disabled' : 'primary.main',
          }}
        />
      ))}
      {extra > 0 && (
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem' }}>
          +{extra}
        </Typography>
      )}
    </Box>
  )
}

export default function CalendarDay({ day, currentMonth, isToday, events, onClick }) {
  const hasEvents = events.length > 0
  const allPast = hasEvents && events.every((e) => isEventPast(e.data_evento))
  const hasLive = hasEvents && events.some((e) => isEventToday(e.data_evento))

  return (
    <Box
      onClick={hasEvents ? onClick : undefined}
      role={hasEvents ? 'button' : undefined}
      tabIndex={hasEvents ? 0 : undefined}
      onKeyDown={hasEvents ? (e) => (e.key === 'Enter' || e.key === ' ') && onClick() : undefined}
      aria-label={
        hasEvents ? `${day}, ${events.length} evento${events.length > 1 ? 's' : ''}` : String(day)
      }
      sx={{
        aspectRatio: '1',
        p: 0.75,
        borderRadius: 1.5,
        border: '1px solid',
        borderColor: isToday ? 'primary.main' : 'divider',
        opacity: currentMonth ? 1 : 0.4,
        cursor: hasEvents ? 'pointer' : 'default',
        bgcolor: hasLive
          ? 'success.main'
          : hasEvents && !allPast
            ? 'action.selected'
            : 'transparent',
        color: hasLive ? 'success.contrastText' : 'text.primary',
        '&:hover': hasEvents ? { bgcolor: hasLive ? 'success.dark' : 'action.hover' } : undefined,
      }}
    >
      <Typography variant="body2" sx={{ fontWeight: isToday ? 700 : 400 }}>
        {day}
      </Typography>
      {hasEvents && <EventDots events={events} />}
    </Box>
  )
}
