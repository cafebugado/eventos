import { describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '../test/mocks/server'
import { getAlbuns, normalizeAlbum } from './galeriaService'

const API_BASE_URL = 'https://v2.backendeventoscfb.cafebugado.com.br'

describe('getAlbuns', () => {
  it('busca álbuns já resolvidos (nome de evento/comunidade/autor) na API', async () => {
    const albuns = [
      {
        id: 'album-1',
        evento_nome: 'Meetup React',
        evento_data: '10/08/2026',
        comunidade_nome: 'Comunidade Tech',
        created_by_nome: 'Ana Silva',
        created_at: '2026-08-01T00:00:00Z',
        fotos: [],
      },
    ]
    server.use(http.get(`${API_BASE_URL}/gallery/albums/public`, () => HttpResponse.json(albuns)))

    const result = await getAlbuns()

    expect(result).toEqual(albuns)
  })

  it('propaga erro quando a API responde com falha', async () => {
    server.use(
      http.get(`${API_BASE_URL}/gallery/albums/public`, () =>
        HttpResponse.json(null, { status: 500 })
      )
    )

    await expect(getAlbuns()).rejects.toThrow()
  })
})

describe('normalizeAlbum', () => {
  it('normaliza álbum com fotos e dados de evento/comunidade/criador já resolvidos', () => {
    const album = {
      id: 'album-1',
      evento_nome: 'Meetup React',
      evento_data: '10/08/2026',
      comunidade_nome: 'Comunidade Tech',
      created_by_nome: 'Ana Silva',
      fotos: [
        {
          id: 'foto-1',
          url: 'https://x/1.png',
          legenda: '',
          ordem: 1,
          created_at: '2026-08-10T09:00:00Z',
          uploaded_by_nome: null,
        },
        {
          id: 'foto-2',
          url: 'https://x/2.png',
          legenda: 'Segunda',
          ordem: 2,
          created_at: '2026-08-10T10:00:00Z',
          uploaded_by_nome: 'Bruno Costa',
        },
      ],
    }

    const result = normalizeAlbum(album)

    expect(result.eventName).toBe('Meetup React')
    expect(result.eventDate).toBe('10/08/2026')
    expect(result.community).toBe('Comunidade Tech')
    expect(result.createdBy).toBe('Ana Silva')
    expect(result.photos.map((p) => p.id)).toEqual(['foto-1', 'foto-2'])
    expect(result.photos[0].postedBy).toBeNull()
    expect(result.photos[1].postedBy).toBe('Bruno Costa')
    expect(result.photos[1].caption).toBe('Segunda')
  })

  it('usa valores default quando evento/comunidade/criador estão ausentes', () => {
    const result = normalizeAlbum({ id: 'album-1', fotos: [] })

    expect(result.eventName).toBe('Sem evento')
    expect(result.eventDate).toBe('')
    expect(result.community).toBe('Sem comunidade')
    expect(result.createdBy).toBeNull()
    expect(result.photos).toEqual([])
  })
})
