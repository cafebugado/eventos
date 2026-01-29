import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Sun,
  Moon,
  Home,
  PartyPopper,
  Info,
  Phone,
  Calendar,
  Clock,
  CalendarDays,
  Briefcase,
  Camera,
  Twitter,
  Menu,
} from 'lucide-react'
import { getEvents } from './services/eventService'
import './App.css'
import BgEventos from '../public/eventos.png'

// Função para converter data no formato DD/MM/YYYY para objeto Date
function parseEventDate(dateStr) {
  if (!dateStr) {
    return new Date(0)
  }
  const parts = dateStr.split('/')
  if (parts.length === 3) {
    // Formato DD/MM/YYYY
    return new Date(parts[2], parts[1] - 1, parts[0])
  }
  // Tenta parse direto se estiver em outro formato
  return new Date(dateStr)
}

function App() {
  const [agenda, setAgenda] = useState([])
  const [loading, setLoading] = useState(true)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // Carrega tema salvo
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'dark') {
      setIsDarkMode(true)
      document.documentElement.setAttribute('data-theme', 'dark')
    }

    // Carrega eventos do Supabase
    async function loadEvents() {
      try {
        const events = await getEvents()
        // Ordena eventos por data mais próxima primeiro
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const sortedEvents = events.sort((a, b) => {
          const dateA = parseEventDate(a.data_evento)
          const dateB = parseEventDate(b.data_evento)

          // Eventos futuros vêm primeiro, ordenados por proximidade
          const isAFuture = dateA >= today
          const isBFuture = dateB >= today

          if (isAFuture && !isBFuture) {
            return -1
          }
          if (!isAFuture && isBFuture) {
            return 1
          }

          // Ambos futuros: mais próximo primeiro
          // Ambos passados: mais recente primeiro
          return dateA - dateB
        })

        setAgenda(sortedEvents)
      } catch (error) {
        console.error('Erro ao carregar eventos:', error)
      } finally {
        setLoading(false)
      }
    }

    loadEvents()
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

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  useEffect(() => {
    const observerOptions = {
      threshold: 0.3,
      rootMargin: '-50px 0px',
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in')
        }
      })
    }, observerOptions)

    const sections = document.querySelectorAll('.animate-section')
    sections.forEach((section) => {
      observer.observe(section)
    })

    return () => observer.disconnect()
  }, [])

  const navigationItems = [
    { path: '/eventos', label: 'Eventos', icon: PartyPopper },
    { path: '/sobre', label: 'Sobre', icon: Info },
    { path: '/contato', label: 'Contato', icon: Phone },
  ]

  return (
    <div className="App">
      {/* Header com Navegação */}
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
                    className={item.path === '/eventos' ? 'active' : ''}
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

      {/* Sidebar para Tablet */}
      <aside className={`sidebar ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <button className="sidebar-toggle" onClick={toggleSidebar} aria-label="Alternar menu">
          <Menu size={24} />
        </button>
        <nav className="sidebar-nav">
          <button className="sidebar-item" onClick={() => navigate('/')} aria-label="Início">
            <span className="sidebar-icon">
              <Home size={20} />
            </span>
            <span className="sidebar-label">Início</span>
          </button>
          {navigationItems.map((item) => {
            const IconComponent = item.icon
            return (
              <button
                key={item.path}
                className={`sidebar-item ${item.path === '/eventos' ? 'active' : ''}`}
                onClick={() => navigate(item.path)}
                aria-label={item.label}
              >
                <span className="sidebar-icon">
                  <IconComponent size={20} />
                </span>
                <span className="sidebar-label">{item.label}</span>
              </button>
            )
          })}
        </nav>
      </aside>

      {/* FAB para Mobile */}
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
                    className={`mobile-nav-item ${item.path === '/eventos' ? 'active' : ''}`}
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
        {/* Seção de Eventos */}
        <section id="eventos" className="eventos-section animate-section">
          <div className="section-header">
            <h2>Próximos Eventos</h2>
            <p>
              Eventos de comunidades e empresas de tecnologia. Meetups, workshops, hackathons e
              conferências — tudo compartilhado para você não perder nenhuma oportunidade.
            </p>
          </div>

          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
              <p>Carregando eventos...</p>
            </div>
          ) : (
            <div className="eventos-grid">
              {agenda.length > 0 ? (
                agenda.map((item, index) => (
                  <div
                    key={item.id || index}
                    className="evento-card"
                    style={{ animationDelay: `${index * 0.1}s`, cursor: 'pointer' }}
                    onClick={() => navigate(`/eventos/${item.id}`)}
                  >
                    <div className="card-image">
                      <img src={item.imagem || BgEventos} alt={item.nome} />
                      <div className="card-badge">{item.periodo}</div>
                    </div>
                    <div className="card-content">
                      <h3>{item.nome}</h3>
                      {item.descricao && <p className="event-description">{item.descricao}</p>}
                      <div className="event-info">
                        <div className="info-item">
                          <span className="icon">
                            <Calendar size={16} />
                          </span>
                          <span>{item.data_evento}</span>
                        </div>
                        <div className="info-item">
                          <span className="icon">
                            <Clock size={16} />
                          </span>
                          <span>{item.horario}</span>
                        </div>
                        <div className="info-item">
                          <span className="icon">
                            <CalendarDays size={16} />
                          </span>
                          <span>{item.dia_semana}</span>
                        </div>
                      </div>
                      <div className="event-link-wrapper">
                        <button
                          className="event-link"
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/eventos/${item.id}`)
                          }}
                        >
                          Saber mais sobre o evento
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-events">
                  <div className="empty-icon">
                    <Calendar size={48} />
                  </div>
                  <h3>Nenhum evento no momento</h3>
                  <p>Estamos preparando eventos incríveis para você. Volte em breve!</p>
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
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
                Comunidade Café Bugado - Conectando pessoas através de eventos e experiências únicas
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
              <h4>Navegação</h4>
              <ul>
                <li>
                  <button onClick={() => navigate('/')}>Início</button>
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
                  <a href="#">Negócios</a>
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
                Comunidade Café Bugado
              </a>
              . Todos os direitos reservados.
            </p>
            <p>Feito com ❤️ para conectar pessoas através de eventos</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
