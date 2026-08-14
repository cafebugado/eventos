import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import UpcomingEvents from './UpcomingEvents'
import { useFavouritesStore } from '../store/useFavouritesStore'

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

const events = [
  {
    id: '1',
    nome: 'Evento Um',
    descricao: 'Descrição um',
    data_evento: '20/02/2026',
    horario: '19:00',
    dia_semana: 'Sexta-feira',
    periodo: 'Noturno',
    modalidade: 'Online',
    link: 'https://evento.com',
  },
]

describe('UpcomingEvents', () => {
  beforeEach(() => {
    useFavouritesStore.setState({ favourites: [], favouriteIds: new Set() })
  })

  it('não renderiza nada quando não há eventos e não está carregando', () => {
    const { container } = renderWithTheme(<UpcomingEvents events={[]} tagsMap={{}} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renderiza skeletons quando loading=true', () => {
    const { container } = renderWithTheme(<UpcomingEvents events={[]} tagsMap={{}} loading />)
    expect(container.querySelectorAll('.MuiSkeleton-root')).toHaveLength(3)
  })

  it('renderiza os eventos recebidos', () => {
    renderWithTheme(<UpcomingEvents events={events} tagsMap={{}} />)
    expect(screen.getByText('Evento Um')).toBeInTheDocument()
  })

  it('renderiza o link para a listagem completa', () => {
    renderWithTheme(<UpcomingEvents events={events} tagsMap={{}} />)
    expect(screen.getByRole('link', { name: /explorar todos/i })).toHaveAttribute(
      'href',
      '/eventos'
    )
  })

  it('mostra mensagem de erro em vez de sumir quando a busca falhou e não há eventos', () => {
    renderWithTheme(<UpcomingEvents events={[]} tagsMap={{}} hasError />)
    expect(
      screen.getByText(/não foi possível carregar os eventos em destaque/i)
    ).toBeInTheDocument()
  })

  it('prioriza os eventos recebidos sobre a mensagem de erro quando ambos estão presentes', () => {
    renderWithTheme(<UpcomingEvents events={events} tagsMap={{}} hasError />)
    expect(screen.getByText('Evento Um')).toBeInTheDocument()
    expect(
      screen.queryByText(/não foi possível carregar os eventos em destaque/i)
    ).not.toBeInTheDocument()
  })
})
