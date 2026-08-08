import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import EventsPage, { metadata } from './page'
import { getPublishedEvents } from '../../services/eventService'

vi.mock('../../services/eventService', () => ({
  getPublishedEvents: vi.fn(),
}))
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
  usePathname: () => '/eventos',
  useSearchParams: () => new URLSearchParams(),
}))

function renderWithTheme(ui) {
  return render(<ThemeProvider theme={createTheme()}>{ui}</ThemeProvider>)
}

const event = {
  id: '1',
  slug: 'evento-publicado',
  nome: 'Evento Publicado',
  descricao: 'Um evento publicado real',
  data_evento: '20/12/2026',
  horario: '19:00',
  dia_semana: 'Sexta-feira',
  periodo: 'Noturno',
  modalidade: 'Online',
  cidade: 'São Paulo',
  estado: 'SP',
  link: 'https://cafebugado.com.br',
  imagem: null,
  created_at: '2026-01-01T00:00:00.000Z',
}

describe('EventsPage', () => {
  it('define metadata de título e descrição', () => {
    expect(metadata.title).toMatch(/próximos eventos/i)
    expect(metadata.description).toBeTruthy()
  })

  it('busca os eventos publicados no servidor e renderiza a lista', async () => {
    getPublishedEvents.mockResolvedValue([event])

    const ui = await EventsPage()
    renderWithTheme(ui)

    expect(screen.getByText('Evento Publicado')).toBeInTheDocument()
  })

  it('busca a lista completa, sem parâmetros de filtro/paginação', async () => {
    getPublishedEvents.mockResolvedValue([])

    await EventsPage()

    expect(getPublishedEvents).toHaveBeenCalledWith()
  })

  it('não quebra a página quando a busca de eventos falha', async () => {
    getPublishedEvents.mockRejectedValue(new Error('falha de rede'))

    const ui = await EventsPage()
    renderWithTheme(ui)

    expect(screen.getByText('Erro ao carregar eventos')).toBeInTheDocument()
  })
})
