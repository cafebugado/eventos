import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
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
  ArrowRight,
  ArrowUpRight,
  ArrowLeft,
  Target,
  Zap,
  Globe,
  Handshake,
  Mail,
  MessageCircle,
  MapPin,
  Briefcase,
  Camera,
  Twitter,
  Menu
} from 'lucide-react';
import { getEvents } from './services/eventService';
import './App.css';
import BgEventos from '../public/eventos.png'

function App() {
  const [agenda, setAgenda] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('eventos');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  useEffect(() => {
    // Carrega tema salvo
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    }

    // Carrega eventos do Supabase
    async function loadEvents() {
      try {
        const events = await getEvents();
        setAgenda(events);
      } catch (error) {
        console.error('Erro ao carregar eventos:', error);
      } finally {
        setLoading(false);
      }
    }

    loadEvents();
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);

    if (newTheme) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    }
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(sectionId);
    }
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const onSubmit = (data) => {
    console.log('Formulário enviado:', data);
    alert('Mensagem enviada com sucesso!');
    reset();
  };

  useEffect(() => {
    const observerOptions = {
      threshold: 0.3,
      rootMargin: '-50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    }, observerOptions);

    const sections = document.querySelectorAll('.animate-section');
    sections.forEach(section => {
      observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  const navigationItems = [
    { id: 'eventos', label: 'Eventos', icon: PartyPopper },
    { id: 'sobre', label: 'Sobre', icon: Info },
    { id: 'contato', label: 'Contato', icon: Phone }
  ];

  return (
    <div className="App">
      {/* Header com Navegação */}
      <header className="main-header">
        <div className="header-container">
          <div className="logo">
            <a href="https://cafebugado.com.br" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
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
              {navigationItems.map(item => (
                <li key={item.id}>
                  <button
                    className={activeSection === item.id ? 'active' : ''}
                    onClick={() => scrollToSection(item.id)}
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
            className="sidebar-item"
            onClick={() => navigate('/')}
            aria-label="Início"
          >
            <span className="sidebar-icon">
              <Home size={20} />
            </span>
            <span className="sidebar-label">Início</span>
          </button>
          {navigationItems.map(item => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.id}
                className={`sidebar-item ${activeSection === item.id ? 'active' : ''}`}
                onClick={() => scrollToSection(item.id)}
                aria-label={item.label}
              >
                <span className="sidebar-icon">
                  <IconComponent size={20} />
                </span>
                <span className="sidebar-label">{item.label}</span>
              </button>
            );
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
                onClick={() => { setIsMobileMenuOpen(false); navigate('/'); }}
              >
                <span className="mobile-icon">
                  <Home size={20} />
                </span>
                <span>Início</span>
              </button>
              {navigationItems.map(item => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.id}
                    className={`mobile-nav-item ${activeSection === item.id ? 'active' : ''}`}
                    onClick={() => scrollToSection(item.id)}
                  >
                    <span className="mobile-icon">
                      <IconComponent size={20} />
                    </span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </>
      )}

      {/* Main Content */}
      <main className="main-content" style={{ paddingTop: '6rem' }}>
        {/* Back to Home */}
        <div className="back-to-home">
          <button onClick={() => navigate('/')} className="back-link">
            <ArrowLeft size={18} />
            <span>Voltar ao Início</span>
          </button>
        </div>

        {/* Seção de Eventos */}
        <section id="eventos" className="eventos-section animate-section">
          <div className="section-header">
            <h2>Próximos Eventos</h2>
            <p>
              Eventos de comunidades e empresas de tecnologia. Meetups, workshops, hackathons
              e conferências — tudo compartilhado para você não perder nenhuma oportunidade.
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
                  <div key={item.id || index} className="evento-card" style={{ animationDelay: `${index * 0.1}s` }}>
                    <div className="card-image">
                      <img
                        src={item.imagem || BgEventos}
                        alt={item.nome}
                      />
                      <div className="card-badge">{item.periodo}</div>
                    </div>
                    <div className="card-content">
                      <h3>{item.nome}</h3>
                      {item.descricao && (
                        <p className="event-description">{item.descricao}</p>
                      )}
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
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="event-link"
                      >
                        Participar
                        <span className="link-arrow">
                          <ArrowUpRight size={16} />
                        </span>
                      </a>
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

        {/* Seção Sobre */}
        <section id="sobre" className="sobre-section animate-section">
          <div className="container">
            <div className="sobre-content">
              <div className="section-badge">Nossa Missão</div>
              <h2>Transformando a forma como você <span className="highlight">descobre eventos</span></h2>
              <p>
                A Comunidade Café Bugado nasceu da necessidade de centralizar e simplificar a descoberta de eventos.
                Acreditamos que experiências memoráveis acontecem quando as pessoas certas se encontram
                nos lugares certos, no momento certo.
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
                  <p>Cada evento passa por um processo rigoroso de seleção, garantindo qualidade e relevância para nossa comunidade.</p>
                </div>
                <div className="feature">
                  <div className="feature-icon">
                    <Zap size={40} />
                  </div>
                  <h4>Atualização em Tempo Real</h4>
                  <p>Nossa plataforma é sincronizada automaticamente, garantindo que você sempre tenha acesso às informações mais recentes.</p>
                </div>
                <div className="feature">
                  <div className="feature-icon">
                    <Globe size={40} />
                  </div>
                  <h4>Diversidade de Categorias</h4>
                  <p>De tecnologia a arte, de negócios a entretenimento. Temos eventos para todos os interesses e momentos da vida.</p>
                </div>
                <div className="feature">
                  <div className="feature-icon">
                    <Handshake size={40} />
                  </div>
                  <h4>Comunidade Ativa</h4>
                  <p>Conecte-se com pessoas que compartilham seus interesses e construa uma rede de contatos valiosa.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Seção Contato */}
        <section id="contato" className="contato-section animate-section">
          <div className="container">
            <div className="section-badge">Fale Conosco</div>
            <h2>Vamos criar algo <span className="highlight">incrível juntos</span></h2>
            <p>
              Seja você um organizador de eventos, participante ou parceiro,
              adoraríamos conhecer sua história e como podemos ajudar.
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
                        {...register("nome", {
                          required: "Nome é obrigatório",
                          minLength: { value: 2, message: "Nome deve ter pelo menos 2 caracteres" }
                        })}
                        style={{ borderColor: errors.nome ? '#ef4444' : undefined }}
                      />
                      {errors.nome && (
                        <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                          {errors.nome.message}
                        </span>
                      )}
                    </div>
                    <div>
                      <input
                        type="email"
                        placeholder="Seu email"
                        {...register("email", {
                          required: "Email é obrigatório",
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: "Email inválido"
                          }
                        })}
                        style={{ borderColor: errors.email ? '#ef4444' : undefined }}
                      />
                      {errors.email && (
                        <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                          {errors.email.message}
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Assunto"
                      {...register("assunto", {
                        required: "Assunto é obrigatório"
                      })}
                      style={{ borderColor: errors.assunto ? '#ef4444' : undefined }}
                    />
                    {errors.assunto && (
                      <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                        {errors.assunto.message}
                      </span>
                    )}
                  </div>
                  <div>
                    <textarea
                      placeholder="Sua mensagem..."
                      rows="4"
                      {...register("mensagem", {
                        required: "Mensagem é obrigatória",
                        minLength: { value: 10, message: "Mensagem deve ter pelo menos 10 caracteres" }
                      })}
                      style={{ borderColor: errors.mensagem ? '#ef4444' : undefined }}
                    />
                    {errors.mensagem && (
                      <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                        {errors.mensagem.message}
                      </span>
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

      {/* Footer */}
      <footer className="main-footer">
        <div className="footer-container">
          <div className="footer-content">
            <div className="footer-section">
              <a href="https://cafebugado.com.br" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
                <h4>Eventos</h4>
              </a>
              <p>
                Comunidade Café Bugado - Conectando pessoas através de eventos
                e experiências únicas na comunidade.
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
                <li><button onClick={() => navigate('/')}>Início</button></li>
                <li><button onClick={() => scrollToSection('eventos')}>Eventos</button></li>
                <li><button onClick={() => scrollToSection('sobre')}>Sobre</button></li>
                <li><button onClick={() => scrollToSection('contato')}>Contato</button></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Categorias</h4>
              <ul>
                <li><a href="#">Tecnologia</a></li>
                <li><a href="#">Negócios</a></li>
                <li><a href="#">Arte & Cultura</a></li>
                <li><a href="#">Networking</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Suporte</h4>
              <ul>
                <li><a href="#">Central de Ajuda</a></li>
                <li><a href="#">Termos de Uso</a></li>
                <li><a href="#">Privacidade</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 <a href="https://cafebugado.com.br" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>Comunidade Café Bugado</a>. Todos os direitos reservados.</p>
            <p>Feito com ❤️ para conectar pessoas através de eventos</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
