import FavoritosPageClient from './FavoritosPageClient'
import { getEventsTagsMap } from '../../services/eventService'
import { captureError } from '../../lib/sentry'

export const metadata = {
  title: 'Favoritos | Eventos Café Bugado',
  description: 'Os eventos de tecnologia que você favoritou, reunidos num só lugar.',
  robots: { index: false, follow: true },
}

export const dynamic = 'force-dynamic'

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
