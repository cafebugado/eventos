import { describe, expect, it, vi } from 'vitest'
import { getAlbuns, normalizeAlbum } from './galeriaService'

function createMockSupabase(responses) {
  return {
    from: vi.fn((table) => {
      const response = responses[table] || { data: null, error: null }
      const builder = {
        select: vi.fn(() => builder),
        order: vi.fn(() => Promise.resolve(response)),
        in: vi.fn(() => Promise.resolve(response)),
      }
      return builder
    }),
  }
}

describe('getAlbuns', () => {
  it('busca álbuns e enriquece com perfil de quem criou e de quem fez upload das fotos', async () => {
    const albuns = [
      {
        id: 'album-1',
        created_by: 'user-1',
        galeria_fotos: [{ id: 'foto-1', uploaded_by: 'user-2' }],
      },
    ]
    const profiles = [
      { user_id: 'user-1', nome: 'Ana', sobrenome: 'Silva' },
      { user_id: 'user-2', nome: 'Bruno', sobrenome: 'Costa' },
    ]
    const supabase = createMockSupabase({
      galeria_albuns: { data: albuns, error: null },
      user_profiles: { data: profiles, error: null },
    })

    const result = await getAlbuns(supabase)

    expect(result).toEqual([
      {
        ...albuns[0],
        user_profiles: { user_id: 'user-1', nome: 'Ana', sobrenome: 'Silva' },
        galeria_fotos: [
          {
            id: 'foto-1',
            uploaded_by: 'user-2',
            uploader_profile: { user_id: 'user-2', nome: 'Bruno', sobrenome: 'Costa' },
          },
        ],
      },
    ])
  })

  it('não busca perfis quando não há álbuns com created_by/uploaded_by', async () => {
    const supabase = createMockSupabase({
      galeria_albuns: {
        data: [{ id: 'album-1', created_by: null, galeria_fotos: [] }],
        error: null,
      },
    })

    const result = await getAlbuns(supabase)

    expect(result).toEqual([
      { id: 'album-1', created_by: null, galeria_fotos: [], user_profiles: null },
    ])
    expect(supabase.from).not.toHaveBeenCalledWith('user_profiles')
  })

  it('propaga erro do Supabase', async () => {
    const supabase = createMockSupabase({
      galeria_albuns: { data: null, error: new Error('falha ao buscar álbuns') },
    })

    await expect(getAlbuns(supabase)).rejects.toThrow('falha ao buscar álbuns')
  })
})

describe('normalizeAlbum', () => {
  it('normaliza álbum com fotos ordenadas e dados de evento/comunidade/criador', () => {
    const album = {
      id: 'album-1',
      eventos: { nome: 'Meetup React', data_evento: '10/08/2026' },
      comunidades: { nome: 'Comunidade Tech' },
      user_profiles: { nome: 'Ana', sobrenome: 'Silva' },
      galeria_fotos: [
        {
          id: 'foto-2',
          url: 'https://x/2.png',
          legenda: 'Segunda',
          ordem: 2,
          created_at: '2026-08-10T10:00:00Z',
          uploader_profile: { nome: 'Bruno', sobrenome: 'Costa' },
        },
        {
          id: 'foto-1',
          url: 'https://x/1.png',
          legenda: '',
          ordem: 1,
          created_at: '2026-08-10T09:00:00Z',
          uploader_profile: null,
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
    const result = normalizeAlbum({ id: 'album-1', galeria_fotos: [] })

    expect(result.eventName).toBe('Sem evento')
    expect(result.eventDate).toBe('')
    expect(result.community).toBe('Sem comunidade')
    expect(result.createdBy).toBeNull()
    expect(result.photos).toEqual([])
  })
})
