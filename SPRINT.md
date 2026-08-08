# SPRINT: `GET /events/featured` — Eventos em Destaque na Home

> Documento de planejamento. Nenhum código foi alterado ainda — ver seção "Status" no final.

## Contexto

O commit `9e78c7c` removeu toda a integração deste frontend com a API antiga (`v2.backendeventoscfb...`) — ver histórico dessa limpeza no `git log` (sprint anterior, já implementada). Hoje `HEAD` da home (`src/app/page.jsx`) não busca nada: renderiza `<UpcomingEvents events={[]} tagsMap={{}} />`, e a seção "Eventos em Destaque" fica sempre vazia (`UpcomingEvents` retorna `null` quando `events.length === 0`).

Está entrando em produção um **novo backend**, `D:\backendeventos-public-api` (NestJS + Prisma, somente-leitura, lê do mesmo Postgres/Supabase do backend FastAPI legado `D:\backendeventos`, mas com role dedicada `public_api_readonly`). Produção: `https://v3.api.eventoscafebugado.cafebugado.com.br`. Hoje esse projeto só tem 1 endpoint implementado: `GET /events/published` (Sprint 1 do roadmap dele, ver `D:\backendeventos-public-api\SPRINT.md`).

A primeira funcionalidade a religar no frontend é a seção de destaques da home. Requisito explícito: **endpoint dedicado no backend**, criado especificamente para isso — não reaproveitar `/events/published?limit=3`, que devolve o DTO completo (16 campos). O objetivo é performance: o card da home não deve pagar o custo de buscar/serializar campos que não usa.

**Definição de "destaque":** os **3 últimos eventos cadastrados**, ordenados por `created_at DESC` — não pela data do evento. Isso é diferente do antigo `/events/upcoming` (que ordenava por data/hora futura); esse endpoint não existe no backend novo e não é o que esta sprint implementa.

**Por que esta é a próxima funcionalidade certa (impacto × complexidade):** é a tela mais visível do site (home), a estrutura de apresentação (`EventCard`, `UpcomingEvents`, `useFavouritesStore`) já existe intacta e só precisa voltar a receber dados, e o backend novo já validou o esqueleto ponta-a-ponta (Controller → Service → Repository → DTO → cache HTTP → Swagger → testes) em `/events/published` — o endpoint novo é uma repetição direta desse padrão, com baixo risco de regressão.

**Decisão de escopo do DTO (validada com o usuário):** o payload será **estritamente mínimo** — só os campos que o card da home realmente lê. Consequência aceita conscientemente: `useFavouritesStore` persiste o objeto do evento inteiro no `localStorage` ao favoritar; um evento favoritado a partir do card de destaque da home terá exibição incompleta em `/favoritos` (badge sem texto, sem local/modalidade, botão "Ver evento" sem link) até o usuário revisitar `/eventos` e favoritar por lá (fonte com o DTO completo de `/events/published`). **Não é um bug a corrigir nesta sprint** — é a consequência explícita da escolha de payload mínimo.

**Fora de escopo:** os outros 4 services antigos (`getPublishedEvents`, `getEventBySlugOrId`, `getEventStats`, `getRecommendedEvents`, tags, galeria, contribuidores) — voltam quando os respectivos endpoints existirem no backend novo, mesmo espírito incremental do roadmap dele. Cache do service worker (`public/sw.js`) para o domínio da API nova. Documentação geral (`README.md`, `docs/*`) além do `.env.example`.

## Desenho da solução

### Backend (`D:\backendeventos-public-api`) — novo endpoint `GET /events/featured`

Replica a arquitetura já usada em `/events/published`, no mesmo módulo (`src/modules/events/`), sem criar módulo novo:

- **Query Prisma:** `where: { status: 'publicado' }, orderBy: { created_at: 'desc' }, take: limit`, com **`select`** trazendo só as colunas necessárias (otimização real — menos bytes trafegados do Postgres, não só um DTO mais magro na saída).
- **Campos do DTO (`EventFeaturedResponseDto`):** `id, slug, nome, descricao, data_evento, horario, imagem, created_at`. Confirmado lendo `EventCard.jsx` linha a linha para o modo exato como a home renderiza o card (`variant="compact"`, `showDescription`, `showActionButton`, `showInfoRows={false}`, `showDateBadge`, `actionInternal`, ver `src/components/UpcomingEvents.jsx`):
  - `showInfoRows={false}` → `horario`/`dia_semana`/`modalidade`/`cidade`/`estado` não aparecem nas linhas de info (só `data_evento`+`horario` alimentam `useEventCountdown` para o badge de "acontecendo agora"/contagem regressiva).
  - `showDateBadge={true}` → o badge usa `formatDateToDayMonth(data_evento)`, então `periodo` nunca é lido.
  - `actionInternal={true}` → o botão "Ver evento" navega internamente via `slug`/`id`, então `link` não é lido.
  - `created_at` é lido para o badge "Novo" (< 48h).
