import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import './NotFound.css';

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="notfound-page">
      <div className="notfound-content">
        <div className="notfound-code">404</div>
        <h1>Página não encontrada</h1>
        <p>
          A página que você está procurando não existe ou foi movida.
        </p>
        <div className="notfound-actions">
          <button onClick={() => navigate(-1)} className="notfound-btn secondary">
            <ArrowLeft size={18} />
            Voltar
          </button>
          <button onClick={() => navigate('/')} className="notfound-btn primary">
            <Home size={18} />
            Ir para Início
          </button>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
