import { describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '../test/mocks/server'
import {
  getContributors,
  getEventDetail,
  getEventsTagsMap,
  getEventStats,
  getFeaturedEvents,
  getPublishedEvents,
  getRecommendedEvents,
  getTags,
} from './eventService'

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

describe('getEventDetail', () => {
  it('busca o detalhe agregado (evento + tags) pelo slug na API', async () => {
    const detail = {
      evento: { id: '1', slug: 'meetup-cafe-bugado', nome: 'Meetup Café Bugado' },
      tags: [{ id: 't1', nome: 'Backend', cor: '#2563eb' }],
    }
    server.use(
      http.get(`${API_BASE_URL}/events/slug/meetup-cafe-bugado/detail`, () =>
        HttpResponse.json(detail)
      )
    )

    await expect(getEventDetail('meetup-cafe-bugado')).resolves.toEqual(detail)
  })

  it('preserva o slug/id exato na URL mesmo com espaço/acento', async () => {
    server.use(
      http.get(`${API_BASE_URL}/events/slug/:slugOrId/detail`, ({ params }) => {
        expect(params.slugOrId).toBe('evento com espaço')
        return HttpResponse.json({ evento: { id: '1' }, tags: [] })
      })
    )

    await expect(getEventDetail('evento com espaço')).resolves.toEqual({
      evento: { id: '1' },
      tags: [],
    })
  })

  it('anexa status 404 no erro quando o evento não existe', async () => {
    server.use(
      http.get(`${API_BASE_URL}/events/slug/inexistente/detail`, () =>
        HttpResponse.json({ message: 'Evento não encontrado' }, { status: 404 })
      )
    )

    await expect(getEventDetail('inexistente')).rejects.toMatchObject({ status: 404 })
  })

  it('codifica caracteres estruturais (/, ?, #) no slug em vez de deixá-los alterar a URL', async () => {
    server.use(
      http.get(`${API_BASE_URL}/events/slug/:slugOrId/detail`, ({ params }) => {
        expect(params.slugOrId).toBe('a/b?c#d')
        return HttpResponse.json({ evento: { id: '1' }, tags: [] })
      })
    )

    await expect(getEventDetail('a/b?c#d')).resolves.toEqual({
      evento: { id: '1' },
      tags: [],
    })
  })
})

describe('getTags', () => {
  it('busca a lista de tags na API', async () => {
    const tags = [{ id: '1', nome: 'Backend', cor: '#2563eb' }]
    server.use(http.get(`${API_BASE_URL}/tags`, () => HttpResponse.json(tags)))

    await expect(getTags()).resolves.toEqual(tags)
  })

  it('anexa status no erro quando a API responde não-2xx', async () => {
    server.use(
      http.get(`${API_BASE_URL}/tags`, () =>
        HttpResponse.json({ detail: 'erro interno' }, { status: 500 })
      )
    )

    await expect(getTags()).rejects.toMatchObject({ status: 500 })
  })
})

describe('getEventsTagsMap', () => {
  it('busca o mapa de tags por evento na API', async () => {
    const map = { 'evento-1': [{ id: '1', nome: 'Backend', cor: '#2563eb' }] }
    server.use(http.get(`${API_BASE_URL}/events/tags-map`, () => HttpResponse.json(map)))

    await expect(getEventsTagsMap()).resolves.toEqual(map)
  })

  it('anexa status no erro quando a API responde não-2xx', async () => {
    server.use(
      http.get(`${API_BASE_URL}/events/tags-map`, () =>
        HttpResponse.json({ detail: 'erro interno' }, { status: 500 })
      )
    )

    await expect(getEventsTagsMap()).rejects.toMatchObject({ status: 500 })
  })
})

describe('getRecommendedEvents', () => {
  it('busca os eventos recomendados na API', async () => {
    const events = [{ id: '1', nome: 'Evento Relacionado' }]
    server.use(
      http.get(`${API_BASE_URL}/events/evento-1/recommended`, () => HttpResponse.json(events))
    )

    await expect(getRecommendedEvents('evento-1')).resolves.toEqual(events)
  })

  it('passa o limit como query param, com default 3', async () => {
    server.use(
      http.get(`${API_BASE_URL}/events/evento-1/recommended`, ({ request }) => {
        const url = new URL(request.url)
        expect(url.searchParams.get('limit')).toBe('3')
        return HttpResponse.json([])
      })
    )

    await getRecommendedEvents('evento-1')
  })

  it('repassa um limit explícito como query param', async () => {
    server.use(
      http.get(`${API_BASE_URL}/events/evento-1/recommended`, ({ request }) => {
        const url = new URL(request.url)
        expect(url.searchParams.get('limit')).toBe('5')
        return HttpResponse.json([])
      })
    )

    await getRecommendedEvents('evento-1', 5)
  })

  it('anexa status 404 no erro quando o evento não existe', async () => {
    server.use(
      http.get(`${API_BASE_URL}/events/inexistente/recommended`, () =>
        HttpResponse.json({ message: 'Evento não encontrado' }, { status: 404 })
      )
    )

    await expect(getRecommendedEvents('inexistente')).rejects.toMatchObject({ status: 404 })
  })

  it('codifica caracteres estruturais (/, ?, #) no eventId em vez de deixá-los alterar a URL', async () => {
    server.use(
      http.get(`${API_BASE_URL}/events/:eventId/recommended`, ({ params }) => {
        expect(params.eventId).toBe('a/b?c#d')
        return HttpResponse.json([])
      })
    )

    await expect(getRecommendedEvents('a/b?c#d')).resolves.toEqual([])
  })
})

describe('getContributors', () => {
  it('busca a lista de contribuintes na API', async () => {
    const contributors = [
      {
        id: '1',
        nome: 'Alice',
        avatar_url: 'https://example.com/a.png',
        github_url: 'https://github.com/alice',
        linkedin_url: null,
        portfolio_url: null,
      },
    ]
    server.use(http.get(`${API_BASE_URL}/contributors`, () => HttpResponse.json(contributors)))

    await expect(getContributors()).resolves.toEqual(contributors)
  })

  it('anexa status no erro quando a API responde não-2xx', async () => {
    server.use(
      http.get(`${API_BASE_URL}/contributors`, () =>
        HttpResponse.json({ detail: 'erro interno' }, { status: 500 })
      )
    )

    await expect(getContributors()).rejects.toMatchObject({ status: 500 })
  })
})

describe('getEventStats', () => {
  it('busca as estatísticas de eventos na API', async () => {
    const stats = { totalEventos: 42 }
    server.use(http.get(`${API_BASE_URL}/events/stats/public`, () => HttpResponse.json(stats)))

    await expect(getEventStats()).resolves.toEqual(stats)
  })

  it('anexa status no erro quando a API responde não-2xx', async () => {
    server.use(
      http.get(`${API_BASE_URL}/events/stats/public`, () =>
        HttpResponse.json({ detail: 'erro interno' }, { status: 500 })
      )
    )

    await expect(getEventStats()).rejects.toMatchObject({ status: 500 })
  })
})
