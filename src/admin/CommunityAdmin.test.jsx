import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CommunityAdmin from './CommunityAdmin'

const showNotification = vi.fn()

describe('CommunityAdmin', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renderiza estado vazio com botão de criar comunidade', () => {
    render(<CommunityAdmin showNotification={showNotification} />)

    expect(screen.getByText('Comunidades')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Nova Comunidade' })).toBeInTheDocument()
    expect(screen.getByText('Nenhuma comunidade cadastrada')).toBeInTheDocument()
  })

  it('abre modal ao clicar em Nova Comunidade', async () => {
    const user = userEvent.setup()
    render(<CommunityAdmin showNotification={showNotification} />)

    await user.click(screen.getByRole('button', { name: 'Nova Comunidade' }))

    expect(screen.getByRole('heading', { name: 'Nova Comunidade' })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Ex: Cafe Bugado')).toBeInTheDocument()
  })

  it('fecha modal ao clicar em Cancelar', async () => {
    const user = userEvent.setup()
    render(<CommunityAdmin showNotification={showNotification} />)

    await user.click(screen.getByRole('button', { name: 'Nova Comunidade' }))
    await user.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(screen.queryByPlaceholderText('Ex: Cafe Bugado')).not.toBeInTheDocument()
  })

  it('fecha modal ao clicar no X', async () => {
    const user = userEvent.setup()
    render(<CommunityAdmin showNotification={showNotification} />)

    await user.click(screen.getByRole('button', { name: 'Nova Comunidade' }))
    await user.click(screen.getByRole('button', { name: 'Fechar' }))

    expect(screen.queryByPlaceholderText('Ex: Cafe Bugado')).not.toBeInTheDocument()
  })

  it('mostra erro de validação ao submeter sem nome', async () => {
    const user = userEvent.setup()
    render(<CommunityAdmin showNotification={showNotification} />)

    await user.click(screen.getByRole('button', { name: 'Nova Comunidade' }))
    await user.click(screen.getByRole('button', { name: 'Criar' }))

    expect(await screen.findByText('Nome é obrigatório')).toBeInTheDocument()
  })

  it('cria comunidade ao preencher nome e submeter', async () => {
    const user = userEvent.setup()
    render(<CommunityAdmin showNotification={showNotification} />)

    await user.click(screen.getByRole('button', { name: 'Nova Comunidade' }))
    await user.type(screen.getByPlaceholderText('Ex: Cafe Bugado'), 'Cafe Bugado')
    await user.click(screen.getByRole('button', { name: 'Criar' }))

    await waitFor(() => {
      expect(showNotification).toHaveBeenCalledWith('Comunidade criada com sucesso!', 'success')
    })
    expect(screen.getByText('Cafe Bugado')).toBeInTheDocument()
  })

  it('exibe botões de editar e excluir para cada comunidade', async () => {
    const user = userEvent.setup()
    render(<CommunityAdmin showNotification={showNotification} />)

    await user.click(screen.getByRole('button', { name: 'Nova Comunidade' }))
    await user.type(screen.getByPlaceholderText('Ex: Cafe Bugado'), 'Cafe Bugado')
    await user.click(screen.getByRole('button', { name: 'Criar' }))

    await waitFor(() => expect(showNotification).toHaveBeenCalled())

    expect(screen.getByRole('button', { name: 'Editar comunidade' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Excluir comunidade' })).toBeInTheDocument()
  })

  it('abre modal de edição com nome preenchido ao clicar em editar', async () => {
    const user = userEvent.setup()
    render(<CommunityAdmin showNotification={showNotification} />)

    await user.click(screen.getByRole('button', { name: 'Nova Comunidade' }))
    await user.type(screen.getByPlaceholderText('Ex: Cafe Bugado'), 'Cafe Bugado')
    await user.click(screen.getByRole('button', { name: 'Criar' }))

    await waitFor(() => expect(showNotification).toHaveBeenCalled())

    await user.click(screen.getByRole('button', { name: 'Editar comunidade' }))

    expect(screen.getByText('Editar Comunidade')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Cafe Bugado')).toBeInTheDocument()
  })

  it('atualiza comunidade ao editar e salvar', async () => {
    const user = userEvent.setup()
    render(<CommunityAdmin showNotification={showNotification} />)

    await user.click(screen.getByRole('button', { name: 'Nova Comunidade' }))
    await user.type(screen.getByPlaceholderText('Ex: Cafe Bugado'), 'Cafe Bugado')
    await user.click(screen.getByRole('button', { name: 'Criar' }))

    await waitFor(() => expect(showNotification).toHaveBeenCalledTimes(1))

    await user.click(screen.getByRole('button', { name: 'Editar comunidade' }))

    const input = screen.getByDisplayValue('Cafe Bugado')
    await user.clear(input)
    await user.type(input, 'Meet Up Tech SP')
    await user.click(screen.getByRole('button', { name: 'Salvar' }))

    await waitFor(() => {
      expect(showNotification).toHaveBeenCalledWith('Comunidade atualizada com sucesso!', 'success')
    })
    expect(screen.getByText('Meet Up Tech SP')).toBeInTheDocument()
    expect(screen.queryByText('Cafe Bugado')).not.toBeInTheDocument()
  })

  it('abre modal de confirmação ao clicar em excluir', async () => {
    const user = userEvent.setup()
    render(<CommunityAdmin showNotification={showNotification} />)

    await user.click(screen.getByRole('button', { name: 'Nova Comunidade' }))
    await user.type(screen.getByPlaceholderText('Ex: Cafe Bugado'), 'Cafe Bugado')
    await user.click(screen.getByRole('button', { name: 'Criar' }))

    await waitFor(() => expect(showNotification).toHaveBeenCalled())

    await user.click(screen.getByRole('button', { name: 'Excluir comunidade' }))

    expect(screen.getByRole('heading', { name: 'Excluir Comunidade' })).toBeInTheDocument()
    expect(screen.getByRole('strong')).toHaveTextContent('Cafe Bugado')
  })

  it('exclui comunidade ao confirmar exclusão', async () => {
    const user = userEvent.setup()
    render(<CommunityAdmin showNotification={showNotification} />)

    await user.click(screen.getByRole('button', { name: 'Nova Comunidade' }))
    await user.type(screen.getByPlaceholderText('Ex: Cafe Bugado'), 'Cafe Bugado')
    await user.click(screen.getByRole('button', { name: 'Criar' }))

    await waitFor(() => expect(showNotification).toHaveBeenCalledTimes(1))

    await user.click(screen.getByRole('button', { name: 'Excluir comunidade' }))

    const botoesExcluir = screen.getAllByRole('button', { name: /excluir/i })
    await user.click(botoesExcluir[botoesExcluir.length - 1])

    await waitFor(() => {
      expect(showNotification).toHaveBeenCalledWith('Comunidade excluída com sucesso!', 'success')
    })
    expect(screen.getByText('Nenhuma comunidade cadastrada')).toBeInTheDocument()
  })

  it('cancela exclusão ao clicar em Cancelar no modal de confirmação', async () => {
    const user = userEvent.setup()
    render(<CommunityAdmin showNotification={showNotification} />)

    await user.click(screen.getByRole('button', { name: 'Nova Comunidade' }))
    await user.type(screen.getByPlaceholderText('Ex: Cafe Bugado'), 'Cafe Bugado')
    await user.click(screen.getByRole('button', { name: 'Criar' }))

    await waitFor(() => expect(showNotification).toHaveBeenCalledTimes(1))

    await user.click(screen.getByRole('button', { name: 'Excluir comunidade' }))
    await user.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(screen.queryByText('Excluir Comunidade')).not.toBeInTheDocument()
    expect(screen.getByText('Cafe Bugado')).toBeInTheDocument()
  })
})
