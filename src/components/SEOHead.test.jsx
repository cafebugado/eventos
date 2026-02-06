import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, cleanup } from '@testing-library/react'
import SEOHead from './SEOHead'

describe('SEOHead', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Clean up meta tags
    document.querySelectorAll('meta[property^="og:"]').forEach((el) => el.remove())
    document.querySelectorAll('meta[name^="twitter:"]').forEach((el) => el.remove())
    document.querySelectorAll('meta[name="description"]').forEach((el) => el.remove())
    document.querySelectorAll('meta[name="robots"]').forEach((el) => el.remove())
    document.querySelectorAll('link[rel="canonical"]').forEach((el) => el.remove())
  })

  afterEach(() => {
    cleanup()
  })

  it('deve atualizar o titulo do documento', () => {
    render(<SEOHead title="Evento Teste" />)

    expect(document.title).toBe('Evento Teste | Eventos - Comunidade Café Bugado')
  })

  it('deve usar titulo padrao quando nao fornecido', () => {
    render(<SEOHead />)

    expect(document.title).toBe('Eventos - Comunidade Café Bugado')
  })

  it('deve definir meta tag de descricao', () => {
    render(<SEOHead description="Descricao do evento teste" />)

    const metaDescription = document.querySelector('meta[name="description"]')
    expect(metaDescription).not.toBeNull()
    expect(metaDescription.getAttribute('content')).toBe('Descricao do evento teste')
  })

  it('deve definir meta tags Open Graph', () => {
    render(
      <SEOHead
        title="Evento Teste"
        description="Descricao teste"
        image="https://exemplo.com/imagem.jpg"
        url="https://exemplo.com/evento/1"
      />
    )

    expect(document.querySelector('meta[property="og:title"]').getAttribute('content')).toBe(
      'Evento Teste'
    )
    expect(document.querySelector('meta[property="og:description"]').getAttribute('content')).toBe(
      'Descricao teste'
    )
    expect(document.querySelector('meta[property="og:image"]').getAttribute('content')).toBe(
      'https://exemplo.com/imagem.jpg'
    )
    expect(document.querySelector('meta[property="og:url"]').getAttribute('content')).toBe(
      'https://exemplo.com/evento/1'
    )
    expect(document.querySelector('meta[property="og:type"]').getAttribute('content')).toBe(
      'website'
    )
    expect(document.querySelector('meta[property="og:locale"]').getAttribute('content')).toBe(
      'pt_BR'
    )
  })

  it('deve definir meta tags Twitter Card', () => {
    render(
      <SEOHead
        title="Evento Teste"
        description="Descricao teste"
        image="https://exemplo.com/imagem.jpg"
      />
    )

    expect(document.querySelector('meta[name="twitter:card"]').getAttribute('content')).toBe(
      'summary_large_image'
    )
    expect(document.querySelector('meta[name="twitter:title"]').getAttribute('content')).toBe(
      'Evento Teste'
    )
    expect(document.querySelector('meta[name="twitter:description"]').getAttribute('content')).toBe(
      'Descricao teste'
    )
    expect(document.querySelector('meta[name="twitter:image"]').getAttribute('content')).toBe(
      'https://exemplo.com/imagem.jpg'
    )
  })

  it('deve definir tipo article quando especificado', () => {
    render(<SEOHead title="Evento" type="article" />)

    expect(document.querySelector('meta[property="og:type"]').getAttribute('content')).toBe(
      'article'
    )
  })

  it('deve definir meta tags de artigo quando fornecidas', () => {
    render(
      <SEOHead
        title="Evento"
        type="article"
        article={{
          publishedTime: '2024-01-15T10:00:00Z',
          modifiedTime: '2024-01-16T12:00:00Z',
          author: 'Cafe Bugado',
        }}
      />
    )

    expect(
      document.querySelector('meta[property="article:published_time"]').getAttribute('content')
    ).toBe('2024-01-15T10:00:00Z')
    expect(
      document.querySelector('meta[property="article:modified_time"]').getAttribute('content')
    ).toBe('2024-01-16T12:00:00Z')
    expect(document.querySelector('meta[property="article:author"]').getAttribute('content')).toBe(
      'Cafe Bugado'
    )
  })

  it('deve definir link canonical', () => {
    render(<SEOHead url="https://exemplo.com/evento/1" />)

    const canonical = document.querySelector('link[rel="canonical"]')
    expect(canonical).not.toBeNull()
    expect(canonical.getAttribute('href')).toBe('https://exemplo.com/evento/1')
  })

  it('deve definir robots como noindex quando especificado', () => {
    render(<SEOHead noIndex={true} />)

    const robots = document.querySelector('meta[name="robots"]')
    expect(robots.getAttribute('content')).toBe('noindex, nofollow')
  })

  it('deve definir robots como index por padrao', () => {
    render(<SEOHead />)

    const robots = document.querySelector('meta[name="robots"]')
    expect(robots.getAttribute('content')).toBe('index, follow')
  })

  it('deve truncar descricao longa', () => {
    const longDescription = 'A'.repeat(200)
    render(<SEOHead description={longDescription} />)

    const metaDescription = document.querySelector('meta[name="description"]')
    expect(metaDescription.getAttribute('content').length).toBeLessThanOrEqual(160)
    expect(metaDescription.getAttribute('content').endsWith('...')).toBe(true)
  })

  it('deve remover tags HTML da descricao', () => {
    render(<SEOHead description="<p>Descricao com <strong>HTML</strong></p>" />)

    const metaDescription = document.querySelector('meta[name="description"]')
    expect(metaDescription.getAttribute('content')).toBe('Descricao com HTML')
  })

  it('deve converter imagem relativa para URL absoluta', () => {
    render(<SEOHead image="/eventos.png" />)

    const ogImage = document.querySelector('meta[property="og:image"]')
    expect(ogImage.getAttribute('content')).toContain('/eventos.png')
    expect(ogImage.getAttribute('content')).toMatch(/^https?:\/\//)
  })

  it('deve manter URL absoluta da imagem', () => {
    render(<SEOHead image="https://cdn.exemplo.com/imagem.jpg" />)

    const ogImage = document.querySelector('meta[property="og:image"]')
    expect(ogImage.getAttribute('content')).toBe('https://cdn.exemplo.com/imagem.jpg')
  })

  it('deve atualizar meta tags quando props mudam', () => {
    const { rerender } = render(<SEOHead title="Titulo 1" />)

    expect(document.title).toContain('Titulo 1')

    rerender(<SEOHead title="Titulo 2" />)

    expect(document.title).toContain('Titulo 2')
  })
})
