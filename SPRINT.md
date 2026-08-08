# SPRINT: Remoção da integração com a API atual

> Documento de planejamento. Ver seção "Status" no final.

## Contexto

O projeto vai trocar de API dedicada (a atual, `https://v2.backendeventoscfb.cafebugado.com.br`, será substituída — a nova ainda não está definida e está fora de escopo aqui). Antes de plugar a nova API, este sprint cobre só a **limpeza**: remover completamente o código que fala com a API atual (camada de fetch, services, chamadas nas páginas), deixando cada ponto que hoje mostra dados da API mostrando **apenas o estado de erro/vazio que a página já sabe tratar** — sem nenhum fetch de rede acontecendo.

**Objetivo:** eliminar todo o código que fala com `v2.backendeventoscfb.cafebugado.com.br`, deixando cada página no estado de erro/vazio que ela já trata hoje. Prepara o terreno para plugar uma nova API depois (fora de escopo deste sprint).

**Fora de escopo:** definir/integrar a nova API; mudar o shape de dados em componentes de apresentação (`EventCard`, `CalendarView`, etc.) — eles só recebem props, continuam como estão até a nova API existir.

## Mapa da integração atual

- **Camada de fetch:** `src/lib/api/eventosApi.js` (função `apiGet`, única que faz fetch de verdade) e `src/lib/apiClient.js` (`withRetry`, retry/timeout — importa `captureError` de `src/lib/sentry.js`, que **não é da API e deve ficar**, é usado em toda a app).
- **4 services**, todos finas camadas sobre `apiGet`: `src/services/eventService.js` (5 funções), `contributorService.js`, `galeriaService.js` (+ `normalizeAlbum`, função pura), `tagService.js` (3 funções).
- **8 consumidores diretos:** 6 `page.jsx` (`/`, `/eventos`, `/eventos/[slug]`, `/sobre`, `/galeria`, `/favoritos`), `src/app/sitemap.js` (chama `apiGet` direto, não via service) e `src/components/EventRecommendations.jsx` (client-side, via `IntersectionObserver`).
- **Infra de teste MSW:** `src/test/mocks/handlers.js` + `server.js` + lifecycle em `src/test/setup.js`; 4 testes de service usam MSW; 6 testes de página + `EventRecommendations.test.jsx` mockam os services direto (sem MSW); `sitemap.test.js` mocka `eventosApi` via `vi.mock`.
- **E2E:** só `e2e/favoritos.spec.js` depende de dado real vindo da API (já tem `test.skip` condicional se não houver evento publicado). Os outros 3 specs não dependem de dado dinâmico.
- **Config/infra fora de `src/`:** `public/sw.js` tem o domínio da API hardcoded (estratégia de cache), `next.config.mjs` tem o domínio hardcoded no CSP `connect-src`, `.env.example`/docs documentam `NEXT_PUBLIC_API_BASE_URL`.
- **Acoplado ao shape de dados, mas sem import de código de API** (não muda neste sprint, só documentado): `useFavouritesStore.js` (persiste objetos de evento inteiros no localStorage), `EventCard.jsx` e outros componentes de apresentação, `utils/eventDate.js`, `calendarExport.js`, `eventLocationOptions.js`.

## Tarefas

1. **Remover a camada de fetch** (`src/lib/api/eventosApi.js` + `src/lib/apiClient.js`) — deletar os dois arquivos (e a pasta `src/lib/api/` se ficar vazia). Manter `src/lib/sentry.js` intacto.

2. **Remover os 4 services** — deletar `src/services/eventService.js`, `contributorService.js`, `galeriaService.js` (inclui `normalizeAlbum`), `tagService.js`.

