import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Sun, Moon, Home, Calendar, Users, Mail } from 'lucide-react'
import './Header.css'

const NAVIGATION_ITEMS = [
  { path: '/', label: 'Inicio', icon: Home },
  { path: '/eventos', label: 'Eventos', icon: Calendar },
  { path: '/sobre', label: 'Sobre', icon: Users },
  { path: '/contato', label: 'Contato', icon: Mail },
]

function Header() {
  const [isDarkMode, setIsDarkMode] = useState(false)
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
