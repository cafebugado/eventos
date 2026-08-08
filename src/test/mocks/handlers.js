import { http, HttpResponse } from 'msw'

// Base URL da API dedicada de eventos — mesmo fallback usado por
// src/lib/api/eventosApi.js quando NEXT_PUBLIC_API_BASE_URL não está
// definida (é o caso do ambiente de teste, que não carrega .env.local).
const API_BASE_URL = 'https://v3.api.eventoscafebugado.cafebugado.com.br'

// Handlers MSW para a API dedicada de eventos. Cobrem só o caminho feliz com
// um payload vazio — cada teste sobrescreve o handler relevante via
// server.use(...) quando precisa de um payload ou erro específico. Só os
// endpoints de destaques e listagem publicada estão implementados no
// frontend por enquanto; os demais voltam quando os services
// correspondentes forem reintroduzidos.
export const handlers = [
  http.get(`${API_BASE_URL}/events/featured`, () => HttpResponse.json([])),
  http.get(`${API_BASE_URL}/events/published`, () => HttpResponse.json([])),
]
