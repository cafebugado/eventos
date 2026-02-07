import { useState, useEffect, useCallback } from 'react'
import { Quote } from 'lucide-react'
import './Testimonials.css'

const testimonials = [
  {
    id: 1,
    name: 'Lucas Mendes',
    role: 'Desenvolvedor Front-end',
    quote:
      'Graças a essa plataforma, descobri meetups incríveis que me ajudaram a crescer na carreira. A comunidade é muito acolhedora!',
    avatar: 'LM',
  },
  {
    id: 2,
    name: 'Ana Souza',
    role: 'Engenheira de Software',
    quote:
      'Encontrei workshops e hackathons que nunca teria descoberto sozinha. É o lugar perfeito para quem quer se conectar com a comunidade tech.',
    avatar: 'AS',
  },
  {
    id: 3,
    name: 'Pedro Oliveira',
    role: 'Estudante de Ciência da Computação',
    quote:
      'Como estudante, essa plataforma foi essencial para eu encontrar eventos gratuitos e networking. Recomendo demais!',
    avatar: 'PO',
  },
  {
    id: 4,
    name: 'Mariana Costa',
    role: 'DevOps Engineer',
    quote:
      'A curadoria dos eventos é excelente. Sempre encontro conteúdo relevante e de qualidade. Virou minha fonte principal de eventos tech.',
    avatar: 'MC',
  },
  {
    id: 5,
    name: 'Rafael Santos',
    role: 'Tech Lead',
    quote:
      'Uso a plataforma para divulgar os eventos da minha comunidade. É incrível ver como ela conecta pessoas e fortalece o ecossistema.',
    avatar: 'RS',
  },
]

function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const goToSlide = useCallback(
    (index) => {
      if (isTransitioning) {
        return
      }
      setIsTransitioning(true)
      setCurrentIndex(index)
      setTimeout(() => setIsTransitioning(false), 500)
    },
    [isTransitioning]
  )

  const nextSlide = useCallback(() => {
    goToSlide((currentIndex + 1) % testimonials.length)
  }, [currentIndex, goToSlide])

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000)
    return () => clearInterval(interval)
  }, [nextSlide])

  const current = testimonials[currentIndex]

  return (
    <section className="testimonials-section">
      <div className="testimonials-container">
        <div className="testimonials-header">
          <h2>O que dizem nossos membros</h2>
          <p>Veja como a plataforma tem ajudado pessoas a se conectarem com a comunidade tech.</p>
        </div>

        <div className="testimonials-carousel">
          <div className="testimonial-card-wrapper">
            <div className="testimonial-card" key={current.id}>
              <div className="testimonial-quote-icon">
                <Quote size={32} />
              </div>

              <blockquote className="testimonial-quote">{current.quote}</blockquote>

              <div className="testimonial-author">
                <div className="testimonial-avatar">{current.avatar}</div>
                <div className="testimonial-info">
                  <strong>{current.name}</strong>
                  <span>{current.role}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Testimonials