3. **Adaptar as 6 páginas + `sitemap.js`** para não buscar dados, renderizando direto o estado de erro/vazio que cada uma já usa hoje quando o fetch falha:
   - `src/app/page.jsx` — sem `getUpcomingEvents`/`getAllEventTags`; seção de próximos eventos cai no estado vazio.
   - `src/app/eventos/page.jsx` — sem `getPublishedEvents`/`getAllEventTags`/`getTags`; lista cai no estado de erro.
   - `src/app/eventos/[slug]/page.jsx` — sem `getEventBySlugOrId`/`getEventTags`. **Decisão de UX a confirmar:** recomendado _não_ usar `notFound()` (significa "evento não existe", diferente de "fonte de dados indisponível") — usar o branch de erro genérico que a página já tem para erros não-404. Remove também o `if (error?.status === 404)`.
   - `src/app/sobre/page.jsx` — sem `getEventStats`/`getContributors` (hoje já usa `Promise.allSettled` com fallback isolado — reaproveitar direto).
   - `src/app/galeria/page.jsx` — sem `getAlbuns`; cai no estado de erro/vazio de álbuns.
   - `src/app/favoritos/page.jsx` — sem `getAllEventTags`; `tagsMap` vazio (favoritos continuam vindo do Zustand/localStorage).
   - `src/app/sitemap.js` — remover a chamada `apiGet('/events/published')`; usar o fallback que já existe (só rotas estáticas).

4. **Adaptar `EventRecommendations`** — remover import/chamada de `getRecommendedEvents` em `src/components/EventRecommendations.jsx`; o componente deixa de buscar recomendações.

5. **Limpar infraestrutura MSW** — remover `src/test/mocks/handlers.js` e `src/test/mocks/server.js`; em `src/test/setup.js`, remover o lifecycle do MSW, mantendo os polyfills de `matchMedia`/`IntersectionObserver`.

6. **Remover referências ao domínio da API atual em config/infra**:
   - `public/sw.js` — remover o bloco condicional para `backendeventoscfb.cafebugado.com.br` e a lógica `EVENTS_CACHE` associada.
   - `next.config.mjs` — remover o domínio do CSP `connect-src`.
   - `.env.example` — remover/comentar `NEXT_PUBLIC_API_BASE_URL`.

7. **Atualizar documentação** — `README.md`, `docs/OPERATIONS.md`, `docs/TROUBLESHOOTING.md`, `docs/SETUP_INICIAL.md`: remover/sinalizar menções a `NEXT_PUBLIC_API_BASE_URL` e ao backend atual como integração ativa.

8. **Ajustar E2E** — `e2e/favoritos.spec.js` depende de evento real publicado; depois do cleanup, `/eventos` sempre mostra estado vazio/erro. Marcar `test.skip` com comentário explicando que está pendente da nova API. Confirmar que `e2e/app.spec.js`, `e2e/mobile-nav.spec.js`, `e2e/pwa.spec.js` continuam passando (não dependem de dado dinâmico).

9. **Verificação final** — grep geral por resíduos (`apiGet`, `eventosApi`, `withRetry`, `NEXT_PUBLIC_API_BASE_URL`, `backendeventoscfb`, imports de `services/`); rodar `pnpm lint`, `pnpm test`, `pnpm build`.

## Critérios de conclusão

- Grep por `apiGet`, `withRetry`, `eventosApi`, `apiClient`, imports de `services/` em `src/` retorna zero resultados.
- `src/services/` e `src/lib/api/` vazios ou removidos.
- `pnpm build` passa; todas as páginas renderizam no dev server mostrando o estado vazio/erro correspondente, sem crash.
- Grep por `backendeventoscfb` em `public/`, `next.config.mjs`, `.env.example` retorna zero.
- Service worker não quebra (DevTools > Application > Service Workers); sem erro de CSP no console do browser.
- `pnpm test:e2e` roda com `favoritos.spec.js` explicitamente pulado (`test.skip` com comentário) e os outros 3 specs passando.
- `pnpm lint`, `pnpm test`, `pnpm build` verdes; cobertura ainda atinge os thresholds de `vitest.config.js` (55% linhas / 50% funções / 48% branches) — ajustar os thresholds só se necessário, e sinalizar isso na revisão.

