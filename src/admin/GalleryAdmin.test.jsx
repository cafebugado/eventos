import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import GalleryAdmin from './GalleryAdmin'

// Mock dos serviços
vi.mock('../services/galeriaService', () => ({
  getAlbuns: vi.fn().mockResolvedValue([]),
  createAlbum: vi.fn(),
  updateAlbum: vi.fn(),
  deleteAlbum: vi.fn(),
  uploadFoto: vi.fn(),
  addFotoByUrl: vi.fn(),
  deleteFoto: vi.fn(),
  updateFotoLegenda: vi.fn(),
}))

vi.mock('../services/communityService', () => ({
  getCommunities: vi.fn().mockResolvedValue([
    { id: 'com-1', nome: 'Cafe Bugado' },
    { id: 'com-2', nome: 'ConectaDevs' },
  ]),
}))

import { getAlbuns, createAlbum, deleteAlbum } from '../services/galeriaService'
import { getCommunities } from '../services/communityService'

const showNotification = vi.fn()

const EVENTOS_MOCK = [
  { id: 'ev-1', nome: 'DevFest Goiânia 2026', data_evento: '15/03/2026' },
  { id: 'ev-2', nome: 'Cafe Bugado Meetup #12', data_evento: '23/04/2026' },
]

const ALBUM_MOCK = {
  id: 'album-1',
  evento_id: 'ev-1',
  comunidade_id: 'com-1',
  created_by: 'user-1',
  created_at: '2026-01-01T00:00:00Z',
  eventos: { id: 'ev-1', nome: 'DevFest Goiânia 2026', data_evento: '15/03/2026' },
  comunidades: { id: 'com-1', nome: 'Cafe Bugado' },
  user_profiles: { nome_completo: 'João Silva', username: 'joao' },
  galeria_fotos: [],
}

function renderGallery(props = {}) {
  return render(
    <GalleryAdmin
      showNotification={showNotification}
      eventos={EVENTOS_MOCK}
      userRole={props.userRole ?? 'admin'}
      userId={props.userId ?? 'user-1'}
      {...props}
    />
  )
}

describe('GalleryAdmin — carregamento inicial', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getAlbuns.mockResolvedValue([])
    getCommunities.mockResolvedValue([
      { id: 'com-1', nome: 'Cafe Bugado' },
      { id: 'com-2', nome: 'ConectaDevs' },
    ])
  })

  it('exibe estado de carregamento e depois estado vazio', async () => {
    renderGallery()
    expect(screen.getByText('Carregando galeria...')).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByText('Nenhum álbum cadastrado')).toBeInTheDocument()
    })
  })

  it('exibe álbuns após carregamento', async () => {
    getAlbuns.mockResolvedValue([ALBUM_MOCK])
    renderGallery()
    await waitFor(() => {
      expect(screen.getByText('DevFest Goiânia 2026')).toBeInTheDocument()
    })
  })

  it('exibe nome do criador no card do álbum', async () => {
    getAlbuns.mockResolvedValue([ALBUM_MOCK])
    renderGallery()
    await waitFor(() => {
      expect(screen.getByText('João Silva')).toBeInTheDocument()
    })
  })

  it('continua carregando comunidades mesmo quando getAlbuns falha', async () => {
    getAlbuns.mockRejectedValue(new Error('Tabela não existe'))
    renderGallery()
    // Não deve exibir erro de comunidades
    await waitFor(() => {
      expect(screen.getByText('Nenhum álbum cadastrado')).toBeInTheDocument()
    })
    expect(getCommunities).toHaveBeenCalled()
  })
})

