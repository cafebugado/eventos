import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CalendarDayModal from './CalendarDayModal'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

function renderWithTheme(ui) {
  return render(<ThemeProvider theme={createTheme()}>{ui}</ThemeProvider>)
}

const events = [
  { id: '1', nome: 'Evento Um', data_evento: '20/02/2999', horario: '19:00' },
  { id: '2', nome: 'Evento Dois', data_evento: '20/02/2999', horario: '20:00' },
]

describe('CalendarDayModal', () => {
  it('renderiza a contagem de eventos e a data formatada', () => {
    renderWithTheme(
      <CalendarDayModal
        date={new Date(2999, 1, 20)}
        events={events}
        eventTagsMap={{}}
        favouriteIds={new Set()}
        toggleFavourite={vi.fn()}
        onClose={vi.fn()}
      />
    )
    expect(screen.getByText('2 eventos neste dia')).toBeInTheDocument()
    expect(screen.getByText('Evento Um')).toBeInTheDocument()
    expect(screen.getByText('Evento Dois')).toBeInTheDocument()
  })
})
