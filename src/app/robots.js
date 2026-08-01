// Convenção do Next.js App Router: servido automaticamente em /robots.txt.
// Sem admin pra desalow (ver memoria/decisao de nao portar admin) — só
// aponta pro sitemap.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://eventos.cafebugado.com.br'

export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
