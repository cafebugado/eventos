import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import Home from './page'
import { getFeaturedEvents } from '../services/eventService'

vi.mock('../services/eventService', () => ({
  getFeaturedEvents: vi.fn(),
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

const event = {
  id: '1',
  slug: 'evento-destaque',
  nome: 'Evento Destaque',
  descricao: 'Um evento em destaque na home',
  data_evento: '20/02/2026',
  horario: '19:00',
  imagem: null,
  created_at: '2026-01-01T00:00:00.000Z',
}

describe('Home', () => {
  it('renderiza o título e busca os eventos em destaque no servidor', async () => {
    getFeaturedEvents.mockResolvedValue([event])

    const ui = await Home()
    renderWithTheme(ui)

    expect(
      screen.getByRole('heading', { name: /eventos de tecnologia em um só lugar/i })
    ).toBeInTheDocument()
    expect(screen.getByText('Evento Destaque')).toBeInTheDocument()
  })

  it('não quebra a página quando a busca de destaques falha', async () => {
    getFeaturedEvents.mockRejectedValue(new Error('falha de rede'))

    const ui = await Home()
    renderWithTheme(ui)

    expect(
      screen.getByRole('heading', { name: /eventos de tecnologia em um só lugar/i })
    ).toBeInTheDocument()
  })
})
