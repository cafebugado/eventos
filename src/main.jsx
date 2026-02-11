import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import { initSentry, captureError } from './lib/sentry.js'
import { initWebVitals } from './lib/vitals.js'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import Home from './pages/Home.jsx'
import App from './App.jsx'
import EventDetails from './pages/EventDetails.jsx'
import About from './pages/About.jsx'
import Contact from './pages/Contact.jsx'
import Login from './admin/Login.jsx'
import Dashboard from './admin/Dashboard.jsx'
import NotFound from './pages/NotFound.jsx'

// Inicializa Sentry (só ativa em produção com DSN configurado)
initSentry()

// Inicializa Web Vitals (LCP, FID, CLS, TTFB, INP)
initWebVitals()

// Handler global para erros assíncronos não capturados
window.addEventListener('unhandledrejection', (event) => {
  captureError(event.reason, { type: 'unhandledrejection' })

  console.error('Unhandled promise rejection:', event.reason)
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/eventos" element={<App />} />
          <Route path="/eventos/:id" element={<EventDetails />} />
          <Route path="/sobre" element={<About />} />
          <Route path="/contato" element={<Contact />} />
          <Route path="/admin" element={<Login />} />
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Analytics />
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>
)
