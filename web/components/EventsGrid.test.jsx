import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import EventsGrid from './EventsGrid'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

function renderWithTheme(ui) {
  return render(<ThemeProvider theme={createTheme()}>{ui}</ThemeProvider>)
}

const event = {
  id: '1',
  nome: 'Evento Grid',
  data_evento: '20/02/2999',
  horario: '19:00',
  dia_semana: 'Sexta-feira',
  periodo: 'Noturno',
}

const baseProps = {
  loading: false,
  error: null,
  onRetry: vi.fn(),
  filteredEvents: [],
  allEvents: undefined,
  totalEvents: 0,
  viewMode: 'grid',
  pageSize: 9,
  eventTagsMap: {},
  favouriteIds: new Set(),
  toggleFavourite: vi.fn(),
}

describe('EventsGrid', () => {
  it('exibe skeletons quando loading=true', () => {
    const { container } = renderWithTheme(<EventsGrid {...baseProps} loading />)
    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(container.querySelectorAll('.MuiSkeleton-root').length).toBeGreaterThan(0)
  })

  it('exibe estado de erro e permite tentar novamente', async () => {
    const onRetry = vi.fn()
    renderWithTheme(<EventsGrid {...baseProps} error={new Error('falhou')} onRetry={onRetry} />)
    expect(screen.getByText('Erro ao carregar eventos')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /tentar novamente/i }))
    expect(onRetry).toHaveBeenCalled()
  })

  it('exibe estado vazio quando não há eventos', () => {
    renderWithTheme(<EventsGrid {...baseProps} />)
    expect(screen.getByText('Nenhum evento no momento')).toBeInTheDocument()
  })

  it('exibe mensagem de filtro quando há eventos totais mas nenhum filtrado', () => {
    renderWithTheme(<EventsGrid {...baseProps} totalEvents={5} />)
    expect(screen.getByText('Nenhum evento encontrado')).toBeInTheDocument()
  })

  it('renderiza EventCard para viewMode=grid', () => {
    renderWithTheme(<EventsGrid {...baseProps} filteredEvents={[event]} totalEvents={1} />)
    expect(screen.getByText('Evento Grid')).toBeInTheDocument()
  })

  it('renderiza EventRowCompact para viewMode=compact', () => {
    renderWithTheme(
      <EventsGrid {...baseProps} viewMode="compact" filteredEvents={[event]} totalEvents={1} />
    )
    expect(screen.getByText('Evento Grid')).toBeInTheDocument()
  })
})
