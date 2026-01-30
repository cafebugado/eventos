import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Sun, Moon, Home, Calendar, Users, Mail, Menu, X } from 'lucide-react'
import './Header.css'

function Header() {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'dark') {
      setIsDarkMode(true)
      document.documentElement.setAttribute('data-theme', 'dark')
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
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
    document.body.style.overflow = !isMobileMenuOpen ? 'hidden' : ''
  }

  const navigationItems = [
    { path: '/', label: 'Inicio', icon: Home },
    { path: '/eventos', label: 'Eventos', icon: Calendar },
    { path: '/sobre', label: 'Sobre', icon: Users },
    { path: '/contato', label: 'Contato', icon: Mail },
  ]

  const isActive = (path) => {
    return location.pathname === path
  }

  return (
    <>
      <header className={`main-header ${isScrolled ? 'header-scrolled' : ''}`}>
        <div className="header-container">
          <a
            href="https://cafebugado.com.br"
            target="_blank"
            rel="noopener noreferrer"
            className="logo-link"
          >
            <div className="logo">
              <div className="logo-text">
                <h1>Eventos</h1>
                <span>Cafe Bugado</span>
              </div>
            </div>
          </a>

          <nav className="main-nav">
            <ul>
              {navigationItems.map((item) => {
                const IconComponent = item.icon
                return (
                  <li key={item.path}>
                    <button
                      className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                      onClick={() => navigate(item.path)}
                    >
                      <IconComponent size={18} className="nav-icon" />
                      <span>{item.label}</span>
                      {isActive(item.path) && <span className="nav-indicator"></span>}
                    </button>
                  </li>
                )
              })}
            </ul>
          </nav>

          <div className="header-actions">
            <button className="theme-toggle" onClick={toggleTheme} aria-label="Alternar tema">
              <span className="theme-icon-wrapper">
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </span>
            </button>

            <button className="mobile-menu-btn" onClick={toggleMobileMenu} aria-label="Menu">
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`mobile-overlay ${isMobileMenuOpen ? 'active' : ''}`}
        onClick={toggleMobileMenu}
      ></div>

      {/* Mobile Menu */}
      <nav className={`mobile-nav ${isMobileMenuOpen ? 'active' : ''}`}>
        <div className="mobile-nav-header">
          <div className="logo">
            <div className="logo-text">
              <h1>Eventos</h1>
              <span>Cafe Bugado</span>
            </div>
          </div>
        </div>

        <div className="mobile-nav-items">
          {navigationItems.map((item) => {
            const IconComponent = item.icon
            return (
              <button
                key={item.path}
                className={`mobile-nav-item ${isActive(item.path) ? 'active' : ''}`}
                onClick={() => {
                  toggleMobileMenu()
                  navigate(item.path)
                }}
              >
                <span className="mobile-nav-icon">
                  <IconComponent size={22} />
                </span>
                <span className="mobile-nav-label">{item.label}</span>
                {isActive(item.path) && <span className="mobile-nav-indicator"></span>}
              </button>
            )
          })}
        </div>

        <div className="mobile-nav-footer">
          <button className="mobile-theme-toggle" onClick={toggleTheme}>
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            <span>{isDarkMode ? 'Modo Claro' : 'Modo Escuro'}</span>
          </button>
        </div>
      </nav>
    </>
  )
}

export default Header
