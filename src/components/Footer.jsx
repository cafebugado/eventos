import { useNavigate } from 'react-router-dom'
import { Briefcase, Camera, Twitter } from 'lucide-react'
import './Footer.css'

function Footer() {
  const navigate = useNavigate()

  return (
    <footer className="main-footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <a
              href="https://cafebugado.com.br"
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <h4>Eventos</h4>
            </a>
            <p>
              Comunidade Cafe Bugado - Conectando pessoas atraves de eventos e experiencias unicas
              na comunidade.
            </p>
            <div className="social-links">
              <a href="#" aria-label="LinkedIn">
                <Briefcase size={20} />
              </a>
              <a href="#" aria-label="Instagram">
                <Camera size={20} />
              </a>
              <a href="#" aria-label="Twitter">
                <Twitter size={20} />
              </a>
            </div>
          </div>
          <div className="footer-section">
            <h4>Navegacao</h4>
            <ul>
              <li>
                <button onClick={() => navigate('/')}>Inicio</button>
              </li>
              <li>
                <button onClick={() => navigate('/eventos')}>Eventos</button>
              </li>
              <li>
                <button onClick={() => navigate('/sobre')}>Sobre</button>
              </li>
              <li>
                <button onClick={() => navigate('/contato')}>Contato</button>
              </li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Categorias</h4>
            <ul>
              <li>
                <a href="#">Tecnologia</a>
              </li>
              <li>
                <a href="#">Negocios</a>
              </li>
              <li>
                <a href="#">Arte & Cultura</a>
              </li>
              <li>
                <a href="#">Networking</a>
              </li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Suporte</h4>
            <ul>
              <li>
                <a href="#">Central de Ajuda</a>
              </li>
              <li>
                <a href="#">Termos de Uso</a>
              </li>
              <li>
                <a href="#">Privacidade</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>
            &copy; {new Date().getFullYear()}{' '}
            <a
              href="https://cafebugado.com.br"
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              Comunidade Cafe Bugado
            </a>
            . Todos os direitos reservados.
          </p>
          <p>Feito com amor para conectar pessoas atraves de eventos</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
