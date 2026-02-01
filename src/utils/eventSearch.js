import { stripRichText } from './richText'

const normalizeValue = (value) => {
  if (value === null || value === undefined) {
    return ''
  }
  return String(value).toLowerCase().trim()
}

const buildEventSearchText = (event) => {
  if (!event) {
    return ''
  }
  const description = stripRichText(event.descricao || '')
  return [
    event.nome,
    description,
    event.data_evento,
    event.horario,
    event.dia_semana,
    event.periodo,
  ]
    .filter(Boolean)
    .join(' ')
}

export const filterEventsByQuery = (events, query) => {
  const normalizedQuery = normalizeValue(query)
  if (!normalizedQuery) {
    return events
  }

  return events.filter((event) => {
    const searchableText = normalizeValue(buildEventSearchText(event))
    return searchableText.includes(normalizedQuery)
  })
}
