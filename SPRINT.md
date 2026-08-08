# SPRINT.md — Listagem de eventos em `/eventos` via `GET /events/published`

> Documento de planejamento. Nenhum código foi alterado ainda — ver seção "Status" no final.

## Contexto

O commit `9e78c7c` removeu toda a integração deste frontend com a API antiga. O commit seguinte
(`136f986`, HEAD atual) religou a home ao backend novo (`D:\backendeventos-public-api`, NestJS +
Prisma, somente-leitura, produção em `https://v3.api.eventoscafebugado.cafebugado.com.br`) via
`GET /events/featured`. A página `/eventos` continua desligada: `src/app/eventos/page.jsx` não
busca dado nenhum, sempre renderiza o estado de erro (`EventsPageClient` recebe `events={[]}` +
um `Error` fixo).

O backend novo já implementa `GET /events/published` (Sprint 1 do roadmap dele): filtra
`status='publicado'`, ordena por `created_at DESC`, aceita `limit`/`offset` opcionais (omitidos =
retorna tudo), devolve o DTO público de 16 campos (`id, slug, nome, descricao, data_evento,
horario, dia_semana, periodo, modalidade, endereco, cidade, estado, link, imagem, created_at,
updated_at` — nunca `status`/`created_by`/`motivo_recusa`), com cache HTTP
(`Cache-Control: public, max-age=30, stale-while-revalidate=120`). Hoje esse endpoint não tem
nenhum consumidor.

**Decisão de escopo (confirmada com o usuário):**

- O endpoint ganha filtros `cidade`/`modalidade` (server-side, além do `limit`/`offset` que já
  existe) — capability pronta e testada, para dar suporte a filtragem otimizada no servidor.
- O **frontend, nesta fase, não usa esses filtros no fetch do servidor**. `/eventos` continua
  buscando a lista completa (sem parâmetros) e mantém 100% do comportamento atual de busca, tag,
  local/modalidade, data, favoritos e paginação **no cliente** — arquitetura já implementada,
  testada, e documentada como decisão deliberada em `usePagination.js`/`useEventFilters.js`
  (evita round-trip ao servidor a cada troca de filtro/página). Mudar isso é uma decisão de
  arquitetura separada, não incluída aqui.
- Página de detalhe (`/eventos/[slug]`) fica fora de escopo — depende de
  `GET /events/slug/{slugOrId}`, que não existe no backend ainda (Sprint 3 do roadmap dele).

## Por que esta funcionalidade agora (impacto × complexidade)

| Candidato                              | Impacto                                                                                                             | Complexidade                                                                                                                                                                                                                                | Motivo                                                                  |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| **`/eventos` via `/events/published`** | **Alto** — reconecta a página inteira, hoje 100% quebrada (só estado de erro); segunda página mais visitada do site | **Baixa** — endpoint já existe (Sprint 1 do backend); frontend só repete o padrão já validado e testado na home (`/events/featured`, commit `136f986`); zero mudança nos hooks/componentes de listagem, já prontos para receber dados reais | **Escolhido**                                                           |
| `/eventos/[slug]` (detalhe)            | Alto (SEO, conversão)                                                                                               | Média/Alta — endpoint `/events/slug/{slugOrId}` não existe no backend, precisa lookup + 404 + metadata                                                                                                                                      | Fora de escopo por pedido explícito do usuário — próxima sprint natural |
| Tags (`/tags`, `/events/tags-map`)     | Médio — só melhora o filtro de tags dentro de `/eventos`                                                            | Média — endpoint novo, join `evento_tags`+`tags`                                                                                                                                                                                            | Backlog do backend (Sprint 2 dele)                                      |
| `/sobre` (stats, contributors)         | Baixo/Médio (páginas secundárias)                                                                                   | Baixa/Média                                                                                                                                                                                                                                 | Backlog do backend (Sprint 4 dele)                                      |
| `/galeria`                             | Médio                                                                                                               | Alta — join de 4 tabelas + resolução de nomes                                                                                                                                                                                               | Backlog do backend (Sprint 5 dele)                                      |
| `EventRecommendations`                 | Baixo (componente secundário)                                                                                       | Alta — algoritmo de ranking                                                                                                                                                                                                                 | Backlog do backend (Sprint 6 dele)                                      |

## Desenho da solução

### Backend (`D:\backendeventos-public-api`) — estender `GET /events/published`, não criar rota nova

