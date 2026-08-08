'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined'
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined'
import { sortEventsByDate } from '../../utils/eventDate'
import { useFavouritesStore } from '../../store/useFavouritesStore'
import EventsGrid from '../../components/EventsGrid'

// Client Component: os favoritos vivem só no localStorage (useFavouritesStore),
// então não há nada pra buscar no servidor além do tagsMap (ver page.jsx).
// Reaproveita o mesmo EventsGrid de /eventos — sem filtros/paginação aqui,
// a lista de favoritos tende a ser pequena.
export default function FavoritosPageClient({ tagsMap }) {
  const favourites = useFavouritesStore((state) => state.favourites)
  const favouriteIds = useFavouritesStore((state) => state.favouriteIds)
  const toggleFavouriteInStore = useFavouritesStore((state) => state.toggleFavourite)

  const agenda = useMemo(() => sortEventsByDate(favourites), [favourites])
  const toggleFavourite = (eventId) => toggleFavouriteInStore(eventId, agenda)

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
      <Stack spacing={0.5} sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" component="h1">
          Meus favoritos
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 640, mx: 'auto' }}>
          Os eventos que você favoritou, reunidos num só lugar.
        </Typography>
      </Stack>

      {agenda.length === 0 ? (
        <Stack spacing={1.5} sx={{ alignItems: 'center', textAlign: 'center', py: 8 }}>
          <FavoriteBorderOutlinedIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
          <Typography variant="h6" component="h2">
            Você ainda não favoritou nenhum evento
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Favorite eventos na listagem para encontrá-los rapidamente por aqui.
          </Typography>
          <Button
            variant="contained"
            component={Link}
            href="/eventos"
            startIcon={<CalendarMonthOutlinedIcon />}
            sx={{ mt: 1 }}
          >
            Ver eventos
          </Button>
        </Stack>
      ) : (
        <EventsGrid
          loading={false}
          error={null}
          filteredEvents={agenda}
          totalEvents={agenda.length}
          viewMode="grid"
          pageSize={agenda.length}
          eventTagsMap={tagsMap}
          favouriteIds={favouriteIds}
          toggleFavourite={toggleFavourite}
        />
      )}
    </Container>
  )
}
