import { withRetry } from '../apiClient'

const DEFAULT_BASE_URL = 'https://v3.api.eventoscafebugado.cafebugado.com.br'

function resolveBaseUrl() {
  return process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_BASE_URL
}

function buildUrl(path, params) {
  const url = new URL(path, resolveBaseUrl())
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value))
      }
    }
  }
  return url
}

// GET na API dedicada de eventos (v3.api.eventoscafebugado.cafebugado.com.br).
// Sem cache por padrão (`cache: 'no-store'`). Toda chamada feita durante a
// renderização de páginas deve passar `next: { revalidate }` (ver
// eventService.js): as páginas são ISR (issue #376) e um fetch no-store dentro
// delas as tornaria dinâmicas de novo. Com `next`, o `cache: 'no-store'` é
// omitido, já que os dois são mutuamente exclusivos.
export async function apiGet(path, { params, context, next, ...fetchOptions } = {}) {
  const url = buildUrl(path, params)

  return withRetry(
    async () => {
      const response = await fetch(url, {
        headers: { Accept: 'application/json' },
        ...(next ? { next } : { cache: 'no-store' }),
        ...fetchOptions,
      })

      if (!response.ok) {
        const error = new Error(`GET ${path} respondeu ${response.status}`)
        error.status = response.status
        throw error
      }

      return response.json()
    },
    { context: context || `GET ${path}` }
  )
}
