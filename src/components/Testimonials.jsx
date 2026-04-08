import { Star } from 'lucide-react'
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

function StarRating() {
  return (
    <div className="testi-stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={16} fill="currentColor" />
      ))}
    </div>
  )
}

function Testimonials() {
  const visible = testimonials.slice(0, 3)

  return (
    <section className="testimonials-section">
      <div className="testimonials-container">
        <div className="testimonials-header">
          <h2>O que diz a comunidade</h2>
        </div>

        <div className="testi-grid">
          {visible.map((t) => (
            <div key={t.id} className="testi-card">
              <StarRating />
              <blockquote className="testi-quote">"{t.quote}"</blockquote>
              <div className="testi-author">
                <div className="testi-avatar">{t.avatar}</div>
                <div className="testi-info">
                  <strong>{t.name}</strong>
                  <span>{t.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Testimonials
