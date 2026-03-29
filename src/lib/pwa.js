let deferredPrompt = null
let registrationPromise = null

export function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    return Promise.resolve(null)
  }
  if (!registrationPromise) {
    registrationPromise = navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .catch(() => null)
  }
  return registrationPromise
}

export function getSwStatus(registration) {
  if (!('serviceWorker' in navigator)) {
    return 'unsupported'
  }
  if (!registration) {
    return 'idle'
  }
  if (registration.installing) {
    return 'installing'
  }
  if (registration.waiting) {
    return 'waiting'
  }
  if (registration.active) {
    return 'active'
  }
  return 'idle'
}

export function skipWaiting(registration) {
  if (registration?.waiting) {
    registration.waiting.postMessage({ type: 'SKIP_WAITING' })
  }
}

export function isInstalledPwa() {
  return (
    window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true
  )
}

export function canInstall() {
  return deferredPrompt !== null
}

export async function promptInstall() {
  if (!deferredPrompt) {
    return null
  }
  deferredPrompt.prompt()
  const { outcome } = await deferredPrompt.userChoice
  deferredPrompt = null
  return outcome
}

export function captureInstallPrompt() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt = e
  })
}
