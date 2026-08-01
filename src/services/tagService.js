import { apiGet } from '../lib/api/eventosApi'

// Buscar todas as tags (já ordenadas por nome pelo backend)
export async function getTags() {
  return apiGet('/tags', { context: 'getTags' })
}

// Buscar tags de todos os eventos de uma vez — mapa { eventoId: tag[] }
export async function getAllEventTags() {
  return apiGet('/events/tags-map', { context: 'getAllEventTags' })
}

// Buscar tags de um evento
export async function getEventTags(eventoId) {
  return apiGet(`/events/${encodeURIComponent(eventoId)}/tags`, { context: 'getEventTags' })
}
