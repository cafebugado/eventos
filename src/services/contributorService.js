import { withRetry } from '../lib/apiClient'

// Todas as funções recebem o client Supabase como primeiro argumento — ver
// convenção em services/eventService.js.

// Buscar todos os contribuintes (com retry automático)
export async function getContributors(supabase) {
  return withRetry(
    async () => {
      const { data, error } = await supabase
        .from('contribuintes')
        .select('*')
        .order('nome', { ascending: true })

      if (error) {
        throw error
      }
      return data
    },
    { context: 'getContributors' }
  )
}
