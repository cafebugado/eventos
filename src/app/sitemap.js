// Convenção nativa do Next: cada objeto exportado aqui vira uma entrada do
// sitemap.xml servido automaticamente em /sitemap.xml.
//
// O sitemap ainda contém apenas rotas estáticas. A inclusão das páginas de
// eventos publicadas pela API é acompanhada em #382.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://eventos.cafebugado.com.br'

const STATIC_ROUTES = [
  { path: '/', priority: 1.0, changeFrequency: 'daily' },
  { path: '/eventos', priority: 0.9, changeFrequency: 'daily' },
  { path: '/sobre', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/galeria', priority: 0.6, changeFrequency: 'weekly' },
  { path: '/contato', priority: 0.4, changeFrequency: 'monthly' },
]

export default async function sitemap() {
  return STATIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }))
}
