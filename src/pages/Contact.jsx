import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { ArrowLeft, ArrowRight, Mail, MessageCircle, MapPin } from 'lucide-react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import './Contact.css'

function Contact() {
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm()

  const onSubmit = (data) => {
    console.log('Formulario enviado:', data)
    alert('Mensagem enviada com sucesso!')
    reset()
  }

  return (
    <div className="page-container">
      <Header />

      {/* Main Content */}
      <main className="main-content" style={{ paddingTop: '6rem' }}>
        <div className="back-to-home">
          <button onClick={() => navigate('/')} className="back-link">
            <ArrowLeft size={18} />
            <span>Voltar ao Inicio</span>
          </button>
        </div>

        {/* Secao Contato */}
        <section className="contato-section">
          <div className="container">
            <div className="section-badge">Fale Conosco</div>
            <h2>
              Vamos criar algo <span className="highlight">incrivel juntos</span>
            </h2>
            <p className="section-description">
              Seja voce um organizador de eventos, participante ou parceiro, adorariamos conhecer
              sua historia e como podemos ajudar.
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
                    <span>Resposta em ate 24h</span>
                  </div>
                </div>
                <div className="contato-item">
                  <div className="contato-icon">
                    <MessageCircle size={24} />
                  </div>
                  <div className="contato-details">
                    <h4>WhatsApp</h4>
                    <p>(11) 99999-9999</p>
                    <span>Seg-Sex, 9h as 18h</span>
                  </div>
                </div>
                <div className="contato-item">
                  <div className="contato-icon">
                    <MapPin size={24} />
                  </div>
                  <div className="contato-details">
                    <h4>Localizacao</h4>
                    <p>Sao Paulo, SP - Brasil</p>
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
                          required: 'Nome e obrigatorio',
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
                          required: 'Email e obrigatorio',
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Email invalido',
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
                        required: 'Assunto e obrigatorio',
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
                        required: 'Mensagem e obrigatoria',
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

      <Footer />
    </div>
  )
}

export default Contact
