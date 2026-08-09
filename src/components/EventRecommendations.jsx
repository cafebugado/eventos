'use client'

import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import EventCard from './EventCard'
import { useInViewport } from '../hooks/useInViewport'
import { useFavouritesStore } from '../store/useFavouritesStore'
import { getRecommendedEvents } from '../services/eventService'
import { captureError } from '../lib/sentry'

// Busca sob demanda ao entrar na viewport (useInViewport) — evita disparar
// essa chamada extra pra quem nem rola até o fim da página de detalhe.
export default function EventRecommendations({ currentEvent }) {
  const { ref, isInView } = useInViewport()
  const [events, setEvents] = useState([])
  const favouriteIds = useFavouritesStore((state) => state.favouriteIds)
  const toggleFavourite = useFavouritesStore((state) => state.toggleFavourite)

  useEffect(() => {
    if (!isInView || !currentEvent?.id) {
      return undefined
    }

    let cancelled = false

    getRecommendedEvents(currentEvent.id)
      .then((result) => {
        if (!cancelled) {
          setEvents(result)
        }
      })
      .catch((error) => {
        captureError(error, { context: 'EventRecommendations.load' })
      })

    return () => {
      cancelled = true
    }
  }, [isInView, currentEvent?.id])

  return (
    <Box
      ref={ref}
      component="section"
      sx={events.length > 0 ? { py: { xs: 6, md: 10 } } : undefined}
    >
      {events.length > 0 && (
        <Container maxWidth="lg">
          <Stack spacing={0.5} sx={{ mb: 4 }}>
            <Typography
              variant="overline"
              color="primary"
              sx={{ fontWeight: 700, letterSpacing: 1 }}
            >
              Continue explorando
            </Typography>
            <Typography variant="h4" component="h2">
              Eventos relacionados
            </Typography>
          </Stack>

          <Box
            sx={{
              display: 'grid',
              gap: 3,
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
            }}
          >
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                variant="compact"
                showDescription
                showActionButton
                showInfoRows={false}
                showDateBadge
                actionInternal
                actionLabel="Ver evento"
                favouriteIds={favouriteIds}
                toggleFavourite={(eventId) => toggleFavourite(eventId, events)}
              />
            ))}
          </Box>
        </Container>
      )}
    </Box>
  )
}
