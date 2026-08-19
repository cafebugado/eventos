/**
 * Aplica um patch de chave/valor a um URLSearchParams existente, removendo
 * chaves com valor "vazio" (string vazia, false, null, undefined) e
 * convertendo `true` para '1' (formato compacto para flags booleanas na URL).
 *
 * Usado pelos hooks de filtro/paginação de /eventos para sincronizar o
 * estado de UI com a URL (ver useEventFilters.js e usePagination.js).
 */
export function withUpdatedParams(searchParams, patch, { resetPage = false } = {}) {
  const params = new URLSearchParams(searchParams?.toString ? searchParams.toString() : '')

  Object.entries(patch).forEach(([key, value]) => {
    if (value === '' || value === false || value === null || value === undefined) {
      params.delete(key)
    } else if (value === true) {
      params.set(key, '1')
    } else {
      params.set(key, String(value))
    }
  })

  if (resetPage) {
    params.delete('page')
  }

  return params.toString()
}
