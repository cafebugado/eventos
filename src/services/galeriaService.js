import { supabase } from '../lib/supabase'
import { withRetry } from '../lib/apiClient'

// ─── ÁLBUNS ─────────────────────────────────────────────────────────────────

/**
 * Busca todos os álbuns com dados do evento, comunidade, criador e fotos.
 */
export async function getAlbuns() {
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

/**
 * Cria um álbum. created_by é preenchido pelo trigger no banco.
 */
export async function createAlbum({ evento_id, comunidade_id }) {
  return withRetry(
    async () => {
      const { data, error } = await supabase
        .from('galeria_albuns')
        .insert([{ evento_id, comunidade_id }])
        .select(
          `
          id,
          created_at,
          evento_id,
          comunidade_id,
          created_by,
          eventos ( id, nome, data_evento ),
          comunidades ( id, nome )
        `
        )
        .single()
      if (error) {
        throw error
      }

      // Buscar perfil do criador
      let user_profiles = null
      if (data.created_by) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('user_id, nome, sobrenome')
          .eq('user_id', data.created_by)
          .maybeSingle()
        user_profiles = profile
      }

      return { ...data, galeria_fotos: [], user_profiles }
    },
    { context: 'createAlbum' }
  )
}

/**
 * Atualiza evento e/ou comunidade de um álbum.
 */
export async function updateAlbum(id, { evento_id, comunidade_id }) {
  return withRetry(
    async () => {
      const { data, error } = await supabase
        .from('galeria_albuns')
        .update({ evento_id, comunidade_id })
        .eq('id', id)
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
        .single()
      if (error) {
        throw error
      }

      // Buscar perfil do criador
      let user_profiles = null
      if (data.created_by) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('user_id, nome, sobrenome')
          .eq('user_id', data.created_by)
          .maybeSingle()
        user_profiles = profile
      }

      return { ...data, user_profiles }
    },
    { context: 'updateAlbum' }
  )
}

/**
 * Deleta um álbum (as fotos são removidas em cascata pelo banco).
 * Os arquivos no Storage precisam ser removidos separadamente via deletePhoto.
 */
export async function deleteAlbum(id) {
  return withRetry(
    async () => {
      const { error } = await supabase.from('galeria_albuns').delete().eq('id', id)
      if (error) {
        throw error
      }
      return true
    },
    { context: 'deleteAlbum' }
  )
}

// ─── FOTOS ───────────────────────────────────────────────────────────────────

/**
 * Faz upload de um File para o Storage e insere o registro na tabela galeria_fotos.
 * @param {string} albumId
 * @param {File} file
 * @param {string} [legenda]
 * @param {number} [ordem]
 */
export async function uploadFoto(albumId, file, legenda = '', ordem = 0) {
  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
  const storagePath = `galeria/${albumId}/${fileName}`

  // 1. Upload para o bucket
  const { error: uploadError } = await supabase.storage.from('imagens').upload(storagePath, file)

  if (uploadError) {
    throw uploadError
  }

  // 2. URL pública
  const { data: urlData } = supabase.storage.from('imagens').getPublicUrl(storagePath)

  // 3. Inserir registro
  return withRetry(
    async () => {
      const { data, error } = await supabase
        .from('galeria_fotos')
        .insert([
          {
            album_id: albumId,
            url: urlData.publicUrl,
            storage_path: storagePath,
            legenda: legenda.trim() || null,
            ordem,
          },
        ])
        .select()
        .single()
      if (error) {
        throw error
      }
      return data
    },
    { context: 'uploadFoto' }
  )
}

/**
 * Insere uma foto por URL externa (sem upload no Storage).
 */
export async function addFotoByUrl(albumId, url, legenda = '', ordem = 0) {
  return withRetry(
    async () => {
      const { data, error } = await supabase
        .from('galeria_fotos')
        .insert([
          { album_id: albumId, url, storage_path: null, legenda: legenda.trim() || null, ordem },
        ])
        .select()
        .single()
      if (error) {
        throw error
      }
      return data
    },
    { context: 'addFotoByUrl' }
  )
}

/**
 * Remove uma foto do banco e, se tiver storage_path, do bucket também.
 */
export async function updateFotoLegenda(fotoId, legenda) {
  return withRetry(
    async () => {
      const { data, error } = await supabase
        .from('galeria_fotos')
        .update({ legenda: legenda.trim() || null })
        .eq('id', fotoId)
        .select('id, legenda')
        .single()
      if (error) {
        throw error
      }
      return data
    },
    { context: 'updateFotoLegenda' }
  )
}

export async function deleteFoto(fotoId, storagePath) {
  return withRetry(
    async () => {
      const { error } = await supabase.from('galeria_fotos').delete().eq('id', fotoId)
      if (error) {
        throw error
      }

      if (storagePath) {
        await supabase.storage.from('imagens').remove([storagePath])
      }
      return true
    },
    { context: 'deleteFoto' }
  )
}
