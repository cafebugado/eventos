import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Sun, Moon, Home, PartyPopper, Info, Phone, Menu } from 'lucide-react'
import './Header.css'

function Header() {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

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

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const navigationItems = [
    { path: '/eventos', label: 'Eventos', icon: PartyPopper },
    { path: '/sobre', label: 'Sobre', icon: Info },
    { path: '/contato', label: 'Contato', icon: Phone },
  ]

  const isActive = (path) => {
    return location.pathname === path
  }

  return (
    <>
      {/* Header com Navegacao */}
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
              <span>Comunidade Cafe Bugado</span>
            </a>
          </div>
          <nav className="main-nav desktop-nav">
            <ul>
              <li>
                <button className={isActive('/') ? 'active' : ''} onClick={() => navigate('/')}>
                  <Home size={16} style={{ marginRight: '0.25rem' }} />
                  Inicio
                </button>
              </li>
              {navigationItems.map((item) => (
                <li key={item.path}>
                  <button
                    className={isActive(item.path) ? 'active' : ''}
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
          <button
            className={`sidebar-item ${isActive('/') ? 'active' : ''}`}
            onClick={() => navigate('/')}
            aria-label="Inicio"
          >
            <span className="sidebar-icon">
              <Home size={20} />
            </span>
            <span className="sidebar-label">Inicio</span>
          </button>
          {navigationItems.map((item) => {
            const IconComponent = item.icon
            return (
              <button
                key={item.path}
                className={`sidebar-item ${isActive(item.path) ? 'active' : ''}`}
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
                className={`mobile-nav-item ${isActive('/') ? 'active' : ''}`}
                onClick={() => {
                  setIsMobileMenuOpen(false)
                  navigate('/')
                }}
              >
                <span className="mobile-icon">
                  <Home size={20} />
                </span>
                <span>Inicio</span>
              </button>
              {navigationItems.map((item) => {
                const IconComponent = item.icon
                return (
                  <button
                    key={item.path}
                    className={`mobile-nav-item ${isActive(item.path) ? 'active' : ''}`}
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
    </>
  )
}

export default Header
