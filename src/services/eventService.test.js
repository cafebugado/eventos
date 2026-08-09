import { describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '../test/mocks/server'
import { getEventBySlug, getFeaturedEvents, getPublishedEvents } from './eventService'

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

describe('getPublishedEvents', () => {
  it('busca a lista de eventos publicados na API', async () => {
    const events = [{ id: '1', nome: 'Evento Publicado' }]
    server.use(http.get(`${API_BASE_URL}/events/published`, () => HttpResponse.json(events)))

    await expect(getPublishedEvents()).resolves.toEqual(events)
  })

  it('não envia nenhum query param quando chamada sem argumentos', async () => {
    server.use(
      http.get(`${API_BASE_URL}/events/published`, ({ request }) => {
        const url = new URL(request.url)
        expect(Array.from(url.searchParams.keys())).toHaveLength(0)
        return HttpResponse.json([])
      })
    )

    await getPublishedEvents()
  })

  it('repassa cidade, modalidade, limit e offset como query params quando informados', async () => {
    server.use(
      http.get(`${API_BASE_URL}/events/published`, ({ request }) => {
        const url = new URL(request.url)
        expect(url.searchParams.get('cidade')).toBe('São Paulo')
        expect(url.searchParams.get('modalidade')).toBe('Online')
        expect(url.searchParams.get('limit')).toBe('9')
        expect(url.searchParams.get('offset')).toBe('0')
        return HttpResponse.json([])
      })
    )

    await getPublishedEvents({ cidade: 'São Paulo', modalidade: 'Online', limit: 9, offset: 0 })
  })

  it('anexa status no erro quando a API responde não-2xx', async () => {
    server.use(
      http.get(`${API_BASE_URL}/events/published`, () =>
        HttpResponse.json({ detail: 'erro interno' }, { status: 500 })
      )
    )

    await expect(getPublishedEvents()).rejects.toMatchObject({ status: 500 })
  })
})

describe('getEventBySlug', () => {
  it('busca o evento pelo slug na API', async () => {
    const event = { id: '1', slug: 'meetup-cafe-bugado', nome: 'Meetup Café Bugado' }
    server.use(
      http.get(`${API_BASE_URL}/events/slug/meetup-cafe-bugado`, () => HttpResponse.json(event))
    )

    await expect(getEventBySlug('meetup-cafe-bugado')).resolves.toEqual(event)
  })

  it('preserva o slug/id exato na URL mesmo com espaço/acento', async () => {
    server.use(
      http.get(`${API_BASE_URL}/events/slug/:slugOrId`, ({ params }) => {
        expect(params.slugOrId).toBe('evento com espaço')
        return HttpResponse.json({ id: '1' })
      })
    )

    await expect(getEventBySlug('evento com espaço')).resolves.toEqual({ id: '1' })
  })

  it('anexa status 404 no erro quando o evento não existe', async () => {
    server.use(
      http.get(`${API_BASE_URL}/events/slug/inexistente`, () =>
        HttpResponse.json({ message: 'Evento não encontrado' }, { status: 404 })
      )
    )

    await expect(getEventBySlug('inexistente')).rejects.toMatchObject({ status: 404 })
  })
})
