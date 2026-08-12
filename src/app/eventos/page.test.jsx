import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import EventsPage, { metadata } from './page'
import { getEventsTagsMap, getPublishedEvents, getTags } from '../../services/eventService'

vi.mock('../../services/eventService', () => ({
  getPublishedEvents: vi.fn(),
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
    getPublishedEvents.mockReset().mockResolvedValue([])
    getTags.mockReset().mockResolvedValue([])
    getEventsTagsMap.mockReset().mockResolvedValue({})
  })

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

  it('mantém a leitura de q sem repassar para a API, que ainda não aceita busca', async () => {
    await EventsPage({ searchParams: Promise.resolve({ q: ' react ' }) })

    expect(getPublishedEvents).toHaveBeenCalledWith()
  })

  it('não quebra a página quando a busca de eventos falha', async () => {
    getPublishedEvents.mockRejectedValue(new Error('falha de rede'))

    const ui = await EventsPage()
    renderWithTheme(ui)

    expect(screen.getByText('Erro ao carregar eventos')).toBeInTheDocument()
  })

  it('busca tags e o mapa de tags em paralelo com os eventos', async () => {
    getPublishedEvents.mockResolvedValue([])
    getTags.mockResolvedValue([{ id: 't1', nome: 'Backend', cor: '#2563eb' }])
    getEventsTagsMap.mockResolvedValue({ 1: [{ id: 't1', nome: 'Backend', cor: '#2563eb' }] })

    await EventsPage()

    expect(getTags).toHaveBeenCalled()
    expect(getEventsTagsMap).toHaveBeenCalled()
  })

  it('continua renderizando a lista de eventos quando a busca de tags falha (degradação graciosa)', async () => {
    getPublishedEvents.mockResolvedValue([event])
    getTags.mockRejectedValue(new Error('falha ao buscar tags'))

    const ui = await EventsPage()
    renderWithTheme(ui)

    expect(screen.getByText('Evento Publicado')).toBeInTheDocument()
    expect(screen.queryByText('Erro ao carregar eventos')).not.toBeInTheDocument()
  })

  it('continua renderizando a lista de eventos quando o mapa de tags falha (degradação graciosa)', async () => {
    getPublishedEvents.mockResolvedValue([event])
    getEventsTagsMap.mockRejectedValue(new Error('falha ao buscar tags-map'))

    const ui = await EventsPage()
    renderWithTheme(ui)

    expect(screen.getByText('Evento Publicado')).toBeInTheDocument()
    expect(screen.queryByText('Erro ao carregar eventos')).not.toBeInTheDocument()
  })
})
