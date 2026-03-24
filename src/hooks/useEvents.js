import { useCallback } from 'react'
import { useSwrQuery } from './useSwrQuery'
import { getEvents, getUpcomingEvents, getEventStats } from '../services/eventService'
import { getTags, getAllEventTags } from '../services/tagService'
import { cacheInvalidate } from '../lib/cache'

export const CACHE_KEYS = {
  events: 'events',
  eventsWithTags: 'events:tags',
  upcoming: 'events:upcoming',
  stats: 'events:stats',
  tags: 'tags',
}

/**
 * Invalida todo o cache relacionado a eventos.
 * Chamar após create, update ou delete no admin.
 */
export function invalidateEventsCache() {
  cacheInvalidate(
    CACHE_KEYS.events,
    CACHE_KEYS.eventsWithTags,
    CACHE_KEYS.upcoming,
    CACHE_KEYS.stats
  )
}

/**
 * Retorna eventos + tagsMap + tags para filtro — com cache de 5 min.
 */
export function useEventsWithTags() {
  const fetcher = useCallback(async () => {
    const [events, tagsMap, tags] = await Promise.all([getEvents(), getAllEventTags(), getTags()])
    return { events, tagsMap, tags }
  }, [])

  const { data, loading, error, revalidate } = useSwrQuery(CACHE_KEYS.eventsWithTags, fetcher)

  return {
    events: data?.events ?? [],
    tagsMap: data?.tagsMap ?? {},
    tags: data?.tags ?? [],
    loading,
    error,
    revalidate,
  }
}

/**
 * Retorna os próximos N eventos — com cache de 5 min.
 */
export function useUpcomingEvents(limit = 3) {
  const fetcher = useCallback(() => getUpcomingEvents(limit), [limit])
  const { data, loading, error } = useSwrQuery(CACHE_KEYS.upcoming, fetcher)
  return { events: data ?? [], loading, error }
}

/**
 * Retorna estatísticas de eventos — com cache de 5 min.
 */
export function useEventStats() {
  const fetcher = useCallback(() => getEventStats(), [])
  const { data, loading, error } = useSwrQuery(CACHE_KEYS.stats, fetcher)
  return { stats: data ?? null, loading, error }
}