- **Rota:** `GET events/featured`, adicionada ao `EventsController` já existente (`@Controller('events')`) — herda automaticamente `@UseInterceptors(CacheControlInterceptor)` de nível de controller (`Cache-Control: public, max-age=30, stale-while-revalidate=120`), sem código extra de cache.
- **Query params:** `limit` opcional, `1–10` (não `1–100` como `/published` — é um endpoint de "top N fixo", não uma listagem paginada), default `3` via `ListFeaturedQueryDto` (`limit?: number = 3`, mesmo padrão de `offset?: number = 0` em `ListPublishedQueryDto`).
- **Interface:** `IEventoRepository` ganha `findFeatured(limit?: number): Promise<EventoFeaturedFields[]>`, onde `EventoFeaturedFields = Pick<Evento, 'id'|'slug'|'nome'|'descricao'|'data_evento'|'horario'|'imagem'|'created_at'>`.

### Frontend (`e:\agendas_eventos`) — reintrodução mínima da camada de API

- Restaurar `src/lib/apiClient.js` (`withRetry`: timeout 15s, até 2 retries com backoff exponencial só em erro de rede/timeout, reporta ao Sentry) e `src/lib/api/eventosApi.js` (`apiGet`: monta querystring de `params`, `cache: 'no-store'` por padrão, anexa `error.status` em respostas não-2xx) — recuperáveis do histórico do git (commit `a08e2f3`, antes da remoção), só trocando `DEFAULT_BASE_URL` para `https://v3.api.eventoscafebugado.cafebugado.com.br`.
- Novo `src/services/eventService.js` com **uma função só**:
  ```js
  import { apiGet } from '../lib/api/eventosApi'

  export async function getFeaturedEvents(limit = 3) {
    return apiGet('/events/featured', { params: { limit }, context: 'getFeaturedEvents' })
  }
  ```
- `src/app/page.jsx` volta a ser Server Component assíncrono, buscando os destaques num `try/catch` (mesmo padrão do antigo `loadUpcomingEvents`: reporta erro via `captureError` de `src/lib/sentry.js`, cai em `[]` — a home nunca quebra por falha da API):
  ```jsx
  async function loadFeaturedEvents() {
    try {
      return await getFeaturedEvents()
    } catch (error) {
      captureError(error, { context: 'Home.loadFeaturedEvents' })
      return []
    }
  }

  export default async function Home() {
    const events = await loadFeaturedEvents()
    return (
      <>
        {/* hero, sem alteração */}
        <UpcomingEvents events={events} tagsMap={{}} />
        <Testimonials />
      </>
    )
  }
  ```
  `tagsMap` fica `{}` fixo por enquanto — endpoint de tags ainda não existe no backend novo; `EventCard` já tolera `tags=[]` sem quebrar.
- `.env.example`: restaurar o bloco `NEXT_PUBLIC_API_BASE_URL` (comentado, com o novo default de produção).
- `next.config.mjs`: adicionar `https://v3.api.eventoscafebugado.cafebugado.com.br` ao `connect-src` do CSP — sem isso o `fetch` é bloqueado no browser em produção.

`UpcomingEvents.jsx` **não precisa de nenhuma alteração** — já aceita `events`/`tagsMap` via props e já renderiza `EventCard` exatamente do jeito certo (`variant="compact"`, `showDescription`, `showActionButton`, `showInfoRows={false}`, `showDateBadge`, `actionInternal`, `favouriteIds`/`toggleFavourite` do Zustand).

## Tarefas

