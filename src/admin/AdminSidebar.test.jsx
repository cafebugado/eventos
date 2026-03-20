import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AdminSidebar } from './AdminSidebar'

const BASE_PROPS = {
  activeTab: 'eventos',
  onTabChange: vi.fn(),
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

describe('AdminSidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renderiza itens do menu pelo aria-label quando expandido', () => {
    render(<AdminSidebar {...BASE_PROPS} />)

    expect(screen.getByRole('button', { name: 'Eventos' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Tags' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Contribuintes' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Repositório' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Usuários' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Configurações' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Ver Site' })).toBeInTheDocument()
  })

  it('renderiza cabeçalho com título e subtítulo quando expandido', () => {
    render(<AdminSidebar {...BASE_PROPS} />)

    expect(screen.getByText('Café Bugado Admin')).toBeInTheDocument()
  })

  it('oculta labels de texto quando recolhido', () => {
    render(<AdminSidebar {...BASE_PROPS} isCollapsed={true} />)

    // spans com texto de label não devem aparecer
    expect(screen.queryByText('Tags')).not.toBeInTheDocument()
    expect(screen.queryByText('Café Bugado Admin')).not.toBeInTheDocument()
  })

  it('ainda renderiza os botões do menu pelo aria-label quando recolhido', () => {
    render(<AdminSidebar {...BASE_PROPS} isCollapsed={true} />)

    expect(screen.getByRole('button', { name: 'Tags' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sair' })).toBeInTheDocument()
  })

  it('chama onToggle ao clicar no botão de toggle', async () => {
    const user = userEvent.setup()
    render(<AdminSidebar {...BASE_PROPS} />)

    await user.click(screen.getByRole('button', { name: /recolher menu/i }))
    expect(BASE_PROPS.onToggle).toHaveBeenCalledTimes(1)
  })

  it('botão de toggle mostra aria-label "Expandir menu" quando recolhido', () => {
    render(<AdminSidebar {...BASE_PROPS} isCollapsed={true} />)

    expect(screen.getByRole('button', { name: /expandir menu/i })).toBeInTheDocument()
  })

  it('chama onTabChange com o id correto ao clicar em item do menu', async () => {
    const user = userEvent.setup()
    render(<AdminSidebar {...BASE_PROPS} />)

    await user.click(screen.getByRole('button', { name: 'Tags' }))
    expect(BASE_PROPS.onTabChange).toHaveBeenCalledWith('tags')
  })

  it('marca o item ativo com classe "active"', () => {
    render(<AdminSidebar {...BASE_PROPS} activeTab="tags" />)

    const tagsBtn = screen.getByRole('button', { name: 'Tags' })
    expect(tagsBtn).toHaveClass('active')

    const eventosBtn = screen.getByRole('button', { name: 'Eventos' })
    expect(eventosBtn).not.toHaveClass('active')
  })

  it('oculta Tags quando canManageTags é false', () => {
    const props = {
      ...BASE_PROPS,
      permissions: { ...BASE_PROPS.permissions, canManageTags: false },
    }
    render(<AdminSidebar {...props} />)

    expect(screen.queryByRole('button', { name: 'Tags' })).not.toBeInTheDocument()
  })

  it('oculta Usuários quando canManageUsers é false', () => {
    const props = {
      ...BASE_PROPS,
      permissions: { ...BASE_PROPS.permissions, canManageUsers: false },
    }
    render(<AdminSidebar {...props} />)

    expect(screen.queryByRole('button', { name: 'Usuários' })).not.toBeInTheDocument()
  })

  it('chama onLogout ao clicar em sair', async () => {
    const user = userEvent.setup()
    render(<AdminSidebar {...BASE_PROPS} />)

    await user.click(screen.getByRole('button', { name: /sair/i }))
    expect(BASE_PROPS.onLogout).toHaveBeenCalledTimes(1)
  })

  it('exibe initial do email como avatar quando não há avatar_url', () => {
    render(<AdminSidebar {...BASE_PROPS} />)

    expect(screen.getByText('A')).toBeInTheDocument()
  })

  it('exibe imagem quando avatar_url está presente', () => {
    const props = {
      ...BASE_PROPS,
      userProfile: { ...BASE_PROPS.userProfile, avatar_url: 'https://example.com/avatar.jpg' },
    }
    render(<AdminSidebar {...props} />)

    expect(screen.getByAltText('avatar')).toBeInTheDocument()
  })

  it('adiciona classe admin-sidebar--collapsed quando recolhido', () => {
    render(<AdminSidebar {...BASE_PROPS} isCollapsed={true} />)

    const aside = screen.getByRole('complementary')
    expect(aside).toHaveClass('admin-sidebar--collapsed')
  })

  it('não adiciona classe admin-sidebar--collapsed quando expandido', () => {
    render(<AdminSidebar {...BASE_PROPS} isCollapsed={false} />)

    const aside = screen.getByRole('complementary')
    expect(aside).not.toHaveClass('admin-sidebar--collapsed')
  })
})
