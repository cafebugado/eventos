'use client'

import { useRouter } from 'next/navigation'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined'
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined'
import ArrowOutwardOutlinedIcon from '@mui/icons-material/ArrowOutwardOutlined'
import { isEventPast } from '../utils/eventDate'

// Não usamos next/link no row inteiro para evitar markup interativo aninhado.
// O row e o CTA navegam via router.push, igual ao EventCard.
export default function EventRowCompact({ event, style }) {
  const router = useRouter()
  const past = isEventPast(event.data_evento)
  const href = `/eventos/${event.slug || event.id}`
  const navigateToDetails = () => router.push(href)

  return (
    <Stack
      direction="row"
      role="button"
      tabIndex={0}
      aria-label={event.nome}
      onClick={navigateToDetails}
      onKeyDown={(e) => e.key === 'Enter' && navigateToDetails()}
      spacing={2}
      style={style}
      sx={{
        alignItems: 'center',
        py: 1.25,
        px: 1.5,
        borderRadius: 1.5,
        cursor: 'pointer',
        color: 'text.primary',
        opacity: past ? 0.6 : 1,
        '&:hover': { bgcolor: 'action.hover' },
      }}
    >
      <Typography
        variant="body2"
        sx={{ fontWeight: 600, flexGrow: 1, minWidth: 0 }}
        noWrap
        title={event.nome}
      >
        {event.nome}
      </Typography>
      <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', flexShrink: 0 }}>
        <CalendarMonthOutlinedIcon fontSize="inherit" />
        <Typography variant="caption" color="text.secondary">
          {event.data_evento}
        </Typography>
      </Stack>
      <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', flexShrink: 0 }}>
        <AccessTimeOutlinedIcon fontSize="inherit" />
        <Typography variant="caption" color="text.secondary">
          {event.horario}
        </Typography>
      </Stack>
      <Button
        disabled={past}
        size="small"
        variant={past ? 'text' : 'outlined'}
        endIcon={!past && <ArrowOutwardOutlinedIcon fontSize="small" />}
        onClick={(e) => {
          e.stopPropagation()
          if (!past) {
            navigateToDetails()
          }
        }}
        sx={{ flexShrink: 0 }}
      >
        {past ? 'Encerrado' : 'Acessar'}
      </Button>
    </Stack>
  )
}
