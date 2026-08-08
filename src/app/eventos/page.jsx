import EventsPageClient from './EventsPageClient'
import { getPublishedEvents } from '../../services/eventService'
import { captureError } from '../../lib/sentry'

export const metadata = {
  title: 'Próximos Eventos | Eventos Café Bugado',
  description:
    'Confira os próximos eventos de tecnologia. Meetups, workshops, hackathons e conferências indicados pela comunidade Café Bugado.',
}

export const dynamic = 'force-dynamic'

async function loadEvents() {
  try {
    return { events: await getPublishedEvents(), error: null }
  } catch (error) {
    captureError(error, { context: 'EventsPage.loadEvents' })
    return { events: [], error }
  }
}

export default async function EventsPage() {
  const { events, error } = await loadEvents()

  return <EventsPageClient events={events} tagsMap={{}} tags={[]} error={error} />
}
