import FavoritosPageClient from './FavoritosPageClient'

export const metadata = {
  title: 'Favoritos | Eventos Café Bugado',
  description: 'Os eventos de tecnologia que você favoritou, reunidos num só lugar.',
  robots: { index: false, follow: true },
}

// ISR: servida do cache da CDN e regenerada no máximo a cada 600s — não voltar
// pra force-dynamic, que roda a função a cada visita (ver issue #376).
// O valor precisa ser literal (exigência do Next) e igual a PAGE_REVALIDATE.FAVOURITES em
// constants/revalidate.js — o page.test.jsx falha se divergirem (ver issue #400).
export const revalidate = 600

export default function FavoritosPage() {
  return <FavoritosPageClient />
}
