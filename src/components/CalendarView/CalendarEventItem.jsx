'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import { darken } from '@mui/material/styles'
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined'
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import WifiOutlinedIcon from '@mui/icons-material/WifiOutlined'
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined'
import DesktopWindowsOutlinedIcon from '@mui/icons-material/DesktopWindowsOutlined'
import ArrowOutwardOutlinedIcon from '@mui/icons-material/ArrowOutwardOutlined'
import { FavouriteEventButton } from '../FavouriteEventButton'
import { isEventPast, isEventToday } from '../../utils/eventDate'
import { vivoVioleta } from '../../theme/tokens/vivoVioleta'

const FALLBACK_IMAGE = '/eventos.png'

function ModalidadeIcon({ modalidade }) {
  if (modalidade === 'Online') {
    return <WifiOutlinedIcon sx={{ fontSize: 13 }} />
  }
  if (modalidade === 'Híbrido') {
    return <VideocamOutlinedIcon sx={{ fontSize: 13 }} />
  }
  return <DesktopWindowsOutlinedIcon sx={{ fontSize: 13 }} />
}

export default function CalendarEventItem({
  event,
  tags = [],
  favouriteIds,
  toggleFavourite,
  onNavigate,
}) {
  const router = useRouter()
  const isPast = isEventPast(event?.data_evento)
  const isToday = isEventToday(event?.data_evento)

  // Estado em vez de mutar e.target.src direto no onError — ver comentário
  // equivalente em EventCard.jsx.
  const [imageFailed, setImageFailed] = useState(false)
  useEffect(() => {
    const timeoutId = setTimeout(() => setImageFailed(false), 0)
    return () => clearTimeout(timeoutId)
  }, [event?.imagem])

  function handleClick() {
    onNavigate?.()
    router.push(`/eventos/${event?.slug || event?.id}`)
  }

  const badgeText = isPast ? 'Encerrado' : isToday ? 'Hoje' : event?.periodo

  return (
    <Stack
      direction="row"
      spacing={1.5}
      role="button"
      tabIndex={0}
      aria-label={event?.nome}
      onClick={handleClick}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleClick()}
      sx={{
        p: 1.25,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        cursor: 'pointer',
        opacity: isPast ? 0.6 : 1,
        '&:hover': { bgcolor: 'action.hover' },
      }}
    >
      <Box sx={{ position: 'relative', flexShrink: 0 }}>
        <Box
          component="img"
          src={imageFailed || !event?.imagem ? FALLBACK_IMAGE : event.imagem}
          alt={event?.nome ?? ''}
          loading="lazy"
          onError={() => setImageFailed(true)}
          sx={{ width: 88, height: 64, borderRadius: 1.5, objectFit: 'cover' }}
        />
        {badgeText && (
          <Chip
            label={badgeText}
            size="small"
            color={isPast ? 'default' : isToday ? 'success' : 'primary'}
            sx={{ position: 'absolute', top: 2, left: 2, height: 18, fontSize: '0.6rem' }}
          />
        )}
      </Box>

      <Stack spacing={0.5} sx={{ flexGrow: 1, minWidth: 0 }}>
        <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
          <Typography variant="subtitle2" component="h4" noWrap title={event?.nome}>
            {event?.nome}
          </Typography>
          {tags.map((tag) => (
            <Chip
              key={tag.id}
              label={tag.nome}
              size="small"
              sx={{
                bgcolor: darken(tag.cor || vivoVioleta['500'], 0.15),
                color: 'common.white',
                height: 18,
                fontSize: '0.6rem',
              }}
            />
          ))}
        </Stack>

        <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap' }}>
          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
            <CalendarMonthOutlinedIcon sx={{ fontSize: 13 }} color="disabled" />
            <Typography variant="caption" color="text.secondary">
              {event?.data_evento}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
            <AccessTimeOutlinedIcon sx={{ fontSize: 13 }} color="disabled" />
            <Typography variant="caption" color="text.secondary">
              {event?.horario}
            </Typography>
          </Stack>
          {event?.modalidade && (
            <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
              <ModalidadeIcon modalidade={event.modalidade} />
              <Typography variant="caption" color="text.secondary">
                {event.modalidade}
              </Typography>
            </Stack>
          )}
          {event?.cidade && event?.modalidade !== 'Online' && (
            <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
              <LocationOnOutlinedIcon sx={{ fontSize: 13 }} color="disabled" />
              <Typography variant="caption" color="text.secondary">
                {[event.cidade, event.estado].filter(Boolean).join(' - ')}
              </Typography>
            </Stack>
          )}
        </Stack>

        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: 'center' }}
          onClick={(e) => e.stopPropagation()}
        >
          {isPast ? (
            <Button size="small" variant="text" disabled>
              Ver detalhes
            </Button>
          ) : (
            <Button
              component="a"
              href={event?.link}
              target="_blank"
              rel="noopener noreferrer"
              size="small"
              variant="outlined"
              endIcon={<ArrowOutwardOutlinedIcon sx={{ fontSize: 14 }} />}
            >
              Saber mais
            </Button>
          )}
          <FavouriteEventButton
            event={event}
            isFavourite={favouriteIds.has(event?.id)}
            onToggle={toggleFavourite}
            isCard
          />
        </Stack>
      </Stack>
    </Stack>
  )
}
