import { http, HttpResponse } from 'msw'

// Base URL da API dedicada de eventos — mesmo fallback usado por
// src/lib/api/eventosApi.js quando NEXT_PUBLIC_API_BASE_URL não está
// definida (é o caso do ambiente de teste, que não carrega .env.local).
const API_BASE_URL = 'https://v2.backendeventoscfb.cafebugado.com.br'

// Handlers MSW para a API dedicada de eventos. Cobrem só o caminho feliz com
// um payload vazio/mínimo — cada teste sobrescreve o handler relevante via
// server.use(...) quando precisa de um payload ou erro específico.
export const handlers = [
  http.get(`${API_BASE_URL}/events/published`, () => HttpResponse.json([])),
  http.get(`${API_BASE_URL}/events/upcoming`, () => HttpResponse.json([])),
  http.get(`${API_BASE_URL}/events/slug/:slugOrId`, () =>
    HttpResponse.json({ error: 'not found' }, { status: 404 })
  ),
  http.get(`${API_BASE_URL}/events/stats/public`, () =>
    HttpResponse.json({ total_publicados: 0, noturno: 0, diurno: 0 })
  ),
  http.get(`${API_BASE_URL}/events/:eventId/recommended`, () => HttpResponse.json([])),
  http.get(`${API_BASE_URL}/tags`, () => HttpResponse.json([])),
  http.get(`${API_BASE_URL}/events/tags-map`, () => HttpResponse.json({})),
  http.get(`${API_BASE_URL}/events/:eventId/tags`, () => HttpResponse.json([])),
  http.get(`${API_BASE_URL}/gallery/albums/public`, () => HttpResponse.json([])),
  http.get(`${API_BASE_URL}/contributors`, () => HttpResponse.json([])),
]
