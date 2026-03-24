/**
 * Cache em memória com TTL — implementação SWR-like sem dependências externas.
 *
 * Estratégia stale-while-revalidate:
 *   - Retorna dado cacheado imediatamente (mesmo que stale)
 *   - Revalida em background quando TTL expirou
 *   - Listeners são notificados ao fim da revalidação
 */

const TTL_MS = 5 * 60 * 1000 // 5 minutos

const store = new Map()
// Map<key, Set<() => void>>
const listeners = new Map()

function notify(key) {
  listeners.get(key)?.forEach((fn) => fn())
}

/**
 * Lê o cache para uma chave.
 * @returns {{ data: any, isStale: boolean } | null}
 */
export function cacheRead(key) {
  const entry = store.get(key)
  if (!entry) {
    return null
  }
  return {
    data: entry.data,
    isStale: Date.now() - entry.timestamp > TTL_MS,
  }
}

/**
 * Escreve no cache.
 */
export function cacheWrite(key, data) {
  store.set(key, { data, timestamp: Date.now() })
  notify(key)
}

/**
 * Invalida uma ou mais chaves, apagando-as do cache.
 * Listeners são notificados para forçar re-fetch.
 */
export function cacheInvalidate(...keys) {
  keys.forEach((key) => {
    store.delete(key)
    notify(key)
  })
}

/**
 * Inscreve um listener para mudanças em uma chave.
 * @returns {() => void} função de unsubscribe
 */
export function cacheSubscribe(key, fn) {
  if (!listeners.has(key)) {
    listeners.set(key, new Set())
  }
  listeners.get(key).add(fn)
  return () => listeners.get(key)?.delete(fn)
}
