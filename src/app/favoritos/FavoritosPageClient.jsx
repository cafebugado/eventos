'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
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
import { filterTagsMapByEvents, getEventsTagsMap } from '../../services/eventService'
import { captureError } from '../../lib/sentry'

// Client Component: os favoritos vivem só no localStorage (useFavouritesStore),
// As tags são buscadas no client apenas quando há favoritos, evitando embutir
// o mapa completo de todos os eventos publicados no HTML estático (ver issue #409).
export default function FavoritosPageClient({ tagsMap: initialTagsMap }) {
  const favourites = useFavouritesStore((state) => state.favourites)
  const favouriteIds = useFavouritesStore((state) => state.favouriteIds)
  const toggleFavouriteInStore = useFavouritesStore((state) => state.toggleFavourite)
  const [fetchedTagsMap, setFetchedTagsMap] = useState({})
  const hasFetchedRef = useRef(false)

  useEffect(() => {
    if (initialTagsMap || favourites.length === 0 || hasFetchedRef.current) {
      return
    }

    hasFetchedRef.current = true
    getEventsTagsMap()
      .then(setFetchedTagsMap)
      .catch((error) => {
        captureError(error, { context: 'FavoritosPageClient.loadEventsTagsMap' })
      })
  }, [initialTagsMap, favourites.length])

  const agenda = useMemo(() => sortEventsByDate(favourites), [favourites])
  const visibleTagsMap = useMemo(
    () => filterTagsMapByEvents(initialTagsMap ?? fetchedTagsMap, agenda),
    [initialTagsMap, fetchedTagsMap, agenda]
  )
  const toggleFavourite = (eventId) => toggleFavouriteInStore(eventId, agenda)

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
      <Stack spacing={4} sx={{ mb: 4, alignItems: 'center' }}>
        <Typography
          variant="h3"
          component="h1"
          sx={{ fontSize: { xs: '1.85rem', md: '2.25rem' }, textAlign: 'center' }}
        >
          Meus favoritos
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ fontSize: '1.05rem', maxWidth: 760, width: '100%', textAlign: 'justify' }}
        >
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
          eventTagsMap={visibleTagsMap}
          favouriteIds={favouriteIds}
          toggleFavourite={toggleFavourite}
        />
      )}
    </Container>
  )
}
