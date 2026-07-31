'use client'

import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Modal } from '../Modal'
import CalendarEventItem from './CalendarEventItem'

const DAY_NAMES = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
]
const MONTH_NAMES = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
]

function formatModalDate(date) {
  return `${DAY_NAMES[date.getDay()]}, ${date.getDate()} de ${MONTH_NAMES[date.getMonth()]} de ${date.getFullYear()}`
}

// Reusa o Modal compartilhado (Dialog do MUI) em vez do portal/focus-trap
// escrito à mão no app antigo — scroll-lock, foco e Escape já vêm de graça.
export default function CalendarDayModal({
  date,
  events,
  eventTagsMap,
  favouriteIds,
  toggleFavourite,
  onClose,
}) {
  return (
    <Modal
      isOpen
      onClose={onClose}
      title={`${events.length} evento${events.length > 1 ? 's' : ''} neste dia`}
      size="md"
      footer={null}
    >
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {formatModalDate(date)}
      </Typography>

      <Stack spacing={1.5}>
        {events.map((event) => {
          const tags = eventTagsMap?.[String(event.id)] || []
          return (
            <CalendarEventItem
              key={event.id}
              event={event}
              tags={tags}
              favouriteIds={favouriteIds ?? new Set()}
              toggleFavourite={toggleFavourite ?? (() => {})}
              onNavigate={onClose}
            />
          )
        })}
      </Stack>
    </Modal>
  )
}
