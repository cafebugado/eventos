import { Component } from 'react'
import { RefreshCw, Home } from 'lucide-react'
import { captureError } from '../lib/sentry.js'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    captureError(error, { componentStack: errorInfo?.componentStack })

    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null })
    window.location.reload()
  }

  handleGoHome = () => {
    this.setState({ hasError: false, error: null })
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '2rem',
            textAlign: 'center',
            fontFamily: 'system-ui, sans-serif',
            background: '#0f172a',
            color: '#e2e8f0',
          }}
        >
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#f87171' }}>
            Algo deu errado
          </h1>
          <p style={{ marginBottom: '2rem', color: '#94a3b8', maxWidth: '500px' }}>
            Ocorreu um erro inesperado. Tente recarregar a página ou voltar ao início.
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={this.handleReload}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                background: '#3b82f6',
                color: '#fff',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontSize: '1rem',
              }}
            >
              <RefreshCw size={18} />
              Recarregar
            </button>
            <button
              onClick={this.handleGoHome}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                background: '#1e293b',
                color: '#e2e8f0',
                border: '1px solid #334155',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontSize: '1rem',
              }}
            >
              <Home size={18} />
              Ir para Início
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
