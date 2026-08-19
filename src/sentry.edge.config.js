import * as Sentry from '@sentry/nextjs'

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN
const IS_PRODUCTION = process.env.NODE_ENV === 'production'

Sentry.init({
  dsn: SENTRY_DSN,
  environment: IS_PRODUCTION ? 'production' : 'development',
  enabled: Boolean(SENTRY_DSN) && IS_PRODUCTION,
  tracesSampleRate: 0.2,
})
