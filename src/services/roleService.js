import { supabase } from '../lib/supabase'
import { withRetry } from '../lib/apiClient'

// Buscar role do usuario atual
export async function getCurrentUserRole() {
  return withRetry(
    async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        return null
      }

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single()

      if (error) {
        // PGRST116 = no rows found, usuario sem role
        if (error.code === 'PGRST116') {
          return null
        }
        throw error
      }
      return data.role
    },
    { context: 'getCurrentUserRole' }
  )
}

// Listar todos os usuarios com roles (super_admin only)
export async function getUsersWithRoles() {
  const { data, error } = await supabase.rpc('get_users_with_roles')

  if (error) {
    console.error('Erro ao listar usuarios:', error)
    throw error
  }

  return data
}

// Listar usuarios visiveis para admin: retorna apenas moderadores e usuarios sem role
// Usa a RPC admin_get_users que valida permissoes no banco
export async function getUsersWithRolesForAdmin() {
  const { data, error } = await supabase.rpc('admin_get_users')

  if (error) {
    console.error('Erro ao listar usuarios (admin):', error)
    throw error
  }

  return data || []
}

// Atribuir role a um usuario (super_admin only via assign_user_role)
export async function assignUserRole(userId, role) {
  const { error } = await supabase.rpc('assign_user_role', {
    target_user_id: userId,
    new_role: role,
  })

  if (error) {
    console.error('Erro ao atribuir role:', error)
    throw error
  }

  return true
}

// Atribuir role a um usuario (admin: so pode atribuir moderador)
export async function adminAssignUserRole(userId, role) {
  const { error } = await supabase.rpc('admin_assign_user_role', {
    target_user_id: userId,
    new_role: role,
  })

  if (error) {
    console.error('Erro ao atribuir role (admin):', error)
    throw error
  }

  return true
}

// Remover role de um usuario (super_admin only)
export async function removeUserRole(userId) {
  const { error } = await supabase.rpc('remove_user_role', {
    target_user_id: userId,
  })

  if (error) {
    console.error('Erro ao remover role:', error)
    throw error
  }

  return true
}

// Remover role de um usuario (admin: so pode remover moderador)
export async function adminRemoveUserRole(userId) {
  const { error } = await supabase.rpc('admin_remove_user_role', {
    target_user_id: userId,
  })

  if (error) {
    console.error('Erro ao remover role (admin):', error)
    throw error
  }

  return true
}