1. **Backend T1** — `IEventoRepository.findFeatured` (interface) + `PrismaEventoRepository.findFeatured` (query com `select` dos 8 campos, `where: { status: 'publicado' }`, `orderBy: { created_at: 'desc' }`, `take: limit`).
2. **Backend T2** — `dto/event-featured-response.dto.ts` (`EventFeaturedResponseDto`, 8 `@ApiProperty`, `static fromEntity()`) + `dto/list-featured-query.dto.ts` (`ListFeaturedQueryDto`, `limit?: number = 3`, `@Min(1) @Max(10)`).
3. **Backend T3** — rota `@Get('featured')` em `EventsController` (`@ApiOkResponse`, `@ApiQuery` para `limit`) + `EventsService.getFeatured(limit?)` (chama repositório, mapeia entidade → DTO).
4. **Backend T4 — Testes:**
   - Estender `prisma-evento.repository.spec.ts`: `findFeatured` sem argumento usa `take: 3` (default aplicado pelo DTO antes de chegar aqui — ou testar que o repositório aceita `limit` explícito e usa no `take`), `select` contém exatamente os 8 campos.
   - Estender `events.service.spec.ts`: `getFeatured()` mapeia entidade → DTO com só os 8 campos, retorna `[]` sem erro quando não há eventos.
   - Estender `events.controller.spec.ts`: rota chama `eventsService.getFeatured` com o `limit` da query.
   - Novo `test/events-featured.e2e-spec.ts` (mirror de `events-published.e2e-spec.ts`): `GET /events/featured` → 200, `Content-Type: application/json`, array; documentado em `/docs-json`; header `Cache-Control: public, max-age=30, stale-while-revalidate=120`; `?limit=2` respeitado (`take: 2` na chamada ao Prisma); `?limit=0` e `?limit=11` → 400; payload de cada item contém **exatamente** `id, slug, nome, descricao, data_evento, horario, imagem, created_at` (nada de `status`, `created_by`, `motivo_recusa`, mas também nada de `dia_semana`, `periodo`, `modalidade`, `link`, `cidade`, `estado`, `endereco`, `updated_at` — o contrato é mínimo por design).
   - Estender `test/contract.spec.ts` com um novo `describe('Contrato de resposta — GET /events/featured')`: compara `Object.keys(firstEvent).sort()` com os 8 campos esperados (trava regressão se alguém adicionar campo sem decisão deliberada).
5. **Backend T5** — atualizar `README.md` (tabela de endpoints implementados) e `SPRINT.md` do backend (nova entrada no roadmap — "featured" não estava nos 10 endpoints originalmente mapeados na Sprint 1).
6. **Frontend T1** — restaurar `src/lib/apiClient.js` e `src/lib/api/eventosApi.js` (`DEFAULT_BASE_URL = 'https://v3.api.eventoscafebugado.cafebugado.com.br'`).
7. **Frontend T2** — criar `src/services/eventService.js` com `getFeaturedEvents(limit = 3)`.
8. **Frontend T3** — reescrever `src/app/page.jsx` (Server Component assíncrono, `loadFeaturedEvents` com try/catch + Sentry, passa `events` real pro `UpcomingEvents`).
9. **Frontend T4** — `.env.example` (restaurar `NEXT_PUBLIC_API_BASE_URL`) e `next.config.mjs` (CSP `connect-src`).
10. **Frontend T5 — Testes:**
    - Novo `src/test/mocks/handlers.js` (só o handler de `GET /events/featured`, retornando `[]` por padrão) e `src/test/mocks/server.js` (`setupServer(...handlers)`, padrão MSW).
    - Restaurar lifecycle MSW em `src/test/setup.js` (`beforeAll(() => server.listen(...))`, `afterEach(() => server.resetHandlers())`, `afterAll(() => server.close())`), mantendo os polyfills de `matchMedia`/`IntersectionObserver` já existentes.
    - Novo `src/services/eventService.test.js`: busca eventos em destaque via MSW, confirma que `limit` vai como query param.
    - Reescrever `src/app/page.test.jsx`: mock de `getFeaturedEvents` (via `vi.mock('../services/eventService', ...)`, mesmo padrão do commit `a08e2f3`) — caminho feliz (evento mockado aparece) + resiliência a erro (`mockRejectedValue`, página não quebra, heading continua visível).
11. **Verificação final:**
    - Backend: `npm run lint && npm run test && npm run test:e2e` em `D:\backendeventos-public-api`.
    - Frontend: `pnpm lint && pnpm test:run && pnpm build` em `e:\agendas_eventos`.
    - Manual: dev server do frontend apontando pro backend novo local (`NEXT_PUBLIC_API_BASE_URL=http://localhost:3000` do Nest, se as portas não colidirem, ajustar), depois apontando pra produção v3 — confirmar 3 cards reais na home, sem erro de CSP no console, sem erro no Sentry.

## Critérios de conclusão

- `GET /events/featured` responde 200 com array de até 3 objetos, exatamente os 8 campos (`id, slug, nome, descricao, data_evento, horario, imagem, created_at`), ordenados por `created_at DESC`.
- Header `Cache-Control: public, max-age=30, stale-while-revalidate=120` presente na resposta.
- `?limit=` funciona no intervalo 1–10; fora disso retorna 400.
- Rota documentada em `/docs` (Swagger) do backend.
- Grep no payload por `status`, `created_by`, `motivo_recusa`, `dia_semana`, `periodo`, `modalidade`, `link`, `cidade`, `estado`, `endereco`, `updated_at` retorna zero — contrato deliberadamente mínimo.
- Home (`/`) do frontend renderiza até 3 cards reais de "Eventos em Destaque" (sem tags, por enquanto), sem crash quando a API falha ou está fora do ar (cai no estado vazio atual, com erro reportado ao Sentry).
- `pnpm build`, `pnpm lint`, `pnpm test:run` (frontend) e `npm run test`, `npm run test:e2e`, `npm run lint` (backend) verdes.
- Cobertura do backend mantém o gate de 80% em `modules/events/**`; cobertura do frontend mantém os thresholds de `vitest.config.js` (55% linhas / 50% funções / 48% branches).
- Nenhuma origem além de `CORS_ORIGINS` consegue chamar o endpoint (mesma proteção já existente em `/events/published`).

