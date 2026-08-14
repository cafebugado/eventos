'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Fica `true` assim que o elemento referenciado entra na viewport — dispara
 * uma única vez (desconecta o observer depois), não reage a sair/voltar.
 * @returns {{ ref: import('react').RefObject, isInView: boolean }}
 */
export function useInViewport() {
  const ref = useRef(null)
  const [isInView, setIsInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || isInView) {
      return undefined
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsInView(true)
      }
    })

    observer.observe(el)
    return () => observer.disconnect()
  }, [isInView])

  return { ref, isInView }
}
