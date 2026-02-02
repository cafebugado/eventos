import { useEffect } from 'react'

const DEFAULT_SEO = {
  siteName: 'Eventos - Comunidade Café Bugado',
  title: 'Eventos - Comunidade Café Bugado',
  description:
    'Descubra os melhores eventos de tecnologia. Meetups, workshops, hackathons e conferências reunidos em um só lugar pela comunidade.',
  image: '/eventos.png',
  url: typeof window !== 'undefined' ? window.location.origin : '',
  type: 'website',
  locale: 'pt_BR',
  twitterCard: 'summary_large_image',
}

function getAbsoluteUrl(path) {
  if (!path) {
    return ''
  }
  if (path.startsWith('http')) {
    return path
  }
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  return `${origin}${path.startsWith('/') ? '' : '/'}${path}`
}

function truncateText(text, maxLength = 160) {
  if (!text || text.length <= maxLength) {
    return text
  }
  return text.substring(0, maxLength - 3) + '...'
}

function stripHtmlTags(html) {
  if (!html) {
    return ''
  }
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function setMetaTag(property, content, isName = false) {
  if (!content) {
    return
  }

  const attribute = isName ? 'name' : 'property'
  let element = document.querySelector(`meta[${attribute}="${property}"]`)

  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, property)
    document.head.appendChild(element)
  }

  element.setAttribute('content', content)
}

function setLinkTag(rel, href) {
  if (!href) {
    return
  }

  let element = document.querySelector(`link[rel="${rel}"]`)

  if (!element) {
    element = document.createElement('link')
    element.setAttribute('rel', rel)
    document.head.appendChild(element)
  }

  element.setAttribute('href', href)
}

function SEOHead({
  title,
  description,
  image,
  url,
  type = 'website',
  noIndex = false,
  article = null,
}) {
  useEffect(() => {
    const seoTitle = title || DEFAULT_SEO.title
    const seoDescription = truncateText(stripHtmlTags(description) || DEFAULT_SEO.description)
    const seoImage = getAbsoluteUrl(image || DEFAULT_SEO.image)
    const seoUrl = url || (typeof window !== 'undefined' ? window.location.href : DEFAULT_SEO.url)
    const fullTitle =
      title && title !== DEFAULT_SEO.title ? `${title} | ${DEFAULT_SEO.siteName}` : seoTitle

    // Update document title
    document.title = fullTitle

    // Basic meta tags
    setMetaTag('description', seoDescription, true)
    setMetaTag('robots', noIndex ? 'noindex, nofollow' : 'index, follow', true)

    // Open Graph tags
    setMetaTag('og:title', seoTitle)
    setMetaTag('og:description', seoDescription)
    setMetaTag('og:image', seoImage)
    setMetaTag('og:url', seoUrl)
    setMetaTag('og:type', type)
    setMetaTag('og:site_name', DEFAULT_SEO.siteName)
    setMetaTag('og:locale', DEFAULT_SEO.locale)

    // Twitter Card tags
    setMetaTag('twitter:card', DEFAULT_SEO.twitterCard, true)
    setMetaTag('twitter:title', seoTitle, true)
    setMetaTag('twitter:description', seoDescription, true)
    setMetaTag('twitter:image', seoImage, true)

    // Article specific tags
    if (type === 'article' && article) {
      if (article.publishedTime) {
        setMetaTag('article:published_time', article.publishedTime)
      }
      if (article.modifiedTime) {
        setMetaTag('article:modified_time', article.modifiedTime)
      }
      if (article.author) {
        setMetaTag('article:author', article.author)
      }
    }

    // Canonical URL
    setLinkTag('canonical', seoUrl)

    // Cleanup function
    return () => {
      // Reset to defaults when component unmounts
      document.title = DEFAULT_SEO.title
    }
  }, [title, description, image, url, type, noIndex, article])

  return null
}

export default SEOHead
