import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Sun, Moon, X, Menu } from 'lucide-react'
import { useTheme } from '../hooks/useTheme'
import { NAVIGATION_ITEMS } from '../constants/navigation'
import LogoImg from '../assets/logoEventosCafeBugado.png'
import './FloatingMenu.css'

function FloatingMenu() {
  const { isDarkMode, toggleTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
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
          <img src={LogoImg} alt="Eventos Cafe Bugado" className="mobile-logo-img" />
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
