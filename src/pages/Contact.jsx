import { useForm } from 'react-hook-form'
import { ArrowRight, Mail, MessageCircle, MapPin } from 'lucide-react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import FloatingMenu from '../components/FloatingMenu'
import SEOHead from '../components/SEOHead'
import './Contact.css'

function Contact() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm()

  const onSubmit = (_data) => {
    alert('Mensagem enviada com sucesso!')
    reset()
  }

  return (
    <div className="page-container">
      <SEOHead
        title="Contato"
        description="Entre em contato com a Comunidade Cafe Bugado. Fale conosco para duvidas, sugestoes, parcerias ou para indicar eventos de tecnologia."
        url={`${window.location.origin}/contato`}
      />
      <Header />

      {/* Main Content */}
      <main className="main-content">
        {/* Secao Contato */}
        <section className="contato-section">
          <div className="container">
            <h2>
              Vamos fortalecer a
              <br />
              <span className="highlight">comunidade juntos</span>
            </h2>
            <p className="section-description">
              Se você organiza eventos, participa ou quer colaborar, a gente quer ouvir você. Conte
              sua ideia, dúvida ou sugestão e vamos conversar.
            </p>

            <div className="contato-grid">
              <div className="contato-info">
                <div className="contato-item">
                  <div className="contato-icon">
                    <Mail size={24} />
                  </div>
                  <div className="contato-details">
                    <h4>Email</h4>
                    <p>comunidade.cafebugado@gmail.com</p>
                    <span>
                      Fale com a gente para dúvidas, sugestões ou parcerias. Resposta em até 24h.
                    </span>
                  </div>
                </div>
                <div className="contato-item">
                  <div className="contato-icon">
                    <MessageCircle size={24} />
                  </div>
                  <div className="contato-details">
                    <h4>WhatsApp</h4>
                    <p>+55 11 96188-9886</p>
                    <span>
                      Canal direto para falar com a comunidade e tirar dúvidas rápidas. Seg a sex,
                      das 9h às 18h.
                    </span>
                  </div>
                </div>
                <div className="contato-item">
                  <div className="contato-icon">
                    <MapPin size={24} />
                  </div>
                  <div className="contato-details">
                    <h4>Localização</h4>
                    <p>Brasil</p>
                    <span>Atendimento remoto para todo o Brasil.</span>
                  </div>
                </div>
              </div>

              <div className="contato-form">
                <h3>Fale com a comunidade</h3>
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
                      placeholder="Sobre o que você quer falar"
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
                      placeholder="Conte sua mensagem aqui"
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
                    Enviar mensagem
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
      <FloatingMenu />
    </div>
  )
}

export default Contact
