import * as Sentry from '@sentry/react'

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN
const IS_PRODUCTION = import.meta.env.PROD

export function initSentry() {
  if (!SENTRY_DSN) {
    return
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: IS_PRODUCTION ? 'production' : 'development',
    enabled: IS_PRODUCTION,
    tracesSampleRate: 0.2,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: IS_PRODUCTION ? 1.0 : 0,
    beforeSend(event) {
      // Filtra erros de extensões de browser
      if (
        event.exception?.values?.[0]?.stacktrace?.frames?.some((f) =>
          f.filename?.includes('extensions://')
        )
      ) {
        return null
      }
      return event
    },
  })
}

export function captureError(error, context = {}) {
  if (SENTRY_DSN) {
    Sentry.captureException(error, { extra: context })
  }
}

export function captureMessage(message, level = 'info') {
  if (SENTRY_DSN) {
    Sentry.captureMessage(message, level)
  }
}
