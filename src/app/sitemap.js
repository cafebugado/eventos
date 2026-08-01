import { apiGet } from '../lib/api/eventosApi'
import { captureError } from '../lib/sentry'

// Convenção nativa do Next (substitui api/sitemap.ts): qualquer objeto
// exportado aqui vira uma entrada do sitemap.xml servido automaticamente em
// /sitemap.xml — sem Edge Function nem reescrita no vercel.json.
//
// Chama apiGet direto (não services/eventService.js) deliberadamente: o
// wrapper padrão usa cache: 'no-store' pra sempre refletir eventos novos nas
// páginas normais, mas isso forçaria esta rota inteira a virar dynamic. O
// sitemap tolera dado com até 1h de atraso — revalidate aqui mantém a rota
// cacheável, igual ao comportamento anterior (que evitava cookies() pelo
// mesmo motivo).
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://eventos.cafebugado.com.br'

const STATIC_ROUTES = [
  { path: '/', priority: 1.0, changeFrequency: 'daily' },
  { path: '/eventos', priority: 0.9, changeFrequency: 'daily' },
  { path: '/sobre', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/galeria', priority: 0.6, changeFrequency: 'weekly' },
  { path: '/contato', priority: 0.4, changeFrequency: 'monthly' },
]

function eventLastModified(event) {
  if (event.updated_at) {
    return new Date(event.updated_at)
  }
  if (event.data_evento) {
    const [day, month, year] = event.data_evento.split('/')
    if (day && month && year) {
      return new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`)
    }
  }
  return new Date()
}

export default async function sitemap() {
  const staticEntries = STATIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }))

  let eventEntries = []
  try {
    // Não existe endpoint público que liste todos os status — e não faria
    // sentido indexar rascunho mesmo, então o escopo aqui é só publicados
    // (api/sitemap.ts, do app antigo, indexava todos os status; convergimos
    // pro mais correto). Usamos slug quando disponível: a URL final bate com
    // o canonical real da página (app/eventos/[slug]/page.jsx).
    const events = await apiGet('/events/published', {
      context: 'sitemap',
      next: { revalidate: 3600 },
    })
    eventEntries = events.map((event) => ({
      url: `${SITE_URL}/eventos/${event.slug || event.id}`,
      lastModified: eventLastModified(event),
      changeFrequency: 'weekly',
      priority: 0.8,
    }))
  } catch (error) {
    captureError(error, { context: 'sitemap' })
    // Falha silenciosa — sitemap ainda é gerado com as rotas estáticas.
  }

  return [...staticEntries, ...eventEntries]
}