## Arquivos afetados

**Removidos:**

- `src/lib/api/eventosApi.js`, `src/lib/apiClient.js`
- `src/services/eventService.js`, `contributorService.js`, `galeriaService.js`, `tagService.js`
- `src/services/eventService.test.js`, `contributorService.test.js`, `galeriaService.test.js`, `tagService.test.js`
- `src/test/mocks/handlers.js`, `src/test/mocks/server.js`

**Modificados:**

- `src/app/page.jsx`, `src/app/eventos/page.jsx`, `src/app/eventos/[slug]/page.jsx`, `src/app/sobre/page.jsx`, `src/app/galeria/page.jsx`, `src/app/favoritos/page.jsx`, `src/app/sitemap.js`
- `src/components/EventRecommendations.jsx`
- `src/test/setup.js`
- `public/sw.js`, `next.config.mjs`, `.env.example`
- `README.md`, `docs/OPERATIONS.md`, `docs/TROUBLESHOOTING.md`, `docs/SETUP_INICIAL.md`
- `e2e/favoritos.spec.js`
- Testes de página: `src/app/page.test.jsx`, `eventos/page.test.jsx`, `eventos/[slug]/page.test.jsx`, `sobre/page.test.jsx`, `galeria/page.test.jsx`, `favoritos/page.test.jsx`, `sitemap.test.js`, `EventRecommendations.test.jsx`

**Intocados (deliberado, referência):**

- `src/store/useFavouritesStore.js`
- `src/components/EventCard.jsx`, `EventRowCompact.jsx`, `CalendarView/*`, `ContributorsGrid.jsx`, `gallery/GalleryEventCard.jsx`, `gallery/GalleryPhotoModal.jsx`
- `src/utils/eventDate.js`, `calendarExport.js`, `eventLocationOptions.js`
- `src/lib/sentry.js`

## Testes necessários

- Reescrever os 6 `page.test.jsx` + `sitemap.test.js`: remover cenários de sucesso (não fazem mais sentido sem fetch), manter/adaptar o cenário de estado de erro/vazio como único caminho de renderização.
- Simplificar `EventRecommendations.test.jsx` (sem mock de service, só verificar que não renderiza/renderiza vazio).
- Rodar a suíte inteira após remover a infraestrutura MSW, para confirmar que nada dependia implicitamente do `onUnhandledRequest: 'error'`.
- Rodar suíte Playwright completa (`pnpm test:e2e`) com `favoritos.spec.js` pulado.
- Verificação manual: dev server (todas as páginas em estado vazio/erro), DevTools (service worker, console sem erro de CSP).

## Observações para a revisão

1. **Decisão de UX pendente** (`/eventos/[slug]`): recomendado estado de erro genérico em vez de `notFound()` — ajustar se a preferência for outra.
2. **`normalizeAlbum`** some junto com `galeriaService.js` — é função pura, mas só é usada para o payload que deixa de existir.
3. **`useFavouritesStore.js`** e componentes de apresentação ficam intocados neste sprint — só processam props, sem import de código de API. Revisão de shape fica para quando a nova API for definida.

## Status

Implementado. Todas as 9 tarefas concluídas: camada de fetch e os 4 services removidos, 6 páginas + `sitemap.js` + `EventRecommendations` adaptados para estado de erro/vazio, infraestrutura MSW limpa, domínio da API removido de `sw.js`/CSP/`.env.example`, documentação (README, OPERATIONS, TROUBLESHOOTING, SETUP_INICIAL) atualizada, `e2e/favoritos.spec.js` pulado explicitamente. `pnpm lint`, `pnpm test:run` (229 testes), `pnpm test:coverage` (thresholds ok, cobertura ~79% linhas), `pnpm test:e2e` (7 passando, 1 pulado) e `pnpm build` passando limpos.
