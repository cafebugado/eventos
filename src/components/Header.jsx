import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../hooks/useTheme'
import { NAVIGATION_ITEMS } from '../constants/navigation'
import './Header.css'

// Mapa de prefetch por rota — dispara o import quando o user passa o mouse
const PREFETCH_MAP = {
  '/': () => import('../pages/Home.jsx'),
  '/eventos': () => import('../pages/EventsPage.jsx'),
  '/sobre': () => import('../pages/About.jsx'),
  '/galeria': () => import('../pages/Gallery.jsx'),
  '/contato': () => import('../pages/Contact.jsx'),
}

function Header() {
  const { isDarkMode, toggleTheme } = useTheme()
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

  const isActive = (path) => {
    return location.pathname === path
  }

  return (
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
            {NAVIGATION_ITEMS.map((item) => {
              const IconComponent = item.icon
              return (
                <li key={item.path}>
                  <button
                    className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                    onClick={() => navigate(item.path)}
                    onMouseEnter={() => PREFETCH_MAP[item.path]?.()}
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
        </div>
      </div>
    </header>
  )
}

export default Header
