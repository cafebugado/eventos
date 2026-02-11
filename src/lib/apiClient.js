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

/**
 * Executa uma função async com timeout e retry automático.
 * Retry só ocorre para erros de rede/timeout, não para erros de negócio.
 */
export async function withRetry(fn, options = {}) {
  const { timeout = DEFAULT_TIMEOUT, retries = MAX_RETRIES, context = '' } = options

  let lastError

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const result = await Promise.race([
        fn(),
        new Promise((_, reject) => setTimeout(() => reject(new TimeoutError(timeout)), timeout)),
      ])
      return result
    } catch (error) {
      lastError = error

      const isRetryable =
        error instanceof TimeoutError ||
        error?.message?.includes('Failed to fetch') ||
        error?.message?.includes('NetworkError') ||
        error?.code === 'NETWORK_ERROR'

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
