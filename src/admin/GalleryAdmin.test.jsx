import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import GalleryAdmin from './GalleryAdmin'

const showNotification = vi.fn()

const EVENTOS_MOCK = [
  { id: '1', nome: 'DevFest Goiânia 2024', data_evento: '15/11/2024', community: '' },
  { id: '2', nome: 'Cafe Bugado Meetup #12', data_evento: '23/10/2024', community: '' },
]

describe('GalleryAdmin', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renderiza estado vazio com botão de criar álbum', () => {
    render(<GalleryAdmin showNotification={showNotification} eventos={[]} />)

    expect(screen.getByText('Galeria de Fotos')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Novo Álbum' })).toBeInTheDocument()
    expect(screen.getByText('Nenhum álbum cadastrado')).toBeInTheDocument()
  })

  it('abre modal ao clicar em Novo Álbum', async () => {
    const user = userEvent.setup()
    render(<GalleryAdmin showNotification={showNotification} eventos={EVENTOS_MOCK} />)

    await user.click(screen.getByRole('button', { name: 'Novo Álbum' }))

    expect(screen.getByText('Novo Álbum de Fotos')).toBeInTheDocument()
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('lista os eventos cadastrados no select do modal', async () => {
    const user = userEvent.setup()
    render(<GalleryAdmin showNotification={showNotification} eventos={EVENTOS_MOCK} />)

    await user.click(screen.getByRole('button', { name: 'Novo Álbum' }))

    const select = screen.getByRole('combobox')
    expect(select).toContainHTML('DevFest Goiânia 2024')
    expect(select).toContainHTML('Cafe Bugado Meetup #12')
  })

  it('fecha o modal ao clicar em Cancelar', async () => {
    const user = userEvent.setup()
    render(<GalleryAdmin showNotification={showNotification} eventos={EVENTOS_MOCK} />)

    await user.click(screen.getByRole('button', { name: 'Novo Álbum' }))
    await user.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(screen.queryByText('Novo Álbum de Fotos')).not.toBeInTheDocument()
  })

  it('cria álbum ao preencher o form e submeter', async () => {
    const user = userEvent.setup()
    render(<GalleryAdmin showNotification={showNotification} eventos={EVENTOS_MOCK} />)

    await user.click(screen.getByRole('button', { name: 'Novo Álbum' }))

    await user.selectOptions(screen.getByRole('combobox'), '1')
    await user.type(screen.getByPlaceholderText('Ex: Cafe Bugado'), 'Cafe Bugado')
    await user.click(screen.getByRole('button', { name: 'Criar Álbum' }))

    await waitFor(() => {
      expect(showNotification).toHaveBeenCalledWith('Álbum criado com sucesso!', 'success')
    })
    expect(screen.getByText('DevFest Goiânia 2024')).toBeInTheDocument()
  })

  it('mostra erro de validação ao submeter sem selecionar evento', async () => {
    const user = userEvent.setup()
    render(<GalleryAdmin showNotification={showNotification} eventos={EVENTOS_MOCK} />)

    await user.click(screen.getByRole('button', { name: 'Novo Álbum' }))
    await user.click(screen.getByRole('button', { name: 'Criar Álbum' }))

    expect(await screen.findByText('Selecione um evento')).toBeInTheDocument()
  })

  it('abre modal de edição ao clicar em editar álbum', async () => {
    const user = userEvent.setup()
    render(<GalleryAdmin showNotification={showNotification} eventos={EVENTOS_MOCK} />)

    // Criar álbum primeiro
    await user.click(screen.getByRole('button', { name: 'Novo Álbum' }))
    await user.selectOptions(screen.getByRole('combobox'), '1')
    await user.type(screen.getByPlaceholderText('Ex: Cafe Bugado'), 'Cafe Bugado')
    await user.click(screen.getByRole('button', { name: 'Criar Álbum' }))

    await waitFor(() => expect(showNotification).toHaveBeenCalled())

    // Editar
    await user.click(screen.getByRole('button', { name: 'Editar álbum' }))
    expect(screen.getByText('Editar Álbum')).toBeInTheDocument()
  })

  it('abre modal de confirmação ao clicar em excluir', async () => {
    const user = userEvent.setup()
    render(<GalleryAdmin showNotification={showNotification} eventos={EVENTOS_MOCK} />)

    await user.click(screen.getByRole('button', { name: 'Novo Álbum' }))
    await user.selectOptions(screen.getByRole('combobox'), '1')
    await user.type(screen.getByPlaceholderText('Ex: Cafe Bugado'), 'Cafe Bugado')
    await user.click(screen.getByRole('button', { name: 'Criar Álbum' }))

    await waitFor(() => expect(showNotification).toHaveBeenCalled())

    await user.click(screen.getByRole('button', { name: 'Excluir álbum' }))
    expect(screen.getByRole('heading', { name: 'Excluir Álbum' })).toBeInTheDocument()
    expect(screen.getByRole('strong')).toHaveTextContent('DevFest Goiânia 2024')
  })

  it('exclui álbum ao confirmar exclusão', async () => {
    const user = userEvent.setup()
    render(<GalleryAdmin showNotification={showNotification} eventos={EVENTOS_MOCK} />)

    await user.click(screen.getByRole('button', { name: 'Novo Álbum' }))
    await user.selectOptions(screen.getByRole('combobox'), '1')
    await user.type(screen.getByPlaceholderText('Ex: Cafe Bugado'), 'Cafe Bugado')
    await user.click(screen.getByRole('button', { name: 'Criar Álbum' }))

    await waitFor(() => expect(showNotification).toHaveBeenCalledTimes(1))

    await user.click(screen.getByRole('button', { name: 'Excluir álbum' }))
    const botoesExcluir = screen.getAllByRole('button', { name: /excluir/i })
    await user.click(botoesExcluir[botoesExcluir.length - 1])

    await waitFor(() => {
      expect(showNotification).toHaveBeenCalledWith('Álbum excluído com sucesso!', 'success')
    })
    expect(screen.getByText('Nenhum álbum cadastrado')).toBeInTheDocument()
  })

  it('cancela exclusão ao clicar em Cancelar no modal de confirmação', async () => {
    const user = userEvent.setup()
    render(<GalleryAdmin showNotification={showNotification} eventos={EVENTOS_MOCK} />)

    await user.click(screen.getByRole('button', { name: 'Novo Álbum' }))
    await user.selectOptions(screen.getByRole('combobox'), '1')
    await user.type(screen.getByPlaceholderText('Ex: Cafe Bugado'), 'Cafe Bugado')
    await user.click(screen.getByRole('button', { name: 'Criar Álbum' }))

    await waitFor(() => expect(showNotification).toHaveBeenCalledTimes(1))

    await user.click(screen.getByRole('button', { name: 'Excluir álbum' }))
    await user.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(screen.queryByText('Excluir Álbum')).not.toBeInTheDocument()
    expect(screen.getByText('DevFest Goiânia 2024')).toBeInTheDocument()
  })
})

