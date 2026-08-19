import { beforeEach, describe, expect, it, vi } from 'vitest'
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
  beforeEach(() => {
    pushMock.mockClear()
  })

  it('renderiza nome do evento', () => {
    renderWithTheme(<CalendarEventItem event={event} />)
    expect(screen.getByText('Evento Calendário')).toBeInTheDocument()
  })

  it('navega ao clicar e chama onNavigate', async () => {
    const onNavigate = vi.fn()
    renderWithTheme(<CalendarEventItem event={event} onNavigate={onNavigate} />)
    await userEvent.click(screen.getByRole('button', { name: 'Evento Calendário' }))
    expect(onNavigate).toHaveBeenCalled()
    expect(pushMock).toHaveBeenCalledWith('/eventos/1')
  })

  it('navega para os detalhes do evento ao clicar em Saber mais', async () => {
    const onNavigate = vi.fn()
    renderWithTheme(<CalendarEventItem event={event} onNavigate={onNavigate} />)

    await userEvent.click(screen.getByRole('button', { name: /saber mais/i }))

    expect(onNavigate).toHaveBeenCalled()
    expect(pushMock).toHaveBeenCalledWith('/eventos/1')
  })

  it('não exibe data, tags nem favorito no card do modal', () => {
    renderWithTheme(
      <CalendarEventItem event={event} tags={[{ id: 't1', nome: 'React', cor: '#61dafb' }]} />
    )

    expect(screen.queryByText('20/02/2999')).not.toBeInTheDocument()
    expect(screen.queryByText('React')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /favoritar/i })).not.toBeInTheDocument()
  })
})
