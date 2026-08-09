# SPRINT.md — Tags + Eventos Relacionados (front-end)

> Documento de planejamento. Nenhum código foi implementado ainda.

## Contexto

Duas funcionalidades já têm UI pronta no front e só faltam dados reais:

- **Tags** — `useEventFilters.js` já filtra por `?tag=` contra um `eventTagsMap`; `EventsFilters` já tem o dropdown de tags; `src/app/eventos/page.jsx`, `src/app/page.jsx` (home) e `src/app/favoritos/page.jsx` passam `tagsMap={{}}`/`tags={[]}` hardcoded, com comentários explícitos de que é um placeholder até a API existir. A página de detalhe (`src/app/eventos/[slug]/page.jsx`) também já renderiza chips de tag sobre a imagem, alimentados por `eventTags: []` hardcoded.
- **Eventos relacionados** — `src/components/EventRecommendations.jsx` já está importado em `src/app/eventos/[slug]/page.jsx:237`, mas é um stub que retorna `null` desde a remoção do Supabase (commit `9e78c7c`). Não existe `getRecommendedEvents` em `src/services/eventService.js`.

Essas duas funcionalidades dependem de endpoints novos na API dedicada (`D:\backendeventos-public-api`), cujo detalhamento (models Prisma, algoritmo de ranking, endpoints, testes) está no `SPRINT.md` daquele repositório — seções **Sprint 2**, **Sprint 3 (restante)** e **Sprint 6**. Este arquivo cobre só o lado do consumo: o que muda neste repo quando esses endpoints existirem.

Algoritmo de ranking dos relacionados (a replicar do backend, `evento_service.py:get_recommended_events`): eventos publicados e ainda não passados, excluindo o próprio evento, ordenados por `(tem tag em comum?, é da mesma semana ISO?, dias até o evento)` — tag em comum vem primeiro; se não houver candidato suficiente com tag em comum, o próximo evento mais próximo preenche o resto naturalmente (não é um filtro rígido com fallback manual, é uma ordenação).

## Dependência

Todas as tarefas abaixo dependem dos endpoints ficarem disponíveis em produção/staging:

- `GET /tags`, `GET /events/tags-map` (Sprint 2 do backend)
- `GET /events/{eventoId}/tags` (Sprint 3 restante do backend)
- `GET /events/{id}/recommended?limit=` (Sprint 6 do backend)

## Tarefas

### F1 — `eventService.js`: novas funções de leitura

Adicionar em `src/services/eventService.js`, seguindo o padrão já usado por `getFeaturedEvents`/`getPublishedEvents`/`getEventBySlug` (via `apiGet`):

```js
export async function getTags() {
  return apiGet('/tags', { context: 'getTags' })
}

export async function getEventsTagsMap() {
  return apiGet('/events/tags-map', { context: 'getEventsTagsMap' })
}

export async function getEventTags(eventoId) {
  return apiGet(`/events/${eventoId}/tags`, { context: 'getEventTags' })
}

export async function getRecommendedEvents(eventId, limit = 3) {
  return apiGet(`/events/${eventId}/recommended`, {
    params: { limit },
    context: 'getRecommendedEvents',
  })
}
```

**Critério de conclusão:** as 4 funções seguem a assinatura `apiGet(path, { params, context })` já usada pelas existentes; `error.status === 404` tratável pelo chamador (mesmo padrão de `getEventBySlug`).

**Arquivos:** `src/services/eventService.js`, `src/services/eventService.test.js`.

**Testes:** um teste por função (sucesso + repasse de `limit`/params), reaproveitando `src/test/mocks/handlers.js` (adicionar handlers para `/tags`, `/events/tags-map`, `/events/:id/tags`, `/events/:id/recommended`).

---

### F2 — Listagem `/eventos`: plugar `tagsMap`/`tags` reais

`src/app/eventos/page.jsx` hoje só chama `getPublishedEvents`. Buscar `getPublishedEvents` + `getTags` + `getEventsTagsMap` em paralelo (`Promise.all`, ainda em Server Component) e passar pro `EventsPageClient` já existente. **Nenhuma mudança de UI** — o filtro por tag e o dropdown já funcionam, só estavam recebendo dado vazio.

**Critério de conclusão:** dropdown de tags em `/eventos` lista as tags reais; filtrar por uma tag mostra só eventos com aquela tag; sem regressão nos outros filtros (busca, local, data, favoritos).

**Arquivos:** `src/app/eventos/page.jsx`.

