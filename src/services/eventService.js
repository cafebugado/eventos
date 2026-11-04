import { apiGet } from '../lib/api/eventosApi'
import { DATA_REVALIDATE } from '../constants/revalidate'

export async function getFeaturedEvents(limit = 3) {
  return apiGet('/events/featured', {
    params: { limit },
    context: 'getFeaturedEvents',
    next: { revalidate: DATA_REVALIDATE.FEATURED_EVENTS },
  })
}

// Eventos publicados de hoje em diante (fuso de Brasília), já ordenados por
// data e horário pela API. Substitui a busca de todos os publicados, que
// trazia os passados só para descartá-los (ver issue #381).
export async function getUpcomingEvents({ limit, offset } = {}) {
  return apiGet('/events/upcoming', {
    params: { limit, offset },
    context: 'getUpcomingEvents',
    next: { revalidate: DATA_REVALIDATE.UPCOMING_EVENTS },
  })
}

export async function getEventDetail(slugOrId) {
  return apiGet(`/events/slug/${encodeURIComponent(slugOrId)}/detail`, {
    context: 'getEventDetail',
    next: { revalidate: DATA_REVALIDATE.EVENT_DETAIL },
  })
}

export async function getTags() {
  return apiGet('/tags', { context: 'getTags', next: { revalidate: DATA_REVALIDATE.TAGS } })
}

export async function getEventsTagsMap() {
  return apiGet('/events/tags-map', {
    context: 'getEventsTagsMap',
    next: { revalidate: DATA_REVALIDATE.EVENTS_TAGS_MAP },
  })
}

export async function getRecommendedEvents(eventId, limit = 3) {
  return apiGet(`/events/${encodeURIComponent(eventId)}/recommended`, {
    params: { limit },
    context: 'getRecommendedEvents',
  })
}

export async function getContributors() {
  return apiGet('/contributors', {
    context: 'getContributors',
    next: { revalidate: DATA_REVALIDATE.CONTRIBUTORS },
  })
}

export async function getEventStats() {
  return apiGet('/events/stats/public', {
    context: 'getEventStats',
    next: { revalidate: DATA_REVALIDATE.EVENT_STATS },
  })
}
