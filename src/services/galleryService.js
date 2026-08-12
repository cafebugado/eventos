import { apiGet } from '../lib/api/eventosApi'
import { formatDateToDisplay } from '../utils/eventDate'

// A API (GET /gallery/albums/public) devolve português/snake_case; os componentes de
// galeria (GalleryEventCard, GalleryPhotoModal) foram construídos antes do contrato
// existir, com nomes em inglês/camelCase — este mapeamento faz a ponte, evitando
// reescrever componentes já prontos e testados.
function mapAlbumToGalleryEvent(album) {
  return {
    id: album.id,
    eventName: album.evento_nome ?? album.comunidade_nome ?? 'Álbum da comunidade',
    eventDate: album.evento_data || formatDateToDisplay(album.created_at),
    community: album.comunidade_nome ?? '',
    createdBy: album.created_by_nome,
    photos: album.fotos.map((foto) => ({
      id: foto.id,
      url: foto.url,
      thumb: foto.url,
      caption: foto.legenda ?? '',
      postedBy: foto.uploaded_by_nome,
      postedAt: foto.created_at ? formatDateToDisplay(foto.created_at) : undefined,
    })),
  }
}

export async function getGalleryEvents() {
  const albums = await apiGet('/gallery/albums/public', {
    context: 'getGalleryEvents',
    next: { revalidate: 120 },
  })
  return albums.filter((album) => album.fotos.length > 0).map(mapAlbumToGalleryEvent)
}
