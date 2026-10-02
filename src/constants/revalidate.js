// Janelas de revalidação (ISR), em segundos. Com ISR, cada rota com tráfego é
// regenerada uma vez por janela, com ou sem dado novo — é a janela, e não o
// número de visitas, que define o consumo de CPU na Vercel (ver issue #400).
//
// O Next exige um literal em `export const revalidate` de cada page.jsx, então
// a página não consegue importar daqui: o valor é repetido lá e o teste de cada
// página (page.test.jsx) falha se os dois divergirem.
export const PAGE_REVALIDATE = {
  HOME: 600,
  EVENTS: 600,
  EVENT_DETAIL: 300,
  FAVOURITES: 600,
  GALLERY: 300,
  ABOUT: 600,
}

// Janela de cada fetch, derivada da página que o consome. O Next usa a menor
// janela entre a página e os fetches dela, então um fetch mais curto encurta a
// página inteira sem aviso (era o caso do detalhe do evento: página com 300s,
// fetch com 30s). Um dado usado por várias páginas segue a maior delas, para
// não encurtar nenhuma.
export const DATA_REVALIDATE = {
  FEATURED_EVENTS: PAGE_REVALIDATE.HOME,
  PUBLISHED_EVENTS: PAGE_REVALIDATE.EVENTS,
  EVENT_DETAIL: PAGE_REVALIDATE.EVENT_DETAIL,
  TAGS: PAGE_REVALIDATE.EVENTS,
  EVENTS_TAGS_MAP: Math.max(
    PAGE_REVALIDATE.HOME,
    PAGE_REVALIDATE.EVENTS,
    PAGE_REVALIDATE.FAVOURITES
  ),
  CONTRIBUTORS: PAGE_REVALIDATE.ABOUT,
  EVENT_STATS: PAGE_REVALIDATE.ABOUT,
  GALLERY_ALBUMS: PAGE_REVALIDATE.GALLERY,
}
