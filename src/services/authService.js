import { supabase } from '../lib/supabase'

// Login com email e senha
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error('Erro ao fazer login:', error)
    throw error
  }

  return data
}

// Logout
export async function signOut() {
  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error('Erro ao fazer logout:', error)
    throw error
  }

  return true
}

// Obter usuário atual
export async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) {
    console.error('Erro ao obter usuário:', error)
    return null
  }

  return user
}

// Obter sessão atual
export async function getSession() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()

  if (error) {
    console.error('Erro ao obter sessão:', error)
    return null
  }

  return session
}

// Listener para mudanças de autenticação
export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session)
  })
}

// Registrar novo usuário (opcional - para criar novos admins)
export async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    console.error('Erro ao registrar:', error)
    throw error
  }

  return data
}

// Resetar senha
export async function resetPassword(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/admin/reset-password`,
  })

  if (error) {
    console.error('Erro ao enviar email de reset:', error)
    throw error
  }

  return true
}

// Atualizar senha
export async function updatePassword(newPassword) {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (error) {
    console.error('Erro ao atualizar senha:', error)
    throw error
  }

  return true
}
