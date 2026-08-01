import { apiGet } from '../lib/api/eventosApi'

// ─── ÁLBUNS ─────────────────────────────────────────────────────────────────

/**
 * Busca todos os álbuns já com nome do evento, da comunidade e de quem
 * postou resolvidos pelo backend (GET /gallery/albums/public).
 */
export async function getAlbuns() {
  return apiGet('/gallery/albums/public', { context: 'getAlbuns' })
}

// ─── NORMALIZAÇÃO (uso público — app/galeria) ─────────────────────────────────

/**
 * Normaliza um álbum bruto (retornado por getAlbuns) para o formato usado
 * pela página pública de galeria. As fotos já vêm ordenadas (ordem, created_at)
 * e com os nomes de criador/uploader resolvidos pelo backend.
 */
export function normalizeAlbum(album) {
  const fotos = (album.fotos || []).map((foto) => ({
    id: foto.id,
    url: foto.url,
    thumb: foto.url,
    caption: foto.legenda || '',
    postedBy: foto.uploaded_by_nome || null,
    postedAt: foto.created_at ? new Date(foto.created_at).toLocaleDateString('pt-BR') : '',
  }))

  return {
    id: album.id,
    eventName: album.evento_nome || 'Sem evento',
    eventDate: album.evento_data || '',
    community: album.comunidade_nome || 'Sem comunidade',
    createdBy: album.created_by_nome || null,
    photos: fotos,
  }
}
