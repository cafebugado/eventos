// Stub temporário — apenas loga no console. Substituído por @sentry/nextjs
// na Fase 4 do plano de migração (não antecipar essa integração aqui).

export function initSentry() {
  // Sem-op por enquanto.
}

export function captureError(error, context = {}) {
  console.error('[captureError]', error, context)
}

export function captureMessage(message, level = 'info') {
  console.warn(`[captureMessage:${level}]`, message)
}
