import { describe, it, expect, vi, beforeEach } from 'vitest'
import { supabase } from '../lib/supabase'
import {
  getCommunities,
  createCommunity,
  updateCommunity,
  deleteCommunity,
} from './communityService'

describe('communityService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getCommunities', () => {
    it('deve buscar todas as comunidades ordenadas por nome', async () => {
      const mockData = [
        { id: '1', nome: 'Cafe Bugado' },
        { id: '2', nome: 'Meet Up Tech SP' },
      ]

      const mockChain = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockData, error: null }),
      }

      supabase.from.mockReturnValue(mockChain)

      const result = await getCommunities()

      expect(supabase.from).toHaveBeenCalledWith('comunidades')
      expect(mockChain.select).toHaveBeenCalledWith('*')
      expect(mockChain.order).toHaveBeenCalledWith('nome', { ascending: true })
      expect(result).toEqual(mockData)
    })

    it('deve lançar erro quando a busca falha', async () => {
      const mockError = new Error('Database error')

      const mockChain = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      }

      supabase.from.mockReturnValue(mockChain)

      await expect(getCommunities()).rejects.toThrow('Database error')
    })
  })

  describe('createCommunity', () => {
    it('deve criar uma comunidade e retornar o registro criado', async () => {
      const mockCommunity = { id: '1', nome: 'Cafe Bugado' }

      const mockChain = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockCommunity, error: null }),
      }

      supabase.from.mockReturnValue(mockChain)

      const result = await createCommunity({ nome: 'Cafe Bugado' })

      expect(supabase.from).toHaveBeenCalledWith('comunidades')
      expect(mockChain.insert).toHaveBeenCalledWith([{ nome: 'Cafe Bugado' }])
      expect(result).toEqual(mockCommunity)
    })

    it('deve lançar erro quando a criação falha', async () => {
      const mockError = new Error('Insert error')

      const mockChain = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      }

      supabase.from.mockReturnValue(mockChain)

      await expect(createCommunity({ nome: 'Cafe Bugado' })).rejects.toThrow('Insert error')
    })
  })

  describe('updateCommunity', () => {
    it('deve atualizar uma comunidade e retornar o registro atualizado', async () => {
      const mockUpdated = { id: '1', nome: 'Meet Up Tech SP' }

      const mockChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockUpdated, error: null }),
      }

      supabase.from.mockReturnValue(mockChain)

      const result = await updateCommunity('1', { nome: 'Meet Up Tech SP' })

      expect(supabase.from).toHaveBeenCalledWith('comunidades')
      expect(mockChain.update).toHaveBeenCalledWith({ nome: 'Meet Up Tech SP' })
      expect(mockChain.eq).toHaveBeenCalledWith('id', '1')
      expect(result).toEqual(mockUpdated)
    })

    it('deve lançar erro quando a atualização falha', async () => {
      const mockError = new Error('Update error')

      const mockChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      }

      supabase.from.mockReturnValue(mockChain)

      await expect(updateCommunity('1', { nome: 'Meet Up Tech SP' })).rejects.toThrow(
        'Update error'
      )
    })
  })

  describe('deleteCommunity', () => {
    it('deve deletar uma comunidade e retornar true', async () => {
      const mockChain = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      }

      supabase.from.mockReturnValue(mockChain)

      const result = await deleteCommunity('1')

      expect(supabase.from).toHaveBeenCalledWith('comunidades')
      expect(mockChain.delete).toHaveBeenCalled()
      expect(mockChain.eq).toHaveBeenCalledWith('id', '1')
      expect(result).toBe(true)
    })

    it('deve lançar erro quando a exclusão falha', async () => {
      const mockError = new Error('Delete error')

      const mockChain = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: mockError }),
      }

      supabase.from.mockReturnValue(mockChain)

      await expect(deleteCommunity('1')).rejects.toThrow('Delete error')
    })
  })
})
