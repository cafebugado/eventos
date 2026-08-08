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
// Sem cache por padrão — os dados mudam a qualquer momento (eventos novos,
// badge de "hoje"/"acontecendo agora"), então cada request busca o estado
// atual. Passe `next: { revalidate }` pra rotas que toleram cache (ex.:
// sitemap.js) — nesse caso `cache: 'no-store'` é omitido, já que os dois são
// mutuamente exclusivos.
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
