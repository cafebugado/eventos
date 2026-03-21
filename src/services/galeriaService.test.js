import { describe, it, expect, vi, beforeEach } from 'vitest'
import { supabase } from '../lib/supabase'
import {
  getAlbuns,
  createAlbum,
  updateAlbum,
  deleteAlbum,
  uploadFoto,
  addFotoByUrl,
  deleteFoto,
  updateFotoLegenda,
} from './galeriaService'

const ALBUM_BASE = {
  id: 'album-1',
  evento_id: 'ev-1',
  comunidade_id: 'com-1',
  created_by: 'user-1',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  eventos: { id: 'ev-1', nome: 'DevFest 2026', data_evento: '01/01/2026' },
  comunidades: { id: 'com-1', nome: 'Cafe Bugado' },
  galeria_fotos: [],
}

describe('galeriaService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ── getAlbuns ──────────────────────────────────────────────────────────────

  describe('getAlbuns', () => {
    it('deve buscar álbuns e retornar com user_profiles mapeados', async () => {
      const mockAlbuns = [{ ...ALBUM_BASE }]
      const mockProfiles = [{ user_id: 'user-1', nome_completo: 'João', username: 'joao' }]

      const albumChain = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockAlbuns, error: null }),
      }
      const profileChain = {
        select: vi.fn().mockReturnThis(),
        in: vi.fn().mockResolvedValue({ data: mockProfiles, error: null }),
      }

      supabase.from.mockReturnValueOnce(albumChain).mockReturnValueOnce(profileChain)

      const result = await getAlbuns()

      expect(supabase.from).toHaveBeenCalledWith('galeria_albuns')
      expect(result[0].user_profiles).toEqual(mockProfiles[0])
    })

    it('deve retornar user_profiles null quando criador não tem perfil', async () => {
      const mockAlbuns = [{ ...ALBUM_BASE, created_by: 'user-sem-perfil' }]
      const albumChain = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockAlbuns, error: null }),
      }
      const profileChain = {
        select: vi.fn().mockReturnThis(),
        in: vi.fn().mockResolvedValue({ data: [], error: null }),
      }

      supabase.from.mockReturnValueOnce(albumChain).mockReturnValueOnce(profileChain)

      const result = await getAlbuns()
      expect(result[0].user_profiles).toBeNull()
    })

    it('deve lançar erro quando a busca falha', async () => {
      const mockError = new Error('DB error')
      const albumChain = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      }
      supabase.from.mockReturnValue(albumChain)

      await expect(getAlbuns()).rejects.toThrow('DB error')
    })
  })

  // ── createAlbum ────────────────────────────────────────────────────────────

  describe('createAlbum', () => {
    it('deve criar álbum e retornar com galeria_fotos vazia', async () => {
      const mockCreated = { ...ALBUM_BASE }
      const insertChain = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockCreated, error: null }),
      }
      const profileChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: null }),
      }

      supabase.from.mockReturnValueOnce(insertChain).mockReturnValueOnce(profileChain)

      const result = await createAlbum({ evento_id: 'ev-1', comunidade_id: 'com-1' })

      expect(supabase.from).toHaveBeenCalledWith('galeria_albuns')
      expect(insertChain.insert).toHaveBeenCalledWith([
        { evento_id: 'ev-1', comunidade_id: 'com-1' },
      ])
      expect(result.galeria_fotos).toEqual([])
    })

    it('deve lançar erro quando a criação falha', async () => {
      const mockError = new Error('Insert error')
      const insertChain = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      }
      supabase.from.mockReturnValue(insertChain)

      await expect(createAlbum({ evento_id: 'ev-1', comunidade_id: 'com-1' })).rejects.toThrow(
        'Insert error'
      )
    })
  })

  // ── updateAlbum ────────────────────────────────────────────────────────────

  describe('updateAlbum', () => {
    it('deve atualizar álbum e retornar com user_profiles', async () => {
      const mockUpdated = { ...ALBUM_BASE }
      const updateChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockUpdated, error: null }),
      }
      const profileChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi
          .fn()
          .mockResolvedValue({ data: { user_id: 'user-1', nome_completo: 'João' } }),
      }

      supabase.from.mockReturnValueOnce(updateChain).mockReturnValueOnce(profileChain)

      const result = await updateAlbum('album-1', { evento_id: 'ev-1', comunidade_id: 'com-1' })

      expect(updateChain.update).toHaveBeenCalledWith({ evento_id: 'ev-1', comunidade_id: 'com-1' })
      expect(updateChain.eq).toHaveBeenCalledWith('id', 'album-1')
      expect(result.user_profiles).toEqual({ user_id: 'user-1', nome_completo: 'João' })
    })

    it('deve lançar erro quando a atualização falha', async () => {
      const mockError = new Error('Update error')
      const updateChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      }
      supabase.from.mockReturnValue(updateChain)

      await expect(
        updateAlbum('album-1', { evento_id: 'ev-1', comunidade_id: 'com-1' })
      ).rejects.toThrow('Update error')
    })
  })

  // ── deleteAlbum ────────────────────────────────────────────────────────────

  describe('deleteAlbum', () => {
    it('deve deletar álbum e retornar true', async () => {
      const deleteChain = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      }
      supabase.from.mockReturnValue(deleteChain)

      const result = await deleteAlbum('album-1')

      expect(supabase.from).toHaveBeenCalledWith('galeria_albuns')
      expect(deleteChain.eq).toHaveBeenCalledWith('id', 'album-1')
      expect(result).toBe(true)
    })

    it('deve lançar erro quando a exclusão falha', async () => {
      const mockError = new Error('Delete error')
      const deleteChain = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: mockError }),
      }
      supabase.from.mockReturnValue(deleteChain)

      await expect(deleteAlbum('album-1')).rejects.toThrow('Delete error')
    })
  })

  // ── uploadFoto ─────────────────────────────────────────────────────────────

  describe('uploadFoto', () => {
    it('deve fazer upload e inserir registro da foto', async () => {
      const mockFile = new File(['img'], 'foto.jpg', { type: 'image/jpeg' })
      const mockFoto = { id: 'foto-1', url: 'https://storage/foto.jpg', legenda: 'Abertura' }

      supabase.storage.from.mockReturnValue({
        upload: vi.fn().mockResolvedValue({ error: null }),
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://storage/foto.jpg' } }),
      })

      const insertChain = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockFoto, error: null }),
      }
      supabase.from.mockReturnValue(insertChain)

      const result = await uploadFoto('album-1', mockFile, 'Abertura')

      expect(supabase.storage.from).toHaveBeenCalledWith('imagens')
      expect(supabase.from).toHaveBeenCalledWith('galeria_fotos')
      expect(result).toEqual(mockFoto)
    })

    it('deve lançar erro quando o upload falha', async () => {
      const mockFile = new File(['img'], 'foto.jpg', { type: 'image/jpeg' })

      supabase.storage.from.mockReturnValue({
        upload: vi.fn().mockResolvedValue({ error: new Error('Upload error') }),
        getPublicUrl: vi.fn(),
      })

      await expect(uploadFoto('album-1', mockFile, '')).rejects.toThrow('Upload error')
    })
  })

  // ── addFotoByUrl ───────────────────────────────────────────────────────────

  describe('addFotoByUrl', () => {
    it('deve inserir foto por URL e retornar o registro', async () => {
      const mockFoto = { id: 'foto-2', url: 'https://img.com/foto.jpg', legenda: null }
      const insertChain = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockFoto, error: null }),
      }
      supabase.from.mockReturnValue(insertChain)

      const result = await addFotoByUrl('album-1', 'https://img.com/foto.jpg', '')

      expect(insertChain.insert).toHaveBeenCalledWith([
        expect.objectContaining({
          album_id: 'album-1',
          url: 'https://img.com/foto.jpg',
          storage_path: null,
        }),
      ])
      expect(result).toEqual(mockFoto)
    })

    it('deve salvar legenda nula quando string vazia', async () => {
      const insertChain = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { id: 'f1' }, error: null }),
      }
      supabase.from.mockReturnValue(insertChain)

      await addFotoByUrl('album-1', 'https://img.com/foto.jpg', '')

      expect(insertChain.insert).toHaveBeenCalledWith([expect.objectContaining({ legenda: null })])
    })
  })

  // ── deleteFoto ─────────────────────────────────────────────────────────────

  describe('deleteFoto', () => {
    it('deve deletar foto do banco e do storage quando há storage_path', async () => {
      const deleteChain = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      }
      supabase.from.mockReturnValue(deleteChain)

      const mockRemove = vi.fn().mockResolvedValue({ error: null })
      supabase.storage.from.mockReturnValue({ remove: mockRemove })

      const result = await deleteFoto('foto-1', 'galeria/album-1/foto.jpg')

      expect(deleteChain.eq).toHaveBeenCalledWith('id', 'foto-1')
      expect(mockRemove).toHaveBeenCalledWith(['galeria/album-1/foto.jpg'])
      expect(result).toBe(true)
    })

    it('deve deletar foto somente do banco quando não há storage_path', async () => {
      const deleteChain = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      }
      supabase.from.mockReturnValue(deleteChain)

      const mockRemove = vi.fn()
      supabase.storage.from.mockReturnValue({ remove: mockRemove })

      await deleteFoto('foto-1', null)

      expect(mockRemove).not.toHaveBeenCalled()
    })
  })

  // ── updateFotoLegenda ──────────────────────────────────────────────────────

  describe('updateFotoLegenda', () => {
    it('deve atualizar a legenda e retornar o registro', async () => {
      const mockFoto = { id: 'foto-1', legenda: 'Nova legenda' }
      const updateChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockFoto, error: null }),
      }
      supabase.from.mockReturnValue(updateChain)

      const result = await updateFotoLegenda('foto-1', 'Nova legenda')

      expect(updateChain.update).toHaveBeenCalledWith({ legenda: 'Nova legenda' })
      expect(updateChain.eq).toHaveBeenCalledWith('id', 'foto-1')
      expect(result).toEqual(mockFoto)
    })

    it('deve salvar null quando legenda for string vazia', async () => {
      const updateChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { id: 'foto-1', legenda: null }, error: null }),
      }
      supabase.from.mockReturnValue(updateChain)

      await updateFotoLegenda('foto-1', '   ')

      expect(updateChain.update).toHaveBeenCalledWith({ legenda: null })
    })

    it('deve lançar erro quando a atualização falha', async () => {
      const mockError = new Error('Update error')
      const updateChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      }
      supabase.from.mockReturnValue(updateChain)

      await expect(updateFotoLegenda('foto-1', 'legenda')).rejects.toThrow('Update error')
    })
  })
})
