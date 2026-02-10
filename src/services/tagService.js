import { supabase } from '../lib/supabase'

// Buscar todas as tags
export async function getTags() {
  const { data, error } = await supabase.from('tags').select('*').order('nome', { ascending: true })

  if (error) {
    console.error('Erro ao buscar tags:', error)
    throw error
  }

  return data
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

// Buscar tags de todos os eventos (retorna mapa evento_id -> tags[])
export async function getAllEventTags() {
  const { data, error } = await supabase
    .from('evento_tags')
    .select('evento_id, tags(id, nome, cor)')

  if (error) {
    console.error('Erro ao buscar tags dos eventos:', error)
    throw error
  }

  const map = {}
  for (const item of data) {
    if (!map[item.evento_id]) {
      map[item.evento_id] = []
    }
    map[item.evento_id].push(item.tags)
  }

  return map
}

// Buscar tags de um evento
export async function getEventTags(eventoId) {
  const { data, error } = await supabase
    .from('evento_tags')
    .select('tag_id, tags(id, nome, cor)')
    .eq('evento_id', eventoId)

  if (error) {
    console.error('Erro ao buscar tags do evento:', error)
    throw error
  }

  return data.map((item) => item.tags)
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
