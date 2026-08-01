import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { withSentryConfig } from '@sentry/nextjs'

const dirname = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Repo contém o app Vite legado na raiz (com seu próprio lockfile) enquanto
  // esta migração está em andamento — fixamos a raiz para não inferir errado.
  turbopack: {
    root: dirname,
  },
}

// org/project/authToken ficam de fora por enquanto (não temos esses valores
// aqui) — sem eles o wrapper ainda injeta as rotas de monitoramento e a
// config de instrumentation, só pula o upload de source maps pro Sentry.
export default withSentryConfig(nextConfig, {
  silent: true,
})
