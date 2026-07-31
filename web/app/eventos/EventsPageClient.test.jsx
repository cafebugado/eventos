import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import EventsPageClient from './EventsPageClient'
import { useFavouritesStore } from '../../store/useFavouritesStore'

const { useSearchParamsMock } = vi.hoisted(() => ({
  useSearchParamsMock: vi.fn(() => new URLSearchParams()),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
  usePathname: () => '/eventos',
  useSearchParams: useSearchParamsMock,
}))

function renderWithTheme(ui) {
  return render(<ThemeProvider theme={createTheme()}>{ui}</ThemeProvider>)
}

const events = [
  {
    id: '1',
    nome: 'Evento Futuro',
    data_evento: '20/02/2999',
    horario: '19:00',
    dia_semana: 'Sexta-feira',
    periodo: 'Noturno',
  },
]

describe('EventsPageClient', () => {
  beforeEach(() => {
    useSearchParamsMock.mockReturnValue(new URLSearchParams())
    useFavouritesStore.setState({ favourites: [], favouriteIds: new Set() })
  })

  it('renderiza o título da página', () => {
    renderWithTheme(<EventsPageClient events={[]} tagsMap={{}} tags={[]} error={null} />)
    expect(screen.getByRole('heading', { name: /próximos eventos/i })).toBeInTheDocument()
  })

  it('renderiza os eventos recebidos', () => {
    renderWithTheme(<EventsPageClient events={events} tagsMap={{}} tags={[]} error={null} />)
    expect(screen.getByText('Evento Futuro')).toBeInTheDocument()
  })

  it('exibe estado vazio quando não há eventos', () => {
    renderWithTheme(<EventsPageClient events={[]} tagsMap={{}} tags={[]} error={null} />)
    expect(screen.getByText('Nenhum evento no momento')).toBeInTheDocument()
  })

  it('filtra pelo termo de busca vindo da URL (?q=)', () => {
    useSearchParamsMock.mockReturnValue(new URLSearchParams('q=inexistente'))
    renderWithTheme(<EventsPageClient events={events} tagsMap={{}} tags={[]} error={null} />)
    expect(screen.queryByText('Evento Futuro')).not.toBeInTheDocument()
    expect(screen.getByText('Nenhum evento encontrado')).toBeInTheDocument()
  })

  it('exibe estado de erro quando error é passado', () => {
    renderWithTheme(
      <EventsPageClient events={[]} tagsMap={{}} tags={[]} error={new Error('falhou')} />
    )
    expect(screen.getByText('Erro ao carregar eventos')).toBeInTheDocument()
  })
})
