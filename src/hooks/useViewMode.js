import { useState } from 'react'

const STORAGE_KEY = 'eventos-view-mode'
const VALID_MODES = ['grid', 'list', 'compact']

export default function useViewMode(defaultMode = 'grid') {
  const [viewMode, setViewMode] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return VALID_MODES.includes(stored) ? stored : defaultMode
    } catch {
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
    } catch {
      // ignore
    }
  }

  return { viewMode, changeViewMode }
}
