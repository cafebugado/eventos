import FavoritosPageClient from './FavoritosPageClient'

export const metadata = {
  title: 'Favoritos | Eventos Café Bugado',
  description: 'Os eventos de tecnologia que você favoritou, reunidos num só lugar.',
  robots: { index: false, follow: true },
}

export const dynamic = 'force-dynamic'

// Sem fonte de dados: integração com a API removida — tagsMap fica vazio até
// a nova API ser plugada (favoritos em si vêm do localStorage, ver SPRINT.md).
export default function FavoritosPage() {
  return <FavoritosPageClient tagsMap={{}} />
}
