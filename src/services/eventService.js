import { supabase } from '../lib/supabase'

// Buscar todos os eventos
export async function getEvents() {
  const { data, error } = await supabase
    .from('eventos')
    .select('*')
    .order('data_evento', { ascending: true })

  if (error) {
    console.error('Erro ao buscar eventos:', error)
    throw error
  }

  return data
}

// Buscar evento por ID
export async function getEventById(id) {
  const { data, error } = await supabase.from('eventos').select('*').eq('id', id).single()

  if (error) {
    console.error('Erro ao buscar evento:', error)
    throw error
  }

  return data
}

// Criar novo evento
export async function createEvent(event) {
  const { data, error } = await supabase
    .from('eventos')
    .insert([
      {
        nome: event.nome,
        descricao: event.descricao || null,
        data_evento: event.data_evento,
        horario: event.horario,
        dia_semana: event.dia_semana,
        periodo: event.periodo,
        link: event.link,
        imagem: event.imagem || null,
      },
    ])
    .select()
    .single()

  if (error) {
    console.error('Erro ao criar evento:', error)
    throw error
  }

  return data
}

// Atualizar evento
export async function updateEvent(id, event) {
  const { data, error } = await supabase
    .from('eventos')
    .update({
      nome: event.nome,
      descricao: event.descricao || null,
      data_evento: event.data_evento,
      horario: event.horario,
      dia_semana: event.dia_semana,
      periodo: event.periodo,
      link: event.link,
      imagem: event.imagem || null,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Erro ao atualizar evento:', error)
    throw error
  }

  return data
}

// Deletar evento
export async function deleteEvent(id) {
  const { error } = await supabase.from('eventos').delete().eq('id', id)

  if (error) {
    console.error('Erro ao deletar evento:', error)
    throw error
  }

  return true
}

// Buscar eventos por período
export async function getEventsByPeriod(periodo) {
  const { data, error } = await supabase
    .from('eventos')
    .select('*')
    .eq('periodo', periodo)
    .order('data_evento', { ascending: true })

  if (error) {
    console.error('Erro ao buscar eventos por período:', error)
    throw error
  }

  return data
}

// Buscar os próximos eventos (futuros, ordenados por data, limitado)
export async function getUpcomingEvents(limit = 3) {
  const { data, error } = await supabase
    .from('eventos')
    .select('*')
    .order('data_evento', { ascending: true })

  if (error) {
    console.error('Erro ao buscar próximos eventos:', error)
    throw error
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const upcoming = data
    .filter((event) => {
      if (!event.data_evento) {
        return false
      }
      const parts = event.data_evento.split('/')
      if (parts.length === 3) {
        const eventDate = new Date(parts[2], parts[1] - 1, parts[0])
        return eventDate >= today
      }
      return new Date(event.data_evento) >= today
    })
    .slice(0, limit)

  return upcoming
}

// Buscar estatísticas dos eventos
export async function getEventStats() {
  const { data: allEvents, error } = await supabase.from('eventos').select('periodo')

  if (error) {
    console.error('Erro ao buscar estatísticas:', error)
    throw error
  }

  const total = allEvents.length
  const noturno = allEvents.filter((e) => e.periodo === 'Noturno').length
  const diurno = allEvents.filter(
    (e) => e.periodo === 'Diurno' || e.periodo === 'Matinal' || e.periodo === 'Vespertino'
  ).length

  return { total, noturno, diurno }
}

// Upload de imagem para o Supabase Storage
export async function uploadEventImage(file) {
  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
  const filePath = `eventos/${fileName}`

  const { error: uploadError } = await supabase.storage.from('imagens').upload(filePath, file)

  if (uploadError) {
    console.error('Erro ao fazer upload da imagem:', uploadError)
    throw uploadError
  }

  // Retorna a URL pública da imagem
  const { data } = supabase.storage.from('imagens').getPublicUrl(filePath)

  return data.publicUrl
}

// Deletar imagem do Storage
export async function deleteEventImage(imageUrl) {
  if (!imageUrl) {
    return
  }

  // Extrai o path da URL
  const url = new URL(imageUrl)
  const pathParts = url.pathname.split('/storage/v1/object/public/imagens/')
  if (pathParts.length < 2) {
    return
  }

  const filePath = pathParts[1]

  const { error } = await supabase.storage.from('imagens').remove([filePath])

  if (error) {
    console.error('Erro ao deletar imagem:', error)
  }
}