Reaproveita 100% do módulo `events` já existente (Controller → Service → Repository interface +
impl Prisma → DTO), evitando duplicar uma query quase idêntica em uma rota paralela (DRY). A
assinatura do repositório evolui de parâmetros posicionais para um objeto de filtros — mais limpo
já que estamos adicionando 2 parâmetros novos a uma função que já tinha 2 posicionais opcionais:

```ts
// evento.repository.interface.ts
export interface FindPublishedFilters {
  cidade?: string
  modalidade?: string
  limit?: number
  offset?: number
}

export interface IEventoRepository {
  findPublished(filters?: FindPublishedFilters): Promise<Evento[]>
  findFeatured(limit: number): Promise<EventoFeaturedFields[]>
}
```

```ts
// prisma-evento.repository.ts
findPublished(filters: FindPublishedFilters = {}): Promise<Evento[]> {
  const { cidade, modalidade, limit, offset } = filters
  return this.prisma.evento.findMany({
    where: {
      status: 'publicado',
      ...(cidade && { cidade: { equals: cidade, mode: 'insensitive' } }),
      ...(modalidade && { modalidade: { equals: modalidade, mode: 'insensitive' } }),
    },
    orderBy: { created_at: 'desc' },
    take: limit,
    skip: offset,
  })
}
```

`EventsService.getPublished(filters)` e `EventsController.findPublished(query)` viram passthrough
do objeto inteiro (`ListPublishedQueryDto` já tem exatamente esse formato, então passa direto sem
mapeamento manual). `ListPublishedQueryDto` ganha:

```ts
@ApiPropertyOptional({ description: 'Filtra por cidade exata (case-insensitive).', maxLength: 120 })
@IsOptional() @IsString() @MaxLength(120)
cidade?: string

@ApiPropertyOptional({ description: 'Filtra por modalidade exata (ex.: "Online", "Presencial").', maxLength: 60 })
@IsOptional() @IsString() @MaxLength(60)
modalidade?: string
```

Sem filtros informados, o comportamento é **idêntico ao de hoje** (mesma query, mesmo cache, mesmo
DTO) — extensão aditiva, não é breaking change no contrato existente. `EventPublicResponseDto`,
`contract.spec.ts` e o cache do controller não mudam.

**Fora de escopo no backend:** índice de banco em `cidade`/`modalidade` — o schema Prisma é
introspectado do Postgres gerenciado pelo outro repositório (`D:\backendeventos`, dono das
migrations via Alembic); adicionar índice é mudança de schema, pertence lá, não aqui. Não é
necessário para o volume atual de eventos; fica anotado como possível melhoria futura se o filtro
passar a ser muito usado.

### Frontend (`e:\agendas_eventos`) — reconectar `/eventos` no mesmo padrão já usado na home

`src/services/eventService.js` ganha uma segunda função, mesmo padrão de `getFeaturedEvents`:

```js
export async function getPublishedEvents({ cidade, modalidade, limit, offset } = {}) {
  return apiGet('/events/published', {
    params: { cidade, modalidade, limit, offset },
    context: 'getPublishedEvents',
  })
}
```

`src/app/eventos/page.jsx` vira Server Component assíncrono, mesmo padrão de `src/app/page.jsx`
(commit `136f986`): busca **sem parâmetros** (lista completa), `try/catch` com `captureError`
(Sentry) e fallback vazio — a página nunca quebra por falha da API:

```jsx
import EventsPageClient from './EventsPageClient'
import { getPublishedEvents } from '../../services/eventService'
import { captureError } from '../../lib/sentry'

export const metadata = {/* mantém como está */}
export const dynamic = 'force-dynamic'

async function loadEvents() {
  try {
    return { events: await getPublishedEvents(), error: null }
  } catch (error) {
    captureError(error, { context: 'EventsPage.loadEvents' })
    return { events: [], error }
  }
}

export default async function EventsPage() {
  const { events, error } = await loadEvents()
  return <EventsPageClient events={events} tagsMap={{}} tags={[]} error={error} />
}
```

`tagsMap`/`tags` continuam vazios — endpoint de tags ainda não existe no backend (Sprint 2 dele);
`EventsPageClient`/`FilterModal` já toleram isso.

**Nada muda** em `EventsPageClient.jsx`, `useEventFilters.js`, `usePagination.js`,
`useViewMode.js`, `EventsGrid.jsx`, `EventsFilters.jsx`, `FilterModal.jsx`, `Pagination.jsx`,
`EventCard.jsx`, `eventLocationOptions.js` — já recebem `events` via prop e já filtram/paginam
100% no cliente; só passam a receber dados reais em vez de `[]`. `.env.example`
(`NEXT_PUBLIC_API_BASE_URL`) e `next.config.mjs` (CSP `connect-src`) já apontam para
`v3.api.eventoscafebugado.cafebugado.com.br` desde a sprint anterior — sem alteração.

