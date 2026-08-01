import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import EventDetailsPage, { generateMetadata } from './page'
import { getEventBySlugOrId } from '../../../services/eventService'
import { getEventTags } from '../../../services/tagService'

const { notFoundMock } = vi.hoisted(() => ({
  notFoundMock: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND')
  }),
}))

vi.mock('../../../services/eventService', () => ({
  getEventBySlugOrId: vi.fn(),
}))
vi.mock('../../../services/tagService', () => ({
  getEventTags: vi.fn(),
}))
vi.mock('next/navigation', () => ({
  notFound: notFoundMock,
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
  usePathname: () => '/eventos/evento-teste',
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

const event = {
  id: '1',
  slug: 'evento-teste',
  nome: 'Evento Teste',
  descricao: 'Uma descrição de teste',
  data_evento: '20/02/2999',
  horario: '19:00',
  dia_semana: 'Sexta-feira',
  periodo: 'Noturno',
  link: 'https://evento.com',
}

describe('EventDetailsPage', () => {
  beforeEach(() => {
    notFoundMock.mockClear()
  })

  it('renderiza o nome e a descrição do evento', async () => {
    getEventBySlugOrId.mockResolvedValue(event)
    getEventTags.mockResolvedValue([])

    const ui = await EventDetailsPage({ params: Promise.resolve({ slug: 'evento-teste' }) })
    renderWithTheme(ui)

    expect(screen.getByRole('heading', { name: 'Evento Teste' })).toBeInTheDocument()
    expect(screen.getByText('20/02/2999')).toBeInTheDocument()
  })

  it('chama notFound() quando o evento não existe (404)', async () => {
    const notFoundError = new Error('not found')
    notFoundError.status = 404
    getEventBySlugOrId.mockRejectedValue(notFoundError)

    await expect(
      EventDetailsPage({ params: Promise.resolve({ slug: 'inexistente' }) })
    ).rejects.toThrow('NEXT_NOT_FOUND')
    expect(notFoundMock).toHaveBeenCalled()
  })

  it('propaga erros que não são "não encontrado"', async () => {
    getEventBySlugOrId.mockRejectedValue(new Error('falha de rede'))

    await expect(
      EventDetailsPage({ params: Promise.resolve({ slug: 'evento-teste' }) })
    ).rejects.toThrow('falha de rede')
  })

  describe('generateMetadata', () => {
    it('monta title/description/openGraph a partir do evento', async () => {
      getEventBySlugOrId.mockResolvedValue(event)
      getEventTags.mockResolvedValue([])

      const metadata = await generateMetadata({ params: Promise.resolve({ slug: 'evento-teste' }) })

      expect(metadata.title).toBe('Evento Teste | Eventos Café Bugado')
      expect(metadata.description).toContain('Uma descrição de teste')
      expect(metadata.openGraph.type).toBe('article')
      expect(metadata.alternates.canonical).toBe('/eventos/evento-teste')
    })

    it('retorna título de "não encontrado" quando o evento não existe', async () => {
      const notFoundError = new Error('not found')
      notFoundError.status = 404
      getEventBySlugOrId.mockRejectedValue(notFoundError)

      const metadata = await generateMetadata({ params: Promise.resolve({ slug: 'inexistente' }) })

      expect(metadata.title).toMatch(/não encontrado/i)
    })
  })
})
