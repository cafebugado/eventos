import EventsPageClient from './EventsPageClient'
import { getEventsTagsMap, getPublishedEvents, getTags } from '../../services/eventService'
import { captureError } from '../../lib/sentry'

export const metadata = {
  title: 'Próximos Eventos | Eventos Café Bugado',
  description:
    'Confira os próximos eventos de tecnologia. Meetups, workshops, hackathons e conferências indicados pela comunidade Café Bugado.',
}

export const dynamic = 'force-dynamic'

// getTags/getEventsTagsMap falhando não deve derrubar a listagem de eventos —
// só o filtro por tag fica indisponível (degradação graciosa).
async function loadEvents() {
  const [eventsResult, tagsResult, tagsMapResult] = await Promise.allSettled([
    getPublishedEvents(),
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

export default async function EventsPage() {
  const { events, tags, tagsMap, error } = await loadEvents()

  return <EventsPageClient events={events} tagsMap={tagsMap} tags={tags} error={error} />
}
