import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Dashboard from './Dashboard'
import { renderWithRouter, createMockEvent } from '../test/utils'
import * as authService from '../services/authService'
import * as eventService from '../services/eventService'

// Mock dos services
vi.mock('../services/authService', () => ({
  getSession: vi.fn(),
  signOut: vi.fn(),
  getCurrentUser: vi.fn(),
}))

vi.mock('../services/eventService', () => ({
  getEvents: vi.fn(),
  createEvent: vi.fn(),
  updateEvent: vi.fn(),
  deleteEvent: vi.fn(),
  getEventStats: vi.fn(),
  uploadEventImage: vi.fn(),
}))

vi.mock('../services/tagService', () => ({
  getTags: vi.fn().mockResolvedValue([]),
  createTag: vi.fn(),
  updateTag: vi.fn(),
  deleteTag: vi.fn(),
  getEventTags: vi.fn().mockResolvedValue([]),
  setEventTags: vi.fn(),
  getAllEventTags: vi.fn().mockResolvedValue({}),
}))

vi.mock('../services/contributorService', () => ({
  getContributors: vi.fn().mockResolvedValue([]),
  createContributor: vi.fn(),
  updateContributor: vi.fn(),
  deleteContributor: vi.fn(),
  fetchGitHubUser: vi.fn(),
  isValidLinkedInUrl: vi.fn().mockReturnValue(true),
  isValidPortfolioUrl: vi.fn().mockReturnValue(true),
  isValidGitHubUsername: vi.fn().mockReturnValue(true),
}))

// Mock do react-router-dom navigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// Mock da imagem
vi.mock('../../public/eventos.png', () => ({ default: 'mock-image.png' }))

