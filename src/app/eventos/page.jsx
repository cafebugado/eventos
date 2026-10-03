import { Suspense } from 'react'
import EventsPageClient from './EventsPageClient'
import Loading from './loading'
import { getEventsTagsMap, getPublishedEvents, getTags } from '../../services/eventService'
import { captureError } from '../../lib/sentry'
import { isEventPast } from '../../utils/eventDate'

export const metadata = {
  title: 'Próximos Eventos | Eventos Café Bugado',
  description:
    'Confira os próximos eventos de tecnologia. Meetups, workshops, hackathons e conferências indicados pela comunidade Café Bugado.',
}

// ISR: servida do cache da CDN e regenerada no máximo a cada 600s — não voltar
// pra force-dynamic, que roda a função (e até 20 fetches na API) a cada visita
// (ver issue #376).
// O valor precisa ser literal (exigência do Next) e igual a PAGE_REVALIDATE.EVENTS em
// constants/revalidate.js — o page.test.jsx falha se divergirem (ver issue #400).
export const revalidate = 600

const PUBLISHED_EVENTS_PAGE_SIZE = 100
const MAX_PUBLISHED_EVENTS_PAGES = 20

async function fetchAllPublishedEvents() {
  const events = []
  let offset = 0

  for (let page = 0; page < MAX_PUBLISHED_EVENTS_PAGES; page += 1) {
    const batch = await getPublishedEvents({ limit: PUBLISHED_EVENTS_PAGE_SIZE, offset })
    events.push(...batch)

    if (batch.length < PUBLISHED_EVENTS_PAGE_SIZE) {
      break
    }
    offset += PUBLISHED_EVENTS_PAGE_SIZE
  }

  return events
}

async function loadEvents() {
  const [eventsResult, tagsResult, tagsMapResult] = await Promise.allSettled([
    fetchAllPublishedEvents(),
    getTags(),
    getEventsTagsMap(),
  ])

  if (tagsResult.status === 'rejected') {
    captureError(tagsResult.reason, { context: 'EventsPage.loadTags' })
  }
  if (tagsMapResult.status === 'rejected') {
    captureError(tagsMapResult.reason, { context: 'EventsPage.loadTagsMap' })
  }

  const tags = tagsResult.status === 'fulfilled' ? tagsResult.value : []
  const tagsMap = tagsMapResult.status === 'fulfilled' ? tagsMapResult.value : {}

  if (eventsResult.status === 'rejected') {
    captureError(eventsResult.reason, { context: 'EventsPage.loadEvents' })
    return { events: [], tags, tagsMap, error: eventsResult.reason }
  }

  return { events: eventsResult.value, tags, tagsMap, error: null }
}

// Sem `searchParams` aqui de propósito: lê-los no servidor força a rota a ser
// dinâmica. Os filtros (?q=&tag=&fav=&from=&to=) e a paginação vivem na URL e
// são aplicados no client (hooks/useEventFilters.js) — e por usarem
// useSearchParams numa rota estática, o client precisa de um <Suspense>.
export default async function EventsPage() {
  const { events, tags, tagsMap, error } = await loadEvents()
  // O client descarta os passados de novo (cobre a janela entre revalidações);
  // filtrar aqui só evita mandar no HTML/RSC eventos que nunca são exibidos.
  const upcomingEvents = events.filter((event) => !isEventPast(event.data_evento))

  return (
    <Suspense fallback={<Loading />}>
      <EventsPageClient events={upcomingEvents} tagsMap={tagsMap} tags={tags} error={error} />
    </Suspense>
  )
}