## Tarefas

### Backend

1. **T1 — `IEventoRepository`**: adicionar `FindPublishedFilters` e mudar `findPublished` para
   aceitar o objeto de filtros (`evento.repository.interface.ts`).
2. **T2 — `PrismaEventoRepository.findPublished`**: aplicar `cidade`/`modalidade` no `where`
   (case-insensitive), manter `take`/`skip` como já é.
3. **T3 — `ListPublishedQueryDto`**: adicionar `cidade?`/`modalidade?` com validação
   (`@IsString`, `@MaxLength`).
4. **T4 — `EventsService.getPublished` / `EventsController.findPublished`**: repassar o objeto de
   filtros inteiro (não mais `limit`/`offset` posicionais).
5. **T5 — Testes** (ver seção própria abaixo).
6. **T6 — Docs**: nova entrada no `SPRINT.md` do backend (`D:\backendeventos-public-api\SPRINT.md`,
   "Sprint 1.6" — mesmo padrão da entrada 1.5 de `/events/featured`) e atualização da tabela de
   endpoints no `README.md` dele.

### Frontend

7. **T7 — `eventService.js`**: adicionar `getPublishedEvents({ cidade, modalidade, limit, offset })`.
8. **T8 — `app/eventos/page.jsx`**: virar Server Component assíncrono (padrão de `app/page.jsx`).
9. **T9 — `app/eventos/page.test.jsx`**: reescrever para mockar `getPublishedEvents` (mesmo padrão
   de `app/page.test.jsx`) — caminho feliz (eventos mockados chegam ao `EventsPageClient`) +
   resiliência (API falha, página não quebra, sem crash).
10. **T10 — `src/test/mocks/handlers.js`**: novo handler `GET /events/published` → `[]` por
    padrão (mesmo padrão do handler de `/events/featured`).
11. **T11 — `src/services/eventService.test.js`**: estender com testes de `getPublishedEvents`
    (busca ok, `cidade`/`modalidade`/`limit`/`offset` viram query params quando informados,
    ausentes quando omitidos, erro não-2xx anexa `.status`).
12. **T12 (opcional, baixo custo)** — corrigir a seção "Backend" do `CLAUDE.md` da raiz, hoje
    desatualizada (ainda descreve o backend como FastAPI/v2 — a API em uso é a nova, NestJS+Prisma
    v3). Não bloqueia a feature; é acerto de documentação.

## Critérios de conclusão

- [ ] `GET /events/published` sem parâmetros mantém exatamente o comportamento de hoje (mesmo
      payload, mesmo cache) — nenhuma regressão nos testes já existentes (`contract.spec.ts`,
      `events-published.e2e-spec.ts` originais).
- [ ] `GET /events/published?cidade=São Paulo` retorna só eventos dessa cidade (case-insensitive).
- [ ] `GET /events/published?modalidade=Online` retorna só eventos dessa modalidade.
- [ ] Filtros combináveis entre si e com `limit`/`offset`.
- [ ] `/eventos` (frontend) renderiza eventos reais vindos da API, com busca, tag (sem dado real
      ainda, mas sem quebrar), local/modalidade, intervalo de data, favoritos e paginação
      funcionando exatamente como hoje (client-side).
- [ ] Falha da API em `/eventos` não derruba a página — cai no `ErrorState` já existente
      (`EventsGrid`), erro reportado ao Sentry.
- [ ] `npm run lint && npm run test && npm run test:e2e` verdes em `D:\backendeventos-public-api`,
      cobertura ≥ 80% mantida em `modules/events/**`.
- [ ] `pnpm lint && pnpm test:run && pnpm build` verdes em `e:\agendas_eventos`, thresholds do
      `vitest.config.js` mantidos (55%/50%/48%).
- [ ] Verificação manual: dev server do frontend contra o backend local e contra produção v3 —
      `/eventos` mostra eventos reais, filtros/paginação funcionam, sem erro de CSP no console.

## Arquivos afetados

**Backend `D:\backendeventos-public-api` (modificados):**

- `src/modules/events/repositories/evento.repository.interface.ts`
- `src/modules/events/repositories/prisma-evento.repository.ts`
- `src/modules/events/repositories/prisma-evento.repository.spec.ts`
- `src/modules/events/events.service.ts`
- `src/modules/events/events.service.spec.ts`
- `src/modules/events/events.controller.ts`
- `src/modules/events/events.controller.spec.ts`
- `src/modules/events/dto/list-published-query.dto.ts`
- `src/modules/events/dto/list-published-query.dto.spec.ts`
- `test/events-published.e2e-spec.ts`
- `README.md`, `SPRINT.md`

