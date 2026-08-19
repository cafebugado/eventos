// Registro do Sentry pro runtime de servidor/edge — convenção do Next.js
// (register() roda uma vez, antes de qualquer código da aplicação).
// https://nextjs.org/docs/app/guides/instrumentation

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config.js')
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config.js')
  }
}

export const onRequestError = async (...args) => {
  const Sentry = await import('@sentry/nextjs')
  return Sentry.captureRequestError(...args)
}
