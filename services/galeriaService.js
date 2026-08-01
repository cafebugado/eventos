import { withRetry } from '../lib/apiClient'

// Todas as funções recebem o client Supabase como primeiro argumento — ver
// convenção em services/eventService.js.

// ─── ÁLBUNS ─────────────────────────────────────────────────────────────────

/**
 * Busca todos os álbuns com dados do evento, comunidade, criador e fotos.
 */
export async function getAlbuns(supabase) {
  return withRetry(
    async () => {
      const { data, error } = await supabase
        .from('galeria_albuns')
        .select(
          `
          id,
          created_at,
          updated_at,
          evento_id,
          comunidade_id,
          created_by,
          eventos ( id, nome, data_evento ),
          comunidades ( id, nome ),
          galeria_fotos ( id, url, storage_path, legenda, ordem, uploaded_by, created_at )
        `
        )
        .order('created_at', { ascending: false })
      if (error) {
        throw error
      }

      // Coletar todos os user IDs (criadores de álbuns + uploaders de fotos)
      const creatorIds = data.map((a) => a.created_by).filter(Boolean)
      const uploaderIds = data.flatMap((a) =>
        (a.galeria_fotos || []).map((f) => f.uploaded_by).filter(Boolean)
      )
      const allUserIds = [...new Set([...creatorIds, ...uploaderIds])]

      let profilesMap = {}
      if (allUserIds.length > 0) {
        const { data: profiles } = await supabase
          .from('user_profiles')
          .select('user_id, nome, sobrenome')
          .in('user_id', allUserIds)
        if (profiles) {
          profilesMap = Object.fromEntries(profiles.map((p) => [p.user_id, p]))
        }
      }

      return data.map((album) => ({
        ...album,
        user_profiles: profilesMap[album.created_by] || null,
        galeria_fotos: (album.galeria_fotos || []).map((foto) => ({
          ...foto,
          uploader_profile: profilesMap[foto.uploaded_by] || null,
        })),
      }))
    },
    { context: 'getAlbuns' }
  )
}

// ─── NORMALIZAÇÃO (uso público — app/galeria) ─────────────────────────────────

/**
 * Normaliza um álbum bruto (retornado por getAlbuns) para o formato usado
 * pela página pública de galeria. Portado de hooks/useGallery.js do app
 * antigo — como a Fase 2 busca os álbuns no servidor (sem hook client-side),
 * a normalização passa a viver aqui, perto da fonte dos dados.
 */
export function normalizeAlbum(album) {
  const fotos = (album.galeria_fotos || [])
    .slice()
    .sort((a, b) => a.ordem - b.ordem || new Date(a.created_at) - new Date(b.created_at))
    .map((foto) => ({
      id: foto.id,
      url: foto.url,
      thumb: foto.url,
      caption: foto.legenda || '',
      postedBy: foto.uploader_profile
        ? [foto.uploader_profile.nome, foto.uploader_profile.sobrenome].filter(Boolean).join(' ')
        : null,
      postedAt: foto.created_at ? new Date(foto.created_at).toLocaleDateString('pt-BR') : '',
    }))

  return {
    id: album.id,
    eventName: album.eventos?.nome || 'Sem evento',
    eventDate: album.eventos?.data_evento || '',
    community: album.comunidades?.nome || 'Sem comunidade',
    createdBy: album.user_profiles
      ? [album.user_profiles.nome, album.user_profiles.sobrenome].filter(Boolean).join(' ')
      : null,
    photos: fotos,
  }
}
