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

export async function getEventBySlug(slugOrId) {
  return apiGet(`/events/slug/${slugOrId}`, {
    context: 'getEventBySlug',
    next: { revalidate: 30 },
  })
}
