import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import EventsPage, { metadata, revalidate } from './page'
import { PAGE_REVALIDATE } from '../../constants/revalidate'
import { getEventsTagsMap, getTags, getUpcomingEvents } from '../../services/eventService'

vi.mock('../../services/eventService', () => ({
  getUpcomingEvents: vi.fn(),
  getTags: vi.fn(),
  getEventsTagsMap: vi.fn(),
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
  beforeEach(() => {
    getUpcomingEvents.mockReset().mockResolvedValue([])
    getTags.mockReset().mockResolvedValue([])
    getEventsTagsMap.mockReset().mockResolvedValue({})
  })

  it('define metadata de título e descrição', () => {
    expect(metadata.title).toMatch(/próximos eventos/i)
    expect(metadata.description).toBeTruthy()
  })

  it('busca os eventos futuros no servidor e renderiza a lista', async () => {
    getUpcomingEvents.mockResolvedValue([event])

    const ui = await EventsPage()
    renderWithTheme(ui)

    expect(screen.getByText('Evento Publicado')).toBeInTheDocument()
  })

  it('busca os eventos futuros em uma única chamada no volume normal', async () => {
    getUpcomingEvents.mockResolvedValue([event])

    await EventsPage()

    expect(getUpcomingEvents).toHaveBeenCalledTimes(1)
    expect(getUpcomingEvents).toHaveBeenCalledWith({ limit: 500, offset: 0 })
  })

  it('só busca a página seguinte se o lote vier cheio (500 itens)', async () => {
    const fullBatch = Array.from({ length: 500 }, (_, index) => ({
      ...event,
      id: String(index + 1),
      slug: `evento-${index + 1}`,
    }))
    getUpcomingEvents.mockResolvedValueOnce(fullBatch).mockResolvedValueOnce([event])

    const ui = await EventsPage()

    expect(getUpcomingEvents).toHaveBeenCalledTimes(2)
    expect(getUpcomingEvents).toHaveBeenNthCalledWith(2, { limit: 500, offset: 500 })
    expect(ui.props.children.props.events).toHaveLength(501)
  })

  it('repassa ao client os eventos na ordem devolvida pela API', async () => {
    const segundo = { ...event, id: '2', slug: 'segundo', nome: 'Segundo Evento' }
    getUpcomingEvents.mockResolvedValue([event, segundo])

    const ui = await EventsPage()

    expect(ui.props.children.props.events.map((item) => item.id)).toEqual(['1', '2'])
  })

  it('é ISR (revalidate) e não força renderização dinâmica a cada visita', () => {
    expect(revalidate).toBe(PAGE_REVALIDATE.EVENTS)
  })

  it('não quebra a página quando a busca de eventos falha', async () => {
    getUpcomingEvents.mockRejectedValue(new Error('falha de rede'))

    const ui = await EventsPage()
    renderWithTheme(ui)

    expect(screen.getByText('Erro ao carregar eventos')).toBeInTheDocument()
  })

  it('busca tags e o mapa de tags em paralelo com os eventos', async () => {
    getUpcomingEvents.mockResolvedValue([])
    getTags.mockResolvedValue([{ id: 't1', nome: 'Backend', cor: '#2563eb' }])
    getEventsTagsMap.mockResolvedValue({ 1: [{ id: 't1', nome: 'Backend', cor: '#2563eb' }] })

    await EventsPage()

    expect(getTags).toHaveBeenCalled()
    expect(getEventsTagsMap).toHaveBeenCalled()
  })

  it('continua renderizando a lista de eventos quando a busca de tags falha (degradação graciosa)', async () => {
    getUpcomingEvents.mockResolvedValue([event])
    getTags.mockRejectedValue(new Error('falha ao buscar tags'))

    const ui = await EventsPage()
    renderWithTheme(ui)

    expect(screen.getByText('Evento Publicado')).toBeInTheDocument()
    expect(screen.queryByText('Erro ao carregar eventos')).not.toBeInTheDocument()
  })

  it('continua renderizando a lista de eventos quando o mapa de tags falha (degradação graciosa)', async () => {
    getUpcomingEvents.mockResolvedValue([event])
    getEventsTagsMap.mockRejectedValue(new Error('falha ao buscar tags-map'))

    const ui = await EventsPage()
    renderWithTheme(ui)

    expect(screen.getByText('Evento Publicado')).toBeInTheDocument()
    expect(screen.queryByText('Erro ao carregar eventos')).not.toBeInTheDocument()
  })
})
