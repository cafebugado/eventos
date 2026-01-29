import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import {
  Sun,
  Moon,
  Home,
  PartyPopper,
  Info,
  Phone,
  ArrowLeft,
  ArrowRight,
  Mail,
  MessageCircle,
  MapPin,
  Menu,
} from 'lucide-react'
import './Contact.css'

function Contact() {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm()

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

  const onSubmit = (data) => {
    console.log('Formulário enviado:', data)
    alert('Mensagem enviada com sucesso!')
    reset()
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
                    className={item.path === '/contato' ? 'active' : ''}
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
                    className={`mobile-nav-item ${item.path === '/contato' ? 'active' : ''}`}
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

        {/* Seção Contato */}
        <section className="contato-section">
          <div className="container">
            <div className="section-badge">Fale Conosco</div>
            <h2>
              Vamos criar algo <span className="highlight">incrível juntos</span>
            </h2>
            <p className="section-description">
              Seja você um organizador de eventos, participante ou parceiro, adoraríamos conhecer
              sua história e como podemos ajudar.
            </p>

            <div className="contato-grid">
              <div className="contato-info">
                <div className="contato-item">
                  <div className="contato-icon">
                    <Mail size={24} />
                  </div>
                  <div className="contato-details">
                    <h4>Email</h4>
                    <p>contato@cafebugado.com.br</p>
                    <span>Resposta em até 24h</span>
                  </div>
                </div>
                <div className="contato-item">
                  <div className="contato-icon">
                    <MessageCircle size={24} />
                  </div>
                  <div className="contato-details">
                    <h4>WhatsApp</h4>
                    <p>(11) 99999-9999</p>
                    <span>Seg-Sex, 9h às 18h</span>
                  </div>
                </div>
                <div className="contato-item">
                  <div className="contato-icon">
                    <MapPin size={24} />
                  </div>
                  <div className="contato-details">
                    <h4>Localização</h4>
                    <p>São Paulo, SP - Brasil</p>
                    <span>Atendimento remoto</span>
                  </div>
                </div>
              </div>

              <div className="contato-form">
                <h3>Envie sua mensagem</h3>
                <form className="contact-form" onSubmit={handleSubmit(onSubmit)}>
                  <div className="form-group">
                    <div>
                      <input
                        type="text"
                        placeholder="Seu nome"
                        {...register('nome', {
                          required: 'Nome é obrigatório',
                          minLength: { value: 2, message: 'Nome deve ter pelo menos 2 caracteres' },
                        })}
                        style={{ borderColor: errors.nome ? '#ef4444' : undefined }}
                      />
                      {errors.nome && <span className="error-message">{errors.nome.message}</span>}
                    </div>
                    <div>
                      <input
                        type="email"
                        placeholder="Seu email"
                        {...register('email', {
                          required: 'Email é obrigatório',
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Email inválido',
                          },
                        })}
                        style={{ borderColor: errors.email ? '#ef4444' : undefined }}
                      />
                      {errors.email && (
                        <span className="error-message">{errors.email.message}</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Assunto"
                      {...register('assunto', {
                        required: 'Assunto é obrigatório',
                      })}
                      style={{ borderColor: errors.assunto ? '#ef4444' : undefined }}
                    />
                    {errors.assunto && (
                      <span className="error-message">{errors.assunto.message}</span>
                    )}
                  </div>
                  <div>
                    <textarea
                      placeholder="Sua mensagem..."
                      rows="4"
                      {...register('mensagem', {
                        required: 'Mensagem é obrigatória',
                        minLength: {
                          value: 10,
                          message: 'Mensagem deve ter pelo menos 10 caracteres',
                        },
                      })}
                      style={{ borderColor: errors.mensagem ? '#ef4444' : undefined }}
                    />
                    {errors.mensagem && (
                      <span className="error-message">{errors.mensagem.message}</span>
                    )}
                  </div>
                  <button type="submit" className="form-button">
                    Enviar Mensagem
                    <span className="button-arrow">
                      <ArrowRight size={16} />
                    </span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default Contact
