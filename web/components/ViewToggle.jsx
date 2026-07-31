'use client'

import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import ToggleButton from '@mui/material/ToggleButton'
import GridViewIcon from '@mui/icons-material/GridView'
import ViewListIcon from '@mui/icons-material/ViewList'
import ViewAgendaIcon from '@mui/icons-material/ViewAgenda'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'

const MODES = [
  { id: 'grid', icon: GridViewIcon, label: 'Grade' },
  { id: 'list', icon: ViewListIcon, label: 'Lista' },
  { id: 'compact', icon: ViewAgendaIcon, label: 'Compacto' },
  { id: 'calendar', icon: CalendarMonthIcon, label: 'Calendário' },
]

export default function ViewToggle({ viewMode, onChange, isMobile }) {
  const modes = isMobile ? MODES.filter((mode) => mode.id !== 'grid') : MODES

  return (
    <ToggleButtonGroup
      value={viewMode}
      exclusive
      onChange={(event, value) => {
        if (value) {
          onChange(value)
        }
      }}
      size="small"
      aria-label="Modo de visualização"
    >
      {modes.map((mode) => {
        const ModeIcon = mode.icon
        return (
          <ToggleButton key={mode.id} value={mode.id} aria-label={mode.label} title={mode.label}>
            <ModeIcon fontSize="small" />
          </ToggleButton>
        )
      })}
    </ToggleButtonGroup>
  )
}
