import { describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '../test/mocks/server'
import { getGalleryEvents } from './galleryService'

const API_BASE_URL = 'https://v3.api.eventoscafebugado.cafebugado.com.br'

function buildAlbum(overrides = {}) {
  return {
    id: 'album-1',
    evento_nome: 'Meetup Café Bugado',
    evento_data: '20/02/2026',
    comunidade_nome: 'Café Bugado',
    created_by_nome: 'Alice Souza',
    created_at: '2026-02-20T10:00:00.000Z',
    fotos: [
      {
        id: 'foto-1',
        url: 'https://example.com/1.png',
        legenda: 'Galera do meetup',
        ordem: 0,
        uploaded_by_nome: 'Alice Souza',
        created_at: '2026-02-20T10:00:00.000Z',
      },
    ],
    ...overrides,
  }
}

describe('getGalleryEvents', () => {
  it('busca os álbuns públicos na API e mapeia pro shape esperado pelos componentes de galeria', async () => {
    server.use(
      http.get(`${API_BASE_URL}/gallery/albums/public`, () => HttpResponse.json([buildAlbum()]))
    )

    const result = await getGalleryEvents()

    expect(result).toEqual([
      {
        id: 'album-1',
        eventName: 'Meetup Café Bugado',
        eventDate: '20/02/2026',
        community: 'Café Bugado',
        createdBy: 'Alice Souza',
        photos: [
          {
            id: 'foto-1',
            url: 'https://example.com/1.png',
            thumb: 'https://example.com/1.png',
            caption: 'Galera do meetup',
            postedBy: 'Alice Souza',
            postedAt: '20/02/2026',
          },
        ],
      },
    ])
  })

  it('usa comunidade_nome como eventName e formata created_at quando não há evento vinculado', async () => {
    server.use(
      http.get(`${API_BASE_URL}/gallery/albums/public`, () =>
        HttpResponse.json([
          buildAlbum({ evento_nome: null, evento_data: null, comunidade_nome: 'Café Bugado' }),
        ])
      )
    )

    const [result] = await getGalleryEvents()

    expect(result.eventName).toBe('Café Bugado')
    expect(result.eventDate).toBe('20/02/2026')
  })

  it('filtra álbuns sem nenhuma foto', async () => {
    server.use(
      http.get(`${API_BASE_URL}/gallery/albums/public`, () =>
        HttpResponse.json([buildAlbum({ id: 'sem-fotos', fotos: [] }), buildAlbum()])
      )
    )

    const result = await getGalleryEvents()

    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('album-1')
  })

  it('anexa status no erro quando a API responde não-2xx', async () => {
    server.use(
      http.get(`${API_BASE_URL}/gallery/albums/public`, () =>
        HttpResponse.json({ detail: 'erro interno' }, { status: 500 })
      )
    )

    await expect(getGalleryEvents()).rejects.toMatchObject({ status: 500 })
  })
})
