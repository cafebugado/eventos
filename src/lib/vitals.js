import { onCLS, onFCP, onLCP, onTTFB, onINP } from 'web-vitals'

function sendToAnalytics(metric) {
  // Envia para Vercel Analytics (já integrado) via console em dev
  if (import.meta.env.DEV) {
    const rating = metric.rating || 'unknown'
    // eslint-disable-next-line no-console
    console.debug(`[Web Vitals] ${metric.name}: ${Math.round(metric.value)}ms (${rating})`)
  }
}

export function initWebVitals() {
  onCLS(sendToAnalytics)
  onFCP(sendToAnalytics)
  onLCP(sendToAnalytics)
  onTTFB(sendToAnalytics)
  onINP(sendToAnalytics)
}
