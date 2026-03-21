// Nomes dos dias da semana (usado por getDayName)
const DAY_NAMES = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

/**
 * Converte uma string de data para objeto Date.
 * Suporta DD/MM/YYYY, YYYY-MM-DD e ISO 8601.
 * Retorna null se o valor for inválido.
 */
export function parseEventDate(value) {
  if (!value) {
    return null
  }

  // YYYY-MM-DD (input[type=date])
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-').map(Number)
    return new Date(year, month - 1, day)
  }

  // DD/MM/YYYY
  const brMatch = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (brMatch) {
    const [, day, month, year] = brMatch
    return new Date(Number(year), Number(month) - 1, Number(day))
  }

  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

/** Retorna a data de hoje com horário zerado (meia-noite). */
export function getToday() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today
}

/** Verifica se o evento está no passado. */
export function isEventPast(dataEvento) {
  const date = parseEventDate(dataEvento)
  if (!date) {
    return false
  }
  return date < getToday()
}

/** Verifica se o evento é hoje. */
export function isEventToday(dataEvento) {
  const date = parseEventDate(dataEvento)
  if (!date) {
    return false
  }
  return date.getTime() === getToday().getTime()
}

/**
 * Ordena eventos: futuros primeiro (por proximidade), passados depois (mais recente primeiro).
 * Não muta o array original.
 */
export function sortEventsByDate(events) {
  const today = getToday()
  return [...events].sort((a, b) => {
    const dateA = parseEventDate(a.data_evento) ?? new Date(0)
    const dateB = parseEventDate(b.data_evento) ?? new Date(0)
    const isAFuture = dateA >= today
    const isBFuture = dateB >= today
    if (isAFuture !== isBFuture) {
      return isAFuture ? -1 : 1
    }
    return isAFuture ? dateA - dateB : dateB - dateA
  })
}

/** Formata Date para YYYY-MM-DD (para input[type=date]). */
export function formatDateToInput(value) {
  const date = parseEventDate(value)
  if (!date) {
    return ''
  }
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** Formata Date para DD/MM/YYYY (exibição). */
export function formatDateToDisplay(value) {
  const date = parseEventDate(value)
  if (!date) {
    return ''
  }
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

/** Retorna o nome do dia da semana para uma data. */
export function getDayName(value) {
  const date = parseEventDate(value)
  if (!date) {
    return ''
  }
  return DAY_NAMES[date.getDay()]
}
