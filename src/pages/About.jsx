import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Sun,
  Moon,
  Home,
  PartyPopper,
  Info,
  Phone,
  ArrowLeft,
  Target,
  Zap,
  Globe,
  Handshake,
  Menu,
} from 'lucide-react'
import './About.css'

function About() {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
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

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const navigationItems = [
    { path: '/eventos', label: 'Eventos', icon: PartyPopper },
    { path: '/sobre', label: 'Sobre', icon: Info },
    { path: '/contato', label: 'Contato', icon: Phone },
  ]

  return (
    <div className="page-container">
      {/* Header */}
      <header className="main-header">
        <div className="header-container">
          <div className="logo">
            <a
              href="https://cafebugado.com.br"
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <h1>Eventos</h1>
              <span>Comunidade Café Bugado</span>
            </a>
          </div>
          <nav className="main-nav desktop-nav">
            <ul>
              <li>
                <button onClick={() => navigate('/')}>
                  <Home size={16} style={{ marginRight: '0.25rem' }} />
                  Início
                </button>
              </li>
              {navigationItems.map((item) => (
                <li key={item.path}>
                  <button
                    className={item.path === '/sobre' ? 'active' : ''}
                    onClick={() => navigate(item.path)}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
          <button className="theme-toggle" onClick={toggleTheme} aria-label="Alternar tema">
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile FAB */}
      <button className="mobile-fab" onClick={toggleMobileMenu} aria-label="Menu">
        <Menu size={24} />
      </button>

      {/* Menu Mobile Sheet */}
      {isMobileMenuOpen && (
        <>
          <div className="mobile-overlay" onClick={toggleMobileMenu}></div>
          <div className="mobile-sheet">
            <div className="mobile-sheet-header">
              <h3>Menu</h3>
              <button className="mobile-close" onClick={toggleMobileMenu} aria-label="Fechar menu">
                ✕
              </button>
            </div>
            <nav className="mobile-nav">
              <button
                className="mobile-nav-item"
                onClick={() => {
                  setIsMobileMenuOpen(false)
                  navigate('/')
                }}
              >
                <span className="mobile-icon">
                  <Home size={20} />
                </span>
                <span>Início</span>
              </button>
              {navigationItems.map((item) => {
                const IconComponent = item.icon
                return (
                  <button
                    key={item.path}
                    className={`mobile-nav-item ${item.path === '/sobre' ? 'active' : ''}`}
                    onClick={() => {
                      setIsMobileMenuOpen(false)
                      navigate(item.path)
                    }}
                  >
                    <span className="mobile-icon">
                      <IconComponent size={20} />
                    </span>
                    <span>{item.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        </>
      )}

      {/* Main Content */}
      <main className="main-content" style={{ paddingTop: '6rem' }}>
        <div className="back-to-home">
          <button onClick={() => navigate('/')} className="back-link">
            <ArrowLeft size={18} />
            <span>Voltar ao Início</span>
          </button>
        </div>

        {/* Seção Sobre */}
        <section className="sobre-section">
          <div className="container">
            <div className="sobre-content">
              <div className="section-badge">Nossa Missão</div>
              <h2>
                Transformando a forma como você <span className="highlight">descobre eventos</span>
              </h2>
              <p>
                A Comunidade Café Bugado nasceu da necessidade de centralizar e simplificar a
                descoberta de eventos. Acreditamos que experiências memoráveis acontecem quando as
                pessoas certas se encontram nos lugares certos, no momento certo.
              </p>

              <div className="about-stats">
                <div className="about-stat">
                  <h3>3 anos</h3>
                  <p>Conectando pessoas através de eventos</p>
                </div>
                <div className="about-stat">
                  <h3>100%</h3>
                  <p>Eventos verificados e de qualidade</p>
                </div>
              </div>

              <div className="features">
                <div className="feature">
                  <div className="feature-icon">
                    <Target size={40} />
                  </div>
                  <h4>Curadoria Especializada</h4>
                  <p>
                    Cada evento passa por um processo rigoroso de seleção, garantindo qualidade e
                    relevância para nossa comunidade.
                  </p>
                </div>
                <div className="feature">
                  <div className="feature-icon">
                    <Zap size={40} />
                  </div>
                  <h4>Atualização em Tempo Real</h4>
                  <p>
                    Nossa plataforma é sincronizada automaticamente, garantindo que você sempre
                    tenha acesso às informações mais recentes.
                  </p>
                </div>
                <div className="feature">
                  <div className="feature-icon">
                    <Globe size={40} />
                  </div>
                  <h4>Diversidade de Categorias</h4>
                  <p>
                    De tecnologia a arte, de negócios a entretenimento. Temos eventos para todos os
                    interesses e momentos da vida.
                  </p>
                </div>
                <div className="feature">
                  <div className="feature-icon">
                    <Handshake size={40} />
                  </div>
                  <h4>Comunidade Ativa</h4>
                  <p>
                    Conecte-se com pessoas que compartilham seus interesses e construa uma rede de
                    contatos valiosa.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default About
