import { useState, useEffect, useCallback } from 'react'
import { getCurrentUserRole } from '../services/roleService'
import { onAuthStateChange } from '../services/authService'

const PERMISSIONS = {
  super_admin: {
    canCreateEvents: true,
    canEditEvents: true,
    canDeleteEvents: true,
    canManageTags: true,
    canManageContributors: true,
    canManageUsers: true,
    canUploadImages: true,
  },
  admin: {
    canCreateEvents: true,
    canEditEvents: true,
    canDeleteEvents: true,
    canManageTags: true,
    canManageContributors: true,
    canManageUsers: false,
    canUploadImages: true,
  },
  moderador: {
    canCreateEvents: false,
    canEditEvents: true,
    canDeleteEvents: false,
    canManageTags: false,
    canManageContributors: false,
    canManageUsers: false,
    canUploadImages: false,
  },
}

const NO_PERMISSIONS = {
  canCreateEvents: false,
  canEditEvents: false,
  canDeleteEvents: false,
  canManageTags: false,
  canManageContributors: false,
  canManageUsers: false,
  canUploadImages: false,
}

export const ROLE_LABELS = {
  super_admin: 'Super Admin',
  admin: 'Administrador',
  moderador: 'Moderador',
}

export default function useUserRole() {
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)
  const [permissions, setPermissions] = useState(NO_PERMISSIONS)

  const fetchRole = useCallback(async () => {
    try {
      setLoading(true)
      const userRole = await getCurrentUserRole()
      setRole(userRole)
      setPermissions(userRole ? PERMISSIONS[userRole] || NO_PERMISSIONS : NO_PERMISSIONS)
    } catch (error) {
      console.error('Erro ao buscar role:', error)
      setRole(null)
      setPermissions(NO_PERMISSIONS)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRole()

    const {
      data: { subscription },
    } = onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        fetchRole()
      } else if (event === 'SIGNED_OUT') {
        setRole(null)
        setPermissions(NO_PERMISSIONS)
      }
    })

    return () => subscription?.unsubscribe()
  }, [fetchRole])

  return { role, loading, permissions, refetchRole: fetchRole }
}
