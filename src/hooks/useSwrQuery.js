import { useState, useEffect, useRef, useCallback } from 'react'
import { cacheRead, cacheWrite, cacheSubscribe } from '../lib/cache'

/**
 * Hook SWR-like genérico.
 * - Retorna dado cacheado imediatamente se disponível
 * - Revalida em background quando stale (TTL expirado)
 * - Re-executa quando o cache da chave é invalidado externamente
 *
 * @param {string}           cacheKey - Chave única no cache
 * @param {() => Promise<*>} fetcher  - Função que busca os dados
 * @returns {{ data, loading, error, revalidate }}
 */
export function useSwrQuery(cacheKey, fetcher) {
  const cached = cacheRead(cacheKey)

  const [data, setData] = useState(cached?.data ?? null)
  const [loading, setLoading] = useState(!cached)
  const [error, setError] = useState(null)
  const fetchingRef = useRef(false)

  const revalidate = useCallback(
    async (silent = false) => {
      if (fetchingRef.current) {
        return
      }
      fetchingRef.current = true

      if (!silent) {
        setLoading(true)
      }
      setError(null)

      try {
        const result = await fetcher()
        cacheWrite(cacheKey, result)
        setData(result)
      } catch (err) {
        setError(err)
      } finally {
        fetchingRef.current = false
        if (!silent) {
          setLoading(false)
        }
      }
    },
    [cacheKey, fetcher]
  )

  useEffect(() => {
    const cached = cacheRead(cacheKey)

    if (!cached) {
      // Sem cache — fetch normal com loading
      revalidate(false)
    } else if (cached.isStale) {
      // Dado stale — exibe imediatamente, revalida em background
      setData(cached.data)
      setLoading(false)
      revalidate(true)
    } else {
      // Dado fresco — usa direto
      setData(cached.data)
      setLoading(false)
    }

    // Escuta invalidações externas (ex: após CRUD no admin)
    const unsubscribe = cacheSubscribe(cacheKey, () => {
      const fresh = cacheRead(cacheKey)
      if (!fresh) {
        revalidate(false)
      } else {
        setData(fresh.data)
      }
    })

    return unsubscribe
  }, [cacheKey, revalidate])

  return { data, loading, error, revalidate: () => revalidate(false) }
}
