/**
 * Extrai as opções de local filtráveis a partir de uma lista de eventos:
 * cada cidade distinta de eventos presenciais + "Online" (só se houver ao
 * menos 1 evento com modalidade Online), ordenado alfabeticamente (pt-BR).
 *
 * Usado pelo filtro de local em /eventos (ver useEventFilters.js e
 * FilterModal.jsx).
 */
export function getLocationOptions(events) {
  const cities = new Set()
  let hasOnline = false

  events.forEach((event) => {
    if (event.modalidade === 'Online') {
      hasOnline = true
      return
    }
    const cidade = event.cidade?.trim()
    if (cidade) {
      cities.add(cidade)
    }
  })

  const options = [...cities]
  if (hasOnline) {
    options.push('Online')
  }

  return options.sort((a, b) => a.localeCompare(b, 'pt-BR'))
}
