import { describe, expect, it } from 'vitest'
import nextConfig from './next.config.mjs'

describe('next.config', () => {
  // As metas sentry-trace/baggage mudam a cada renderização; numa rota ISR
  // isso faz a Vercel cobrar uma escrita a cada regeneração, mesmo sem dado
  // novo. O withSentryConfig liga a opção sozinho, então a config precisa
  // removê-la depois de aplicar o wrapper.
  it('não emite metas de trace do Sentry no HTML das páginas', () => {
    expect(nextConfig.experimental?.clientTraceMetadata).toBeUndefined()
  })

  it('mantém os security headers em todas as rotas', async () => {
    const [rule] = await nextConfig.headers()

    expect(rule.source).toBe('/:path*')
    expect(rule.headers.map((header) => header.key)).toContain('Content-Security-Policy')
  })
})
