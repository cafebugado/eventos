import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import EventRowCompact from './EventRowCompact'

const pushMock = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}))

function renderWithTheme(ui) {
  return render(<ThemeProvider theme={createTheme()}>{ui}</ThemeProvider>)
}

const event = {
  id: '1',
  nome: 'Evento Compacto',
  data_evento: '20/02/2026',
  horario: '19:00',
  link: 'https://evento.com',
}

describe('EventRowCompact', () => {
  it('renderiza nome, data e horário', () => {
    renderWithTheme(<EventRowCompact event={event} />)
    expect(screen.getByText('Evento Compacto')).toBeInTheDocument()
    expect(screen.getByText('20/02/2026')).toBeInTheDocument()
    expect(screen.getByText('19:00')).toBeInTheDocument()
  })

  it('navega para a página do evento ao clicar no row', async () => {
    renderWithTheme(<EventRowCompact event={event} />)
    await userEvent.click(screen.getByRole('button', { name: /evento compacto/i }))
    expect(pushMock).toHaveBeenCalledWith('/eventos/1')
  })

  it('exibe "Encerrado" para eventos passados', () => {
    renderWithTheme(<EventRowCompact event={{ ...event, data_evento: '01/01/2000' }} />)
    expect(screen.getByText('Encerrado')).toBeInTheDocument()
  })

  it('exibe "Acessar" para eventos futuros', () => {
    renderWithTheme(<EventRowCompact event={{ ...event, data_evento: '01/01/2999' }} />)
    expect(screen.getByText('Acessar')).toBeInTheDocument()
  })
})