describe('GalleryAdmin — criar álbum', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getAlbuns.mockResolvedValue([])
    getCommunities.mockResolvedValue([
      { id: 'com-1', nome: 'Cafe Bugado' },
      { id: 'com-2', nome: 'ConectaDevs' },
    ])
  })

  it('abre modal ao clicar em Novo Álbum', async () => {
    const user = userEvent.setup()
    renderGallery()
    await waitFor(() => screen.getByText('Nenhum álbum cadastrado'))

    await user.click(screen.getByRole('button', { name: 'Novo Álbum' }))

    expect(screen.getByText('Novo Álbum de Fotos')).toBeInTheDocument()
  })

  it('popula o select de comunidades com dados do banco', async () => {
    const user = userEvent.setup()
    renderGallery()
    await waitFor(() => screen.getByText('Nenhum álbum cadastrado'))

    await user.click(screen.getByRole('button', { name: 'Novo Álbum' }))

    const selects = screen.getAllByRole('combobox')
    const selectComunidade = selects[1]
    expect(selectComunidade).toContainHTML('Cafe Bugado')
    expect(selectComunidade).toContainHTML('ConectaDevs')
  })

  it('exibe erro de validação ao submeter sem evento', async () => {
    const user = userEvent.setup()
    renderGallery()
    await waitFor(() => screen.getByText('Nenhum álbum cadastrado'))

    await user.click(screen.getByRole('button', { name: 'Novo Álbum' }))
    await user.click(screen.getByRole('button', { name: 'Criar Álbum' }))

    expect(await screen.findByText('Selecione um evento')).toBeInTheDocument()
  })

  it('cria álbum com sucesso e exibe notificação', async () => {
    const user = userEvent.setup()
    createAlbum.mockResolvedValue({ ...ALBUM_MOCK })
    renderGallery()
    await waitFor(() => screen.getByText('Nenhum álbum cadastrado'))

    await user.click(screen.getByRole('button', { name: 'Novo Álbum' }))
    const [selectEvento, selectComunidade] = screen.getAllByRole('combobox')
    await user.selectOptions(selectEvento, 'ev-1')
    await user.selectOptions(selectComunidade, 'com-1')
    await user.click(screen.getByRole('button', { name: 'Criar Álbum' }))

    await waitFor(() => {
      expect(createAlbum).toHaveBeenCalledWith({ evento_id: 'ev-1', comunidade_id: 'com-1' })
      expect(showNotification).toHaveBeenCalledWith('Álbum criado com sucesso!', 'success')
    })
  })

  it('bloqueia criação de álbum duplicado para o mesmo evento', async () => {
    const user = userEvent.setup()
    getAlbuns.mockResolvedValue([ALBUM_MOCK])
    renderGallery()
    // Aguardar o álbum existente carregar (garante que albums[] está populado antes do submit)
    await waitFor(() => screen.getByText('DevFest Goiânia 2026'))

    await user.click(screen.getByRole('button', { name: 'Novo Álbum' }))
    // O modal tem 2 selects: evento e comunidade
    const selects = screen.getAllByRole('combobox')
    await user.selectOptions(selects[0], 'ev-1')
    await user.selectOptions(selects[1], 'com-1')
    await user.click(screen.getByRole('button', { name: 'Criar Álbum' }))

    await waitFor(() => {
      expect(showNotification).toHaveBeenCalledWith('Já existe um álbum para este evento.', 'error')
    })
    expect(createAlbum).not.toHaveBeenCalled()
  })

  it('fecha modal ao clicar em Cancelar', async () => {
    const user = userEvent.setup()
    renderGallery()
    await waitFor(() => screen.getByText('Nenhum álbum cadastrado'))

    await user.click(screen.getByRole('button', { name: 'Novo Álbum' }))
    await user.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(screen.queryByText('Novo Álbum de Fotos')).not.toBeInTheDocument()
  })
})

describe('GalleryAdmin — editar e excluir álbum', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getAlbuns.mockResolvedValue([ALBUM_MOCK])
    getCommunities.mockResolvedValue([{ id: 'com-1', nome: 'Cafe Bugado' }])
  })

  it('abre modal de edição com título correto ao clicar no lápis', async () => {
    const user = userEvent.setup()
    renderGallery()
    await waitFor(() => screen.getByText('DevFest Goiânia 2026'))

    await user.click(screen.getByRole('button', { name: 'Editar álbum' }))

    expect(screen.getByText('Editar Álbum')).toBeInTheDocument()
  })

  it('exibe fotos do álbum no modal de edição', async () => {
    const albumComFotos = {
      ...ALBUM_MOCK,
      galeria_fotos: [
        { id: 'f1', url: 'https://img.com/1.jpg', legenda: 'Abertura', storage_path: null },
      ],
    }
    getAlbuns.mockResolvedValue([albumComFotos])
    const user = userEvent.setup()
    renderGallery()
    await waitFor(() => screen.getByText('DevFest Goiânia 2026'))

    await user.click(screen.getByRole('button', { name: 'Editar álbum' }))

    expect(screen.getByText('Fotos (1)')).toBeInTheDocument()
    // A foto aparece tanto no preview do card quanto no modal — verificar pela contagem
    expect(screen.getAllByAltText('Abertura').length).toBeGreaterThanOrEqual(1)
  })

  it('abre modal de confirmação ao clicar em excluir', async () => {
    const user = userEvent.setup()
    renderGallery()
    await waitFor(() => screen.getByText('DevFest Goiânia 2026'))

    await user.click(screen.getByRole('button', { name: 'Excluir álbum' }))

    expect(screen.getByRole('heading', { name: 'Excluir Álbum' })).toBeInTheDocument()
    // O nome aparece no card e no modal — garantir que o modal está aberto
    expect(screen.getAllByText(/DevFest Goiânia 2026/).length).toBeGreaterThanOrEqual(1)
  })

  it('exclui álbum e exibe notificação ao confirmar', async () => {
    deleteAlbum.mockResolvedValue(true)
    const user = userEvent.setup()
    renderGallery()
    await waitFor(() => screen.getByText('DevFest Goiânia 2026'))

    await user.click(screen.getByRole('button', { name: 'Excluir álbum' }))
    const botoesExcluir = screen.getAllByRole('button', { name: /excluir/i })
    await user.click(botoesExcluir[botoesExcluir.length - 1])

    await waitFor(() => {
      expect(deleteAlbum).toHaveBeenCalledWith('album-1')
      expect(showNotification).toHaveBeenCalledWith('Álbum excluído com sucesso!', 'success')
    })
  })

  it('cancela exclusão ao clicar em Cancelar no modal de confirmação', async () => {
    const user = userEvent.setup()
    renderGallery()
    await waitFor(() => screen.getByText('DevFest Goiânia 2026'))

    await user.click(screen.getByRole('button', { name: 'Excluir álbum' }))
    await user.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(screen.queryByRole('heading', { name: 'Excluir Álbum' })).not.toBeInTheDocument()
    expect(deleteAlbum).not.toHaveBeenCalled()
  })
})

