import { apiGet } from '../lib/api/eventosApi'

// Todas as funções chamam a API dedicada (v2.backendeventoscfb.cafebugado.com.br)
// via apiGet — sem client/sessão, são GETs públicos chamáveis tanto de Server
// quanto de Client Components.

// Buscar apenas eventos publicados (uso público — páginas de listagem)
export async function getPublishedEvents() {
  return apiGet('/events/published', { context: 'getPublishedEvents' })
}

// Buscar os próximos eventos (futuros, publicados, ordenados, limitado)
export async function getUpcomingEvents(limit = 3) {
  return apiGet('/events/upcoming', { params: { limit }, context: 'getUpcomingEvents' })
}

// Busca evento por slug ou UUID — o backend resolve slug com fallback pra
// UUID (compatibilidade com links antigos) e responde 404 quando não existe.
export async function getEventBySlugOrId(slugOrId) {
  return apiGet(`/events/slug/${encodeURIComponent(slugOrId)}`, {
    context: 'getEventBySlugOrId',
  })
}

// Buscar estatísticas públicas de eventos (só eventos publicados — rascunhos
// não são expostos por este endpoint)
export async function getEventStats() {
  return apiGet('/events/stats/public', { context: 'getEventStats' })
}

// Buscar eventos recomendados com base em tags e proximidade de data — o
// backend já aplica a mesma regra de ordenação (tag em comum → mesma semana
// ISO → dias mais próximo).
export async function getRecommendedEvents(eventId, limit = 3) {
  return apiGet(`/events/${encodeURIComponent(eventId)}/recommended`, {
    params: { limit },
    context: 'getRecommendedEvents',
  })
}
