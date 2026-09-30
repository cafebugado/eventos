import FavoritosPageClient from './FavoritosPageClient'
import { getEventsTagsMap } from '../../services/eventService'
import { captureError } from '../../lib/sentry'

export const metadata = {
  title: 'Favoritos | Eventos Café Bugado',
  description: 'Os eventos de tecnologia que você favoritou, reunidos num só lugar.',
  robots: { index: false, follow: true },
}

// ISR: servida do cache da CDN e regenerada no máximo a cada 300s — não voltar
// pra force-dynamic, que roda a função a cada visita (ver issue #376).
export const revalidate = 300

// Favoritos em si vêm do localStorage (useFavouritesStore) — o único dado
// buscado no servidor é o tagsMap, pros chips de tag do EventsGrid.
async function loadEventsTagsMap() {
  try {
    return await getEventsTagsMap()
  } catch (error) {
    captureError(error, { context: 'FavoritosPage.loadEventsTagsMap' })
    return {}
  }
}

export default async function FavoritosPage() {
  const tagsMap = await loadEventsTagsMap()

  return <FavoritosPageClient tagsMap={tagsMap} />
}
