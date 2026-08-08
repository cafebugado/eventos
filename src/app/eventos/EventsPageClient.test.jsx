import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import EventsPageClient from './EventsPageClient'
import { useFavouritesStore } from '../../store/useFavouritesStore'

const { useSearchParamsMock, replaceMock } = vi.hoisted(() => ({
  useSearchParamsMock: vi.fn(() => new URLSearchParams()),
  replaceMock: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: replaceMock, refresh: vi.fn() }),
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

const eventsWithLocation = [
  {
    id: '1',
    nome: 'Workshop em São Paulo',
    data_evento: '20/02/2999',
    horario: '19:00',
    cidade: 'São Paulo',
    modalidade: 'Presencial',
  },
  {
    id: '2',
    nome: 'Live Online',
    data_evento: '20/02/2999',
    horario: '19:00',
    modalidade: 'Online',
  },
]

describe('EventsPageClient', () => {
  beforeEach(() => {
    useSearchParamsMock.mockReturnValue(new URLSearchParams())
    useFavouritesStore.setState({ favourites: [], favouriteIds: new Set() })
    replaceMock.mockClear()
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

  it('filtra pela cidade vinda da URL (?local=)', () => {
    useSearchParamsMock.mockReturnValue(new URLSearchParams('local=São Paulo'))
    renderWithTheme(
      <EventsPageClient events={eventsWithLocation} tagsMap={{}} tags={[]} error={null} />
    )
    expect(screen.getByText('Workshop em São Paulo')).toBeInTheDocument()
    expect(screen.queryByText('Live Online')).not.toBeInTheDocument()
  })

  it('filtra por modalidade Online vinda da URL (?local=Online)', () => {
    useSearchParamsMock.mockReturnValue(new URLSearchParams('local=Online'))
    renderWithTheme(
      <EventsPageClient events={eventsWithLocation} tagsMap={{}} tags={[]} error={null} />
    )
    expect(screen.getByText('Live Online')).toBeInTheDocument()
    expect(screen.queryByText('Workshop em São Paulo')).not.toBeInTheDocument()
  })

  it('combina ?local= com outro filtro (?q=) em AND', () => {
    useSearchParamsMock.mockReturnValue(new URLSearchParams('local=São Paulo&q=live'))
    renderWithTheme(
      <EventsPageClient events={eventsWithLocation} tagsMap={{}} tags={[]} error={null} />
    )
    expect(screen.getByText('Nenhum evento encontrado')).toBeInTheDocument()
  })

  it('deriva as opções de local dos eventos recebidos e filtra ao selecionar uma no modal', async () => {
    renderWithTheme(
      <EventsPageClient events={eventsWithLocation} tagsMap={{}} tags={[]} error={null} />
    )

    await userEvent.click(screen.getByRole('button', { name: /filtros/i }))
    const dialog = screen.getByRole('dialog')
    await userEvent.click(within(dialog).getByText('São Paulo'))

    expect(replaceMock).toHaveBeenCalledWith('/eventos?local=S%C3%A3o+Paulo', { scroll: false })
  })

  it('exibe estado de erro quando error é passado', () => {
    renderWithTheme(
      <EventsPageClient events={[]} tagsMap={{}} tags={[]} error={new Error('falhou')} />
    )
    expect(screen.getByText('Erro ao carregar eventos')).toBeInTheDocument()
  })
})
