'use client'

import { useSyncExternalStore } from 'react'

// useSyncExternalStore em vez de useState+useEffect: essa é a API pensada
// pelo React para assinar uma fonte externa (matchMedia, aqui) sem cair no
// padrão "setState síncrono dentro de effect" que o react-hooks/set-state-in-effect
// (eslint-plugin-react-hooks) rejeita — e evita mismatch de hidratação, já
// que o snapshot do servidor é sempre `false` (matchMedia não existe lá).
function subscribe(query, callback) {
  if (typeof window === 'undefined') {
    return () => {}
  }
  const mediaQuery = window.matchMedia(query)
  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', callback)
  } else {
    mediaQuery.addListener(callback)
  }
  return () => {
    if (mediaQuery.removeEventListener) {
      mediaQuery.removeEventListener('change', callback)
    } else {
      mediaQuery.removeListener(callback)
    }
  }
}

function getSnapshot(query) {
  if (typeof window === 'undefined') {
    return false
  }
  return window.matchMedia(query).matches
}

function getServerSnapshot() {
  return false
}

export function useMediaQuery(query) {
  return useSyncExternalStore(
    (callback) => subscribe(query, callback),
    () => getSnapshot(query),
    getServerSnapshot
  )
}
