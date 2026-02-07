import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import About from './About'
import { renderWithRouter } from '../test/utils'

// Mock do contributorService
vi.mock('../services/contributorService', () => ({
  getContributors: vi.fn(),
}))

import { getContributors } from '../services/contributorService'

const mockContributors = [
  {
    id: '1',
    github_username: 'alice',
    nome: 'Alice Silva',
    avatar_url: 'https://avatars.githubusercontent.com/u/123',
    github_url: 'https://github.com/alice',
    linkedin_url: 'https://linkedin.com/in/alice',
    portfolio_url: 'https://alice.dev',
  },
  {
    id: '2',
    github_username: 'bob',
    nome: 'Bob Santos',
    avatar_url: 'https://avatars.githubusercontent.com/u/456',
    github_url: 'https://github.com/bob',
    linkedin_url: null,
    portfolio_url: null,
  },
]

describe('About', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve renderizar o conteúdo principal da página Sobre', async () => {
    getContributors.mockResolvedValue([])

    renderWithRouter(<About />)

    expect(screen.getByText(/Um jeito mais simples de descobrir/i)).toBeInTheDocument()
    expect(screen.getByText(/Curadoria Especializada/i)).toBeInTheDocument()
    expect(screen.getByText(/Atualização em Tempo Real/i)).toBeInTheDocument()
    expect(screen.getByText(/Diversidade de Categorias/i)).toBeInTheDocument()
    expect(screen.getByText(/Comunidade Ativa/i)).toBeInTheDocument()
  })

  it('deve renderizar a seção de contribuintes', async () => {
    getContributors.mockResolvedValue([])

    renderWithRouter(<About />)

    expect(screen.getByText(/Quem mantém este/i)).toBeInTheDocument()
    expect(screen.getByText(/Este projeto é feito pela comunidade/i)).toBeInTheDocument()
  })

  it('deve exibir contribuintes quando carregados com sucesso', async () => {
    getContributors.mockResolvedValue(mockContributors)

    renderWithRouter(<About />)

    await waitFor(() => {
      expect(screen.getByText('Alice Silva')).toBeInTheDocument()
      expect(screen.getByText('Bob Santos')).toBeInTheDocument()
    })
  })

  it('deve exibir links do GitHub para todos os contribuintes', async () => {
    getContributors.mockResolvedValue(mockContributors)

    renderWithRouter(<About />)

    await waitFor(() => {
      const githubLinks = screen.getAllByTitle(/GitHub de/i)
      expect(githubLinks).toHaveLength(2)
    })
  })

  it('deve exibir link do LinkedIn apenas quando disponível', async () => {
    getContributors.mockResolvedValue(mockContributors)

    renderWithRouter(<About />)

    await waitFor(() => {
      const linkedinLinks = screen.getAllByTitle(/LinkedIn de/i)
      // Apenas Alice tem LinkedIn
      expect(linkedinLinks).toHaveLength(1)
      expect(linkedinLinks[0]).toHaveAttribute('href', 'https://linkedin.com/in/alice')
    })
  })

  it('deve exibir link do Portfólio apenas quando disponível', async () => {
    getContributors.mockResolvedValue(mockContributors)

    renderWithRouter(<About />)

    await waitFor(() => {
      const portfolioLinks = screen.getAllByTitle(/Portfólio de/i)
      // Apenas Alice tem portfólio
      expect(portfolioLinks).toHaveLength(1)
      expect(portfolioLinks[0]).toHaveAttribute('href', 'https://alice.dev')
    })
  })

  it('deve exibir mensagem quando não há contribuintes', async () => {
    getContributors.mockResolvedValue([])

    renderWithRouter(<About />)

    await waitFor(() => {
      expect(screen.getByText(/Nenhum contribuinte cadastrado ainda/i)).toBeInTheDocument()
    })
  })

  it('deve tratar erro ao carregar contribuintes', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    getContributors.mockRejectedValue(new Error('Erro de rede'))

    renderWithRouter(<About />)

    await waitFor(() => {
      expect(screen.getByText(/Nenhum contribuinte cadastrado ainda/i)).toBeInTheDocument()
    })

    consoleSpy.mockRestore()
  })

  it('deve exibir imagens dos contribuintes com atributo alt correto', async () => {
    getContributors.mockResolvedValue(mockContributors)

    renderWithRouter(<About />)

    await waitFor(() => {
      const aliceImg = screen.getByAltText('Alice Silva')
      expect(aliceImg).toBeInTheDocument()
      expect(aliceImg).toHaveAttribute('src', 'https://avatars.githubusercontent.com/u/123')

      const bobImg = screen.getByAltText('Bob Santos')
      expect(bobImg).toBeInTheDocument()
    })
  })
})
