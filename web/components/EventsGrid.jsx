'use client'

import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import EventBusyOutlinedIcon from '@mui/icons-material/EventBusyOutlined'
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined'
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined'
import EventCard from './EventCard'
import EventRowCompact from './EventRowCompact'
import CalendarView from './CalendarView'
import { isEventPast, isEventToday } from '../utils/eventDate'

function SkeletonCards({ count }) {
  return (
    <Box
      role="status"
      aria-busy="true"
      aria-label="Carregando eventos"
      sx={{
        display: 'grid',
        gap: 3,
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={`skeleton-${i}`} variant="rounded" height={360} />
      ))}
    </Box>
  )
}

function EmptyState({ hasEvents }) {
  return (
    <Stack spacing={1.5} sx={{ alignItems: 'center', textAlign: 'center', py: 8 }}>
      <EventBusyOutlinedIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
      <Typography variant="h6" component="h3">
        {hasEvents ? 'Nenhum evento encontrado' : 'Nenhum evento no momento'}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {hasEvents
          ? 'Tente ajustar os filtros de busca.'
          : 'Estamos preparando eventos incríveis para você. Volte em breve!'}
      </Typography>
    </Stack>
  )
}

function ErrorState({ onRetry }) {
  return (
    <Stack
      spacing={1.5}
      role="alert"
      aria-live="polite"
      sx={{ alignItems: 'center', textAlign: 'center', py: 8 }}
    >
      <ErrorOutlineOutlinedIcon sx={{ fontSize: 48, color: 'error.main' }} />
      <Typography variant="h6" component="h3">
        Erro ao carregar eventos
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Não foi possível carregar os eventos. Verifique sua conexão e tente novamente.
      </Typography>
      <Button variant="outlined" startIcon={<RefreshOutlinedIcon />} onClick={onRetry}>
        Tentar novamente
      </Button>
    </Stack>
  )
}

export default function EventsGrid({
  loading,
  error,
  onRetry,
  filteredEvents,
  allEvents,
  totalEvents,
  viewMode,
  pageSize,
  eventTagsMap,
  favouriteIds,
  toggleFavourite,
}) {
  if (loading) {
    return <SkeletonCards count={pageSize} />
  }
  if (error) {
    return <ErrorState onRetry={onRetry} />
  }

  if (viewMode === 'calendar') {
    const calendarEvents = allEvents ?? filteredEvents
    if (calendarEvents.length === 0) {
      return <EmptyState hasEvents={totalEvents > 0} />
    }
    return (
      <CalendarView
        events={calendarEvents}
        eventTagsMap={eventTagsMap}
        favouriteIds={favouriteIds}
        toggleFavourite={toggleFavourite}
      />
    )
  }

  if (filteredEvents.length === 0) {
    return <EmptyState hasEvents={totalEvents > 0} />
  }

  if (viewMode === 'compact') {
    return (
      <Stack spacing={0.5}>
        {filteredEvents.map((item, index) => (
          <EventRowCompact
            key={item.id || `event-${index}`}
            event={item}
            style={{ animationDelay: `${index * 0.05}s` }}
          />
        ))}
      </Stack>
    )
  }

  return (
    <Box
      sx={{
        display: 'grid',
        gap: 3,
        gridTemplateColumns:
          viewMode === 'list' ? '1fr' : { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
      }}
    >
      {filteredEvents.map((item, index) => (
        <EventCard
          key={item.id || `event-${index}`}
          event={item}
          tags={eventTagsMap[item.id] || []}
          variant="full"
          isPast={isEventPast(item.data_evento)}
          isToday={isEventToday(item.data_evento)}
          showLocation
          showActionButton
          style={{ animationDelay: `${index * 0.1}s` }}
          favouriteIds={favouriteIds}
          toggleFavourite={toggleFavourite}
        />
      ))}
    </Box>
  )
}
