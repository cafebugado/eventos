'use client'

import { useReportWebVitals } from 'next/web-vitals'

// Equivalente ao src/lib/vitals.js do app antigo (que usava o pacote
// web-vitals direto) — aqui usa o hook nativo do Next.js, que já cobre CLS,
// FCP, LCP, TTFB e INP sem dependência extra. Só loga em dev; em produção o
// reporte de verdade já roda pelo <SpeedInsights /> (components/layout).
export default function WebVitalsReporter() {
  useReportWebVitals((metric) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[Web Vitals] ${metric.name}: ${Math.round(metric.value)}ms (${metric.rating})`)
    }
  })

  return null
}
