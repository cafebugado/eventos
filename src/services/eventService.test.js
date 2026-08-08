import { describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '../test/mocks/server'
import { getFeaturedEvents } from './eventService'

const API_BASE_URL = 'https://v3.api.eventoscafebugado.cafebugado.com.br'

describe('getFeaturedEvents', () => {
  it('busca os eventos em destaque na API', async () => {
    const events = [{ id: '1', nome: 'Evento Destaque' }]
    server.use(http.get(`${API_BASE_URL}/events/featured`, () => HttpResponse.json(events)))

    await expect(getFeaturedEvents()).resolves.toEqual(events)
  })

  it('passa o limit como query param, com default 3', async () => {
    server.use(
      http.get(`${API_BASE_URL}/events/featured`, ({ request }) => {
        const url = new URL(request.url)
        expect(url.searchParams.get('limit')).toBe('3')
        return HttpResponse.json([])
      })
    )

    await getFeaturedEvents()
  })

  it('repassa um limit explícito como query param', async () => {
    server.use(
      http.get(`${API_BASE_URL}/events/featured`, ({ request }) => {
        const url = new URL(request.url)
        expect(url.searchParams.get('limit')).toBe('5')
        return HttpResponse.json([])
      })
    )

    await getFeaturedEvents(5)
  })

  it('anexa status no erro quando a API responde não-2xx', async () => {
    server.use(
      http.get(`${API_BASE_URL}/events/featured`, () =>
        HttpResponse.json({ detail: 'erro interno' }, { status: 500 })
      )
    )

    await expect(getFeaturedEvents()).rejects.toMatchObject({ status: 500 })
  })
})
