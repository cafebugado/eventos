import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import EventsPageClient from './EventsPageClient'
import { useFavouritesStore } from '../../store/useFavouritesStore'
import { getToday } from '../../utils/eventDate'

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
    window.localStorage.removeItem('eventos-view-mode')
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

  it('deriva as opções de local dos eventos recebidos e filtra ao aplicar pelo painel desktop', async () => {
    renderWithTheme(
      <EventsPageClient events={eventsWithLocation} tagsMap={{}} tags={[]} error={null} />
    )

    await userEvent.click(screen.getByRole('button', { name: /filtros/i }))
    await userEvent.click(screen.getByLabelText(/local/i))
    await userEvent.click(screen.getByRole('option', { name: 'São Paulo' }))
    await userEvent.click(screen.getByRole('button', { name: /ver resultados/i }))

    expect(replaceMock).toHaveBeenCalledWith('/eventos?local=S%C3%A3o+Paulo', { scroll: false })
  })

  it('exibe estado de erro quando error é passado', () => {
    renderWithTheme(
      <EventsPageClient events={[]} tagsMap={{}} tags={[]} error={new Error('falhou')} />
    )
    expect(screen.getByText('Erro ao carregar eventos')).toBeInTheDocument()
  })

  it('filtra pela tag vinda da URL (?tag=), usando o tagsMap real', () => {
    const eventsWithTags = [
      { id: '1', nome: 'Meetup Backend', data_evento: '20/02/2999', horario: '19:00' },
      { id: '2', nome: 'Workshop Frontend', data_evento: '20/02/2999', horario: '19:00' },
    ]
    const tagsMap = {
      1: [{ id: 'tag-backend', nome: 'Backend', cor: '#2563eb' }],
      2: [{ id: 'tag-frontend', nome: 'Frontend', cor: '#16a34a' }],
    }
    useSearchParamsMock.mockReturnValue(new URLSearchParams('tag=tag-backend'))

    renderWithTheme(
      <EventsPageClient events={eventsWithTags} tagsMap={tagsMap} tags={[]} error={null} />
    )

    expect(screen.getByText('Meetup Backend')).toBeInTheDocument()
    expect(screen.queryByText('Workshop Frontend')).not.toBeInTheDocument()
  })

  it('não aplica filtros ativos quando muda para o calendário', async () => {
    const today = getToday()
    const date = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`
    useSearchParamsMock.mockReturnValue(new URLSearchParams('q=inexistente'))

    renderWithTheme(
      <EventsPageClient
        events={[{ id: '1', nome: 'Evento no Calendário', data_evento: date, horario: '19:00' }]}
        tagsMap={{}}
        tags={[]}
        error={null}
      />
    )

    expect(screen.getByText('Nenhum evento encontrado')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /calendário/i }))
    await userEvent.click(screen.getByRole('button', { name: new RegExp(`^${today.getDate()},`) }))

    expect(await screen.findByText('Evento no Calendário')).toBeInTheDocument()
  })
})
