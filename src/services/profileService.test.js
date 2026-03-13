import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getMyProfile, upsertMyProfile } from './profileService'

// Mock do supabase
vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(),
  },
}))

// Mock do apiClient (withRetry executa a função diretamente)
vi.mock('../lib/apiClient', () => ({
  withRetry: vi.fn((fn) => fn()),
}))

// Mock do sentry (usado internamente pelo apiClient)
vi.mock('../lib/sentry.js', () => ({
  captureError: vi.fn(),
}))

import { supabase } from '../lib/supabase'

const mockProfile = {
  user_id: 'user-123',
  nome: 'João',
  sobrenome: 'Silva',
  github_username: 'joaosilva',
  avatar_url: 'https://avatars.githubusercontent.com/u/123',
  updated_at: '2024-01-01T00:00:00Z',
}

const mockUser = { id: 'user-123', email: 'admin@teste.com' }

describe('profileService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    supabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
  })

  describe('getMyProfile', () => {
    it('deve retornar o perfil do usuário logado', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockProfile, error: null }),
      }
      supabase.from.mockReturnValue(mockQuery)

      const result = await getMyProfile()

      expect(supabase.from).toHaveBeenCalledWith('user_profiles')
      expect(mockQuery.eq).toHaveBeenCalledWith('user_id', 'user-123')
      expect(result).toEqual(mockProfile)
    })

    it('deve retornar null quando perfil não existe (PGRST116)', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
      }
      supabase.from.mockReturnValue(mockQuery)

      const result = await getMyProfile()

      expect(result).toBeNull()
    })

    it('deve retornar null quando usuário não está autenticado', async () => {
      supabase.auth.getUser.mockResolvedValue({ data: { user: null } })

      const result = await getMyProfile()

      expect(result).toBeNull()
      expect(supabase.from).not.toHaveBeenCalled()
    })

    it('deve lançar erro para falhas que não sejam PGRST116', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST500', message: 'Erro interno' },
        }),
      }
      supabase.from.mockReturnValue(mockQuery)

      await expect(getMyProfile()).rejects.toMatchObject({ code: 'PGRST500' })
    })
  })

  describe('upsertMyProfile', () => {
    it('deve salvar o perfil e retornar os dados salvos', async () => {
      const mockQuery = {
        upsert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockProfile, error: null }),
      }
      supabase.from.mockReturnValue(mockQuery)

      const input = {
        nome: 'João',
        sobrenome: 'Silva',
        github_username: 'joaosilva',
        avatar_url: 'https://avatars.githubusercontent.com/u/123',
      }

      const result = await upsertMyProfile(input)

      expect(supabase.from).toHaveBeenCalledWith('user_profiles')
      expect(mockQuery.upsert).toHaveBeenCalledWith(
        { user_id: 'user-123', ...input },
        { onConflict: 'user_id' }
      )
      expect(result).toEqual(mockProfile)
    })

    it('deve lançar erro quando usuário não está autenticado', async () => {
      supabase.auth.getUser.mockResolvedValue({ data: { user: null } })

      await expect(
        upsertMyProfile({ nome: 'João', sobrenome: '', github_username: null, avatar_url: null })
      ).rejects.toThrow('Usuário não autenticado')
    })

    it('deve lançar erro quando o banco retorna erro', async () => {
      const mockQuery = {
        upsert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'violação de constraint' },
        }),
      }
      supabase.from.mockReturnValue(mockQuery)

      await expect(
        upsertMyProfile({ nome: 'João', sobrenome: '', github_username: null, avatar_url: null })
      ).rejects.toMatchObject({ message: 'violação de constraint' })
    })

    it('deve salvar com github_username nulo quando não informado', async () => {
      const profileSemGitHub = { ...mockProfile, github_username: null, avatar_url: null }
      const mockQuery = {
        upsert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: profileSemGitHub, error: null }),
      }
      supabase.from.mockReturnValue(mockQuery)

      const result = await upsertMyProfile({
        nome: 'João',
        sobrenome: 'Silva',
        github_username: null,
        avatar_url: null,
      })

      expect(mockQuery.upsert).toHaveBeenCalledWith(
        expect.objectContaining({ github_username: null, avatar_url: null }),
        { onConflict: 'user_id' }
      )
      expect(result.github_username).toBeNull()
    })
  })
})
