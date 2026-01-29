import { useNavigate } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import './NotFound.css'

function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="notfound-page">
      <Header />

      <div className="notfound-content">
        <div className="notfound-code">404</div>
        <h1>Pagina nao encontrada</h1>
        <p>A pagina que voce esta procurando nao existe ou foi movida.</p>
        <div className="notfound-actions">
          <button onClick={() => navigate(-1)} className="notfound-btn secondary">
            <ArrowLeft size={18} />
            Voltar
          </button>
          <button onClick={() => navigate('/')} className="notfound-btn primary">
            <Home size={18} />
            Ir para Inicio
          </button>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default NotFound
