import { supabase } from '../lib/supabase'
import { withRetry } from '../lib/apiClient'

export async function getCommunities() {
  return withRetry(
    async () => {
      const { data, error } = await supabase
        .from('comunidades')
        .select('*')
        .order('nome', { ascending: true })

      if (error) {
        throw error
      }
      return data
    },
    { context: 'getCommunities' }
  )
}

export async function createCommunity(community) {
  const { data, error } = await supabase
    .from('comunidades')
    .insert([{ nome: community.nome }])
    .select()
    .single()

  if (error) {
    console.error('Erro ao criar comunidade:', error)
    throw error
  }

  return data
}

export async function updateCommunity(id, community) {
  const { data, error } = await supabase
    .from('comunidades')
    .update({ nome: community.nome })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Erro ao atualizar comunidade:', error)
    throw error
  }

  return data
}

export async function deleteCommunity(id) {
  const { error } = await supabase.from('comunidades').delete().eq('id', id)

  if (error) {
    console.error('Erro ao deletar comunidade:', error)
    throw error
  }

  return true
}
