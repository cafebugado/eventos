import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CalendarEventItem from './CalendarEventItem'

const pushMock = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}))

function renderWithTheme(ui) {
  return render(<ThemeProvider theme={createTheme()}>{ui}</ThemeProvider>)
}

const event = {
  id: '1',
  nome: 'Evento Calendário',
  data_evento: '20/02/2999',
  horario: '19:00',
  periodo: 'Noturno',
  link: 'https://evento.com',
}

describe('CalendarEventItem', () => {
  it('renderiza nome do evento', () => {
    renderWithTheme(
      <CalendarEventItem event={event} favouriteIds={new Set()} toggleFavourite={vi.fn()} />
    )
    expect(screen.getByText('Evento Calendário')).toBeInTheDocument()
  })

  it('navega ao clicar e chama onNavigate', async () => {
    const onNavigate = vi.fn()
    renderWithTheme(
      <CalendarEventItem
        event={event}
        favouriteIds={new Set()}
        toggleFavourite={vi.fn()}
        onNavigate={onNavigate}
      />
    )
    await userEvent.click(screen.getByRole('button', { name: 'Evento Calendário' }))
    expect(onNavigate).toHaveBeenCalled()
    expect(pushMock).toHaveBeenCalledWith('/eventos/1')
  })

  it('exibe as tags recebidas', () => {
    renderWithTheme(
      <CalendarEventItem
        event={event}
        tags={[{ id: 't1', nome: 'React', cor: '#61dafb' }]}
        favouriteIds={new Set()}
        toggleFavourite={vi.fn()}
      />
    )
    expect(screen.getByText('React')).toBeInTheDocument()
  })
})