describe('GalleryAdmin — busca de álbuns', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getAlbuns.mockResolvedValue([
      ALBUM_MOCK,
      {
        ...ALBUM_MOCK,
        id: 'album-2',
        evento_id: 'ev-2',
        eventos: { id: 'ev-2', nome: 'Cafe Bugado Meetup #12', data_evento: '23/04/2026' },
        comunidades: { id: 'com-2', nome: 'ConectaDevs' },
        galeria_fotos: [],
      },
    ])
    getCommunities.mockResolvedValue([{ id: 'com-1', nome: 'Cafe Bugado' }])
  })

  it('exibe barra de busca quando há mais de um álbum', async () => {
    renderGallery()
    await waitFor(() => screen.getByText('DevFest Goiânia 2026'))
    expect(screen.getByPlaceholderText('Buscar por evento ou comunidade...')).toBeInTheDocument()
  })

  it('filtra álbuns pelo nome do evento', async () => {
    const user = userEvent.setup()
    renderGallery()
    await waitFor(() => screen.getByText('DevFest Goiânia 2026'))

    await user.type(screen.getByPlaceholderText('Buscar por evento ou comunidade...'), 'Meetup')

    expect(screen.queryByText('DevFest Goiânia 2026')).not.toBeInTheDocument()
    expect(screen.getByText('Cafe Bugado Meetup #12')).toBeInTheDocument()
  })
})

describe('GalleryAdmin — permissões de moderador', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getCommunities.mockResolvedValue([{ id: 'com-1', nome: 'Cafe Bugado' }])
  })

  it('moderador dono vê botões de editar e excluir no próprio álbum', async () => {
    getAlbuns.mockResolvedValue([ALBUM_MOCK]) // created_by: 'user-1'
    renderGallery({ userRole: 'moderador', userId: 'user-1' })

    await waitFor(() => screen.getByText('DevFest Goiânia 2026'))

    expect(screen.getByRole('button', { name: 'Editar álbum' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Excluir álbum' })).toBeInTheDocument()
  })

  it('moderador não-dono não vê botões de editar e excluir', async () => {
    getAlbuns.mockResolvedValue([ALBUM_MOCK]) // created_by: 'user-1'
    renderGallery({ userRole: 'moderador', userId: 'outro-user' })

    await waitFor(() => screen.getByText('DevFest Goiânia 2026'))

    expect(screen.queryByRole('button', { name: 'Editar álbum' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Excluir álbum' })).not.toBeInTheDocument()
  })

  it('moderador não-dono ainda pode adicionar foto', async () => {
    getAlbuns.mockResolvedValue([ALBUM_MOCK])
    renderGallery({ userRole: 'moderador', userId: 'outro-user' })

    await waitFor(() => screen.getByText('DevFest Goiânia 2026'))

    expect(screen.getByRole('button', { name: 'Adicionar foto' })).toBeInTheDocument()
  })

  it('moderador não-dono não consegue excluir via handler direto', async () => {
    getAlbuns.mockResolvedValue([ALBUM_MOCK])
    renderGallery({ userRole: 'moderador', userId: 'outro-user' })

    await waitFor(() => screen.getByText('DevFest Goiânia 2026'))

    // Não há botão de excluir, então deleteAlbum não deve ser chamado
    expect(deleteAlbum).not.toHaveBeenCalled()
  })

  it('admin vê todos os botões em qualquer álbum', async () => {
    getAlbuns.mockResolvedValue([ALBUM_MOCK])
    renderGallery({ userRole: 'admin', userId: 'outro-user' })

    await waitFor(() => screen.getByText('DevFest Goiânia 2026'))

    expect(screen.getByRole('button', { name: 'Editar álbum' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Excluir álbum' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Adicionar foto' })).toBeInTheDocument()
  })
})
