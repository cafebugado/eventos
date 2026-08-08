import { getAllEventTags } from '../../services/tagService'
import { captureError } from '../../lib/sentry'
import FavoritosPageClient from './FavoritosPageClient'

export const metadata = {
  title: 'Favoritos | Eventos Café Bugado',
  description: 'Os eventos de tecnologia que você favoritou, reunidos num só lugar.',
  robots: { index: false, follow: true },
}

// Força renderização dinâmica — ver comentário em app/page.jsx.
export const dynamic = 'force-dynamic'

// Server Component: os favoritos em si vivem no localStorage do usuário
// (useFavouritesStore), então a única coisa que faz sentido buscar aqui é o
// tagsMap pros chips dos cards — degrada pra {} sem derrubar a página.
async function loadTags() {
  try {
    return await getAllEventTags()
  } catch (error) {
    captureError(error, { context: 'FavoritosPage.loadTags' })
    return {}
  }
}

export default async function FavoritosPage() {
  const tagsMap = await loadTags()

  return <FavoritosPageClient tagsMap={tagsMap} />
}
