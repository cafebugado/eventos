const BASE_URL = 'https://eventos.cafebugado.com.br'

const STATIC_ROUTES = [
  { path: '/', priority: '1.0', changefreq: 'daily' },
  { path: '/eventos', priority: '0.9', changefreq: 'daily' },
  { path: '/sobre', priority: '0.5', changefreq: 'monthly' },
  { path: '/galeria', priority: '0.6', changefreq: 'weekly' },
  { path: '/contato', priority: '0.4', changefreq: 'monthly' },
]

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export const config = {
  runtime: 'edge',
}

export default async function handler(): Promise<Response> {
  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

  let eventUrls = ''

  if (supabaseUrl && supabaseKey) {
    try {
      const response = await fetch(
        `${supabaseUrl}/rest/v1/eventos?select=id,data_evento,updated_at&order=data_evento.desc`,
        {
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
          },
        }
      )

      if (response.ok) {
        const events: Array<{ id: string; data_evento: string; updated_at?: string }> =
          await response.json()

        eventUrls = events
          .map((event) => {
            // data_evento é DD/MM/YYYY — converte para YYYY-MM-DD para lastmod
            let lastmod = new Date().toISOString().split('T')[0]
            if (event.updated_at) {
              lastmod = event.updated_at.split('T')[0]
            } else if (event.data_evento) {
              const [day, month, year] = event.data_evento.split('/')
              if (day && month && year) {
                lastmod = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
              }
            }

            return `
  <url>
    <loc>${escapeXml(`${BASE_URL}/eventos/${event.id}`)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
          })
          .join('')
      }
    } catch {
      // Falha silenciosa — sitemap ainda é gerado com rotas estáticas
    }
  }

  const today = new Date().toISOString().split('T')[0]

  const staticUrls = STATIC_ROUTES.map(
    (route) => `
  <url>
    <loc>${escapeXml(`${BASE_URL}${route.path}`)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`
  ).join('')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${staticUrls}${eventUrls}
</urlset>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
