import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import EventDetailsPage, { generateMetadata } from './page'
import { getEventBySlug } from '../../../services/eventService'
import { captureError } from '../../../lib/sentry'

vi.mock('../../../services/eventService', () => ({
  getEventBySlug: vi.fn(),
}))
vi.mock('../../../lib/sentry', () => ({
  captureError: vi.fn(),
}))

const notFoundMock = vi.fn(() => {
  throw new Error('NEXT_NOT_FOUND')
})
vi.mock('next/navigation', () => ({
  useRouter: () => ({ back: vi.fn() }),
  notFound: () => notFoundMock(),
}))

function renderWithTheme(ui) {
  return render(<ThemeProvider theme={createTheme()}>{ui}</ThemeProvider>)
}

const event = {
  id: '11111111-1111-1111-1111-111111111111',
  slug: 'meetup-cafe-bugado',
  nome: 'Meetup Café Bugado',
  descricao: 'Um encontro mensal da comunidade',
  data_evento: '20/02/2999',
  horario: '19:00',
  dia_semana: 'Terça-feira',
  periodo: 'Noturno',
  modalidade: 'Presencial',
  endereco: 'Av. Paulista, 1000',
  cidade: 'São Paulo',
  estado: 'SP',
  link: 'https://cafebugado.com.br',
  imagem: null,
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-02T00:00:00.000Z',
}

function buildParams(slug = 'meetup-cafe-bugado') {
  return { params: Promise.resolve({ slug }) }
}

describe('EventDetailsPage', () => {
  beforeEach(() => {
    getEventBySlug.mockReset()
    captureError.mockReset()
    notFoundMock.mockClear()
  })

  it('busca o evento pelo slug e renderiza os dados reais', async () => {
    getEventBySlug.mockResolvedValue(event)

    const ui = await EventDetailsPage(buildParams())
    renderWithTheme(ui)

    expect(getEventBySlug).toHaveBeenCalledWith('meetup-cafe-bugado')
    expect(screen.getByRole('heading', { name: 'Meetup Café Bugado' })).toBeInTheDocument()
    expect(screen.getByText('Um encontro mensal da comunidade')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /participar do evento/i })).toHaveAttribute(
      'href',
      'https://cafebugado.com.br'
    )
  })

  it('chama notFound() e propaga quando a API responde 404', async () => {
    const error = new Error('not found')
    error.status = 404
    getEventBySlug.mockRejectedValue(error)

    await expect(EventDetailsPage(buildParams('inexistente'))).rejects.toThrow('NEXT_NOT_FOUND')
    expect(notFoundMock).toHaveBeenCalled()
    expect(captureError).not.toHaveBeenCalled()
  })

  it('propaga erro de rede/servidor (não 404) para o error.jsx, reportando ao Sentry', async () => {
    const error = new Error('falha de rede')
    getEventBySlug.mockRejectedValue(error)

    await expect(EventDetailsPage(buildParams())).rejects.toThrow('falha de rede')
    expect(notFoundMock).not.toHaveBeenCalled()
    expect(captureError).toHaveBeenCalledWith(error, {
      context: 'EventDetailsPage.loadEvent',
    })
  })

  describe('generateMetadata', () => {
    it('gera title/description/OG a partir do evento real', async () => {
      getEventBySlug.mockResolvedValue(event)

      const metadata = await generateMetadata(buildParams())

      expect(metadata.title).toBe('Meetup Café Bugado | Eventos Café Bugado')
      expect(metadata.description).toBe('Um encontro mensal da comunidade')
      expect(metadata.alternates.canonical).toBe('/eventos/meetup-cafe-bugado')
      expect(metadata.openGraph.title).toBe('Meetup Café Bugado')
    })

    it('propaga 404 igual à página', async () => {
      const error = new Error('not found')
      error.status = 404
      getEventBySlug.mockRejectedValue(error)

      await expect(generateMetadata(buildParams('inexistente'))).rejects.toThrow('NEXT_NOT_FOUND')
    })
  })
})
