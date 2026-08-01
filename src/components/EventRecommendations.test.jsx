import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import EventRecommendations from './EventRecommendations'
import { getRecommendedEvents } from '../services/eventService'

vi.mock('../services/eventService', () => ({
  getRecommendedEvents: vi.fn(),
}))
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))
vi.mock('next/link', () => ({
  default: ({ href, children, ...props }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

function renderWithTheme(ui) {
  return render(<ThemeProvider theme={createTheme()}>{ui}</ThemeProvider>)
}

const currentEvent = { id: 'current', nome: 'Evento Atual', data_evento: '20/02/2999' }

let originalIntersectionObserver

beforeEach(() => {
  originalIntersectionObserver = window.IntersectionObserver
  // Dispara a interseção imediatamente para simular o card já visível.
  window.IntersectionObserver = class {
    constructor(callback) {
      this.callback = callback
    }
    observe() {
      this.callback([{ isIntersecting: true }])
    }
    unobserve() {}
    disconnect() {}
  }
})

afterEach(() => {
  window.IntersectionObserver = originalIntersectionObserver
})

describe('EventRecommendations', () => {
  it('carrega e renderiza as recomendações após entrar na viewport', async () => {
    getRecommendedEvents.mockResolvedValue([
      { id: 'rec-1', nome: 'Evento Recomendado', data_evento: '21/02/2999', tags: [] },
    ])

    renderWithTheme(<EventRecommendations currentEvent={currentEvent} />)

    expect(await screen.findByText('Evento Recomendado')).toBeInTheDocument()
    expect(getRecommendedEvents).toHaveBeenCalled()
  })

  it('não renderiza nada quando não há recomendações', async () => {
    getRecommendedEvents.mockResolvedValue([])
    const { container } = renderWithTheme(
      <EventRecommendations currentEvent={currentEvent} currentEventTags={[]} />
    )

    await waitFor(() => expect(getRecommendedEvents).toHaveBeenCalled())
    await waitFor(() => expect(container).toBeEmptyDOMElement())
  })
})
