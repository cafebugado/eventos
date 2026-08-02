const CACHE_VERSION = 'v2'
const STATIC_CACHE = `cb-static-${CACHE_VERSION}`
const EVENTS_CACHE = `cb-events-${CACHE_VERSION}`

const STATIC_ASSETS = ['/', '/eventos', '/sobre', '/manifest.webmanifest', '/icon.svg']

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

  // Assets com hash no nome (/_next/static/*) são imutáveis por build — nunca
  // cachear pelo SW pra evitar servir chunks de uma versão anterior do app.
  if (url.pathname.startsWith('/_next/static/')) {
    return
  }

  // RSC payloads (fetches internos do App Router pra troca de rota/dados) não
  // são estáticos: o mesmo _rsc pode se repetir entre builds diferentes, mas o
  // conteúdo depende da versão do app. Cachear isso serve payload de um build
  // antigo referenciando chunks que não existem mais (404 em cascata).
  if (url.searchParams.has('_rsc') || request.headers.get('RSC') === '1') {
    return
  }

  if (url.href.includes('backendeventoscfb.cafebugado.com.br')) {
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
      return fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone()
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone))
          }
          return response
        })
        .catch(() => Response.error())
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
