import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useEventCountdown } from './useEventCountdown'

describe('useEventCountdown', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-08-10T10:00:00'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('retorna estado vazio no primeiro render (igual em servidor e cliente, evita hydration mismatch)', () => {
    const { result } = renderHook(() => useEventCountdown('10/08/2026', '12:00'))
    expect(result.current).toEqual({ isHappening: false, isWithin24h: false, countdown: null })
  })

  it('sincroniza o countdown real logo depois do mount, pra evento dentro de 24h', () => {
    const { result } = renderHook(() => useEventCountdown('10/08/2026', '12:00'))

    act(() => {
      vi.advanceTimersByTime(0)
    })

    expect(result.current.isWithin24h).toBe(true)
    expect(result.current.countdown).toBe('02:00:00')
  })

  it('atualiza o countdown a cada segundo', () => {
    const { result } = renderHook(() => useEventCountdown('10/08/2026', '12:00'))

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(result.current.countdown).toBe('01:59:59')
  })

  it('marca isHappening quando o evento já começou (dentro de 1h)', () => {
    const { result } = renderHook(() => useEventCountdown('10/08/2026', '09:30'))

    act(() => {
      vi.advanceTimersByTime(0)
    })

    expect(result.current).toEqual({ isHappening: true, isWithin24h: false, countdown: null })
  })

  it('não marca nada pra evento fora da janela de 24h', () => {
    const { result } = renderHook(() => useEventCountdown('20/08/2026', '12:00'))

    act(() => {
      vi.advanceTimersByTime(0)
    })

    expect(result.current).toEqual({ isHappening: false, isWithin24h: false, countdown: null })
  })
})
