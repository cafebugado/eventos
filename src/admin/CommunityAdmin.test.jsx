import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CommunityAdmin from './CommunityAdmin'

vi.mock('../services/communityService', () => ({
  getCommunities: vi.fn(),
  createCommunity: vi.fn(),
  updateCommunity: vi.fn(),
  deleteCommunity: vi.fn(),
}))

import {
  getCommunities,
  createCommunity,
  updateCommunity,
  deleteCommunity,
} from '../services/communityService'

const showNotification = vi.fn()

describe('CommunityAdmin', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getCommunities.mockResolvedValue([])
  })

  it('renderiza estado de carregamento e depois estado vazio', async () => {
    render(<CommunityAdmin showNotification={showNotification} />)

    expect(screen.getByText('Carregando comunidades...')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('Nenhuma comunidade cadastrada')).toBeInTheDocument()
    })
  })

  it('renderiza lista de comunidades carregadas do Supabase', async () => {
    getCommunities.mockResolvedValue([
      { id: '1', nome: 'Cafe Bugado' },
      { id: '2', nome: 'Meet Up Tech SP' },
    ])

    render(<CommunityAdmin showNotification={showNotification} />)

    await waitFor(() => {
      expect(screen.getByText('Cafe Bugado')).toBeInTheDocument()
      expect(screen.getByText('Meet Up Tech SP')).toBeInTheDocument()
    })
  })

  it('exibe notificação de erro quando falha ao carregar comunidades', async () => {
    getCommunities.mockRejectedValue(new Error('DB error'))

    render(<CommunityAdmin showNotification={showNotification} />)

    await waitFor(() => {
      expect(showNotification).toHaveBeenCalledWith('Erro ao carregar comunidades.', 'error')
    })
  })

  it('abre modal ao clicar em Nova Comunidade', async () => {
    const user = userEvent.setup()
    render(<CommunityAdmin showNotification={showNotification} />)

    await waitFor(() =>
      expect(screen.getByText('Nenhuma comunidade cadastrada')).toBeInTheDocument()
    )

    await user.click(screen.getByRole('button', { name: 'Nova Comunidade' }))

    expect(screen.getByRole('heading', { name: 'Nova Comunidade' })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Ex: Cafe Bugado')).toBeInTheDocument()
  })

  it('fecha modal ao clicar em Cancelar', async () => {
    const user = userEvent.setup()
    render(<CommunityAdmin showNotification={showNotification} />)

    await waitFor(() =>
      expect(screen.getByText('Nenhuma comunidade cadastrada')).toBeInTheDocument()
    )

    await user.click(screen.getByRole('button', { name: 'Nova Comunidade' }))
    await user.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(screen.queryByPlaceholderText('Ex: Cafe Bugado')).not.toBeInTheDocument()
  })

  it('fecha modal ao clicar no X', async () => {
    const user = userEvent.setup()
    render(<CommunityAdmin showNotification={showNotification} />)

    await waitFor(() =>
      expect(screen.getByText('Nenhuma comunidade cadastrada')).toBeInTheDocument()
    )

    await user.click(screen.getByRole('button', { name: 'Nova Comunidade' }))
    await user.click(screen.getByRole('button', { name: 'Fechar' }))

    expect(screen.queryByPlaceholderText('Ex: Cafe Bugado')).not.toBeInTheDocument()
  })

  it('mostra erro de validação ao submeter sem nome', async () => {
    const user = userEvent.setup()
    render(<CommunityAdmin showNotification={showNotification} />)

    await waitFor(() =>
      expect(screen.getByText('Nenhuma comunidade cadastrada')).toBeInTheDocument()
    )

    await user.click(screen.getByRole('button', { name: 'Nova Comunidade' }))
    await user.click(screen.getByRole('button', { name: 'Criar' }))

    expect(await screen.findByText('Nome é obrigatório')).toBeInTheDocument()
  })

  it('cria comunidade ao preencher nome e submeter', async () => {
    const user = userEvent.setup()
    createCommunity.mockResolvedValue({ id: '1', nome: 'Cafe Bugado' })

    render(<CommunityAdmin showNotification={showNotification} />)

    await waitFor(() =>
      expect(screen.getByText('Nenhuma comunidade cadastrada')).toBeInTheDocument()
    )

    await user.click(screen.getByRole('button', { name: 'Nova Comunidade' }))
    await user.type(screen.getByPlaceholderText('Ex: Cafe Bugado'), 'Cafe Bugado')
    await user.click(screen.getByRole('button', { name: 'Criar' }))

    await waitFor(() => {
      expect(createCommunity).toHaveBeenCalledWith({ nome: 'Cafe Bugado' })
      expect(showNotification).toHaveBeenCalledWith('Comunidade criada com sucesso!', 'success')
    })

    expect(screen.getByText('Cafe Bugado')).toBeInTheDocument()
  })

  it('exibe notificação de nome duplicado ao criar comunidade já existente', async () => {
    const user = userEvent.setup()
    createCommunity.mockRejectedValue({ code: '23505' })

    render(<CommunityAdmin showNotification={showNotification} />)

    await waitFor(() =>
      expect(screen.getByText('Nenhuma comunidade cadastrada')).toBeInTheDocument()
    )

    await user.click(screen.getByRole('button', { name: 'Nova Comunidade' }))
    await user.type(screen.getByPlaceholderText('Ex: Cafe Bugado'), 'Cafe Bugado')
    await user.click(screen.getByRole('button', { name: 'Criar' }))

    await waitFor(() => {
      expect(showNotification).toHaveBeenCalledWith(
        'Já existe uma comunidade com esse nome.',
        'error'
      )
    })
  })

  it('exibe botões de editar e excluir para cada comunidade', async () => {
    getCommunities.mockResolvedValue([{ id: '1', nome: 'Cafe Bugado' }])

    render(<CommunityAdmin showNotification={showNotification} />)

    await waitFor(() => expect(screen.getByText('Cafe Bugado')).toBeInTheDocument())

    expect(screen.getByRole('button', { name: 'Editar comunidade' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Excluir comunidade' })).toBeInTheDocument()
  })

  it('abre modal de edição com nome preenchido ao clicar em editar', async () => {
    const user = userEvent.setup()
    getCommunities.mockResolvedValue([{ id: '1', nome: 'Cafe Bugado' }])

    render(<CommunityAdmin showNotification={showNotification} />)

    await waitFor(() => expect(screen.getByText('Cafe Bugado')).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: 'Editar comunidade' }))

    expect(screen.getByText('Editar Comunidade')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Cafe Bugado')).toBeInTheDocument()
  })

  it('atualiza comunidade ao editar e salvar', async () => {
    const user = userEvent.setup()
    getCommunities.mockResolvedValue([{ id: '1', nome: 'Cafe Bugado' }])
    updateCommunity.mockResolvedValue({ id: '1', nome: 'Meet Up Tech SP' })

    render(<CommunityAdmin showNotification={showNotification} />)

    await waitFor(() => expect(screen.getByText('Cafe Bugado')).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: 'Editar comunidade' }))

    const input = screen.getByDisplayValue('Cafe Bugado')
    await user.clear(input)
    await user.type(input, 'Meet Up Tech SP')
    await user.click(screen.getByRole('button', { name: 'Salvar' }))

    await waitFor(() => {
      expect(updateCommunity).toHaveBeenCalledWith('1', { nome: 'Meet Up Tech SP' })
      expect(showNotification).toHaveBeenCalledWith('Comunidade atualizada com sucesso!', 'success')
    })

    expect(screen.getByText('Meet Up Tech SP')).toBeInTheDocument()
    expect(screen.queryByText('Cafe Bugado')).not.toBeInTheDocument()
  })

  it('abre modal de confirmação ao clicar em excluir', async () => {
    const user = userEvent.setup()
    getCommunities.mockResolvedValue([{ id: '1', nome: 'Cafe Bugado' }])

    render(<CommunityAdmin showNotification={showNotification} />)

    await waitFor(() => expect(screen.getByText('Cafe Bugado')).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: 'Excluir comunidade' }))

    expect(screen.getByRole('heading', { name: 'Excluir Comunidade' })).toBeInTheDocument()
    // O nome aparece tanto no card quanto no modal de confirmação
    expect(screen.getAllByText('Cafe Bugado').length).toBeGreaterThanOrEqual(1)
  })

  it('exclui comunidade ao confirmar exclusão', async () => {
    const user = userEvent.setup()
    getCommunities.mockResolvedValue([{ id: '1', nome: 'Cafe Bugado' }])
    deleteCommunity.mockResolvedValue(true)

    render(<CommunityAdmin showNotification={showNotification} />)

    await waitFor(() => expect(screen.getByText('Cafe Bugado')).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: 'Excluir comunidade' }))

    const botoesExcluir = screen.getAllByRole('button', { name: /excluir/i })
    await user.click(botoesExcluir[botoesExcluir.length - 1])

    await waitFor(() => {
      expect(deleteCommunity).toHaveBeenCalledWith('1')
      expect(showNotification).toHaveBeenCalledWith('Comunidade excluída com sucesso!', 'success')
    })

    expect(screen.getByText('Nenhuma comunidade cadastrada')).toBeInTheDocument()
  })

  it('exibe erro ao falhar na exclusão', async () => {
    const user = userEvent.setup()
    getCommunities.mockResolvedValue([{ id: '1', nome: 'Cafe Bugado' }])
    deleteCommunity.mockRejectedValue(new Error('DB error'))

    render(<CommunityAdmin showNotification={showNotification} />)

    await waitFor(() => expect(screen.getByText('Cafe Bugado')).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: 'Excluir comunidade' }))

    const botoesExcluir = screen.getAllByRole('button', { name: /excluir/i })
    await user.click(botoesExcluir[botoesExcluir.length - 1])

    await waitFor(() => {
      expect(showNotification).toHaveBeenCalledWith('Erro ao excluir comunidade.', 'error')
    })

    expect(screen.getByText('Cafe Bugado')).toBeInTheDocument()
  })

  it('cancela exclusão ao clicar em Cancelar no modal de confirmação', async () => {
    const user = userEvent.setup()
    getCommunities.mockResolvedValue([{ id: '1', nome: 'Cafe Bugado' }])

    render(<CommunityAdmin showNotification={showNotification} />)

    await waitFor(() => expect(screen.getByText('Cafe Bugado')).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: 'Excluir comunidade' }))
    await user.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(screen.queryByText('Excluir Comunidade')).not.toBeInTheDocument()
    expect(screen.getByText('Cafe Bugado')).toBeInTheDocument()
  })
})