## Arquivos afetados

**Backend `D:\backendeventos-public-api`:**

Modificados:

- `src/modules/events/repositories/evento.repository.interface.ts`
- `src/modules/events/repositories/prisma-evento.repository.ts`
- `src/modules/events/repositories/prisma-evento.repository.spec.ts`
- `src/modules/events/events.service.ts`
- `src/modules/events/events.service.spec.ts`
- `src/modules/events/events.controller.ts`
- `src/modules/events/events.controller.spec.ts`
- `test/contract.spec.ts`
- `README.md`, `SPRINT.md`

Novos:

- `src/modules/events/dto/event-featured-response.dto.ts`
- `src/modules/events/dto/list-featured-query.dto.ts`
- `test/events-featured.e2e-spec.ts`

**Frontend `e:\agendas_eventos`:**

Restaurados (existiam antes do commit `9e78c7c`, recuperáveis do git):

- `src/lib/apiClient.js`
- `src/lib/api/eventosApi.js`

Novos:

- `src/services/eventService.js` (só `getFeaturedEvents`, não os outros 4 métodos antigos)
- `src/services/eventService.test.js`
- `src/test/mocks/handlers.js`
- `src/test/mocks/server.js`

Modificados:

- `src/app/page.jsx`
- `src/app/page.test.jsx`
- `src/test/setup.js` (lifecycle MSW de volta)
- `.env.example`
- `next.config.mjs`

Intocados (confirmado por leitura direta do código atual — já prontos para receber dados reais sem qualquer alteração):

- `src/components/EventCard.jsx`
- `src/components/UpcomingEvents.jsx`
- `src/store/useFavouritesStore.js`
- `src/components/FavouriteEventButton.jsx`
- `src/utils/eventDate.js`

**Fora de escopo (deliberado, não faz parte desta sprint):**

- Os outros 4 services antigos (`getPublishedEvents`, `getEventBySlugOrId`, `getEventStats`, `getRecommendedEvents`) e os services de tags/galeria/contribuidores — voltam quando os respectivos endpoints existirem no backend novo.
- `public/sw.js` (cache do service worker para o domínio da API nova) — débito técnico anotado, não bloqueia a feature.
- `docs/OPERATIONS.md`, `docs/TROUBLESHOOTING.md`, `docs/SETUP_INICIAL.md`, `README.md` do frontend.
- `e2e/favoritos.spec.js` continua pulado (`test.skip`) — depende de `/eventos`, que não faz parte desta sprint.

## Testes necessários

- **Backend:** unitário de repositório (query com `select`/`where`/`orderBy`/`take` corretos), unitário de service (mapeamento entidade → DTO, omissão implícita dos campos não incluídos no DTO, default `limit=3`), e2e (contrato de payload, header de cache, validação de `limit` fora do intervalo), contrato cross-repo (`contract.spec.ts` — chaves exatas comparadas com o que `EventCard`/`UpcomingEvents` realmente leem).
- **Frontend:** unitário de `getFeaturedEvents` via MSW (happy path + `limit` como query param), teste de `page.jsx` (caminho feliz renderiza evento mockado + resiliência: API falha e a home não quebra), verificação manual no browser (dev server local e contra produção v3) incluindo checagem de CSP/console.

## Observação para a revisão

Documentado como limitação conhecida (não como bug): favoritar um evento a partir do card de destaque da home persiste no `localStorage` só os 8 campos do endpoint enxuto, então esse evento aparece incompleto em `/favoritos` (badge sem texto, sem local/modalidade, botão "Ver evento" sem link) até o usuário favoritar novamente a partir de `/eventos` — quando esse endpoint existir no backend novo e a listagem completa voltar ao frontend, o card lá usa o DTO completo de `/events/published` e substitui a entrada incompleta. Essa é a consequência explícita da escolha de payload "estritamente mínimo" confirmada com o usuário nesta sessão.

## Status

Planejado. Nenhum código foi alterado — implementação (backend e frontend) fica para quando o usuário pedir explicitamente.
