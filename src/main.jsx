import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { initSentry, captureError } from './lib/sentry.js'
import { initWebVitals } from './lib/vitals.js'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { ThemeProvider } from './context/ThemeProvider.jsx'
import ScrollToTop from './components/ScrollToTop/ScrollToTop.jsx'
import Home from './pages/Home.jsx'
import EventsPage from './pages/EventsPage.jsx'
import EventDetails from './pages/EventDetails.jsx'
import About from './pages/About.jsx'
import Contact from './pages/Contact.jsx'
import Gallery from './pages/Gallery.jsx'
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
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/eventos" element={<EventsPage />} />
            <Route path="/eventos/:id" element={<EventDetails />} />
            <Route path="/sobre" element={<About />} />
            <Route path="/contato" element={<Contact />} />
            <Route path="/galeria" element={<Gallery />} />
            <Route path="/admin" element={<Login />} />
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <ScrollToTop />
          <Analytics />
          <SpeedInsights />
        </BrowserRouter>
      </ThemeProvider>
    </ErrorBoundary>
  </StrictMode>
)
