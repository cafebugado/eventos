const SITE_NAME = 'Eventos - Comunidade Café Bugado'
const DEFAULT_DESCRIPTION =
  'Descubra os melhores eventos de tecnologia. Meetups, workshops, hackathons e conferências reunidos em um só lugar pela comunidade.'
const DEFAULT_IMAGE_PATH = '/eventos.png'

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
  'Slack-ImgProxy',
  'TelegramBot',
  'Discordbot',
  'Applebot',
  'Pinterest',
  'Googlebot',
  'bingbot',
  'Embedly',
  'Quora Link Preview',
  'Showyoubot',
  'vkShare',
  'redditbot',
  'Skype',
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
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

function truncateText(text: string | null, maxLength = 160): string {
  if (!text || text.length <= maxLength) return text || ''
  return text.substring(0, maxLength - 3) + '...'
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function generateHtml({
  title,
  description,
  image,
  url,
  type = 'website',
  publishedTime,
}: {
  title: string
  description: string
  image: string
  url: string
  type?: string
  publishedTime?: string
}): string {
  const fullTitle =
    title !== SITE_NAME ? `${escapeHtml(title)} | ${SITE_NAME}` : SITE_NAME
  const safeTitle = escapeHtml(title)
  const safeDescription = escapeHtml(description)

  let articleTags = ''
  if (type === 'article' && publishedTime) {
    articleTags = `\n  <meta property="article:published_time" content="${escapeHtml(publishedTime)}">`
  }

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${fullTitle}</title>
  <meta name="description" content="${safeDescription}">

  <!-- Open Graph / Facebook / WhatsApp / LinkedIn / Telegram / Discord -->
  <meta property="og:type" content="${type}">
  <meta property="og:url" content="${url}">
  <meta property="og:title" content="${safeTitle}">
  <meta property="og:description" content="${safeDescription}">
  <meta property="og:image" content="${image}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:type" content="image/png">
  <meta property="og:locale" content="pt_BR">
  <meta property="og:site_name" content="${SITE_NAME}">${articleTags}

  <!-- Twitter / X -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${url}">
  <meta name="twitter:title" content="${safeTitle}">
  <meta name="twitter:description" content="${safeDescription}">
  <meta name="twitter:image" content="${image}">

  <!-- Theme color -->
  <meta name="theme-color" content="#2563eb">

  <!-- Favicon -->
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">

  <!-- Canonical -->
  <link rel="canonical" href="${url}">
</head>
<body>
  <h1>${safeTitle}</h1>
  <p>${safeDescription}</p>
  <img src="${image}" alt="${safeTitle}">
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
        `${supabaseUrl}/rest/v1/eventos?id=eq.${eventId}&select=id,nome,descricao,imagem,data_evento,horario,modalidade,cidade,estado,created_at`,
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

      const eventImage = event.imagem || `${origin}${DEFAULT_IMAGE_PATH}`
      const absoluteImage = eventImage.startsWith('http')
        ? eventImage
        : `${origin}${eventImage.startsWith('/') ? '' : '/'}${eventImage}`

      // Build a richer description with event details
      const cleanDescription = truncateText(stripHtmlTags(event.descricao)) || ''
      const details: string[] = []
      if (event.data_evento) details.push(`Data: ${event.data_evento}`)
      if (event.horario) details.push(`Horário: ${event.horario}`)
      if (event.modalidade) details.push(event.modalidade)
      if (event.cidade) {
        const location = [event.cidade, event.estado].filter(Boolean).join(' - ')
        details.push(location)
      }

      const detailsSuffix = details.length > 0 ? ` | ${details.join(' · ')}` : ''
      const fullDescription = cleanDescription
        ? truncateText(cleanDescription + detailsSuffix, 200)
        : truncateText(details.join(' · ') || DEFAULT_DESCRIPTION, 200)

      const html = generateHtml({
        title: event.nome,
        description: fullDescription,
        image: absoluteImage,
        url: `${origin}/eventos/${event.id}`,
        type: 'article',
        publishedTime: event.created_at,
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
  const seoData = pageSeo || {
    title: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
  }

  const html = generateHtml({
    title: seoData.title,
    description: seoData.description,
    image: `${origin}${DEFAULT_IMAGE_PATH}`,
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
