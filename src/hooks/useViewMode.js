'use client'

import { useState } from 'react'

const STORAGE_KEY = 'eventos-view-mode'
const VALID_MODES = ['grid', 'compact', 'calendar']

// Preferência de visualização — mantida em localStorage (não na URL), pois é
// uma preferência de exibição do usuário, não um filtro compartilhável.
export function useViewMode(defaultMode = 'grid') {
  const [viewMode, setViewMode] = useState(() => {
    if (typeof window === 'undefined') {
      return defaultMode
    }
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      return VALID_MODES.includes(stored) ? stored : defaultMode
    } catch (err) {
      console.warn('[useViewMode] Failed to read from localStorage:', err)
      return defaultMode
    }
  })

  const changeViewMode = (mode) => {
    if (!VALID_MODES.includes(mode)) {
      return
    }
    setViewMode(mode)
    try {
      window.localStorage.setItem(STORAGE_KEY, mode)
    } catch (err) {
      console.warn('[useViewMode] Failed to write to localStorage:', err)
    }
  }

  return { viewMode, changeViewMode }
}
