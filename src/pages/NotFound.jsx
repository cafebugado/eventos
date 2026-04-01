import { useNavigate } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'
import Layout from '../layout/Layout'
import './NotFound.css'

function NotFound() {
  const navigate = useNavigate()

  return (
    <Layout className="notfound-page">
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
    </Layout>
  )
}

export default NotFound
