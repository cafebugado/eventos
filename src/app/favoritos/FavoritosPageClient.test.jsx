import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import FavoritosPageClient from './FavoritosPageClient'
import { useFavouritesStore } from '../../store/useFavouritesStore'
import { getEventsTagsMap } from '../../services/eventService'

vi.mock('../../services/eventService', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    getEventsTagsMap: vi.fn(),
  }
})

const pushMock = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}))

function renderWithTheme(ui) {
  return render(<ThemeProvider theme={createTheme()}>{ui}</ThemeProvider>)
}

const futureEvent = {
  id: '1',
  nome: 'Evento Futuro Favoritado',
  data_evento: '20/02/2999',
  horario: '19:00',
  dia_semana: 'Sexta-feira',
  periodo: 'Noturno',
}

const pastEvent = {
  id: '2',
  nome: 'Evento Passado Favoritado',
  data_evento: '20/02/2000',
  horario: '19:00',
  dia_semana: 'Sexta-feira',
  periodo: 'Diurno',
}

describe('FavoritosPageClient', () => {
  beforeEach(() => {
    pushMock.mockClear()
    getEventsTagsMap.mockReset().mockResolvedValue({})
    useFavouritesStore.setState({ favourites: [], favouriteIds: new Set() })
  })

  it('renderiza o título da página', () => {
    renderWithTheme(<FavoritosPageClient tagsMap={{}} />)
    expect(screen.getByRole('heading', { name: /meus favoritos/i })).toBeInTheDocument()
  })

  it('exibe estado vazio com link para /eventos quando não há favoritos', () => {
    renderWithTheme(<FavoritosPageClient tagsMap={{}} />)

    expect(screen.getByText('Você ainda não favoritou nenhum evento')).toBeInTheDocument()
    const link = screen.getByRole('link', { name: /ver eventos/i })
    expect(link).toHaveAttribute('href', '/eventos')
  })

  it('renderiza os eventos favoritados, ordenados por data', () => {
    useFavouritesStore.setState({
      favourites: [pastEvent, futureEvent],
      favouriteIds: new Set(['1', '2']),
    })

    renderWithTheme(<FavoritosPageClient tagsMap={{}} />)

    expect(screen.queryByText('Você ainda não favoritou nenhum evento')).not.toBeInTheDocument()
    const names = screen.getAllByRole('heading', { level: 3 }).map((el) => el.textContent)
    expect(names).toEqual(['Evento Futuro Favoritado', 'Evento Passado Favoritado'])
  })

  it('remove o card da lista imediatamente ao desfavoritar', async () => {
    useFavouritesStore.setState({
      favourites: [futureEvent],
      favouriteIds: new Set(['1']),
    })

    renderWithTheme(<FavoritosPageClient tagsMap={{}} />)
    expect(screen.getByText('Evento Futuro Favoritado')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /remover dos favoritos/i }))

    expect(screen.queryByText('Evento Futuro Favoritado')).not.toBeInTheDocument()
    expect(screen.getByText('Você ainda não favoritou nenhum evento')).toBeInTheDocument()
  })

  it('não busca o mapa de tags no client quando não há favoritos', () => {
    renderWithTheme(<FavoritosPageClient />)

    expect(getEventsTagsMap).not.toHaveBeenCalled()
  })

  it('busca o mapa de tags no client quando há favoritos e exibe os chips', async () => {
    useFavouritesStore.setState({
      favourites: [pastEvent, futureEvent],
      favouriteIds: new Set(['1', '2']),
    })
    getEventsTagsMap.mockResolvedValue({
      1: [{ id: 't1', nome: 'Frontend', cor: '#2563eb' }],
      2: [{ id: 't2', nome: 'Arquitetura', cor: '#16a34a' }],
      999: [{ id: 't3', nome: 'Outro Evento', cor: '#000000' }],
    })

    renderWithTheme(<FavoritosPageClient />)

    expect(getEventsTagsMap).toHaveBeenCalledTimes(1)
    expect(await screen.findByText('Frontend')).toBeInTheDocument()
    expect(await screen.findByText('Arquitetura')).toBeInTheDocument()
    expect(screen.queryByText('Outro Evento')).not.toBeInTheDocument()
  })

  it('continua exibindo os eventos favoritados se a busca de tags falhar', async () => {
    useFavouritesStore.setState({
      favourites: [futureEvent],
      favouriteIds: new Set(['1']),
    })
    getEventsTagsMap.mockRejectedValue(new Error('falha de rede'))

    renderWithTheme(<FavoritosPageClient />)

    await waitFor(() => {
      expect(getEventsTagsMap).toHaveBeenCalledTimes(1)
    })
    expect(screen.getByText('Evento Futuro Favoritado')).toBeInTheDocument()
  })
})
