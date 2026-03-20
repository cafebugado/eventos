import { useState, useCallback, useEffect } from 'react'

const STORAGE_KEY = 'admin-sidebar-collapsed'

export function useSidebarCollapse() {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true'
    } catch {
      return false
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(isCollapsed))
    } catch {
      // ignore
    }
  }, [isCollapsed])

  const toggle = useCallback(() => setIsCollapsed((prev) => !prev), [])
  const collapse = useCallback(() => setIsCollapsed(true), [])
  const expand = useCallback(() => setIsCollapsed(false), [])

  return { isCollapsed, toggle, collapse, expand }
}
