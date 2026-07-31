import { describe, expect, it, vi } from 'vitest'
import sitemap from './sitemap'
import { getEvents } from '../services/eventService'

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({})),
}))
vi.mock('../services/eventService', () => ({
  getEvents: vi.fn(),
}))

describe('sitemap', () => {
  it('inclui as rotas estáticas', async () => {
    getEvents.mockResolvedValue([])
    const entries = await sitemap()
    const urls = entries.map((e) => e.url)

    expect(urls).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/\/$/),
        expect.stringContaining('/eventos'),
        expect.stringContaining('/sobre'),
        expect.stringContaining('/galeria'),
        expect.stringContaining('/contato'),
      ])
    )
  })

  it('inclui uma entrada por evento, usando slug quando disponível', async () => {
    getEvents.mockResolvedValue([
      { id: '1', slug: 'evento-um', data_evento: '20/02/2026', updated_at: '2026-02-01T00:00:00Z' },
      { id: '2', slug: null, data_evento: '21/02/2026' },
    ])

    const entries = await sitemap()
    const urls = entries.map((e) => e.url)

    expect(urls).toContain('https://eventos.cafebugado.com.br/eventos/evento-um')
    expect(urls).toContain('https://eventos.cafebugado.com.br/eventos/2')
  })

  it('retorna só as rotas estáticas quando a busca de eventos falha', async () => {
    getEvents.mockRejectedValue(new Error('falha'))
    const entries = await sitemap()
    expect(entries).toHaveLength(5)
  })
})
