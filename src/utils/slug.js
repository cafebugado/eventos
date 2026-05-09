/**
 * Converte um nome de evento em slug URL-safe.
 * Deve produzir o mesmo resultado que fn_nome_to_slug() na migration 018.
 *
 * @param {string} nome
 * @returns {string}
 */
export function generateSlug(nome) {
  if (!nome || typeof nome !== 'string') {
    return ''
  }

  let s = nome.toLowerCase()

  s = s.replace(/[áàâä]/g, 'a')
  s = s.replace(/[ãå]/g, 'a')
  s = s.replace(/[éèêë]/g, 'e')
  s = s.replace(/[íìîï]/g, 'i')
  s = s.replace(/[óòôö]/g, 'o')
  s = s.replace(/[õø]/g, 'o')
  s = s.replace(/[úùûü]/g, 'u')
  s = s.replace(/[ýÿ]/g, 'y')
  s = s.replace(/ç/g, 'c')
  s = s.replace(/ñ/g, 'n')

  s = s.replace(/[^a-z0-9]+/g, '-')
  s = s.replace(/-{2,}/g, '-')
  s = s.replace(/^-+|-+$/g, '')

  // Limita a 80 caracteres e remove hífen final que pode surgir após truncamento
  s = s.slice(0, 80).replace(/-+$/, '')

  return s
}

/**
 * Garante unicidade de slug adicionando sufixo numérico quando necessário.
 *
 * @param {string} base - Resultado de generateSlug(nome)
 * @param {Set<string>} used - Slugs já em uso (excluir o próprio evento ao editar)
 * @returns {string}
 */
export function resolveUniqueSlug(base, used) {
  if (!used.has(base)) {
    return base
  }
  let suffix = 2
  while (used.has(`${base}-${suffix}`)) {
    suffix++
  }
  return `${base}-${suffix}`
}
