import { apiGet } from '../lib/api/eventosApi'

export async function getFeaturedEvents(limit = 3) {
  return apiGet('/events/featured', { params: { limit }, context: 'getFeaturedEvents' })
}
