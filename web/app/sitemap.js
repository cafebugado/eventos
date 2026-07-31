import { createClient } from '@supabase/supabase-js'
import { getEvents } from '../services/eventService'
import { captureError } from '../lib/sentry'

// Convenção nativa do Next (substitui api/sitemap.ts): qualquer objeto
// exportado aqui vira uma entrada do sitemap.xml servido automaticamente em
// /sitemap.xml — sem Edge Function nem reescrita no vercel.json.
//
// Usa o client "puro" do @supabase/supabase-js (não lib/supabase/server.js)
// deliberadamente: o client de lib/supabase/server.js chama cookies() do
// next/headers para propagar sessão, o que forçaria esta rota inteira a
// virar dynamic (sem cache) mesmo sendo dado 100% público. O sitemap não
// precisa de sessão — evitar cookies() aqui mantém a rota cacheável.
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
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
    // api/sitemap.ts (app antigo) lista todos os eventos, sem filtrar por
    // status — mantemos o mesmo escopo aqui. Diferente do antigo, porém,
    // usamos slug quando disponível: api/sitemap.ts foi escrito antes das
    // URLs amigáveis (feat/friendly-event-urls) e ainda monta a URL só com
    // o UUID, divergindo do canonical real da página
    // (app/eventos/[slug]/page.jsx). Aqui corrigimos isso.
    const events = await getEvents(supabase)
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
