import { captureError } from './sentry.js'

const DEFAULT_TIMEOUT = 15000
const MAX_RETRIES = 2
const RETRY_DELAY = 1000

class TimeoutError extends Error {
  constructor(ms) {
    super(`Request timeout após ${ms}ms`)
    this.name = 'TimeoutError'
  }
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Códigos de erro do undici (fetch nativo do Node, usado nas funções
// serverless da Vercel onde as páginas force-dynamic rodam) pra falha de
// conexão/timeout — bem diferentes das mensagens de erro do fetch do
// browser ('Failed to fetch', 'NetworkError') que os checks abaixo já
// cobriam. Sem isso, qualquer instabilidade de rede no servidor nunca era
// retentada: a primeira tentativa falhava e o erro subia na hora.
const NODE_NETWORK_ERROR_CODES = new Set([
  'ECONNRESET',
  'ECONNREFUSED',
  'ENOTFOUND',
  'ETIMEDOUT',
  'EAI_AGAIN',
  'UND_ERR_CONNECT_TIMEOUT',
  'UND_ERR_HEADERS_TIMEOUT',
  'UND_ERR_BODY_TIMEOUT',
  'UND_ERR_SOCKET',
])

/**
 * Executa uma função async com timeout e retry automático.
 * Retry só ocorre para erros de rede/timeout, não para erros de negócio.
 */
export async function withRetry(fn, options = {}) {
  const { timeout = DEFAULT_TIMEOUT, retries = MAX_RETRIES, context = '' } = options

  let lastError

  for (let attempt = 0; attempt <= retries; attempt++) {
    let timeoutId
    try {
      const result = await Promise.race([
        fn(),
        new Promise((_, reject) => {
          timeoutId = setTimeout(() => reject(new TimeoutError(timeout)), timeout)
        }),
      ])
      clearTimeout(timeoutId)
      return result
    } catch (error) {
      clearTimeout(timeoutId)
      lastError = error

      const isRetryable =
        error instanceof TimeoutError ||
        error?.message?.includes('Failed to fetch') ||
        error?.message?.includes('NetworkError') ||
        error?.message?.includes('fetch failed') ||
        error?.code === 'NETWORK_ERROR' ||
        NODE_NETWORK_ERROR_CODES.has(error?.code) ||
        NODE_NETWORK_ERROR_CODES.has(error?.cause?.code)

      if (!isRetryable || attempt >= retries) {
        break
      }

      const delay = RETRY_DELAY * Math.pow(2, attempt)
      await wait(delay)
    }
  }

  captureError(lastError, { context, retries })
  throw lastError
}
