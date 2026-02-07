import { describe, it, expect, vi, beforeEach } from 'vitest'
import { http, HttpResponse } from 'msw'
import { supabase } from '../lib/supabase'
import { server } from '../test/mocks/server'
import {
  getContributors,
  getContributorById,
  createContributor,
  updateContributor,
  deleteContributor,
  fetchGitHubUser,
  isValidLinkedInUrl,
  isValidPortfolioUrl,
  isValidGitHubUsername,
} from './contributorService'

describe('contributorService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('fetchGitHubUser', () => {
    it('deve buscar dados do usuário do GitHub', async () => {
      server.use(
        http.get('https://api.github.com/users/:username', () => {
          return HttpResponse.json({
            login: 'octocat',
            name: 'The Octocat',
            avatar_url: 'https://avatars.githubusercontent.com/u/583231',
            html_url: 'https://github.com/octocat',
          })
        })
      )

      const result = await fetchGitHubUser('octocat')

      expect(result).toEqual({
        github_username: 'octocat',
        nome: 'The Octocat',
        avatar_url: 'https://avatars.githubusercontent.com/u/583231',
        github_url: 'https://github.com/octocat',
      })
    })

    it('deve usar login como nome quando name é null', async () => {
      server.use(
        http.get('https://api.github.com/users/:username', () => {
          return HttpResponse.json({
            login: 'octocat',
            name: null,
            avatar_url: 'https://avatars.githubusercontent.com/u/583231',
            html_url: 'https://github.com/octocat',
          })
        })
      )

      const result = await fetchGitHubUser('octocat')

      expect(result.nome).toBe('octocat')
    })

    it('deve lançar erro quando usuário não encontrado (404)', async () => {
      server.use(
        http.get('https://api.github.com/users/:username', () => {
          return new HttpResponse(null, { status: 404 })
        })
      )

      await expect(fetchGitHubUser('usuario-inexistente')).rejects.toThrow(
        'Usuário do GitHub não encontrado'
      )
    })

    it('deve lançar erro genérico para outros status', async () => {
      server.use(
        http.get('https://api.github.com/users/:username', () => {
          return new HttpResponse(null, { status: 500 })
        })
      )

      await expect(fetchGitHubUser('octocat')).rejects.toThrow('Erro ao buscar dados do GitHub')
    })
  })

  describe('getContributors', () => {
    it('deve buscar todos os contribuintes ordenados por nome', async () => {
      const mockContributors = [
        { id: '1', nome: 'Alice', github_username: 'alice' },
        { id: '2', nome: 'Bob', github_username: 'bob' },
      ]

      const mockChain = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockContributors, error: null }),
      }

      supabase.from.mockReturnValue(mockChain)

      const result = await getContributors()

      expect(supabase.from).toHaveBeenCalledWith('contribuintes')
      expect(mockChain.select).toHaveBeenCalledWith('*')
      expect(mockChain.order).toHaveBeenCalledWith('nome', { ascending: true })
      expect(result).toEqual(mockContributors)
    })

    it('deve lançar erro quando a busca falha', async () => {
      const mockError = new Error('Database error')

      const mockChain = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      }

      supabase.from.mockReturnValue(mockChain)

      await expect(getContributors()).rejects.toThrow('Database error')
    })
  })

  describe('getContributorById', () => {
    it('deve buscar contribuinte por ID', async () => {
      const mockContributor = { id: '1', nome: 'Alice', github_username: 'alice' }

      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockContributor, error: null }),
      }

      supabase.from.mockReturnValue(mockChain)

      const result = await getContributorById('1')

      expect(supabase.from).toHaveBeenCalledWith('contribuintes')
      expect(mockChain.eq).toHaveBeenCalledWith('id', '1')
      expect(result).toEqual(mockContributor)
    })

    it('deve lançar erro quando contribuinte não existe', async () => {
      const mockError = new Error('Not found')

      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      }

      supabase.from.mockReturnValue(mockChain)

      await expect(getContributorById('999')).rejects.toThrow('Not found')
    })
  })

  describe('createContributor', () => {
    it('deve criar novo contribuinte', async () => {
      const newContributor = {
        github_username: 'alice',
        nome: 'Alice Silva',
        avatar_url: 'https://avatars.githubusercontent.com/u/123',
        github_url: 'https://github.com/alice',
        linkedin_url: 'https://linkedin.com/in/alice',
        portfolio_url: 'https://alice.dev',
      }

      const createdContributor = { id: '1', ...newContributor }

      const mockChain = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: createdContributor, error: null }),
      }

      supabase.from.mockReturnValue(mockChain)

      const result = await createContributor(newContributor)

      expect(supabase.from).toHaveBeenCalledWith('contribuintes')
      expect(mockChain.insert).toHaveBeenCalledWith([
        {
          github_username: 'alice',
          nome: 'Alice Silva',
          avatar_url: 'https://avatars.githubusercontent.com/u/123',
          github_url: 'https://github.com/alice',
          linkedin_url: 'https://linkedin.com/in/alice',
          portfolio_url: 'https://alice.dev',
        },
      ])
      expect(result).toEqual(createdContributor)
    })

    it('deve criar contribuinte sem linkedin e portfolio', async () => {
      const newContributor = {
        github_username: 'bob',
        nome: 'Bob',
        avatar_url: 'https://avatars.githubusercontent.com/u/456',
        github_url: 'https://github.com/bob',
      }

      const createdContributor = {
        id: '2',
        ...newContributor,
        linkedin_url: null,
        portfolio_url: null,
      }

      const mockChain = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: createdContributor, error: null }),
      }

      supabase.from.mockReturnValue(mockChain)

      const result = await createContributor(newContributor)

      expect(mockChain.insert).toHaveBeenCalledWith([
        expect.objectContaining({ linkedin_url: null, portfolio_url: null }),
      ])
      expect(result).toEqual(createdContributor)
    })

    it('deve lançar erro para username duplicado', async () => {
      const mockError = { code: '23505', message: 'duplicate key' }

      const mockChain = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      }

      supabase.from.mockReturnValue(mockChain)

      await expect(createContributor({ github_username: 'alice' })).rejects.toThrow(
        'Este usuário do GitHub já está cadastrado como contribuinte'
      )
    })

    it('deve lançar erro genérico quando a criação falha', async () => {
      const mockError = new Error('Insert failed')

      const mockChain = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      }

      supabase.from.mockReturnValue(mockChain)

      await expect(createContributor({})).rejects.toThrow('Insert failed')
    })
  })

  describe('updateContributor', () => {
    it('deve atualizar contribuinte existente', async () => {
      const updatedData = {
        github_username: 'alice',
        nome: 'Alice Atualizada',
        avatar_url: 'https://avatars.githubusercontent.com/u/123',
        github_url: 'https://github.com/alice',
        linkedin_url: 'https://linkedin.com/in/alice-new',
      }

      const updatedContributor = { id: '1', ...updatedData }

      const mockChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: updatedContributor, error: null }),
      }

      supabase.from.mockReturnValue(mockChain)

      const result = await updateContributor('1', updatedData)

      expect(supabase.from).toHaveBeenCalledWith('contribuintes')
      expect(mockChain.update).toHaveBeenCalled()
      expect(mockChain.eq).toHaveBeenCalledWith('id', '1')
      expect(result).toEqual(updatedContributor)
    })

    it('deve lançar erro quando a atualização falha', async () => {
      const mockError = new Error('Update failed')

      const mockChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      }

      supabase.from.mockReturnValue(mockChain)

      await expect(updateContributor('1', {})).rejects.toThrow('Update failed')
    })
  })

  describe('deleteContributor', () => {
    it('deve deletar contribuinte', async () => {
      const mockChain = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      }

      supabase.from.mockReturnValue(mockChain)

      const result = await deleteContributor('1')

      expect(supabase.from).toHaveBeenCalledWith('contribuintes')
      expect(mockChain.delete).toHaveBeenCalled()
      expect(mockChain.eq).toHaveBeenCalledWith('id', '1')
      expect(result).toBe(true)
    })

    it('deve lançar erro quando a exclusão falha', async () => {
      const mockError = new Error('Delete failed')

      const mockChain = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: mockError }),
      }

      supabase.from.mockReturnValue(mockChain)

      await expect(deleteContributor('1')).rejects.toThrow('Delete failed')
    })
  })

  describe('isValidLinkedInUrl', () => {
    it('deve aceitar URL vazia ou null', () => {
      expect(isValidLinkedInUrl('')).toBe(true)
      expect(isValidLinkedInUrl(null)).toBe(true)
      expect(isValidLinkedInUrl(undefined)).toBe(true)
    })

    it('deve aceitar URLs válidas do LinkedIn', () => {
      expect(isValidLinkedInUrl('https://linkedin.com/in/alice')).toBe(true)
      expect(isValidLinkedInUrl('https://www.linkedin.com/in/bob-silva')).toBe(true)
      expect(isValidLinkedInUrl('https://linkedin.com/in/user123')).toBe(true)
      expect(isValidLinkedInUrl('https://linkedin.com/in/user-name/')).toBe(true)
    })

    it('deve rejeitar URLs inválidas do LinkedIn', () => {
      expect(isValidLinkedInUrl('https://linkedin.com/company/test')).toBe(false)
      expect(isValidLinkedInUrl('https://google.com')).toBe(false)
      expect(isValidLinkedInUrl('http://linkedin.com/in/alice')).toBe(false)
      expect(isValidLinkedInUrl('linkedin.com/in/alice')).toBe(false)
      expect(isValidLinkedInUrl('not-a-url')).toBe(false)
    })
  })

  describe('isValidPortfolioUrl', () => {
    it('deve aceitar URL vazia ou null', () => {
      expect(isValidPortfolioUrl('')).toBe(true)
      expect(isValidPortfolioUrl(null)).toBe(true)
      expect(isValidPortfolioUrl(undefined)).toBe(true)
    })

    it('deve aceitar URLs válidas de portfólio', () => {
      expect(isValidPortfolioUrl('https://meusite.com')).toBe(true)
      expect(isValidPortfolioUrl('https://www.portfolio.dev')).toBe(true)
      expect(isValidPortfolioUrl('http://localhost:3000')).toBe(true)
      expect(isValidPortfolioUrl('https://user.github.io')).toBe(true)
    })

    it('deve rejeitar URLs inválidas', () => {
      expect(isValidPortfolioUrl('not-a-url')).toBe(false)
      expect(isValidPortfolioUrl('ftp://files.com')).toBe(false)
      expect(isValidPortfolioUrl('meusite.com')).toBe(false)
    })
  })

  describe('isValidGitHubUsername', () => {
    it('deve rejeitar username vazio ou null', () => {
      expect(isValidGitHubUsername('')).toBe(false)
      expect(isValidGitHubUsername(null)).toBe(false)
      expect(isValidGitHubUsername(undefined)).toBe(false)
    })

    it('deve aceitar usernames válidos do GitHub', () => {
      expect(isValidGitHubUsername('octocat')).toBe(true)
      expect(isValidGitHubUsername('user-name')).toBe(true)
      expect(isValidGitHubUsername('user123')).toBe(true)
      expect(isValidGitHubUsername('a')).toBe(true)
    })

    it('deve rejeitar usernames inválidos do GitHub', () => {
      expect(isValidGitHubUsername('-invalid')).toBe(false)
      expect(isValidGitHubUsername('user--name')).toBe(false)
      expect(isValidGitHubUsername('user name')).toBe(false)
      expect(isValidGitHubUsername('a'.repeat(40))).toBe(false)
    })
  })
})
