'use client'

import { useState, useEffect } from 'react'
import { parseEventDate } from '../utils/eventDate'

/**
 * Calcula o estado de contagem regressiva para um evento.
 *
 * @param {string} dataEvento - Data no formato DD/MM/YYYY
 * @param {string} horario    - Horário no formato HH:MM ou HH:MM - HH:MM
 * @returns {{ isHappening: boolean, isWithin24h: boolean, countdown: string|null }}
 */
export function useEventCountdown(dataEvento, horario) {
  const getState = () => {
    const date = parseEventDate(dataEvento)
    if (!date) {
      return { isHappening: false, isWithin24h: false, countdown: null }
    }

    // Extrai apenas o primeiro horário (ex: "19:00 - 21:00" → "19:00")
    const timeStr = horario?.match(/\d{2}:\d{2}/)?.[0]
    if (timeStr) {
      const [h, m] = timeStr.split(':').map(Number)
      date.setHours(h, m, 0, 0)
    } else {
      date.setHours(0, 0, 0, 0)
    }

    const now = Date.now()
    const diffMs = date.getTime() - now
    const MS_1H = 60 * 60 * 1000
    const MS_24H = 24 * MS_1H

    // Acontecendo agora: dentro da janela de 1h após o início
    if (diffMs >= -MS_1H && diffMs <= 0) {
      return { isHappening: true, isWithin24h: false, countdown: null }
    }

    // Nas próximas 24h
    if (diffMs > 0 && diffMs <= MS_24H) {
      const totalSec = Math.floor(diffMs / 1000)
      const h = Math.floor(totalSec / 3600)
      const min = Math.floor((totalSec % 3600) / 60)
      const sec = totalSec % 60
      const countdown = `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
      return { isHappening: false, isWithin24h: true, countdown }
    }

    return { isHappening: false, isWithin24h: false, countdown: null }
  }

  // Estado inicial fixo (sem countdown) igual no servidor e no primeiro
  // render do cliente — depende de Date.now(), então calcular o valor real
  // já no useState causaria hydration mismatch (servidor e cliente rodam em
  // instantes diferentes). O valor de verdade é calculado no effect abaixo,
  // que só roda no cliente.
  const [state, setState] = useState({ isHappening: false, isWithin24h: false, countdown: null })

  useEffect(() => {
    let interval

    // setState roda dentro de um callback (setTimeout), não direto no corpo
    // do effect — mesma regra (react-hooks/refs) de EventCard.jsx.
    const tick = () => {
      const next = getState()
      setState(next)
      if (!next.isHappening && !next.isWithin24h) {
        clearInterval(interval)
      }
    }

    const timeout = setTimeout(tick, 0)
    interval = setInterval(tick, 1000)

    return () => {
      clearTimeout(timeout)
      clearInterval(interval)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataEvento, horario])

  return state
}
