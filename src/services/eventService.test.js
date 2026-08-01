import { describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '../test/mocks/server'
import {
  getEventBySlugOrId,
  getEventStats,
  getPublishedEvents,
  getRecommendedEvents,
  getUpcomingEvents,
} from './eventService'

const API_BASE_URL = 'https://v2.backendeventoscfb.cafebugado.com.br'

describe('getPublishedEvents', () => {
  it('busca eventos publicados na API', async () => {
    const events = [{ id: '1', nome: 'Evento Publicado' }]
    server.use(http.get(`${API_BASE_URL}/events/published`, () => HttpResponse.json(events)))

    await expect(getPublishedEvents()).resolves.toEqual(events)
  })
})

describe('getUpcomingEvents', () => {
  it('passa o limit como query param', async () => {
    server.use(
      http.get(`${API_BASE_URL}/events/upcoming`, ({ request }) => {
        const url = new URL(request.url)
        expect(url.searchParams.get('limit')).toBe('5')
        return HttpResponse.json([])
      })
    )

    await getUpcomingEvents(5)
  })
})

describe('getEventBySlugOrId', () => {
  it('busca evento por slug', async () => {
    const event = { id: '1', slug: 'evento-teste', nome: 'Evento Teste' }
    server.use(http.get(`${API_BASE_URL}/events/slug/evento-teste`, () => HttpResponse.json(event)))

    await expect(getEventBySlugOrId('evento-teste')).resolves.toEqual(event)
  })

  it('anexa status 404 no erro quando o evento não existe', async () => {
    server.use(
      http.get(`${API_BASE_URL}/events/slug/inexistente`, () =>
        HttpResponse.json({ detail: 'not found' }, { status: 404 })
      )
    )

    await expect(getEventBySlugOrId('inexistente')).rejects.toMatchObject({ status: 404 })
  })
})

describe('getEventStats', () => {
  it('busca estatísticas públicas de eventos', async () => {
    const stats = { total_publicados: 10, noturno: 6, diurno: 4 }
    server.use(http.get(`${API_BASE_URL}/events/stats/public`, () => HttpResponse.json(stats)))

    await expect(getEventStats()).resolves.toEqual(stats)
  })
})

describe('getRecommendedEvents', () => {
  it('busca recomendações do evento com o limit informado', async () => {
    const recommended = [{ id: '2', nome: 'Evento Recomendado', tags: [] }]
    server.use(
      http.get(`${API_BASE_URL}/events/evento-1/recommended`, ({ request }) => {
        const url = new URL(request.url)
        expect(url.searchParams.get('limit')).toBe('3')
        return HttpResponse.json(recommended)
      })
    )

    await expect(getRecommendedEvents('evento-1', 3)).resolves.toEqual(recommended)
  })
})
