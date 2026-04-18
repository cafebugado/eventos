import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor, act, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Dashboard from './Dashboard'
import { renderWithRouter, renderWithRoutes, createMockEvent } from '../test/utils'
import * as authService from '../services/authService'
import * as eventService from '../services/eventService'
import * as roleService from '../services/roleService'

// Mock dos services
vi.mock('../services/authService', () => ({
  getSession: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
}))

vi.mock('../services/roleService', () => ({
  getCurrentUserRole: vi.fn(),
  getUsersWithRoles: vi.fn().mockResolvedValue([]),
  assignUserRole: vi.fn(),
  removeUserRole: vi.fn(),
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

vi.mock('../services/profileService', () => ({
  getMyProfile: vi.fn().mockResolvedValue(null),
  upsertMyProfile: vi.fn().mockResolvedValue(null),
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
    authService.getSession.mockResolvedValue({ user: { id: 'user-1', email: 'admin@teste.com' } })
    eventService.getEvents.mockResolvedValue(mockEvents)
    eventService.getEventStats.mockResolvedValue(mockStats)
    roleService.getCurrentUserRole.mockResolvedValue('super_admin')
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

  it('deve exibir funcao do usuario na sidebar', async () => {
    renderWithRouter(<Dashboard />)

    await waitFor(() => {
      expect(screen.getAllByText('Super Admin').length).toBeGreaterThanOrEqual(1)
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
    expect(document.querySelector('input[type="time"]')).toBeInTheDocument()
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
      expect(screen.getByText('Evento deletado com sucesso!')).toBeInTheDocument()
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

  it('deve fechar modal ao pressionar Escape', async () => {
    const user = userEvent.setup()
    renderWithRouter(<Dashboard />)

    await waitFor(() => {
      expect(screen.getByText('Eventos Cadastrados')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /Novo Evento/i }))

    await waitFor(() => {
      expect(screen.getByText('Criar Novo Evento')).toBeInTheDocument()
    })

    fireEvent.keyDown(document, { key: 'Escape' })

    await waitFor(() => {
      expect(screen.queryByText('Criar Novo Evento')).not.toBeInTheDocument()
    })
  })

  it('deve fechar modal ao clicar no botão X', async () => {
    const user = userEvent.setup()
    renderWithRouter(<Dashboard />)

    await waitFor(() => {
      expect(screen.getByText('Eventos Cadastrados')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /Novo Evento/i }))

    await waitFor(() => {
      expect(screen.getByText('Criar Novo Evento')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: 'Fechar' }))

    await waitFor(() => {
      expect(screen.queryByText('Criar Novo Evento')).not.toBeInTheDocument()
    })
  })

  it('deve exibir modal de confirmação para excluir tag', async () => {
    const user = userEvent.setup()
    const tagService = await import('../services/tagService')
    tagService.getTags.mockResolvedValue([{ id: 'tag-1', nome: 'React', cor: '#61dafb' }])

    renderWithRouter(<Dashboard />)

    await waitFor(() => {
      expect(screen.getByText('Eventos Cadastrados')).toBeInTheDocument()
    })

    // Navega para aba Tags
    const tabTags = screen.getAllByRole('button').find((b) => b.textContent.includes('Tags'))
    if (!tabTags) {
      return
    }

    await user.click(tabTags)

    await waitFor(() => {
      expect(screen.getByText('React')).toBeInTheDocument()
    })

    // Botão excluir dentro da listagem de tags tem title="Excluir"
    const deleteTagBtn = screen.getAllByTitle('Excluir')[0]
    await user.click(deleteTagBtn)

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Excluir Tag' })).toBeInTheDocument()
    })
  })

  it('deve copiar link do evento ao clicar em copiar', async () => {
    const user = userEvent.setup()
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      writable: true,
    })

    const publishedEvents = [
      createMockEvent({
        id: '1',
        nome: 'Evento 1',
        periodo: 'Noturno',
        data_evento: futureDate,
        status: 'publicado',
      }),
    ]
    eventService.getEvents.mockResolvedValue(publishedEvents)

    renderWithRouter(<Dashboard />)

    await waitFor(() => {
      expect(screen.getByText('Evento 1')).toBeInTheDocument()
    })

    const copyButtons = screen.getAllByTitle('Copiar link do evento')
    await user.click(copyButtons[0])

    await waitFor(() => {
      expect(writeText).toHaveBeenCalled()
    })
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

  it('deve ordenar eventos futuros por data do evento (mais próximo primeiro)', async () => {
    const nearDate = (() => {
      const d = new Date()
      d.setDate(d.getDate() + 10)
      return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
    })()
    const farDate = (() => {
      const d = new Date()
      d.setFullYear(d.getFullYear() + 2)
      return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
    })()
    const mixedEvents = [
      createMockEvent({ id: '1', nome: 'Evento Distante', data_evento: farDate }),
      createMockEvent({ id: '2', nome: 'Evento Proximo', data_evento: nearDate }),
    ]
    eventService.getEvents.mockResolvedValue(mixedEvents)
    eventService.getEventStats.mockResolvedValue({ total: 2, noturno: 1, diurno: 1 })

    renderWithRouter(<Dashboard />)

    await waitFor(() => {
      expect(screen.getByText('Evento Proximo')).toBeInTheDocument()
      expect(screen.getByText('Evento Distante')).toBeInTheDocument()
    })

    const rows = screen.getAllByRole('row')
    const dataRows = rows.slice(1)
    expect(dataRows[0]).toHaveTextContent('Evento Proximo')
    expect(dataRows[1]).toHaveTextContent('Evento Distante')
  })

  it('deve exibir coluna "Cadastrado em" na tabela de eventos', async () => {
    renderWithRouter(<Dashboard />)

    await waitFor(() => {
      expect(screen.getByText('Cadastrado em')).toBeInTheDocument()
    })
  })

  it('não deve exibir colunas Horário e Período na tabela de eventos', async () => {
    renderWithRouter(<Dashboard />)

    await waitFor(() => {
      expect(screen.getByText('Eventos Cadastrados')).toBeInTheDocument()
    })

    expect(screen.queryByRole('columnheader', { name: 'Horário' })).not.toBeInTheDocument()
    expect(screen.queryByRole('columnheader', { name: 'Período' })).not.toBeInTheDocument()
  })

  it('deve bloquear cadastro de evento com nome duplicado', async () => {
    const user = userEvent.setup()
    renderWithRouter(<Dashboard />)

    // Aguarda os eventos aparecerem (garante que o estado eventos está populado)
    await waitFor(() => {
      expect(screen.getByText('Evento 1')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /Novo Evento/i }))

    await waitFor(() => {
      expect(screen.getByText('Criar Novo Evento')).toBeInTheDocument()
    })

    // Preenche todos os campos obrigatórios, com nome igual ao de um evento existente
    await user.type(screen.getByPlaceholderText('Ex: Workshop de React'), 'Evento 1')
    fireEvent.change(screen.getByPlaceholderText('Selecione uma data'), {
      target: { value: '2099-12-31' },
    })
    await user.type(document.querySelector('input[type="time"]'), '19:00')
    const selects = screen.getAllByRole('combobox')
    fireEvent.change(selects[0], { target: { value: 'Segunda-feira' } })
    fireEvent.change(selects[1], { target: { value: 'Noturno' } })
    const linkInputs = screen.getAllByPlaceholderText('https://...')
    await user.type(linkInputs[0], 'https://evento.com')

    await user.click(screen.getByRole('button', { name: /^Salvar$/i }))

    await waitFor(() => {
      expect(screen.getByText('Já existe um evento com esse nome.')).toBeInTheDocument()
    })

    expect(eventService.createEvent).not.toHaveBeenCalled()
  })

  // === Testes de RBAC ===
  describe('RBAC - Controle de Permissoes', () => {
    it('deve exibir mensagem de acesso nao configurado quando usuario nao tem role', async () => {
      roleService.getCurrentUserRole.mockResolvedValue(null)

      renderWithRouter(<Dashboard />)

      await waitFor(() => {
        expect(screen.getByText('Acesso nao configurado')).toBeInTheDocument()
      })
    })

    it('moderador nao deve ver botao Criar Evento na sidebar', async () => {
      roleService.getCurrentUserRole.mockResolvedValue('moderador')

      renderWithRouter(<Dashboard />)

      await waitFor(() => {
        expect(screen.getByText('Eventos Cadastrados')).toBeInTheDocument()
      })

      const sidebarButtons = screen.getAllByRole('button')
      const criarEventoBtn = sidebarButtons.find((btn) => btn.textContent.includes('Criar Evento'))
      expect(criarEventoBtn).toBeUndefined()
    })

    it('moderador deve ver botao Novo Evento na listagem', async () => {
      roleService.getCurrentUserRole.mockResolvedValue('moderador')

      renderWithRouter(<Dashboard />)

      await waitFor(() => {
        expect(screen.getByText('Eventos Cadastrados')).toBeInTheDocument()
      })

      expect(screen.queryByRole('button', { name: /Novo Evento/i })).toBeInTheDocument()
    })

    it('moderador nao deve ver botao Excluir em eventos de outros usuarios', async () => {
      roleService.getCurrentUserRole.mockResolvedValue('moderador')
      // eventos com created_by diferente do userId do moderador (user-1)
      eventService.getEvents.mockResolvedValue([
        createMockEvent({
          id: '1',
          nome: 'Evento 1',
          periodo: 'Noturno',
          data_evento: futureDate,
          created_by: 'outro-user',
        }),
        createMockEvent({
          id: '2',
          nome: 'Evento 2',
          periodo: 'Diurno',
          data_evento: futureDate,
          created_by: 'outro-user',
        }),
      ])

      renderWithRouter(<Dashboard />)

      await waitFor(() => {
        expect(screen.getByText('Evento 1')).toBeInTheDocument()
      })

      expect(screen.queryByTitle('Excluir')).not.toBeInTheDocument()
    })

    it('moderador deve ver botao Excluir apenas nos eventos que ele criou', async () => {
      roleService.getCurrentUserRole.mockResolvedValue('moderador')
      // um evento do proprio moderador (user-1) e um de outro
      eventService.getEvents.mockResolvedValue([
        createMockEvent({
          id: '1',
          nome: 'Evento 1',
          periodo: 'Noturno',
          data_evento: futureDate,
          created_by: 'user-1',
        }),
        createMockEvent({
          id: '2',
          nome: 'Evento 2',
          periodo: 'Diurno',
          data_evento: futureDate,
          created_by: 'outro-user',
        }),
      ])

      renderWithRouter(<Dashboard />)

      await waitFor(() => {
        expect(screen.getByText('Evento 1')).toBeInTheDocument()
      })

      expect(screen.getAllByTitle('Excluir').length).toBe(1)
    })

    it('moderador deve ver botao Editar em eventos futuros', async () => {
      roleService.getCurrentUserRole.mockResolvedValue('moderador')

      renderWithRouter(<Dashboard />)

      await waitFor(() => {
        expect(screen.getByText('Evento 1')).toBeInTheDocument()
      })

      expect(screen.getAllByTitle('Editar').length).toBeGreaterThan(0)
    })

    it('admin deve ver tab Usuarios na sidebar', async () => {
      roleService.getCurrentUserRole.mockResolvedValue('admin')

      renderWithRouter(<Dashboard />)

      await waitFor(() => {
        expect(screen.getByText('Eventos Cadastrados')).toBeInTheDocument()
      })

      const usuariosLinks = screen.getAllByRole('link', { name: /Usuários/i })
      expect(usuariosLinks.length).toBeGreaterThan(0)
    })

    it('super_admin deve ver tab Usuarios na sidebar', async () => {
      roleService.getCurrentUserRole.mockResolvedValue('super_admin')

      renderWithRouter(<Dashboard />)

      await waitFor(() => {
        expect(screen.getByText('Eventos Cadastrados')).toBeInTheDocument()
      })

      const usuariosLinks = screen.getAllByRole('link', { name: /Usuários/i })
      expect(usuariosLinks.length).toBeGreaterThan(0)
    })

    it('deve exibir role do usuario na sidebar', async () => {
      roleService.getCurrentUserRole.mockResolvedValue('super_admin')

      renderWithRouter(<Dashboard />)

      await waitFor(() => {
        expect(screen.getAllByText('Super Admin').length).toBeGreaterThanOrEqual(1)
      })
    })

    it('admin deve ver todos os botoes de CRUD em eventos', async () => {
      roleService.getCurrentUserRole.mockResolvedValue('admin')

      renderWithRouter(<Dashboard />)

      await waitFor(() => {
        expect(screen.getByText('Evento 1')).toBeInTheDocument()
      })

      expect(screen.getByRole('button', { name: /Novo Evento/i })).toBeInTheDocument()
      expect(screen.getAllByTitle('Editar').length).toBeGreaterThan(0)
      expect(screen.getAllByTitle('Excluir').length).toBeGreaterThan(0)
    })
  })

  // === Testes de Configurações ===
  describe('Configurações - Perfil do usuário', () => {
    const mockProfile = {
      user_id: 'user-1',
      nome: 'João',
      sobrenome: 'Silva',
      github_username: 'joaosilva',
      avatar_url: 'https://avatars.githubusercontent.com/u/123',
      updated_at: '2024-01-01T00:00:00Z',
    }

    it('deve exibir informações do perfil salvo na aba configurações', async () => {
      const { getMyProfile } = await import('../services/profileService')
      getMyProfile.mockResolvedValue(mockProfile)

      renderWithRoutes(<Dashboard />, {
        path: '/admin/dashboard/:tab',
        initialEntry: '/admin/dashboard/configuracoes',
      })

      await waitFor(() => {
        expect(screen.getByText('Configurações do Perfil')).toBeInTheDocument()
        expect(screen.getAllByText(/João Silva/).length).toBeGreaterThanOrEqual(1)
        expect(screen.getByText('@joaosilva')).toBeInTheDocument()
      })
    })

    it('deve exibir botão de editar perfil para admin', async () => {
      roleService.getCurrentUserRole.mockResolvedValue('admin')
      const { getMyProfile } = await import('../services/profileService')
      getMyProfile.mockResolvedValue(mockProfile)

      renderWithRoutes(<Dashboard />, {
        path: '/admin/dashboard/:tab',
        initialEntry: '/admin/dashboard/configuracoes',
      })

      await waitFor(() => {
        expect(screen.getByTitle('Editar perfil')).toBeInTheDocument()
      })
    })

    it('deve exibir botão de editar perfil para moderador', async () => {
      roleService.getCurrentUserRole.mockResolvedValue('moderador')
      const { getMyProfile } = await import('../services/profileService')
      getMyProfile.mockResolvedValue(mockProfile)

      renderWithRoutes(<Dashboard />, {
        path: '/admin/dashboard/:tab',
        initialEntry: '/admin/dashboard/configuracoes',
      })

      await waitFor(() => {
        expect(screen.getByTitle('Editar perfil')).toBeInTheDocument()
      })
    })

    it('deve salvar perfil e refletir na tela', async () => {
      const { getMyProfile, upsertMyProfile } = await import('../services/profileService')
      getMyProfile.mockResolvedValue(null)
      const profileSalvo = {
        user_id: 'user-1',
        nome: 'Maria',
        sobrenome: 'Souza',
        github_username: null,
        avatar_url: null,
        updated_at: '2024-01-01T00:00:00Z',
      }
      upsertMyProfile.mockResolvedValue(profileSalvo)

      const user = userEvent.setup()
      renderWithRoutes(<Dashboard />, {
        path: '/admin/dashboard/:tab',
        initialEntry: '/admin/dashboard/configuracoes',
      })

      await waitFor(() => {
        expect(screen.getByTitle('Editar perfil')).toBeInTheDocument()
      })

      await user.click(screen.getByTitle('Editar perfil'))

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Seu nome')).toBeInTheDocument()
      })

      await user.clear(screen.getByPlaceholderText('Seu nome'))
      await user.type(screen.getByPlaceholderText('Seu nome'), 'Maria')
      await user.clear(screen.getByPlaceholderText('Seu sobrenome'))
      await user.type(screen.getByPlaceholderText('Seu sobrenome'), 'Souza')

      await user.click(screen.getByRole('button', { name: /Salvar/i }))

      await waitFor(() => {
        expect(upsertMyProfile).toHaveBeenCalledWith(
          expect.objectContaining({ nome: 'Maria', sobrenome: 'Souza' })
        )
        expect(screen.getAllByText(/Maria Souza/).length).toBeGreaterThanOrEqual(1)
      })
    })

    it('deve refletir nome e avatar no sidebar após salvar perfil', async () => {
      const { getMyProfile, upsertMyProfile } = await import('../services/profileService')
      getMyProfile.mockResolvedValue(null)
      const profileSalvo = {
        user_id: 'user-1',
        nome: 'Carlos',
        sobrenome: 'Lima',
        github_username: null,
        avatar_url: null,
        updated_at: '2024-01-01T00:00:00Z',
      }
      upsertMyProfile.mockResolvedValue(profileSalvo)

      const user = userEvent.setup()
      renderWithRoutes(<Dashboard />, {
        path: '/admin/dashboard/:tab',
        initialEntry: '/admin/dashboard/configuracoes',
      })

      await waitFor(() => {
        expect(screen.getByTitle('Editar perfil')).toBeInTheDocument()
      })

      await user.click(screen.getByTitle('Editar perfil'))

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Seu nome')).toBeInTheDocument()
      })

      await user.clear(screen.getByPlaceholderText('Seu nome'))
      await user.type(screen.getByPlaceholderText('Seu nome'), 'Carlos')
      await user.clear(screen.getByPlaceholderText('Seu sobrenome'))
      await user.type(screen.getByPlaceholderText('Seu sobrenome'), 'Lima')

      await user.click(screen.getByRole('button', { name: /Salvar/i }))

      await waitFor(() => {
        // nome deve aparecer no sidebar também
        expect(screen.getAllByText('Carlos Lima').length).toBeGreaterThanOrEqual(1)
      })
    })
  })
})
