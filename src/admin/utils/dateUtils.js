const DAY_NAMES = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
]

const DATE_INPUT_REGEX = /^\d{4}-\d{2}-\d{2}$/
const DATE_BR_REGEX = /^(\d{2})\/(\d{2})\/(\d{4})$/

export const parseDateValue = (value) => {
  if (!value) {
    return null
  }

  if (DATE_INPUT_REGEX.test(value)) {
    const [year, month, day] = value.split('-').map(Number)
    return new Date(year, month - 1, day)
  }

  const brMatch = value.match(DATE_BR_REGEX)
  if (brMatch) {
    const [, day, month, year] = brMatch
    return new Date(Number(year), Number(month) - 1, Number(day))
  }

  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export const formatDateToInput = (value) => {
  const date = parseDateValue(value)
  if (!date) {
    return ''
  }
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate()
  ).padStart(2, '0')}`
}

export const formatDateToDisplay = (value) => {
  const date = parseDateValue(value)
  if (!date) {
    return ''
  }
  return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(
    2,
    '0'
  )}/${date.getFullYear()}`
}

export const getDayName = (value) => {
  const date = parseDateValue(value)
  if (!date) {
    return ''
  }
  return DAY_NAMES[date.getDay()]
}
