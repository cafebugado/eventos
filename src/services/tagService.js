import { supabase } from '../lib/supabase'
import { withRetry } from '../lib/apiClient'

// Buscar todas as tags (com retry automático)
export async function getTags() {
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

// Criar nova tag
export async function createTag(tag) {
  const { data, error } = await supabase
    .from('tags')
    .insert([
      {
        nome: tag.nome,
        cor: tag.cor || '#2563eb',
      },
    ])
    .select()
    .single()

  if (error) {
    console.error('Erro ao criar tag:', error)
    throw error
  }

  return data
}

// Atualizar tag
export async function updateTag(id, tag) {
  const { data, error } = await supabase
    .from('tags')
    .update({
      nome: tag.nome,
      cor: tag.cor || '#2563eb',
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Erro ao atualizar tag:', error)
    throw error
  }

  return data
}

// Deletar tag
export async function deleteTag(id) {
  const { error } = await supabase.from('tags').delete().eq('id', id)

  if (error) {
    console.error('Erro ao deletar tag:', error)
    throw error
  }

  return true
}

// Buscar tags de todos os eventos (com retry automático)
export async function getAllEventTags() {
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
export async function getEventTags(eventoId) {
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

// Associar tags a um evento (substitui todas as tags do evento)
export async function setEventTags(eventoId, tagIds) {
  // Remove todas as tags atuais do evento
  const { error: deleteError } = await supabase
    .from('evento_tags')
    .delete()
    .eq('evento_id', eventoId)

  if (deleteError) {
    console.error('Erro ao remover tags do evento:', deleteError)
    throw deleteError
  }

  // Se não há tags para adicionar, retorna
  if (!tagIds || tagIds.length === 0) {
    return []
  }

  // Adiciona as novas tags
  const rows = tagIds.map((tagId) => ({
    evento_id: eventoId,
    tag_id: tagId,
  }))

  const { data, error: insertError } = await supabase.from('evento_tags').insert(rows).select()

  if (insertError) {
    console.error('Erro ao associar tags ao evento:', insertError)
    throw insertError
  }

  return data
}
