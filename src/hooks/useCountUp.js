import { useEffect, useRef, useState } from 'react'

/**
 * Anima um número de 0 até `end` quando o elemento entra na viewport.
 * @param {number} end - Valor final
 * @param {number} duration - Duração em ms (padrão 2000)
 * @returns {{ ref, displayValue }}
 */
export function useCountUp(end, duration = 2000) {
  const ref = useRef(null)
  const [displayValue, setDisplayValue] = useState(0)
  const animatedRef = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !animatedRef.current) {
          animatedRef.current = true
          observer.disconnect()

          const startTime = performance.now()

          function tick(now) {
            const elapsed = now - startTime
            const progress = Math.min(elapsed / duration, 1)
            // easeOutQuart para desacelerar no final
            const eased = 1 - Math.pow(1 - progress, 4)
            setDisplayValue(Math.round(eased * end))
            if (progress < 1) {
              requestAnimationFrame(tick)
            }
          }

          requestAnimationFrame(tick)
        }
      },
      { threshold: 0.5 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [end, duration])

  return { ref, displayValue }
}
