import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { AdminSidebar } from './AdminSidebar'

const BASE_PROPS = {
  permissions: {
    canManageTags: true,
    canManageContributors: true,
    canManageUsers: true,
  },
  userProfile: { nome: 'Ana', sobrenome: 'Silva', avatar_url: null },
  userEmail: 'ana@teste.com',
  userRole: 'admin',
  roleLabels: { admin: 'Administrador', moderador: 'Moderador' },
  onLogout: vi.fn(),
  isCollapsed: false,
  onToggle: vi.fn(),
}

const renderSidebar = (props = {}, route = '/admin/dashboard/eventos') =>
  render(
    <MemoryRouter initialEntries={[route]}>
      <AdminSidebar {...BASE_PROPS} {...props} />
    </MemoryRouter>
  )

describe('AdminSidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renderiza itens do menu pelo aria-label quando expandido', () => {
    renderSidebar()

    expect(screen.getByRole('link', { name: 'Eventos' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Tags' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Contribuintes' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Repositório' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Usuários' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Comunidades' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Galeria' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Configurações' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Ver Site' })).toBeInTheDocument()
  })

  it('renderiza cabeçalho com título e subtítulo quando expandido', () => {
    renderSidebar()

    expect(screen.getByText('Café Bugado Admin')).toBeInTheDocument()
  })

  it('oculta labels de texto quando recolhido', () => {
    renderSidebar({ isCollapsed: true })

    expect(screen.queryByText('Tags')).not.toBeInTheDocument()
    expect(screen.queryByText('Café Bugado Admin')).not.toBeInTheDocument()
  })

  it('ainda renderiza os links do menu pelo aria-label quando recolhido', () => {
    renderSidebar({ isCollapsed: true })

    expect(screen.getByRole('link', { name: 'Tags' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sair' })).toBeInTheDocument()
  })

  it('chama onToggle ao clicar no botão de toggle', async () => {
    const user = userEvent.setup()
    renderSidebar()

    await user.click(screen.getByRole('button', { name: /recolher menu/i }))
    expect(BASE_PROPS.onToggle).toHaveBeenCalledTimes(1)
  })

  it('botão de toggle mostra aria-label "Expandir menu" quando recolhido', () => {
    renderSidebar({ isCollapsed: true })

    expect(screen.getByRole('button', { name: /expandir menu/i })).toBeInTheDocument()
  })

  it('link de Tags aponta para a rota correta', () => {
    renderSidebar()

    const tagsLink = screen.getByRole('link', { name: 'Tags' })
    expect(tagsLink).toHaveAttribute('href', '/admin/dashboard/tags')
  })

  it('marca o item ativo com classe "active" baseado na URL', () => {
    renderSidebar({}, '/admin/dashboard/tags')

    const tagsLink = screen.getByRole('link', { name: 'Tags' })
    expect(tagsLink).toHaveClass('active')

    const eventosLink = screen.getByRole('link', { name: 'Eventos' })
    expect(eventosLink).not.toHaveClass('active')
  })

  it('oculta Tags quando canManageTags é false', () => {
    renderSidebar({ permissions: { ...BASE_PROPS.permissions, canManageTags: false } })

    expect(screen.queryByRole('link', { name: 'Tags' })).not.toBeInTheDocument()
  })

  it('oculta Usuários quando canManageUsers é false', () => {
    renderSidebar({ permissions: { ...BASE_PROPS.permissions, canManageUsers: false } })

    expect(screen.queryByRole('link', { name: 'Usuários' })).not.toBeInTheDocument()
  })

  it('chama onLogout ao clicar em sair', async () => {
    const user = userEvent.setup()
    renderSidebar()

    await user.click(screen.getByRole('button', { name: /sair/i }))
    expect(BASE_PROPS.onLogout).toHaveBeenCalledTimes(1)
  })

  it('exibe initial do email como avatar quando não há avatar_url', () => {
    renderSidebar()

    expect(screen.getByText('A')).toBeInTheDocument()
  })

  it('exibe imagem quando avatar_url está presente', () => {
    renderSidebar({
      userProfile: { ...BASE_PROPS.userProfile, avatar_url: 'https://example.com/avatar.jpg' },
    })

    expect(screen.getByAltText('avatar')).toBeInTheDocument()
  })

  it('adiciona classe admin-sidebar--collapsed quando recolhido', () => {
    renderSidebar({ isCollapsed: true })

    const aside = screen.getByRole('complementary')
    expect(aside).toHaveClass('admin-sidebar--collapsed')
  })

  it('não adiciona classe admin-sidebar--collapsed quando expandido', () => {
    renderSidebar({ isCollapsed: false })

    const aside = screen.getByRole('complementary')
    expect(aside).not.toHaveClass('admin-sidebar--collapsed')
  })
})
