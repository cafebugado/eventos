import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import EventRecommendations from './EventRecommendations'
import { getRecommendedEvents } from '../services/eventService'
import { captureError } from '../lib/sentry'
import { useFavouritesStore } from '../store/useFavouritesStore'

vi.mock('../services/eventService', () => ({
  getRecommendedEvents: vi.fn(),
}))
vi.mock('../lib/sentry', () => ({
  captureError: vi.fn(),
}))
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

function renderWithTheme(ui) {
  return render(<ThemeProvider theme={createTheme()}>{ui}</ThemeProvider>)
}

const currentEvent = { id: 'evento-atual', nome: 'Evento Atual' }

const recommended = [
  {
    id: 'rec-1',
    slug: 'evento-relacionado-1',
    nome: 'Evento Relacionado 1',
    data_evento: '20/02/2999',
    horario: '19:00',
    imagem: null,
  },
  {
    id: 'rec-2',
    slug: 'evento-relacionado-2',
    nome: 'Evento Relacionado 2',
    data_evento: '21/02/2999',
    horario: '19:00',
    imagem: null,
  },
]

let originalIntersectionObserver

function mockIntersectionObserver({ intersects }) {
  window.IntersectionObserver = class {
    constructor(callback) {
      this.callback = callback
    }
    observe() {
      this.callback([{ isIntersecting: intersects }])
    }
    disconnect() {}
  }
}

describe('EventRecommendations', () => {
  beforeEach(() => {
    originalIntersectionObserver = window.IntersectionObserver
    getRecommendedEvents.mockReset()
    captureError.mockReset()
    useFavouritesStore.setState({ favourites: [], favouriteIds: new Set() })
  })

  afterEach(() => {
    window.IntersectionObserver = originalIntersectionObserver
  })

  it('não busca nada antes do componente entrar na viewport', () => {
    mockIntersectionObserver({ intersects: false })

    const { container } = renderWithTheme(<EventRecommendations currentEvent={currentEvent} />)

    expect(getRecommendedEvents).not.toHaveBeenCalled()
    expect(container.textContent).toBe('')
  })

  it('busca e renderiza os eventos relacionados ao entrar na viewport', async () => {
    mockIntersectionObserver({ intersects: true })
    getRecommendedEvents.mockResolvedValue(recommended)

    renderWithTheme(<EventRecommendations currentEvent={currentEvent} />)

    expect(getRecommendedEvents).toHaveBeenCalledWith('evento-atual')
    expect(await screen.findByText('Evento Relacionado 1')).toBeInTheDocument()
    expect(screen.getByText('Evento Relacionado 2')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /eventos relacionados/i })).toBeInTheDocument()
  })

  it('não renderiza nada quando a API retorna lista vazia', async () => {
    mockIntersectionObserver({ intersects: true })
    getRecommendedEvents.mockResolvedValue([])

    const { container } = renderWithTheme(<EventRecommendations currentEvent={currentEvent} />)

    await vi.waitFor(() => expect(getRecommendedEvents).toHaveBeenCalled())
    expect(container.textContent).toBe('')
  })

  it('não quebra a página e reporta ao Sentry quando a busca falha', async () => {
    mockIntersectionObserver({ intersects: true })
    const error = new Error('falha ao buscar recomendados')
    getRecommendedEvents.mockRejectedValue(error)

    const { container } = renderWithTheme(<EventRecommendations currentEvent={currentEvent} />)

    await vi.waitFor(() =>
      expect(captureError).toHaveBeenCalledWith(error, { context: 'EventRecommendations.load' })
    )
    expect(container.textContent).toBe('')
  })
})