**Sem alteração (confirmado por leitura direta):** `dto/event-public-response.dto.ts` (e seu
spec), `test/contract.spec.ts`, `common/interceptors/cache-control.interceptor.ts`.

**Frontend `e:\agendas_eventos` (modificados):**

- `src/services/eventService.js`
- `src/services/eventService.test.js`
- `src/app/eventos/page.jsx`
- `src/app/eventos/page.test.jsx`
- `src/test/mocks/handlers.js`
- `CLAUDE.md` (opcional, T12)

**Sem alteração:** `src/app/eventos/EventsPageClient.jsx`, `src/hooks/useEventFilters.js`,
`src/hooks/usePagination.js`, `src/hooks/useViewMode.js`, `src/components/EventsGrid.jsx`,
`src/components/EventsFilters.jsx`, `src/components/FilterModal.jsx`,
`src/components/Pagination.jsx`, `src/components/EventCard.jsx`,
`src/utils/eventLocationOptions.js`, `.env.example`, `next.config.mjs`.

## Testes necessários

**Backend:**

- Unitário de repositório: `where` inclui `cidade`/`modalidade` quando informados (com
  `mode: 'insensitive'`), omite quando não informados; `findPublished({ limit, offset })` continua
  repassando `take`/`skip` corretamente (call signature migrada de posicional para objeto).
- Unitário de service/controller: repassam o objeto de filtros inteiro sem transformação.
- Unitário de DTO (`list-published-query.dto.spec.ts`): aceita `cidade`/`modalidade` como string,
  rejeita acima do `maxLength`.
- E2E: `?cidade=`/`?modalidade=` chegam corretos no `where` da chamada ao Prisma (mock);
  combinação com `limit`/`offset`; regressão dos testes já existentes (cache header, CORS, campos
  proibidos, 400 em `limit` fora do intervalo).
- Contrato (`contract.spec.ts`): sem alteração — mesma garantia de 16 campos exatos.

**Frontend:**

- Unitário de `getPublishedEvents` via MSW: happy path, cada filtro vira query param só quando
  informado, erro não-2xx anexa `.status`.
- `app/eventos/page.test.jsx`: caminho feliz (evento mockado chega ao `EventsPageClient`,
  renderizado na tela) + resiliência (API rejeita, página mostra estado de erro em vez de crashar).
- Regressão: suíte existente de `EventsPageClient.test.jsx` (filtros, paginação, view mode) não
  deve precisar de nenhuma mudança — continua operando sobre a prop `events`, agora populada com
  dados reais em produção.

## Fora de escopo (deliberado, não faz parte desta sprint)

- Página de detalhe `/eventos/[slug]` — depende de `GET /events/slug/{slugOrId}`, que não existe
  no backend (Sprint 3 do roadmap dele). Fica para quando o usuário pedir.
- Mover o filtro de local (`?local=`) para o servidor (usar `cidade`/`modalidade` no fetch) —
  capability pronta no backend, mas não usada nesta fase por decisão explícita do usuário. Mudaria
  a arquitetura deliberadamente client-side documentada em `usePagination.js`/`useEventFilters.js`
  (introduziria round-trip ao servidor a cada troca de local). Próximo passo natural, não incluído
  aqui.
- Paginação e contagem total no servidor (`total`/envelope de resposta) — segue com paginação
  100% client-side sobre a lista completa, como hoje.
- Tags (`/tags`, `/events/tags-map`) — `tagsMap` continua `{}`; filtro de tag na UI fica sem dado
  real até o backend implementar (Sprint 2 do roadmap dele).
- `/galeria`, `/sobre`, `EventRecommendations` — dependem de endpoints que não existem ainda no
  backend (Sprints 4-6 do roadmap dele).

## Status

Implementado (T1–T11; T12 também aplicado). Backend: `npm run lint && npm run test && npm run
test:e2e` verdes (55 unitários + 27 e2e/contrato), cobertura ≥ 80% mantida em `modules/events/**`.
Frontend: `pnpm lint && pnpm test:run && pnpm build` verdes (272/272 testes, 72 arquivos), `/eventos`
compila como rota dinâmica (`ƒ`). Verificação manual contra o backend real (local/produção v3)
ainda não foi feita nesta sessão — recomendada antes do deploy.
