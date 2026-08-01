import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import Home from './page'
import { getUpcomingEvents } from '../services/eventService'
import { getAllEventTags } from '../services/tagService'

vi.mock('../services/eventService', () => ({
  getUpcomingEvents: vi.fn(),
}))
vi.mock('../services/tagService', () => ({
  getAllEventTags: vi.fn(),
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
  nome: 'Evento Destaque',
  data_evento: '20/02/2026',
  horario: '19:00',
  dia_semana: 'Sexta-feira',
  periodo: 'Noturno',
}

describe('Home', () => {
  it('renderiza o título e busca os próximos eventos no servidor', async () => {
    getUpcomingEvents.mockResolvedValue([event])
    getAllEventTags.mockResolvedValue({})

    const ui = await Home()
    renderWithTheme(ui)

    expect(
      screen.getByRole('heading', { name: /eventos de tecnologia em um só lugar/i })
    ).toBeInTheDocument()
    expect(screen.getByText('Evento Destaque')).toBeInTheDocument()
  })

  it('não quebra a página quando a busca de eventos falha', async () => {
    getUpcomingEvents.mockRejectedValue(new Error('falha de rede'))

    const ui = await Home()
    renderWithTheme(ui)

    expect(
      screen.getByRole('heading', { name: /eventos de tecnologia em um só lugar/i })
    ).toBeInTheDocument()
  })
})
