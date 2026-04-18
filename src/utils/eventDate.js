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
function parseTimeMinutes(horario) {
  if (!horario) {
    return 0
  }
  const match = horario.match(/(\d{1,2}):(\d{2})/)
  if (!match) {
    return 0
  }
  const hours = Number(match[1])
  const minutes = Number(match[2])
  if (hours > 23 || minutes > 59) {
    return 0
  }
  return hours * 60 + minutes
}

export function sortEventsByDate(events) {
  const today = getToday()
  return [...events].sort((a, b) => {
    const dateA = parseEventDate(a.data_evento)
    const dateB = parseEventDate(b.data_evento)

    if (dateA === null && dateB === null) {
      return 0
    }
    if (dateA === null) {
      return 1
    }
    if (dateB === null) {
      return -1
    }

    const isAFuture = dateA >= today
    const isBFuture = dateB >= today
    if (isAFuture !== isBFuture) {
      return isAFuture ? -1 : 1
    }
    if (dateA - dateB !== 0) {
      return isAFuture ? dateA - dateB : dateB - dateA
    }
    const timeA = parseTimeMinutes(a.horario)
    const timeB = parseTimeMinutes(b.horario)
    return isAFuture ? timeA - timeB : timeB - timeA
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
