import { withRetry } from '../lib/apiClient'

// Todas as funções recebem o client Supabase como primeiro argumento —
// Server Components/Actions usam lib/supabase/server (async), Client
// Components usam lib/supabase/client (síncrono).

// Buscar todas as tags (com retry automático)
export async function getTags(supabase) {
  return withRetry(
    async () => {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .order('nome', { ascending: true })

      if (error) {
        throw error
      }
      return data
    },
    { context: 'getTags' }
  )
}

// Buscar tags de todos os eventos (com retry automático)
export async function getAllEventTags(supabase) {
  const data = await withRetry(
    async () => {
      const { data, error } = await supabase
        .from('evento_tags')
        .select('evento_id, tags(id, nome, cor)')

      if (error) {
        throw error
      }
      return data
    },
    { context: 'getAllEventTags' }
  )

  const map = {}
  for (const item of data) {
    if (!map[item.evento_id]) {
      map[item.evento_id] = []
    }
    map[item.evento_id].push(item.tags)
  }

  return map
}

// Buscar tags de um evento (com retry automático)
export async function getEventTags(supabase, eventoId) {
  return withRetry(
    async () => {
      const { data, error } = await supabase
        .from('evento_tags')
        .select('tag_id, tags(id, nome, cor)')
        .eq('evento_id', eventoId)

      if (error) {
        throw error
      }
      return data.map((item) => item.tags)
    },
    { context: 'getEventTags' }
  )
}
