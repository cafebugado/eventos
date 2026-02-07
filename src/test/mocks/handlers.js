import { http, HttpResponse } from 'msw'

const SUPABASE_URL = 'https://test-project.supabase.co'

// Dados mock para eventos
export const mockEvents = [
  {
    id: '1',
    nome: 'Meetup React',
    descricao: 'Encontro sobre React e suas novidades',
    data_evento: '2024-02-15',
    horario: '19:00',
    dia_semana: 'Quinta-feira',
    periodo: 'Noturno',
    link: 'https://meetup.com/react',
    imagem: 'https://example.com/react.jpg',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    nome: 'Workshop Node.js',
    descricao: 'Workshop prático de Node.js',
    data_evento: '2024-02-20',
    horario: '14:00',
    dia_semana: 'Terça-feira',
    periodo: 'Vespertino',
    link: 'https://workshop.com/nodejs',
    imagem: null,
    created_at: '2024-01-02T00:00:00Z',
  },
  {
    id: '3',
    nome: 'Café da Manhã Tech',
    descricao: 'Networking matinal',
    data_evento: '2024-02-25',
    horario: '08:00',
    dia_semana: 'Sábado',
    periodo: 'Matinal',
    link: 'https://evento.com/cafe',
    imagem: 'https://example.com/cafe.jpg',
    created_at: '2024-01-03T00:00:00Z',
  },
]

// Dados mock para contribuintes
export const mockContributors = [
  {
    id: 'contrib-1',
    github_username: 'alice',
    nome: 'Alice Silva',
    avatar_url: 'https://avatars.githubusercontent.com/u/123',
    github_url: 'https://github.com/alice',
    linkedin_url: 'https://linkedin.com/in/alice',
    portfolio_url: 'https://alice.dev',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'contrib-2',
    github_username: 'bob',
    nome: 'Bob Santos',
    avatar_url: 'https://avatars.githubusercontent.com/u/456',
    github_url: 'https://github.com/bob',
    linkedin_url: null,
    portfolio_url: null,
    created_at: '2024-01-02T00:00:00Z',
  },
]

// Dados mock para usuário autenticado
export const mockUser = {
  id: 'user-123',
  email: 'admin@cafebugado.com',
  created_at: '2024-01-01T00:00:00Z',
}

export const mockSession = {
  user: mockUser,
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_at: Date.now() + 3600000,
}

// Handlers do MSW
export const handlers = [
  // Auth handlers
  http.post(`${SUPABASE_URL}/auth/v1/token`, async ({ request }) => {
    const body = await request.json()

    if (body.email === 'admin@cafebugado.com' && body.password === 'password123') {
      return HttpResponse.json({
        user: mockUser,
        session: mockSession,
      })
    }

    return HttpResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }),

  http.post(`${SUPABASE_URL}/auth/v1/logout`, () => {
    return HttpResponse.json({})
  }),

  http.get(`${SUPABASE_URL}/auth/v1/user`, () => {
    return HttpResponse.json({ user: mockUser })
  }),

  // Events handlers
  http.get(`${SUPABASE_URL}/rest/v1/eventos`, ({ request }) => {
    const url = new URL(request.url)
    const periodo = url.searchParams.get('periodo')

    let events = mockEvents
    if (periodo) {
      events = mockEvents.filter((e) => e.periodo === periodo.replace('eq.', ''))
    }

    return HttpResponse.json(events)
  }),

  http.post(`${SUPABASE_URL}/rest/v1/eventos`, async ({ request }) => {
    const body = await request.json()
    const newEvent = {
      id: 'new-event-id',
      ...body,
      created_at: new Date().toISOString(),
    }
    return HttpResponse.json(newEvent, { status: 201 })
  }),

  http.patch(`${SUPABASE_URL}/rest/v1/eventos`, async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json({ id: '1', ...body })
  }),

  http.delete(`${SUPABASE_URL}/rest/v1/eventos`, () => {
    return HttpResponse.json({}, { status: 204 })
  }),

  // Contributors handlers
  http.get(`${SUPABASE_URL}/rest/v1/contribuintes`, () => {
    return HttpResponse.json(mockContributors)
  }),

  http.post(`${SUPABASE_URL}/rest/v1/contribuintes`, async ({ request }) => {
    const body = await request.json()
    const newContributor = {
      id: 'new-contrib-id',
      ...body,
      created_at: new Date().toISOString(),
    }
    return HttpResponse.json(newContributor, { status: 201 })
  }),

  http.patch(`${SUPABASE_URL}/rest/v1/contribuintes`, async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json({ id: 'contrib-1', ...body })
  }),

  http.delete(`${SUPABASE_URL}/rest/v1/contribuintes`, () => {
    return HttpResponse.json({}, { status: 204 })
  }),

  // GitHub API handler
  http.get('https://api.github.com/users/:username', ({ params }) => {
    return HttpResponse.json({
      login: params.username,
      name: `${params.username} Full Name`,
      avatar_url: `https://avatars.githubusercontent.com/u/${Math.floor(Math.random() * 10000)}`,
      html_url: `https://github.com/${params.username}`,
    })
  }),

  // Storage handlers
  http.post(`${SUPABASE_URL}/storage/v1/object/imagens/*`, () => {
    return HttpResponse.json({ Key: 'eventos/test-image.jpg' })
  }),

  http.delete(`${SUPABASE_URL}/storage/v1/object/imagens/*`, () => {
    return HttpResponse.json({})
  }),
]
