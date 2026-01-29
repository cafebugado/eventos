import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sun, Moon, ArrowRight, Info } from 'lucide-react'
import './Home.css'

function Home() {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'dark') {
      setIsDarkMode(true)
      document.documentElement.setAttribute('data-theme', 'dark')
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = !isDarkMode
    setIsDarkMode(newTheme)

    if (newTheme) {
      document.documentElement.setAttribute('data-theme', 'dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.removeAttribute('data-theme')
      localStorage.setItem('theme', 'light')
    }
  }

  return (
    <div className="home-page">
      {/* Header */}
      <header className="home-header">
        <div className="home-header-container">
          <a
            href="https://cafebugado.com.br"
            target="_blank"
            rel="noopener noreferrer"
            className="home-logo"
          >
            <h1>Eventos</h1>
            <span>Comunidade Café Bugado</span>
          </a>
          <button className="theme-toggle" onClick={toggleTheme} aria-label="Alternar tema">
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="home-main">
        <section className="home-hero">
          <div className="home-hero-content">
            <h1>
              Eventos de <span className="highlight">Tecnologia</span> em um só lugar
            </h1>

            <p className="home-description">
              Somos um hub de divulgação de eventos criados por comunidades e empresas de
              tecnologia. Não organizamos eventos — apenas compartilhamos as melhores oportunidades
              para você se conectar, aprender e crescer na área de desenvolvimento e tecnologia.
            </p>

            <div className="home-features">
              <div className="home-feature">
                <span className="feature-code">{'</>'}</span>
                <span>Meetups & Workshops</span>
              </div>
              <div className="home-feature">
                <span className="feature-code">{'{ }'}</span>
                <span>Hackathons</span>
              </div>
              <div className="home-feature">
                <span className="feature-code">{'#'}</span>
                <span>Conferências</span>
              </div>
            </div>

            <div className="home-info-box">
              <div className="info-icon">
                <Info size={20} />
              </div>
              <p>
                <strong>Como funciona:</strong> Reunimos eventos de diversas comunidades e empresas
                de tecnologia em uma única plataforma. Cada evento é organizado por terceiros — nós
                apenas facilitamos a descoberta para você não perder nenhuma oportunidade.
              </p>
            </div>

            <button className="home-cta" onClick={() => navigate('/eventos')}>
              Ver Eventos
              <ArrowRight size={18} />
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="home-footer">
        <p>
          &copy; {new Date().getFullYear()}{' '}
          <a href="https://cafebugado.com.br" target="_blank" rel="noopener noreferrer">
            Comunidade Café Bugado
          </a>
          . Todos os direitos reservados.
        </p>
      </footer>
    </div>
  )
}

export default Home
