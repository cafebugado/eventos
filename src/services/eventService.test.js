import { describe, it, expect, vi, beforeEach } from 'vitest'
import { supabase } from '../lib/supabase'
import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventsByPeriod,
  getUpcomingEvents,
  getEventStats,
  uploadEventImage,
  deleteEventImage,
} from './eventService'

describe('eventService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getEvents', () => {
    it('deve buscar todos os eventos ordenados por data', async () => {
      const mockEvents = [
        { id: '1', nome: 'Evento 1', data_evento: '2024-01-01' },
        { id: '2', nome: 'Evento 2', data_evento: '2024-01-02' },
      ]

      const mockChain = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockEvents, error: null }),
      }

      supabase.from.mockReturnValue(mockChain)

      const result = await getEvents()

      expect(supabase.from).toHaveBeenCalledWith('eventos')
      expect(mockChain.select).toHaveBeenCalledWith('*')
      expect(mockChain.order).toHaveBeenCalledWith('data_evento', { ascending: true })
      expect(result).toEqual(mockEvents)
    })

    it('deve lançar erro quando a busca falha', async () => {
      const mockError = new Error('Database error')

      const mockChain = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      }

      supabase.from.mockReturnValue(mockChain)

      await expect(getEvents()).rejects.toThrow('Database error')
    })
  })

  describe('getEventById', () => {
    it('deve buscar evento por ID', async () => {
      const mockEvent = { id: '1', nome: 'Evento 1' }

      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockEvent, error: null }),
      }

      supabase.from.mockReturnValue(mockChain)

      const result = await getEventById('1')

      expect(supabase.from).toHaveBeenCalledWith('eventos')
      expect(mockChain.eq).toHaveBeenCalledWith('id', '1')
      expect(result).toEqual(mockEvent)
    })

    it('deve lançar erro quando evento não existe', async () => {
      const mockError = new Error('Event not found')

      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      }

      supabase.from.mockReturnValue(mockChain)

      await expect(getEventById('999')).rejects.toThrow('Event not found')
    })
  })

  describe('createEvent', () => {
    it('deve criar novo evento', async () => {
      const newEvent = {
        nome: 'Novo Evento',
        descricao: 'Descrição do evento',
        data_evento: '2024-02-15',
        horario: '19:00',
        dia_semana: 'Quinta-feira',
        periodo: 'Noturno',
        link: 'https://evento.com',
        imagem: 'https://exemplo.com/imagem.jpg',
      }

      const createdEvent = { id: '1', ...newEvent }

      const mockChain = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: createdEvent, error: null }),
      }

      supabase.from.mockReturnValue(mockChain)

      const result = await createEvent(newEvent)

      expect(supabase.from).toHaveBeenCalledWith('eventos')
      expect(mockChain.insert).toHaveBeenCalledWith([
        {
          nome: newEvent.nome,
          descricao: newEvent.descricao,
          data_evento: newEvent.data_evento,
          horario: newEvent.horario,
          dia_semana: newEvent.dia_semana,
          periodo: newEvent.periodo,
          link: newEvent.link,
          imagem: newEvent.imagem,
        },
      ])
      expect(result).toEqual(createdEvent)
    })

    it('deve criar evento sem campos opcionais', async () => {
      const newEvent = {
        nome: 'Evento Mínimo',
        data_evento: '2024-02-15',
        horario: '19:00',
        dia_semana: 'Quinta-feira',
        periodo: 'Noturno',
        link: 'https://evento.com',
      }

      const createdEvent = { id: '1', ...newEvent, descricao: null, imagem: null }

      const mockChain = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: createdEvent, error: null }),
      }

      supabase.from.mockReturnValue(mockChain)

      const result = await createEvent(newEvent)

      expect(mockChain.insert).toHaveBeenCalledWith([
        expect.objectContaining({
          descricao: null,
          imagem: null,
        }),
      ])
      expect(result).toEqual(createdEvent)
    })

    it('deve lançar erro quando a criação falha', async () => {
      const mockError = new Error('Insert failed')

      const mockChain = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      }

      supabase.from.mockReturnValue(mockChain)

      await expect(createEvent({})).rejects.toThrow('Insert failed')
    })
  })

  describe('updateEvent', () => {
    it('deve atualizar evento existente', async () => {
      const updatedData = {
        nome: 'Evento Atualizado',
        descricao: 'Nova descrição',
        data_evento: '2024-03-01',
        horario: '20:00',
        dia_semana: 'Sexta-feira',
        periodo: 'Noturno',
        link: 'https://novo-link.com',
        imagem: 'https://nova-imagem.com',
      }

      const updatedEvent = { id: '1', ...updatedData }

      const mockChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: updatedEvent, error: null }),
      }

      supabase.from.mockReturnValue(mockChain)

      const result = await updateEvent('1', updatedData)

      expect(supabase.from).toHaveBeenCalledWith('eventos')
      expect(mockChain.update).toHaveBeenCalled()
      expect(mockChain.eq).toHaveBeenCalledWith('id', '1')
      expect(result).toEqual(updatedEvent)
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

      await expect(updateEvent('1', {})).rejects.toThrow('Update failed')
    })
  })

  describe('deleteEvent', () => {
    it('deve deletar evento', async () => {
      const mockChain = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      }

      supabase.from.mockReturnValue(mockChain)

      const result = await deleteEvent('1')

      expect(supabase.from).toHaveBeenCalledWith('eventos')
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

      await expect(deleteEvent('1')).rejects.toThrow('Delete failed')
    })
  })

  describe('getEventsByPeriod', () => {
    it('deve filtrar eventos por período', async () => {
      const mockEvents = [
        { id: '1', nome: 'Evento Noturno', periodo: 'Noturno' },
        { id: '2', nome: 'Outro Noturno', periodo: 'Noturno' },
      ]

      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockEvents, error: null }),
      }

      supabase.from.mockReturnValue(mockChain)

      const result = await getEventsByPeriod('Noturno')

      expect(mockChain.eq).toHaveBeenCalledWith('periodo', 'Noturno')
      expect(result).toEqual(mockEvents)
    })

    it('deve retornar array vazio quando não há eventos do período', async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
      }

      supabase.from.mockReturnValue(mockChain)

      const result = await getEventsByPeriod('Matinal')

      expect(result).toEqual([])
    })
  })

  describe('getUpcomingEvents', () => {
    it('deve retornar apenas eventos futuros limitados a 3', async () => {
      const today = new Date()
      const futureDate1 = new Date(today)
      futureDate1.setDate(today.getDate() + 1)
      const futureDate2 = new Date(today)
      futureDate2.setDate(today.getDate() + 5)
      const futureDate3 = new Date(today)
      futureDate3.setDate(today.getDate() + 10)
      const futureDate4 = new Date(today)
      futureDate4.setDate(today.getDate() + 15)
      const pastDate = new Date(today)
      pastDate.setDate(today.getDate() - 5)

      const fmt = (d) =>
        `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`

      const mockEvents = [
        { id: '0', nome: 'Passado', data_evento: fmt(pastDate) },
        { id: '1', nome: 'Futuro 1', data_evento: fmt(futureDate1) },
        { id: '2', nome: 'Futuro 2', data_evento: fmt(futureDate2) },
        { id: '3', nome: 'Futuro 3', data_evento: fmt(futureDate3) },
        { id: '4', nome: 'Futuro 4', data_evento: fmt(futureDate4) },
      ]

      const mockChain = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockEvents, error: null }),
      }

      supabase.from.mockReturnValue(mockChain)

      const result = await getUpcomingEvents(3)

      expect(result).toHaveLength(3)
      expect(result[0].nome).toBe('Futuro 1')
      expect(result[2].nome).toBe('Futuro 3')
    })

    it('deve lançar erro quando a busca falha', async () => {
      const mockError = new Error('Database error')

      const mockChain = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      }

      supabase.from.mockReturnValue(mockChain)

      await expect(getUpcomingEvents()).rejects.toThrow('Database error')
    })

    it('deve retornar array vazio quando não há eventos futuros', async () => {
      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 10)
      const fmt = (d) =>
        `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`

      const mockEvents = [{ id: '1', nome: 'Passado', data_evento: fmt(pastDate) }]

      const mockChain = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockEvents, error: null }),
      }

      supabase.from.mockReturnValue(mockChain)

      const result = await getUpcomingEvents()

      expect(result).toEqual([])
    })
  })

  describe('getEventStats', () => {
    it('deve calcular estatísticas corretamente', async () => {
      const mockEvents = [
        { periodo: 'Noturno' },
        { periodo: 'Noturno' },
        { periodo: 'Diurno' },
        { periodo: 'Matinal' },
        { periodo: 'Vespertino' },
      ]

      const mockChain = {
        select: vi.fn().mockResolvedValue({ data: mockEvents, error: null }),
      }

      supabase.from.mockReturnValue(mockChain)

      const result = await getEventStats()

      expect(result).toEqual({
        total: 5,
        noturno: 2,
        diurno: 3, // Diurno + Matinal + Vespertino
      })
    })

    it('deve retornar zeros quando não há eventos', async () => {
      const mockChain = {
        select: vi.fn().mockResolvedValue({ data: [], error: null }),
      }

      supabase.from.mockReturnValue(mockChain)

      const result = await getEventStats()

      expect(result).toEqual({
        total: 0,
        noturno: 0,
        diurno: 0,
      })
    })

    it('deve lançar erro quando a busca falha', async () => {
      const mockError = new Error('Stats error')

      const mockChain = {
        select: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      }

      supabase.from.mockReturnValue(mockChain)

      await expect(getEventStats()).rejects.toThrow('Stats error')
    })
  })

  describe('uploadEventImage', () => {
    it('deve fazer upload de imagem e retornar URL pública', async () => {
      const mockFile = new File(['test content'], 'test.jpg', { type: 'image/jpeg' })
      const mockPublicUrl = 'https://storage.supabase.co/imagens/eventos/test.jpg'

      const mockStorage = {
        upload: vi.fn().mockResolvedValue({ error: null }),
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: mockPublicUrl } }),
      }

      supabase.storage.from.mockReturnValue(mockStorage)

      const result = await uploadEventImage(mockFile)

      expect(supabase.storage.from).toHaveBeenCalledWith('imagens')
      expect(mockStorage.upload).toHaveBeenCalled()
      expect(result).toBe(mockPublicUrl)
    })

    it('deve lançar erro quando o upload falha', async () => {
      const mockFile = new File(['test content'], 'test.jpg', { type: 'image/jpeg' })
      const mockError = new Error('Upload failed')

      const mockStorage = {
        upload: vi.fn().mockResolvedValue({ error: mockError }),
      }

      supabase.storage.from.mockReturnValue(mockStorage)

      await expect(uploadEventImage(mockFile)).rejects.toThrow('Upload failed')
    })
  })

  describe('deleteEventImage', () => {
    it('deve deletar imagem do storage', async () => {
      const imageUrl =
        'https://storage.supabase.co/storage/v1/object/public/imagens/eventos/test.jpg'

      const mockStorage = {
        remove: vi.fn().mockResolvedValue({ error: null }),
      }

      supabase.storage.from.mockReturnValue(mockStorage)

      await deleteEventImage(imageUrl)

      expect(supabase.storage.from).toHaveBeenCalledWith('imagens')
      expect(mockStorage.remove).toHaveBeenCalledWith(['eventos/test.jpg'])
    })

    it('deve retornar silenciosamente quando URL é null', async () => {
      await deleteEventImage(null)

      expect(supabase.storage.from).not.toHaveBeenCalled()
    })

    it('deve retornar silenciosamente quando URL é undefined', async () => {
      await deleteEventImage(undefined)

      expect(supabase.storage.from).not.toHaveBeenCalled()
    })

    it('deve retornar silenciosamente quando URL não tem path válido', async () => {
      await deleteEventImage('https://exemplo.com/outra-url')

      expect(supabase.storage.from).not.toHaveBeenCalled()
    })
  })
})
