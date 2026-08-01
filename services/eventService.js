import { withRetry } from '../lib/apiClient'
import { parseEventDate, getToday } from '../utils/eventDate'

// Todas as funções recebem o client Supabase como primeiro argumento —
// Server Components/Actions usam lib/supabase/server (async), Client
// Components usam lib/supabase/client (síncrono).

// Buscar todos os eventos, incluindo rascunhos e arquivados (uso: sitemap)
export async function getEvents(supabase) {
  return withRetry(
    async () => {
      const { data, error } = await supabase
        .from('eventos')
        .select('*')
        .order('data_evento', { ascending: true })

      if (error) {
        throw error
      }
      return data
    },
    { context: 'getEvents' }
  )
}

// Buscar apenas eventos publicados (uso público — páginas de listagem)
export async function getPublishedEvents(supabase) {
  return withRetry(
    async () => {
      const { data, error } = await supabase
        .from('eventos')
        .select('*')
        .eq('status', 'publicado')
        .order('data_evento', { ascending: true })

      if (error) {
        // Fallback: se a coluna status ainda não existe (migration pendente), retorna todos
        if (error.code === '42703') {
          const { data: fallback, error: fallbackError } = await supabase
            .from('eventos')
            .select('*')
            .order('data_evento', { ascending: true })
          if (fallbackError) {
            throw fallbackError
          }
          return fallback
        }
        throw error
      }
      return data
    },
    { context: 'getPublishedEvents' }
  )
}

// Buscar evento por ID (com retry automático)
export async function getEventById(supabase, id) {
  return withRetry(
    async () => {
      const { data, error } = await supabase.from('eventos').select('*').eq('id', id).single()

      if (error) {
        throw error
      }
      return data
    },
    { context: 'getEventById' }
  )
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-/i

// Busca evento por slug ou UUID — garante compatibilidade retroativa com URLs antigas
export async function getEventBySlugOrId(supabase, slugOrId) {
  return withRetry(
    async () => {
      // Tenta por slug primeiro
      const { data: bySlug, error: slugError } = await supabase
        .from('eventos')
        .select('*')
        .eq('slug', slugOrId)
        .maybeSingle()

      if (slugError) {
        throw slugError
      }
      if (bySlug) {
        return bySlug
      }

      // Fallback por UUID (links antigos já compartilhados)
      if (!UUID_REGEX.test(slugOrId)) {
        const notFound = new Error('Event not found')
        notFound.code = 'PGRST116'
        throw notFound
      }

      const { data: byId, error: idError } = await supabase
        .from('eventos')
        .select('*')
        .eq('id', slugOrId)
        .single()

      if (idError) {
        throw idError
      }
      return byId
    },
    { context: 'getEventBySlugOrId' }
  )
}

// Buscar eventos por período (com retry automático)
export async function getEventsByPeriod(supabase, periodo) {
  return withRetry(
    async () => {
      const { data, error } = await supabase
        .from('eventos')
        .select('*')
        .eq('periodo', periodo)
        .eq('status', 'publicado')
        .order('data_evento', { ascending: true })

      if (error) {
        throw error
      }
      return data
    },
    { context: 'getEventsByPeriod' }
  )
}

// Buscar os próximos eventos (futuros, publicados, ordenados por data, limitado)
export async function getUpcomingEvents(supabase, limit = 3) {
  const data = await withRetry(
    async () => {
      const { data, error } = await supabase
        .from('eventos')
        .select('*')
        .eq('status', 'publicado')
        .order('created_at', { ascending: false })

      if (error) {
        // Fallback: se a coluna status ainda não existe (migration pendente), retorna todos
        if (error.code === '42703') {
          const { data: fallback, error: fallbackError } = await supabase
            .from('eventos')
            .select('*')
            .order('created_at', { ascending: false })
          if (fallbackError) {
            throw fallbackError
          }
          return fallback
        }
        throw error
      }
      return data
    },
    { context: 'getUpcomingEvents' }
  )

  const today = getToday()

  const upcoming = data
    .filter((event) => {
      if (!event.data_evento) {
        return false
      }
      const eventDate = parseEventDate(event.data_evento)
      return eventDate && eventDate >= today
    })
    .slice(0, limit)

  return upcoming
}

// Buscar estatísticas dos eventos (com retry automático)
export async function getEventStats(supabase) {
  const allEvents = await withRetry(
    async () => {
      const { data, error } = await supabase.from('eventos').select('periodo, status')

      if (error) {
        throw error
      }
      return data
    },
    { context: 'getEventStats' }
  )

  const total = allEvents.length
  const publicados = allEvents.filter((e) => e.status === 'publicado').length
  const rascunhos = allEvents.filter((e) => e.status === 'rascunho').length
  const noturno = allEvents.filter((e) => e.periodo === 'Noturno').length
  const diurno = allEvents.filter(
    (e) => e.periodo === 'Diurno' || e.periodo === 'Matinal' || e.periodo === 'Vespertino'
  ).length

  return { total, publicados, rascunhos, noturno, diurno }
}

// Helper privado para calcular semana ISO 8601
function getISOWeek(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7)
}

