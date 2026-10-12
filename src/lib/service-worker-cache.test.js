import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

describe('service worker runtime cache', () => {
  let listeners

  beforeEach(async () => {
    listeners = {}
    vi.resetModules()
    vi.spyOn(self, 'addEventListener').mockImplementation((type, listener) => {
      listeners[type] = listener
    })
    vi.stubGlobal('caches', {
      open: vi.fn(),
      match: vi.fn(),
    })
    vi.stubGlobal('fetch', vi.fn())

    await import('../../public/sw.js')
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('does not add same-origin assets to the runtime cache', async () => {
    const response = new Response('image', { status: 200 })
    fetch.mockResolvedValue(response)

    const responsePromise = new Promise((resolve) => {
      listeners.fetch({
        request: {
          method: 'GET',
          mode: 'cors',
          url: `${self.location.origin}/_next/image?url=photo.webp`,
          headers: new Headers(),
        },
        respondWith: resolve,
      })
    })

    await expect(responsePromise).resolves.toBe(response)
    expect(caches.open).not.toHaveBeenCalled()
  })
})
