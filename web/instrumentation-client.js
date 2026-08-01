// Inicialização do Sentry no cliente — convenção do Next.js App Router
// (substitui o Sentry.init() que rodava no topo do main.jsx do app antigo).
// Mesma config de src/lib/sentry.js, só trocando VITE_SENTRY_DSN por
// NEXT_PUBLIC_SENTRY_DSN (prefixo público exigido pelo Next pra expor no
// bundle do cliente).
import * as Sentry from '@sentry/nextjs'

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN
const IS_PRODUCTION = process.env.NODE_ENV === 'production'

Sentry.init({
  dsn: SENTRY_DSN,
  environment: IS_PRODUCTION ? 'production' : 'development',
  enabled: Boolean(SENTRY_DSN) && IS_PRODUCTION,
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

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
