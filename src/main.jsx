import { StrictMode, lazy, Suspense } from 'react'
import './styles/variables.css'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { initSentry, captureError } from './lib/sentry.js'
import { initWebVitals } from './lib/vitals.js'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { ThemeProvider } from './context/ThemeProvider.jsx'
import ScrollToTop from './components/ScrollToTop/ScrollToTop.jsx'
import PageLoader from './components/PageLoader.jsx'
import PwaUpdateBanner from './components/PwaUpdateBanner/PwaUpdateBanner.jsx'
import { captureInstallPrompt, registerServiceWorker } from './lib/pwa.js'

captureInstallPrompt()
registerServiceWorker()

// Páginas carregadas via lazy (code splitting por rota)
const Home = lazy(() => import('./pages/Home.jsx'))
const EventsPage = lazy(() => import('./pages/EventsPage.jsx'))
const EventDetails = lazy(() => import('./pages/EventDetails.jsx'))
const About = lazy(() => import('./pages/About.jsx'))
const Contact = lazy(() => import('./pages/Contact.jsx'))
const Gallery = lazy(() => import('./pages/Gallery.jsx'))
const Login = lazy(() => import('./admin/Login.jsx'))
const Dashboard = lazy(() => import('./admin/Dashboard.jsx'))
const NotFound = lazy(() => import('./pages/NotFound.jsx'))

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
          <Suspense fallback={<PageLoader />}>
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
          </Suspense>
          <ScrollToTop />
          <PwaUpdateBanner />
          <Analytics />
          <SpeedInsights />
        </BrowserRouter>
      </ThemeProvider>
    </ErrorBoundary>
  </StrictMode>
)