// Buscar eventos recomendados com base em tags e proximidade de data
export async function getRecommendedEvents(
  supabase,
  currentEventId,
  currentEventTags,
  currentEventDate,
  limit = 3
) {
  const today = getToday()

  const currentTagIds = new Set((currentEventTags || []).map((t) => t.id))
  const currentWeek = getISOWeek(currentEventDate)
  const currentYear = currentEventDate.getFullYear()

  // Buscar apenas eventos publicados e o mapa de tags em paralelo
  const [allEvents, allTagsMap] = await Promise.all([
    withRetry(
      async () => {
        const { data, error } = await supabase
          .from('eventos')
          .select('*')
          .eq('status', 'publicado')
          .order('data_evento', { ascending: true })
        if (error) {
          // Fallback: se a coluna status ainda não existe (migration pendente), retorna todos
          if (error.code === '42703') {
            const { data: fallback, error: fallbackError } = await supabase
              .from('eventos')
              .select('*')
              .order('data_evento', { ascending: true })
            if (fallbackError) {
              throw fallbackError
            }
            return fallback
          }
          throw error
        }
        return data
      },
      { context: 'getRecommendedEvents' }
    ),
    (async () => {
      try {
        const { getAllEventTags } = await import('./tagService')
        return await getAllEventTags(supabase)
      } catch {
        return {}
      }
    })(),
  ])

  // Filtrar candidatos: apenas futuros e excluindo o evento atual
  const candidates = allEvents.filter((ev) => {
    if (String(ev.id) === String(currentEventId)) {
      return false
    }
    if (!ev.data_evento) {
      return false
    }
    const evDate = parseEventDate(ev.data_evento)
    return evDate && evDate >= today
  })

  // Pontuar e ordenar cada candidato
  const scored = candidates.map((ev) => {
    const evDate = parseEventDate(ev.data_evento)

    const evTags = allTagsMap[String(ev.id)] || []
    const sharedTagCount = evTags.filter((t) => currentTagIds.has(t.id)).length
    const hasTagMatch = sharedTagCount > 0
    const sameWeek = getISOWeek(evDate) === currentWeek && evDate.getFullYear() === currentYear
    const daysAway = evDate - today

    return { ev, hasTagMatch, sameWeek, sharedTagCount, daysAway, evTags }
  })

  scored.sort((a, b) => {
    if (a.hasTagMatch !== b.hasTagMatch) {
      return a.hasTagMatch ? -1 : 1
    }
    if (a.sameWeek !== b.sameWeek) {
      return a.sameWeek ? -1 : 1
    }
    return a.daysAway - b.daysAway
  })

  return scored.slice(0, limit).map(({ ev, evTags }) => ({
    ...ev,
    tags: evTags,
  }))
}
