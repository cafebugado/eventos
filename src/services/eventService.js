import { apiGet } from '../lib/api/eventosApi'

export async function getFeaturedEvents(limit = 3) {
  return apiGet('/events/featured', { params: { limit }, context: 'getFeaturedEvents' })
}

export async function getPublishedEvents({ cidade, modalidade, limit, offset } = {}) {
  return apiGet('/events/published', {
    params: { cidade, modalidade, limit, offset },
    context: 'getPublishedEvents',
  })
}

export async function getEventDetail(slugOrId) {
  return apiGet(`/events/slug/${slugOrId}/detail`, {
    context: 'getEventDetail',
    next: { revalidate: 30 },
  })
}

export async function getTags() {
  return apiGet('/tags', { context: 'getTags' })
}

export async function getEventsTagsMap() {
  return apiGet('/events/tags-map', { context: 'getEventsTagsMap' })
}

export async function getRecommendedEvents(eventId, limit = 3) {
  return apiGet(`/events/${eventId}/recommended`, {
    params: { limit },
    context: 'getRecommendedEvents',
  })
}

export async function getContributors() {
  return apiGet('/contributors', { context: 'getContributors' })
}

export async function getEventStats() {
  return apiGet('/events/stats/public', { context: 'getEventStats' })
}