**Testes:** ajustar `EventsPageClient.test.jsx` (já recebe `tagsMap`/`tags` como prop) para cobrir filtro por tag reduzindo a lista de fato; teste do loader da `page.jsx` garantindo o `Promise.all` e queda graciosa se uma das 3 chamadas falhar.

---

### F3 — Home e `/favoritos`: plugar `tagsMap`

Mesma mecânica do F2, sem UI nova:

- `src/app/page.jsx`: buscar `getEventsTagsMap()` junto do que já busca hoje, repassar pro `UpcomingEvents`.
- `src/app/favoritos/page.jsx`: buscar `getEventsTagsMap()` (é Server Component hoje só por causa disso — favoritos em si vêm do `localStorage` via `useFavouritesStore`), repassar pro `FavoritosPageClient`.

**Critério de conclusão:** chips de tag aparecem nos cards de evento na Home e em `/favoritos` quando o evento tem tags.

**Arquivos:** `src/app/page.jsx`, `src/app/favoritos/page.jsx`.

**Testes:** ajustar `src/app/favoritos/page.test.jsx` — hoje testa explicitamente o caso "`tagsMap` vazio até a API ser plugada"; esse teste fica obsoleto e precisa ser reescrito para o caso real.

---

### F4 — Detalhe do evento: tags reais do evento atual

`src/app/eventos/[slug]/page.jsx:loadEvent` hoje retorna `eventTags: []` hardcoded (comentário "tags reais ficam para quando /tags existir no backend"). Trocar por `getEventTags(event.id)` dentro do mesmo `cache()` — a UI de chips sobre a imagem já existe e já usa `eventTags`.

**Critério de conclusão:** chips de tag aparecem sobre a imagem no card de detalhe quando o evento tem tags; sem tags, a `Stack` continua não renderizando (comportamento condicional já existe).

**Arquivos:** `src/app/eventos/[slug]/page.jsx`.

**Testes:** teste da página/loader cobrindo evento com tags e sem tags; mock MSW para `/events/{id}/tags`.

---

### F5 — `EventRecommendations`: sair do stub

Reescrever `src/components/EventRecommendations.jsx` (Client Component):

- Gatilho por `IntersectionObserver` (carrega só ao entrar na viewport, como o `CLAUDE.md` já descreve) — extrair um hook pequeno e testável, `src/hooks/useInViewport.js` (não existe hoje nenhum hook de IntersectionObserver reaproveitável no projeto).
- Ao entrar na viewport, chama `getRecommendedEvents(currentEvent.id)`.
- Renderiza até 3 `EventCard` (`variant="compact"`, mesmo padrão do `UpcomingEvents`), com um título de seção tipo "Eventos relacionados".
- Lista vazia ou erro na chamada → renderiza `null` (mesmo comportamento gracioso de hoje), com `captureError` (Sentry) no caso de erro, seguindo o padrão já usado em `EventDetailsPage.loadEvent`.

**Critério de conclusão:** componente não busca nada fora da viewport; busca uma vez ao entrar; renderiza os cards recebidos; não quebra a página em caso de erro/lista vazia.

**Arquivos:** `src/components/EventRecommendations.jsx`, `src/hooks/useInViewport.js` (novo).

**Testes:** reescrever `EventRecommendations.test.jsx` (o teste atual só afirma "não renderiza nada" — fica obsoleto): mock do `IntersectionObserver` (idle até intersectar), fetch disparado só após intersecção, renderização dos cards recebidos, comportamento vazio/erro. Novo `src/hooks/useInViewport.test.js`. Novo `EventRecommendations.stories.jsx` (Storybook — states: com resultados, vazio) — único componente do diretório hoje sem story.

---

### F6 — Limpeza de documentação obsoleta

Comentários tipo "Sem fonte de dados... ver SPRINT.md" em `EventRecommendations.jsx` e `favoritos/page.jsx` referenciam um `SPRINT.md` que não existia mais no repo (este arquivo o recria) — remover esses comentários ao implementar F3/F5, já que deixam de ser verdade.

**Arquivos:** os mesmos de F3/F5.

## Definition of Done — geral

- [ ] F1–F6 concluídas com os critérios de cada uma.
- [ ] `npm run test` verde, cobertura mínima do projeto mantida (55% linhas / 50% funções / 48% branches).
- [ ] Nenhum novo `console.log` (usar `console.warn`/`console.error`).
- [ ] Nenhuma cor hardcoded — tokens do tema MUI.
- [ ] Storybook (`EventRecommendations.stories.jsx`) cobrindo os estados principais.
