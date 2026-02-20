import { supabase } from '../lib/supabase'

// Buscar perfil do usuario logado
export async function getMyProfile() {
  const { data, error } = await supabase.from('user_profiles').select('*').single()

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = nenhuma linha encontrada (perfil ainda nao criado)
    console.error('Erro ao buscar perfil:', error)
    throw error
  }

  return data || null
}

// Criar ou atualizar perfil do usuario logado
export async function upsertMyProfile({ nome, sobrenome, github_username, avatar_url }) {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Usuário não autenticado')
  }

  const { data, error } = await supabase
    .from('user_profiles')
    .upsert(
      { user_id: user.id, nome, sobrenome, github_username, avatar_url },
      { onConflict: 'user_id' }
    )
    .select()
    .single()

  if (error) {
    console.error('Erro ao salvar perfil:', error)
    throw error
  }

  return data
}
