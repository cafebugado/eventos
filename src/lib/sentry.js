// Init roda via convenção do Next.js (instrumentation.js e
// instrumentation-client.js na raiz do projeto) — este arquivo só encaminha
// captura de erro/mensagem pro Sentry, mantendo a mesma assinatura usada em
// toda a app (services, Server Components, ErrorBoundary etc.) pra não
// precisar tocar nos call sites.
import * as Sentry from '@sentry/nextjs'

export function captureError(error, context = {}) {
  Sentry.captureException(error, { extra: context })
  console.error('[captureError]', error, context)
}

export function captureMessage(message, level = 'info') {
  Sentry.captureMessage(message, level)
  console.warn(`[captureMessage:${level}]`, message)
}