describe('Dashboard', () => {
  const futureDate = (() => {
    const d = new Date()
    d.setFullYear(d.getFullYear() + 1)
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    return `${day}/${month}/${d.getFullYear()}`
  })()

  const pastDate = '15/01/2024'

  const mockEvents = [
    createMockEvent({ id: '1', nome: 'Evento 1', periodo: 'Noturno', data_evento: futureDate }),
    createMockEvent({ id: '2', nome: 'Evento 2', periodo: 'Diurno', data_evento: futureDate }),
  ]

  const mockStats = { total: 2, noturno: 1, diurno: 1 }

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')

    // Setup padrão dos mocks
    authService.getSession.mockResolvedValue({ user: { id: '1' } })
    authService.getCurrentUser.mockResolvedValue({ email: 'admin@teste.com' })
    eventService.getEvents.mockResolvedValue(mockEvents)
    eventService.getEventStats.mockResolvedValue(mockStats)
  })

  it('deve redirecionar se não estiver autenticado', async () => {
    authService.getSession.mockResolvedValue(null)

    renderWithRouter(<Dashboard />)

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/admin')
    })
  })

  it('deve renderizar o dashboard com eventos', async () => {
    renderWithRouter(<Dashboard />)

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Eventos Cadastrados')).toBeInTheDocument()
    })

    expect(screen.getByText('Evento 1')).toBeInTheDocument()
    expect(screen.getByText('Evento 2')).toBeInTheDocument()
  })

  it('deve filtrar eventos pelo termo de busca', async () => {
    const user = userEvent.setup()
    renderWithRouter(<Dashboard />)

    await waitFor(() => {
      expect(screen.getByText('Evento 1')).toBeInTheDocument()
    })

    const searchInput = screen.getByLabelText('Buscar eventos')
    await user.type(searchInput, 'Evento 2')

    await waitFor(() => {
      expect(screen.queryByText('Evento 1')).not.toBeInTheDocument()
      expect(screen.getByText('Evento 2')).toBeInTheDocument()
    })
  })

  it('deve exibir estatísticas corretas', async () => {
    renderWithRouter(<Dashboard />)

    await waitFor(() => {
      expect(screen.getByText('Total de Eventos')).toBeInTheDocument()
    })

    expect(screen.getByText('2')).toBeInTheDocument() // total
    expect(screen.getByText('Eventos Noturnos')).toBeInTheDocument()
    expect(screen.getByText('Eventos Diurnos')).toBeInTheDocument()
  })

  it('deve exibir email do usuário na sidebar', async () => {
    renderWithRouter(<Dashboard />)

    await waitFor(() => {
      expect(screen.getByText('admin@teste.com')).toBeInTheDocument()
    })
  })

  it('deve fazer logout ao clicar no botão', async () => {
    const user = userEvent.setup()
    authService.signOut.mockResolvedValue(true)

    renderWithRouter(<Dashboard />)

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
    })

    // Encontra o botão de logout pelo ícone de LogOut
    const logoutButtons = screen.getAllByRole('button')
    const logoutBtn = logoutButtons.find((btn) => btn.classList.contains('logout-btn'))

    await user.click(logoutBtn)

    await waitFor(() => {
      expect(authService.signOut).toHaveBeenCalled()
      expect(mockNavigate).toHaveBeenCalledWith('/admin')
    })
  })

  it('deve alternar tema', async () => {
    const user = userEvent.setup()
    renderWithRouter(<Dashboard />)

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
    })

    // Encontra o botão de tema na topbar
    const themeButton = screen
      .getAllByRole('button')
      .find((btn) => btn.classList.contains('theme-btn'))

    await user.click(themeButton)

    await waitFor(() => {
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
      expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'dark')
    })
  })

  it('deve abrir modal de criação ao clicar em Novo Evento', async () => {
    const user = userEvent.setup()
    renderWithRouter(<Dashboard />)

    await waitFor(() => {
      expect(screen.getByText('Eventos Cadastrados')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /Novo Evento/i }))

    await waitFor(() => {
      expect(screen.getByText('Criar Novo Evento')).toBeInTheDocument()
    })
  })

  it('deve abrir formulário de criação com campos vazios', async () => {
    const user = userEvent.setup()

    renderWithRouter(<Dashboard />)

    await waitFor(() => {
      expect(screen.getByText('Eventos Cadastrados')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /Novo Evento/i }))

    await waitFor(() => {
      expect(screen.getByText('Criar Novo Evento')).toBeInTheDocument()
    })

    // Verifica que os campos estão presentes
    expect(screen.getByPlaceholderText('Ex: Workshop de React')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Selecione uma data')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Ex: 19:00')).toBeInTheDocument()
    expect(screen.getAllByRole('combobox').length).toBeGreaterThanOrEqual(2)
  })

  it('deve exibir estado vazio quando não há eventos', async () => {
    eventService.getEvents.mockResolvedValue([])
    eventService.getEventStats.mockResolvedValue({ total: 0, noturno: 0, diurno: 0 })

    renderWithRouter(<Dashboard />)

    await waitFor(() => {
      expect(screen.getByText('Nenhum evento cadastrado')).toBeInTheDocument()
      expect(
        screen.getByText('Clique em "Novo Evento" para criar seu primeiro evento.')
      ).toBeInTheDocument()
    })
  })

  it('deve exibir loading enquanto carrega eventos', async () => {
    eventService.getEvents.mockImplementation(() => new Promise(() => {}))
    eventService.getEventStats.mockImplementation(() => new Promise(() => {}))

    await act(async () => {
      renderWithRouter(<Dashboard />)
    })

    expect(screen.getByText('Carregando eventos...')).toBeInTheDocument()
  })

  it('deve abrir modal de edição ao clicar em editar evento', async () => {
    const user = userEvent.setup()
    renderWithRouter(<Dashboard />)

    await waitFor(() => {
      expect(screen.getByText('Evento 1')).toBeInTheDocument()
    })

    const editButtons = screen.getAllByTitle('Editar')
    await user.click(editButtons[0])

    await waitFor(() => {
      expect(screen.getByText('Editar Evento')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Evento 1')).toBeInTheDocument()
    })
  })

  it('deve deletar evento após confirmação', async () => {
    const user = userEvent.setup()
    eventService.deleteEvent.mockResolvedValue(true)
    window.confirm = vi.fn(() => true)

    renderWithRouter(<Dashboard />)

    await waitFor(() => {
      expect(screen.getByText('Evento 1')).toBeInTheDocument()
    })

    const deleteButtons = screen.getAllByTitle('Excluir')
    await user.click(deleteButtons[0])

    await waitFor(() => {
      expect(window.confirm).toHaveBeenCalledWith('Tem certeza que deseja excluir este evento?')
      expect(eventService.deleteEvent).toHaveBeenCalledWith('1')
      expect(screen.getByText('Evento excluído com sucesso!')).toBeInTheDocument()
    })
  })

  it('não deve deletar evento se confirmação for cancelada', async () => {
    const user = userEvent.setup()
    window.confirm = vi.fn(() => false)

    renderWithRouter(<Dashboard />)

    await waitFor(() => {
      expect(screen.getByText('Evento 1')).toBeInTheDocument()
    })

    const deleteButtons = screen.getAllByTitle('Excluir')
    await user.click(deleteButtons[0])

    expect(eventService.deleteEvent).not.toHaveBeenCalled()
  })

  it('deve fechar modal ao clicar em Cancelar', async () => {
    const user = userEvent.setup()
    renderWithRouter(<Dashboard />)

    await waitFor(() => {
      expect(screen.getByText('Eventos Cadastrados')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /Novo Evento/i }))

    await waitFor(() => {
      expect(screen.getByText('Criar Novo Evento')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /Cancelar/i }))

    await waitFor(() => {
      expect(screen.queryByText('Criar Novo Evento')).not.toBeInTheDocument()
    })
  })

  it('deve abrir link do evento ao clicar em visualizar', async () => {
    const user = userEvent.setup()
    const windowOpen = vi.spyOn(window, 'open').mockImplementation(() => null)

    renderWithRouter(<Dashboard />)

    await waitFor(() => {
      expect(screen.getByText('Evento 1')).toBeInTheDocument()
    })

    const viewButtons = screen.getAllByTitle('Ver evento')
    await user.click(viewButtons[0])

    expect(windowOpen).toHaveBeenCalledWith('https://evento.com', '_blank')
    windowOpen.mockRestore()
  })

  it('deve exibir somente botão excluir para eventos passados', async () => {
    const pastEvents = [createMockEvent({ id: '1', nome: 'Evento Passado', data_evento: pastDate })]
    eventService.getEvents.mockResolvedValue(pastEvents)
    eventService.getEventStats.mockResolvedValue({ total: 1, noturno: 1, diurno: 0 })

    renderWithRouter(<Dashboard />)

    await waitFor(() => {
      expect(screen.getByText('Evento Passado')).toBeInTheDocument()
    })

    expect(screen.queryByTitle('Ver evento')).not.toBeInTheDocument()
    expect(screen.queryByTitle('Editar')).not.toBeInTheDocument()
    expect(screen.getByTitle('Excluir')).toBeInTheDocument()
  })

  it('deve exibir badge Encerrado para eventos passados', async () => {
    const pastEvents = [createMockEvent({ id: '1', nome: 'Evento Passado', data_evento: pastDate })]
    eventService.getEvents.mockResolvedValue(pastEvents)
    eventService.getEventStats.mockResolvedValue({ total: 1, noturno: 1, diurno: 0 })

    renderWithRouter(<Dashboard />)

    await waitFor(() => {
      expect(screen.getByText('Encerrado')).toBeInTheDocument()
    })
  })

  it('deve ordenar eventos futuros antes dos passados', async () => {
    const mixedEvents = [
      createMockEvent({ id: '1', nome: 'Evento Passado', data_evento: pastDate }),
      createMockEvent({ id: '2', nome: 'Evento Futuro', data_evento: futureDate }),
    ]
    eventService.getEvents.mockResolvedValue(mixedEvents)
    eventService.getEventStats.mockResolvedValue({ total: 2, noturno: 1, diurno: 1 })

    renderWithRouter(<Dashboard />)

    await waitFor(() => {
      expect(screen.getByText('Evento Futuro')).toBeInTheDocument()
      expect(screen.getByText('Evento Passado')).toBeInTheDocument()
    })

    const rows = screen.getAllByRole('row')
    const dataRows = rows.slice(1)
    expect(dataRows[0]).toHaveTextContent('Evento Futuro')
    expect(dataRows[1]).toHaveTextContent('Evento Passado')
  })
})
