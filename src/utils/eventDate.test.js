import { describe, expect, it } from 'vitest'
import { WEEKDAY_NAMES_LONG, MONTH_NAMES_LONG } from './eventDate'

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
