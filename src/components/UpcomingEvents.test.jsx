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
})
