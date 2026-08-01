import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import EventsPage, { metadata } from './page'
import { getPublishedEvents } from '../../services/eventService'
import { getAllEventTags, getTags } from '../../services/tagService'

vi.mock('../../services/eventService', () => ({
  getPublishedEvents: vi.fn(),
}))
vi.mock('../../services/tagService', () => ({
  getAllEventTags: vi.fn(),
  getTags: vi.fn(),
}))
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
  usePathname: () => '/eventos',
  useSearchParams: () => new URLSearchParams(),
}))

function renderWithTheme(ui) {
  return render(<ThemeProvider theme={createTheme()}>{ui}</ThemeProvider>)
}

describe('EventsPage', () => {
  it('define metadata de título e descrição', () => {
    expect(metadata.title).toMatch(/próximos eventos/i)
    expect(metadata.description).toBeTruthy()
  })

  it('busca eventos publicados e tags no servidor e renderiza a listagem', async () => {
    getPublishedEvents.mockResolvedValue([
      {
        id: '1',
        nome: 'Evento Publicado',
        data_evento: '20/02/2999',
        horario: '19:00',
        periodo: 'Noturno',
      },
    ])
    getAllEventTags.mockResolvedValue({})
    getTags.mockResolvedValue([])

    const ui = await EventsPage()
    renderWithTheme(ui)

    expect(screen.getByText('Evento Publicado')).toBeInTheDocument()
  })

  it('renderiza estado de erro quando a busca falha', async () => {
    getPublishedEvents.mockRejectedValue(new Error('falha de rede'))
    getAllEventTags.mockResolvedValue({})
    getTags.mockResolvedValue([])

    const ui = await EventsPage()
    renderWithTheme(ui)

    expect(screen.getByText('Erro ao carregar eventos')).toBeInTheDocument()
  })
})
