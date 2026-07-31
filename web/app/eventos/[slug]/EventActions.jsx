'use client'

import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import ArrowOutwardOutlinedIcon from '@mui/icons-material/ArrowOutwardOutlined'
import { FavouriteEventButton } from '../../../components/FavouriteEventButton'
import AddToCalendarButton from '../../../components/AddToCalendarButton'
import ShareButtons from '../../../components/ShareButtons'
import { useFavouritesStore } from '../../../store/useFavouritesStore'

// Client Component isolado: agrupa tudo que precisa de estado/browser APIs
// nesta página (favoritos via Zustand, dropdown de calendário, compartilhamento)
// — o restante da página (título, descrição, grid de info, localização) fica
// como Server Component estático em page.jsx.
export default function EventActions({ event, isPast, shareUrl }) {
  const favouriteIds = useFavouritesStore((state) => state.favouriteIds)
  const toggleFavouriteInStore = useFavouritesStore((state) => state.toggleFavourite)
  const toggleFavourite = () => toggleFavouriteInStore(event.id, [event])

  const shareLocation =
    [event.endereco, event.cidade, event.estado].filter(Boolean).join(', ') ||
    event.modalidade ||
    ''

  return (
    <Stack spacing={2.5} sx={{ mt: 3 }}>
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center', flexWrap: 'wrap' }} useFlexGap>
        <Button
          component="a"
          href={isPast ? undefined : event.link}
          target="_blank"
          rel="noopener noreferrer"
          disabled={isPast}
          variant="contained"
          size="large"
          endIcon={!isPast && <ArrowOutwardOutlinedIcon />}
          onClick={(e) => {
            if (isPast) {
              e.preventDefault()
            }
          }}
        >
          {isPast ? 'Evento Encerrado' : 'Participar do Evento'}
        </Button>
        <FavouriteEventButton
          event={event}
          isFavourite={favouriteIds.has(event.id)}
          onToggle={toggleFavourite}
          isCard={false}
        />
      </Stack>

      {!isPast && (
        <Stack direction="row" sx={{ flexWrap: 'wrap' }} useFlexGap spacing={2}>
          <AddToCalendarButton event={event} />
        </Stack>
      )}

      {!isPast && (
        <ShareButtons
          eventName={event.nome}
          eventDate={event.data_evento}
          eventTime={event.horario}
          eventUrl={shareUrl}
          eventLocation={shareLocation}
        />
      )}
    </Stack>
  )
}
