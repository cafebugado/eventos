const CACHE_VERSION = 'v2'
const STATIC_CACHE = `cb-static-${CACHE_VERSION}`
const EVENTS_CACHE = `cb-events-${CACHE_VERSION}`

const STATIC_ASSETS = ['/', '/eventos', '/sobre', '/manifest.json', '/favicon.svg']

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS)))
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== STATIC_CACHE && key !== EVENTS_CACHE)
            .map((key) => caches.delete(key))
        )
      )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  if (request.method !== 'GET') {
    return
  }
  if (url.protocol === 'chrome-extension:') {
    return
  }

  // Assets com hash no nome (/assets/*.js, /assets/*.css) são imutáveis por deploy —
  // nunca cachear pelo SW para evitar servir chunks de builds anteriores
  if (url.pathname.startsWith('/assets/')) {
    return
  }

  if (url.href.includes('supabase')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone()
            caches.open(EVENTS_CACHE).then((cache) => cache.put(request, clone))
          }
          return response
        })
        .catch(() => caches.match(request))
    )
    return
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone()
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone))
          }
          return response
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match('/')))
    )
    return
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        return cached
      }
      return fetch(request).then((response) => {
        if (response.ok) {
          const clone = response.clone()
          caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone))
        }
        return response
      })
    })
  )
})

self.addEventListener('message', (event) => {
  if (event.origin !== self.location.origin) {
    return
  }
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})
