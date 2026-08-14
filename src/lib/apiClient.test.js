import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { withRetry } from './apiClient'

vi.mock('./sentry.js', () => ({
  captureError: vi.fn(),
}))

describe('withRetry', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('retenta e resolve quando o Node lança TypeError("fetch failed") com cause.code de rede (undici)', async () => {
    const networkError = Object.assign(new TypeError('fetch failed'), {
      cause: { code: 'ECONNREFUSED' },
    })
    const fn = vi.fn().mockRejectedValueOnce(networkError).mockResolvedValueOnce('ok')

    const promise = withRetry(fn, { context: 'test' })
    await vi.runAllTimersAsync()

    await expect(promise).resolves.toBe('ok')
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('retenta quando error.code é um código de rede do undici (ex.: timeout de conexão)', async () => {
    const timeoutError = Object.assign(new Error('connect timeout'), {
      code: 'UND_ERR_CONNECT_TIMEOUT',
    })
    const fn = vi.fn().mockRejectedValueOnce(timeoutError).mockResolvedValueOnce('ok')

    const promise = withRetry(fn, { context: 'test' })
    await vi.runAllTimersAsync()

    await expect(promise).resolves.toBe('ok')
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('continua retentando mensagens de erro de rede do browser (Failed to fetch / NetworkError)', async () => {
    const browserError = new TypeError('Failed to fetch')
    const fn = vi.fn().mockRejectedValueOnce(browserError).mockResolvedValueOnce('ok')

    const promise = withRetry(fn, { context: 'test' })
    await vi.runAllTimersAsync()

    await expect(promise).resolves.toBe('ok')
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('não retenta erros de negócio (ex.: 404 respondido pela API)', async () => {
    const businessError = Object.assign(new Error('GET /events respondeu 404'), { status: 404 })
    const fn = vi.fn().mockRejectedValue(businessError)

    const promise = withRetry(fn, { context: 'test' })
    const expectation = expect(promise).rejects.toBe(businessError)
    await vi.runAllTimersAsync()

    await expectation
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('desiste depois do número máximo de tentativas mesmo com erro retentável', async () => {
    const networkError = Object.assign(new TypeError('fetch failed'), {
      cause: { code: 'ETIMEDOUT' },
    })
    const fn = vi.fn().mockRejectedValue(networkError)

    const promise = withRetry(fn, { context: 'test', retries: 2 })
    const expectation = expect(promise).rejects.toBe(networkError)
    await vi.runAllTimersAsync()

    await expectation
    expect(fn).toHaveBeenCalledTimes(3)
  })
})
