'use client'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { isEventPast, isEventToday } from '../../utils/eventDate'

const MAX_DOTS = 3

function EventDots({ events }) {
  const count = Math.min(events.length, MAX_DOTS)
  const extra = events.length - MAX_DOTS

  return (
    <Box
      sx={{
        display: 'flex',
        gap: { xs: 0.25, sm: 0.5 },
        mt: { xs: 0.25, sm: 0.5 },
        minWidth: 0,
        alignItems: 'center',
        flexWrap: 'wrap',
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <Box
          key={i}
          sx={{
            width: { xs: 4, sm: 6 },
            height: { xs: 4, sm: 6 },
            borderRadius: '50%',
            bgcolor: isEventPast(events[i].data_evento) ? 'text.disabled' : 'primary.main',
          }}
        />
      ))}
      {extra > 0 && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ fontSize: { xs: '0.55rem', sm: '0.6rem' }, lineHeight: 1 }}
        >
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
        width: { xs: '100%', sm: 'auto' },
        minWidth: { xs: 0, sm: 'auto' },
        boxSizing: 'border-box',
        overflow: { xs: 'hidden', sm: 'visible' },
        aspectRatio: '1',
        p: { xs: 0.5, sm: 0.75 },
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
      <Typography
        variant="body2"
        sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: isToday ? 700 : 400 }}
      >
        {day}
      </Typography>
      {hasEvents && <EventDots events={events} />}
    </Box>
  )
}