describe('GalleryAdmin — PhotoForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  async function abrirModal(user) {
    render(<GalleryAdmin showNotification={showNotification} eventos={EVENTOS_MOCK} />)
    await user.click(screen.getByRole('button', { name: 'Novo Álbum' }))
  }

  it('exibe área de upload e campo de URL no formulário de fotos', async () => {
    const user = userEvent.setup()
    await abrirModal(user)

    expect(screen.getByText('Clique para fazer upload')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('https://...')).toBeInTheDocument()
  })

  it('mostra erro ao tentar adicionar foto sem imagem', async () => {
    const user = userEvent.setup()
    await abrirModal(user)

    await user.click(screen.getByRole('button', { name: /adicionar foto/i }))

    expect(
      await screen.findByText('Selecione um arquivo ou informe a URL da foto.')
    ).toBeInTheDocument()
  })

  it('mostra preview e adiciona foto via URL', async () => {
    const user = userEvent.setup()
    await abrirModal(user)

    const urlInput = screen.getByPlaceholderText('https://...')
    await user.type(urlInput, 'https://example.com/foto.jpg')

    await user.click(screen.getByRole('button', { name: /adicionar foto/i }))

    await waitFor(() => {
      expect(screen.getByText('Fotos (1)')).toBeInTheDocument()
    })
  })

  it('limpa preview ao clicar no botão de remover imagem', async () => {
    const user = userEvent.setup()
    await abrirModal(user)

    await user.type(screen.getByPlaceholderText('https://...'), 'https://example.com/foto.jpg')

    const previewImg = screen.getByAltText('Preview')
    expect(previewImg).toBeInTheDocument()

    const removeBtnEl = previewImg.parentElement.querySelector('.remove-image')
    await user.click(removeBtnEl)

    expect(screen.queryByAltText('Preview')).not.toBeInTheDocument()
    expect(screen.getByText('Clique para fazer upload')).toBeInTheDocument()
  })
})
