import { useState } from 'react'

const STORAGE_KEY = 'eventos-view-mode'
const VALID_MODES = ['grid', 'list', 'compact', 'calendar']

export default function useViewMode(defaultMode = 'grid') {
  const [viewMode, setViewMode] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
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
      localStorage.setItem(STORAGE_KEY, mode)
    } catch (err) {
      console.warn('[useViewMode] Failed to write to localStorage:', err)
    }
  }

  return { viewMode, changeViewMode }
}
