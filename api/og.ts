const SITE_NAME = 'Eventos - Comunidade Café Bugado'
const DEFAULT_DESCRIPTION =
  'Descubra os melhores eventos de tecnologia. Meetups, workshops, hackathons e conferências reunidos em um só lugar pela comunidade.'
const DEFAULT_IMAGE = '/eventos.png'

const PAGE_SEO: Record<string, { title: string; description: string }> = {
  '/': {
    title: 'Eventos - Comunidade Café Bugado',
    description: DEFAULT_DESCRIPTION,
  },
  '/eventos': {
    title: 'Próximos Eventos',
    description:
      'Confira os próximos eventos de tecnologia da comunidade Café Bugado. Meetups, workshops, hackathons e conferências.',
  },
  '/sobre': {
    title: 'Sobre Nós',
    description:
      'Conheça a Comunidade Café Bugado e nossa missão de conectar pessoas através de eventos de tecnologia.',
  },
  '/contato': {
    title: 'Contato',
    description:
      'Entre em contato com a Comunidade Café Bugado. Tire suas dúvidas ou sugira novos eventos.',
  },
}

const CRAWLER_USER_AGENTS = [
  'facebookexternalhit',
  'Facebot',
  'Twitterbot',
  'LinkedInBot',
  'WhatsApp',
  'Slackbot',
  'TelegramBot',
  'Discordbot',
  'Applebot',
  'Pinterest',
]

function isCrawler(userAgent: string | null): boolean {
  if (!userAgent) return false
  const ua = userAgent.toLowerCase()
  return CRAWLER_USER_AGENTS.some((crawler) => ua.includes(crawler.toLowerCase()))
}

function stripHtmlTags(html: string | null): string {
  if (!html) return ''
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function truncateText(text: string | null, maxLength = 160): string {
  if (!text || text.length <= maxLength) return text || ''
  return text.substring(0, maxLength - 3) + '...'
}

function generateHtml({
  title,
  description,
  image,
  url,
  type = 'website',
}: {
  title: string
  description: string
  image: string
  url: string
  type?: string
}): string {
  const fullTitle = title !== SITE_NAME ? `${title} | ${SITE_NAME}` : title

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${fullTitle}</title>
  <meta name="description" content="${description}">

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="${type}">
  <meta property="og:url" content="${url}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${image}">
  <meta property="og:locale" content="pt_BR">
  <meta property="og:site_name" content="${SITE_NAME}">

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${url}">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${image}">

  <!-- Theme color -->
  <meta name="theme-color" content="#2563eb">

  <!-- Favicon -->
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
</head>
<body>
  <h1>${title}</h1>
  <p>${description}</p>
  <p><a href="${url}">Acessar página</a></p>
</body>
</html>`
}

export const config = {
  runtime: 'edge',
}

export default async function handler(request: Request): Promise<Response> {
  const url = new URL(request.url)
  const userAgent = request.headers.get('user-agent')

  // Get the original path from the query parameter
  const pathname = url.searchParams.get('path') || '/'
  const origin = url.origin

  // If not a crawler, redirect to the SPA
  if (!isCrawler(userAgent)) {
    return Response.redirect(`${origin}${pathname}`, 302)
  }

  // Check if it's an event detail page
  const eventMatch = pathname.match(/^\/eventos\/([^/]+)$/)

  if (eventMatch) {
    const eventId = eventMatch[1]

    try {
      const supabaseUrl = process.env.VITE_SUPABASE_URL
      const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase credentials not configured')
      }

      const response = await fetch(
        `${supabaseUrl}/rest/v1/eventos?id=eq.${eventId}&select=id,nome,descricao,imagem`,
        {
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch event')
      }

      const events = await response.json()
      const event = events[0]

      if (!event) {
        throw new Error('Event not found')
      }

      const eventImage = event.imagem || `${origin}${DEFAULT_IMAGE}`
      const absoluteImage = eventImage.startsWith('http')
        ? eventImage
        : `${origin}${eventImage.startsWith('/') ? '' : '/'}${eventImage}`

      const html = generateHtml({
        title: event.nome,
        description: truncateText(stripHtmlTags(event.descricao)) || DEFAULT_DESCRIPTION,
        image: absoluteImage,
        url: `${origin}/eventos/${event.id}`,
        type: 'article',
      })

      return new Response(html, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        },
      })
    } catch (error) {
      console.error('Error fetching event:', error)
    }
  }

  // Static pages with dynamic meta tags
  const pageSeo = PAGE_SEO[pathname]

  if (pageSeo) {
    const html = generateHtml({
      title: pageSeo.title,
      description: pageSeo.description,
      image: `${origin}${DEFAULT_IMAGE}`,
      url: `${origin}${pathname}`,
      type: 'website',
    })

    return new Response(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    })
  }

  // Fallback - redirect to SPA
  return Response.redirect(`${origin}${pathname}`, 302)
}
