import { withSentryConfig } from '@sentry/nextjs'

// Equivalente aos security headers que o app antigo servia via nginx.conf
// (o Next/Vercel não passa por nginx, então isso precisa ser declarado aqui).
// Sem fonts.googleapis.com/fonts.gstatic.com no CSP porque o layout usa
// next/font/google (DM_Sans), que self-hosta a fonte no build — não há
// requisição externa de fonte em runtime.
const SECURITY_HEADERS = [
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'geolocation=(), microphone=(), camera=(), payment=()',
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      // 'unsafe-inline' ainda necessário: o App Router injeta <script> inline
      // durante o streaming de RSC (self.__next_f.push(...)) para hidratar
      // progressivamente — removê-lo exige CSP com nonce por request via
      // middleware (mudança maior, não feita aqui). 'unsafe-eval' foi
      // removido: nenhum código do app ou das libs usadas (MUI, Sentry,
      // Vercel Analytics) depende de eval em produção.
      // https://vercel.live é o widget de feedback/toolbar que a própria
      // Vercel injeta em deployments (preview e produção) — sem liberar
      // script-src/connect-src/font-src pra ele, o browser bloqueia o
      // carregamento e polui o console com erros de CSP.
      "script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com https://vercel.live",
      "style-src 'self' 'unsafe-inline'",
      "font-src 'self' https://vercel.live",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https://v3.api.eventoscafebugado.cafebugado.com.br https://vitals.vercel-insights.com https://*.ingest.us.sentry.io https://va.vercel-scripts.com https://vercel.live wss://ws-us3.pusher.com",
      'frame-src https://vercel.live',
      "frame-ancestors 'self'",
    ].join('; '),
  },
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: SECURITY_HEADERS,
      },
    ]
  },
}

// org/project/authToken ficam de fora por enquanto (não temos esses valores
// aqui) — sem eles o wrapper ainda injeta as rotas de monitoramento e a
// config de instrumentation, só pula o upload de source maps pro Sentry.
export default withSentryConfig(nextConfig, {
  silent: true,
})
