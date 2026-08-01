'use client'

import Link from 'next/link'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Skeleton from '@mui/material/Skeleton'
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined'
import EventCard from './EventCard'
import { useFavouritesStore } from '../store/useFavouritesStore'

// Diferente do app antigo (UpcomingEvents.jsx tinha markup próprio de card),
// aqui reutilizamos o EventCard compartilhado — mantém a UI consistente com
// /eventos e as recomendações, e evita duplicar lógica de countdown/tags/
// favoritos que o EventCard já resolve.
export default function UpcomingEvents({ events = [], tagsMap = {}, loading = false }) {
  const favouriteIds = useFavouritesStore((state) => state.favouriteIds)
  const toggleFavourite = useFavouritesStore((state) => state.toggleFavourite)

  if (!loading && events.length === 0) {
    return null
  }

  return (
    <Box component="section" sx={{ py: { xs: 6, md: 10 } }}>
      <Container maxWidth="lg">
        <Stack
          direction="row"
          sx={{ alignItems: 'flex-end', justifyContent: 'space-between', mb: 4, flexWrap: 'wrap' }}
          spacing={2}
          useFlexGap
        >
          <Box>
            <Typography
              variant="overline"
              color="primary"
              sx={{ fontWeight: 700, letterSpacing: 1 }}
            >
              Próximas experiências
            </Typography>
            <Typography variant="h4" component="h2">
              Eventos em Destaque
            </Typography>
          </Box>
          <Button component={Link} href="/eventos" endIcon={<ArrowForwardOutlinedIcon />}>
            Explorar todos
          </Button>
        </Stack>

        <Box
          sx={{
            display: 'grid',
            gap: 3,
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
          }}
        >
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={`skeleton-${i}`} variant="rounded" height={340} />
              ))
            : events.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  tags={tagsMap[event.id] || []}
                  variant="compact"
                  showDescription
                  showActionButton
                  actionLabel="Ver evento"
                  favouriteIds={favouriteIds}
                  toggleFavourite={(eventId) => toggleFavourite(eventId, events)}
                />
              ))}
        </Box>
      </Container>
    </Box>
  )
}
