import { createClient } from '../../lib/supabase/server'
import { getPublishedEvents } from '../../services/eventService'
import { getAllEventTags, getTags } from '../../services/tagService'
import { captureError } from '../../lib/sentry'
import EventsPageClient from './EventsPageClient'

export const metadata = {
  title: 'Próximos Eventos | Eventos Café Bugado',
  description:
    'Confira os próximos eventos de tecnologia. Meetups, workshops, hackathons e conferências indicados pela comunidade Café Bugado.',
}

// Server Component: busca a lista completa de eventos publicados uma única
// vez. Filtro/busca/paginação acontecem inteiramente no cliente (EventsPageClient)
// contra essa lista já carregada — por isso esta função deliberadamente NÃO
// declara/lê o parâmetro `searchParams`: se lesse, o Next trataria a rota como
// dependente da query string e re-executaria esta busca ao Supabase a cada
// mudança de filtro/página. Sem essa dependência, o App Router mantém as
// trocas de filtro/página inteiramente client-side (Partial Rendering).
async function loadEvents() {
  const supabase = await createClient()
  try {
    const [events, tagsMap, tags] = await Promise.all([
      getPublishedEvents(supabase),
      getAllEventTags(supabase),
      getTags(supabase),
    ])
    return { events, tagsMap, tags, error: null }
  } catch (error) {
    captureError(error, { context: 'EventsPage.loadEvents' })
    return { events: [], tagsMap: {}, tags: [], error }
  }
}

export default async function EventsPage() {
  const { events, tagsMap, tags, error } = await loadEvents()

  return <EventsPageClient events={events} tagsMap={tagsMap} tags={tags} error={error} />
}
