import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Home, Calendar, Users, Mail, Sun, Moon, X, Menu } from 'lucide-react'
import './FloatingMenu.css'

const NAVIGATION_ITEMS = [
  { path: '/', label: 'Inicio', icon: Home },
  { path: '/eventos', label: 'Eventos', icon: Calendar },
  { path: '/sobre', label: 'Sobre', icon: Users },
  { path: '/contato', label: 'Contato', icon: Mail },
]

function FloatingMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    setIsDarkMode(savedTheme === 'dark')

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const toggleMenu = useCallback(() => {
    setIsOpen((prev) => !prev)
  }, [])

  const closeMenu = useCallback(() => {
    setIsOpen(false)
  }, [])

  const handleNavigation = useCallback(
    (path) => {
      navigate(path)
      closeMenu()
    },
    [navigate, closeMenu]
  )

  const toggleTheme = useCallback(() => {
    const newTheme = !isDarkMode
    setIsDarkMode(newTheme)

    if (newTheme) {
      document.documentElement.setAttribute('data-theme', 'dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.removeAttribute('data-theme')
      localStorage.setItem('theme', 'light')
    }
  }, [isDarkMode])

  const isActive = useCallback(
    (path) => {
      return location.pathname === path
    },
    [location.pathname]
  )

  return (
    <div className="floating-menu-container">
      {/* Mobile Header */}
      <header className={`mobile-header ${isScrolled ? 'scrolled' : ''}`}>
        <a
          href="https://cafebugado.com.br"
          target="_blank"
          rel="noopener noreferrer"
          className="mobile-logo-link"
        >
          <div className="mobile-logo">
            <h1>Eventos</h1>
            <span>Cafe Bugado</span>
          </div>
        </a>
      </header>

      {/* Overlay */}
      <div
        className={`floating-overlay ${isOpen ? 'active' : ''}`}
        onClick={closeMenu}
        aria-hidden="true"
      />

      {/* Menu Items */}
      <nav className={`floating-nav ${isOpen ? 'active' : ''}`}>
        {NAVIGATION_ITEMS.map((item, index) => {
          const IconComponent = item.icon
          const itemStyle = { '--item-index': index }

          return (
            <button
              key={item.path}
              className={`floating-nav-item ${isActive(item.path) ? 'active' : ''}`}
              onClick={() => handleNavigation(item.path)}
              style={itemStyle}
              aria-label={item.label}
            >
              <IconComponent size={20} />
              <span className="floating-nav-label">{item.label}</span>
            </button>
          )
        })}

        {/* Theme Toggle */}
        <button
          className="floating-nav-item floating-theme-toggle"
          onClick={toggleTheme}
          style={{ '--item-index': NAVIGATION_ITEMS.length }}
          aria-label={isDarkMode ? 'Modo Claro' : 'Modo Escuro'}
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          <span className="floating-nav-label">{isDarkMode ? 'Claro' : 'Escuro'}</span>
        </button>
      </nav>

      {/* Floating Action Button */}
      <button
        className={`floating-action-btn ${isOpen ? 'active' : ''}`}
        onClick={toggleMenu}
        aria-label={isOpen ? 'Fechar menu' : 'Abrir menu'}
        aria-expanded={isOpen}
      >
        <span className="fab-icon">{isOpen ? <X size={24} /> : <Menu size={24} />}</span>
      </button>
    </div>
  )
}

export default FloatingMenu
