import { describe, it, expect, beforeEach } from 'vitest'

// Funcao para converter data no formato DD/MM/YYYY para objeto Date
// (copia da funcao em App.jsx para teste isolado)
function parseEventDate(dateStr) {
  if (!dateStr) {
    return new Date(0)
  }
  const parts = dateStr.split('/')
  if (parts.length === 3) {
    return new Date(parts[2], parts[1] - 1, parts[0])
  }
  return new Date(dateStr)
}

// Funcao de ordenacao extraida do App.jsx
function sortEvents(events, today) {
  return [...events].sort((a, b) => {
    const dateA = parseEventDate(a.data_evento)
    const dateB = parseEventDate(b.data_evento)

    const isAFuture = dateA >= today
    const isBFuture = dateB >= today

    if (isAFuture && !isBFuture) {
      return -1
    }
    if (!isAFuture && isBFuture) {
      return 1
    }

    // Ambos futuros: mais proximo primeiro
    if (isAFuture) {
      return dateA - dateB
    }
    // Ambos passados: mais recente primeiro
    return dateB - dateA
  })
}

describe('Ordenacao de eventos', () => {
  let mockToday

  beforeEach(() => {
    // Define uma data fixa para os testes: 15/01/2025
    mockToday = new Date(2025, 0, 15)
    mockToday.setHours(0, 0, 0, 0)
  })

  it('deve ordenar eventos futuros antes dos passados', () => {
    const events = [
      { id: 1, nome: 'Evento Passado', data_evento: '10/01/2025' },
      { id: 2, nome: 'Evento Futuro', data_evento: '20/01/2025' },
    ]

    const sorted = sortEvents(events, mockToday)

    expect(sorted[0].nome).toBe('Evento Futuro')
    expect(sorted[1].nome).toBe('Evento Passado')
  })

  it('deve ordenar eventos futuros por proximidade (mais proximo primeiro)', () => {
    const events = [
      { id: 1, nome: 'Evento Distante', data_evento: '30/01/2025' },
      { id: 2, nome: 'Evento Proximo', data_evento: '16/01/2025' },
      { id: 3, nome: 'Evento Medio', data_evento: '25/01/2025' },
    ]

    const sorted = sortEvents(events, mockToday)

    expect(sorted[0].nome).toBe('Evento Proximo')
    expect(sorted[1].nome).toBe('Evento Medio')
    expect(sorted[2].nome).toBe('Evento Distante')
  })

  it('deve ordenar eventos passados por recencia (mais recente primeiro)', () => {
    const events = [
      { id: 1, nome: 'Evento Antigo', data_evento: '01/01/2025' },
      { id: 2, nome: 'Evento Recente', data_evento: '14/01/2025' },
      { id: 3, nome: 'Evento Meio Antigo', data_evento: '05/01/2025' },
    ]

    const sorted = sortEvents(events, mockToday)

    expect(sorted[0].nome).toBe('Evento Recente')
    expect(sorted[1].nome).toBe('Evento Meio Antigo')
    expect(sorted[2].nome).toBe('Evento Antigo')
  })

  it('deve ordenar corretamente uma mistura de eventos futuros e passados', () => {
    const events = [
      { id: 1, nome: 'Passado Antigo', data_evento: '01/01/2025' },
      { id: 2, nome: 'Futuro Distante', data_evento: '30/01/2025' },
      { id: 3, nome: 'Passado Recente', data_evento: '14/01/2025' },
      { id: 4, nome: 'Futuro Proximo', data_evento: '16/01/2025' },
      { id: 5, nome: 'Passado Meio', data_evento: '10/01/2025' },
    ]

    const sorted = sortEvents(events, mockToday)

    // Futuros primeiro, ordenados por proximidade
    expect(sorted[0].nome).toBe('Futuro Proximo')
    expect(sorted[1].nome).toBe('Futuro Distante')

    // Passados depois, ordenados por recencia (mais recente primeiro)
    expect(sorted[2].nome).toBe('Passado Recente')
    expect(sorted[3].nome).toBe('Passado Meio')
    expect(sorted[4].nome).toBe('Passado Antigo')
  })

  it('deve tratar evento do dia atual como futuro', () => {
    const events = [
      { id: 1, nome: 'Evento Ontem', data_evento: '14/01/2025' },
      { id: 2, nome: 'Evento Hoje', data_evento: '15/01/2025' },
    ]

    const sorted = sortEvents(events, mockToday)

    expect(sorted[0].nome).toBe('Evento Hoje')
    expect(sorted[1].nome).toBe('Evento Ontem')
  })

  it('deve lidar com array vazio', () => {
    const events = []
    const sorted = sortEvents(events, mockToday)
    expect(sorted).toEqual([])
  })

  it('deve lidar com evento com data nula', () => {
    const events = [
      { id: 1, nome: 'Evento Sem Data', data_evento: null },
      { id: 2, nome: 'Evento Normal', data_evento: '20/01/2025' },
    ]

    const sorted = sortEvents(events, mockToday)

    // Evento sem data vai para o final (considerado passado muito antigo)
    expect(sorted[0].nome).toBe('Evento Normal')
    expect(sorted[1].nome).toBe('Evento Sem Data')
  })
})

describe('parseEventDate', () => {
  it('deve converter data no formato DD/MM/YYYY', () => {
    const date = parseEventDate('25/12/2025')
    expect(date.getDate()).toBe(25)
    expect(date.getMonth()).toBe(11) // Dezembro = 11 (zero-indexed)
    expect(date.getFullYear()).toBe(2025)
  })

  it('deve retornar Date(0) para data nula', () => {
    const date = parseEventDate(null)
    expect(date.getTime()).toBe(new Date(0).getTime())
  })

  it('deve retornar Date(0) para data undefined', () => {
    const date = parseEventDate(undefined)
    expect(date.getTime()).toBe(new Date(0).getTime())
  })
})
