import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  WEEKDAY_NAMES_LONG,
  MONTH_NAMES_LONG,
  getToday,
  isEventPast,
  isEventToday,
  parseEventDate,
} from './eventDate'

describe('WEEKDAY_NAMES_LONG', () => {
  it('tem 7 nomes, indexados como Date#getDay() (0 = Domingo)', () => {
    expect(WEEKDAY_NAMES_LONG).toHaveLength(7)
    expect(WEEKDAY_NAMES_LONG[0]).toBe('Domingo')
    expect(WEEKDAY_NAMES_LONG[6]).toBe('Sábado')
  })

  it('tem sufixo "-feira" só nos dias úteis (índices 1 a 5)', () => {
    const dias_uteis = WEEKDAY_NAMES_LONG.slice(1, 6)
    expect(dias_uteis.every((nome) => nome.endsWith('-feira'))).toBe(true)
    expect(WEEKDAY_NAMES_LONG[0]).not.toContain('-feira')
    expect(WEEKDAY_NAMES_LONG[6]).not.toContain('-feira')
  })
})

describe('MONTH_NAMES_LONG', () => {
  it('tem 12 nomes por extenso, capitalizados, indexados como Date#getMonth() (0 = Janeiro)', () => {
    expect(MONTH_NAMES_LONG).toHaveLength(12)
    expect(MONTH_NAMES_LONG[0]).toBe('Janeiro')
    expect(MONTH_NAMES_LONG[7]).toBe('Agosto')
    expect(MONTH_NAMES_LONG[11]).toBe('Dezembro')
  })
})

// Brasília é UTC-3 o ano todo. Os horários abaixo são instantes em UTC; o
// resultado não pode depender do fuso do processo (UTC no CI e na Vercel).
describe('virada do dia no fuso de Brasília', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it.each([
    ['20h59 de Brasília', '2026-10-01T23:59:00.000Z', '01/10/2026'],
    ['21h00 de Brasília (o dia já virou em UTC)', '2026-10-02T00:00:00.000Z', '01/10/2026'],
    ['23h59 de Brasília', '2026-10-02T02:59:00.000Z', '01/10/2026'],
    ['00h01 de Brasília', '2026-10-02T03:01:00.000Z', '02/10/2026'],
  ])('getToday às %s', (_descricao, agora, diaEsperado) => {
    vi.useFakeTimers().setSystemTime(new Date(agora))

    expect(getToday().getTime()).toBe(parseEventDate(diaEsperado).getTime())
  })

  it('às 23h30 de Brasília, o evento de hoje não é passado e conta como hoje', () => {
    vi.useFakeTimers().setSystemTime(new Date('2026-10-02T02:30:00.000Z'))

    expect(isEventPast('01/10/2026')).toBe(false)
    expect(isEventToday('01/10/2026')).toBe(true)
    expect(isEventPast('30/09/2026')).toBe(true)
  })

  it('à 00h01 de Brasília do dia seguinte, o evento passa a ser passado', () => {
    vi.useFakeTimers().setSystemTime(new Date('2026-10-02T03:01:00.000Z'))

    expect(isEventPast('01/10/2026')).toBe(true)
    expect(isEventToday('01/10/2026')).toBe(false)
    expect(isEventToday('02/10/2026')).toBe(true)
  })

  it('acompanha a virada de ano em Brasília, não em UTC', () => {
    vi.useFakeTimers().setSystemTime(new Date('2027-01-01T01:30:00.000Z'))

    expect(isEventToday('31/12/2026')).toBe(true)
    expect(isEventPast('31/12/2026')).toBe(false)
  })
})
