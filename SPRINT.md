# SPRINT.md — Detalhe do evento (`/eventos/[slug]`) via novo `GET /events/slug/{slugOrId}`

> Documento de planejamento. Ver seção "Status" no final para o estado real da implementação.

## Contexto

A sprint anterior (reconexão de `/eventos` via `GET /events/published`, commit `f1aa70b` e
adjacentes) deixou explicitamente registrado em "Fora de escopo": _"Página de detalhe
(`/eventos/[slug]`) fica fora de escopo — depende de `GET /events/slug/{slugOrId}`, que não existe
no backend ainda (Sprint 3 do roadmap dele). Fica para quando o usuário pedir."_ O usuário pediu.

A rota `/eventos/[slug]` já existe neste repositório, com toda a UI pronta (imagem, badges de
tag, descrição rica, grid de info, localização, ações — favoritar, adicionar ao calendário,
compartilhar, CTA externo, `generateMetadata` para SEO/Open Graph), mas está deliberadamente
travada:

```js
// src/app/eventos/[slug]/page.jsx
async function loadEvent() {
  const error = new Error('Busca de evento indisponível: integração com a API removida.')
  throw error
}
```

Toda visita a `/eventos/[slug]` cai direto no `error.jsx` da rota. Os cliques em "Saber mais sobre
o evento" / "Ver evento" (home, `/eventos`, calendário) **já navegam corretamente** para lá via
`router.push('/eventos/${event.slug || event.id}')` — lógica do `EventCard.jsx` que já existe e
não precisa mudar (confirmado por leitura direta: `UpcomingEvents.jsx` já usa `actionInternal` +
`actionLabel="Ver evento"`, que cai no mesmo `router.push` interno). O único elo faltando é a fonte
de dados: o backend dedicado (`D:\backendeventos-public-api`) ainda não tem um endpoint de evento
único — só `GET /events/published` (lista) e `GET /events/featured` (lista enxuta, 8 campos). O
próprio roadmap desse backend já reserva esse endpoint como `GET /events/slug/{slugOrId}`
(Sprint 3 dele).

**Por que buscar no servidor por slug/id em vez de reaproveitar a lista já carregada no cliente:**
o objeto completo do evento já está disponível em memória quando o usuário navega a partir de
`/eventos` (a listagem busca todos os 16 campos), mas **não** está disponível quando a navegação
parte da home (`/events/featured` só traz 8 campos, sem `endereco/cidade/estado/link`) nem em
acesso direto via URL/compartilhamento/SEO (bots, links de redes sociais, favoritos salvos). Um
lookup dedicado por slug (`slug` já é `@unique` no schema Prisma — busca indexada, O(1), não scan
de lista) é a estrutura de dados correta aqui: rápida, funciona em qualquer ponto de entrada, e é a
única forma de dar suporte real a `generateMetadata` (SEO) e a compartilhamento direto do link do
evento.

## Por que esta funcionalidade agora (impacto × complexidade)

| Candidato                                 | Impacto                                                                                                                                                                               | Complexidade                                                                                                                                                                                       | Motivo                                                                                                                                      |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **Detalhe do evento (`/eventos/[slug]`)** | **Alto** — desbloqueia uma página inteira já construída (UI, SEO, favoritos, compartilhamento, calendário) hoje 100% quebrada; toda a navegação "saber mais" do site já aponta pra cá | **Baixa** — reaproveita 100% do módulo `events` do backend (mesmo padrão de `findFeatured`); frontend só implementa a função `loadEvent` já esboçada na página, sem tocar em `EventCard`/navegação | **Escolhido**                                                                                                                               |
| Tags (`/tags`, `/events/tags-map`)        | Médio — melhora filtro e badges                                                                                                                                                       | Média — endpoint novo, join `evento_tags`+`tags`                                                                                                                                                   | Backlog do backend (Sprint 2 dele); página de detalhe funciona sem isso (`eventTags=[]`, mesmo padrão já usado em `tagsMap={}` na listagem) |
| `EventRecommendations` (recomendados)     | Baixo (componente secundário, já stub)                                                                                                                                                | Alta — algoritmo de ranking                                                                                                                                                                        | Backlog do backend (Sprint 6 dele)                                                                                                          |
| `/galeria`, `/sobre`                      | Médio/Baixo                                                                                                                                                                           | Alta / Média                                                                                                                                                                                       | Backlog do backend (Sprints 4-5 dele)                                                                                                       |

## Desenho da solução

### Backend (`D:\backendeventos-public-api`) — novo endpoint no módulo `events` já existente

Mesmo padrão de `findFeatured`/`findPublished` (Controller → Service → Repository → DTO já
existente, sem DTO novo — `EventPublicResponseDto` já tem os 16 campos necessários).

```ts
// evento.repository.interface.ts — novo método na interface
findBySlugOrId(slugOrId: string): Promise<Evento | null>
```

```ts
// prisma-evento.repository.ts
private readonly UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

findBySlugOrId(slugOrId: string): Promise<Evento | null> {
  const isUuid = this.UUID_REGEX.test(slugOrId)
  return this.prisma.evento.findFirst({
    where: {
      status: 'publicado',
      OR: [{ slug: slugOrId }, ...(isUuid ? [{ id: slugOrId }] : [])],
    },
  })
}
```

Validar o formato UUID antes de incluir `{ id: slugOrId }` no `OR` é obrigatório: a coluna `id` é
`@db.Uuid` no Prisma, e passar uma string não-UUID (ex.: um slug) nesse filtro faz o Prisma
rejeitar a query com erro de validação antes mesmo de chegar no Postgres.

```ts
// events.service.ts
async getBySlugOrId(slugOrId: string): Promise<EventPublicResponseDto> {
  const evento = await this.eventoRepository.findBySlugOrId(slugOrId)
  if (!evento) {
    throw new NotFoundException(`Evento '${slugOrId}' não encontrado`)
  }
  return EventPublicResponseDto.fromEntity(evento)
}
```

```ts
// events.controller.ts — mesmo controller, herda o CacheControlInterceptor de classe
@Get('slug/:slugOrId')
@ApiOkResponse({ type: EventPublicResponseDto })
@ApiNotFoundResponse({ description: 'Evento não encontrado ou não publicado' })
findBySlugOrId(@Param('slugOrId') slugOrId: string): Promise<EventPublicResponseDto> {
  return this.eventsService.getBySlugOrId(slugOrId)
}
```

Sem conflito de rota com `/events/published` ou `/events/featured` (segmentos diferentes). Cache
HTTP (`Cache-Control: public, max-age=30, stale-while-revalidate=120`) já vem de graça, aplicado na
classe inteira do controller. `status: 'publicado'` no filtro garante que evento não-publicado (ou
id/slug inexistente) responde 404, nunca vaza rascunho.

**Fora de escopo no backend:** índice extra em `slug` (já é `@unique`, portanto já indexado);
qualquer mudança de schema pertence ao repositório `D:\backendeventos`, dono das migrations.

### Frontend (`e:\agendas_eventos`) — implementar `loadEvent` de verdade na página já existente

```js
// src/services/eventService.js — nova função, mesmo padrão de getFeaturedEvents
export async function getEventBySlug(slugOrId) {
  return apiGet(`/events/slug/${encodeURIComponent(slugOrId)}`, {
    context: 'getEventBySlug',
    next: { revalidate: 30 }, // mesma janela do Cache-Control do backend (max-age=30)
  })
}
```

`src/app/eventos/[slug]/page.jsx` — trocar o stub por busca real, usando `notFound()` do Next para
404 de verdade (distinto de falha de rede/servidor, que continua caindo no `error.jsx` existente).
`params` é assíncrono no App Router atual — a página e o `generateMetadata` hoje nem recebem esse
argumento (por isso nunca usam o slug da URL); os dois passam a receber e usar:

```jsx
import { cache } from 'react'
import { notFound } from 'next/navigation'
import { getEventBySlug } from '../../../services/eventService'

const loadEvent = cache(async (slug) => {
  try {
    const event = await getEventBySlug(slug)
    return { event, eventTags: [] } // tags reais ficam para quando /tags existir (backend Sprint 2)
  } catch (error) {
    if (error.status === 404) {
      notFound()
    }
    captureError(error, { context: 'EventDetailsPage.loadEvent' })
    throw error // erro de rede/servidor → error.jsx (já existe, sem mudança)
  }
})

export async function generateMetadata({ params }) {
  const { slug } = await params
  const { event } = await loadEvent(slug)
  // ...resto do generateMetadata já existente, sem mudança
}

export default async function EventDetailsPage({ params }) {
  const { slug } = await params
  const { event, eventTags } = await loadEvent(slug)
  // ...resto da página já existente, sem mudança
}
```

Envolver `loadEvent` com `cache()` do React é o padrão oficial do App Router para deduplicar
fetches entre `generateMetadata` e a página — sem isso, toda visita dispara 2 chamadas de rede
idênticas (uma para SEO, outra para renderizar); com `cache()`, vira 1 só. Ganho direto de
performance, mudança de uma linha.

`notFound()` sem `not-found.jsx` local nesta rota: o boundary global (`src/app/not-found.jsx`, já
existe) cobre — não precisa criar arquivo novo.

**Nada muda** em `EventCard.jsx`, `UpcomingEvents.jsx`, `EventsGrid.jsx`, `EventRowCompact.jsx`,
`CalendarEventItem.jsx` — a navegação para `/eventos/[slug]` já está correta em todos.
`EventActions.jsx`, `BackToEventsButton.jsx`, `loading.jsx`, `EventLocation`, `RichText` também não
mudam — já esperam exatamente o formato de `event` que o novo endpoint devolve.

## Tarefas

### Backend

1. **T1 — `IEventoRepository`**: adicionar `findBySlugOrId(slugOrId: string): Promise<Evento | null>`.
2. **T2 — `PrismaEventoRepository.findBySlugOrId`**: `findFirst` com `status: 'publicado'` +
   `OR: [slug, id]`, incluindo `id` no `OR` só quando `slugOrId` bate com regex de UUID.
3. **T3 — `EventsService.getBySlugOrId`**: mapeia pra `EventPublicResponseDto`, lança
   `NotFoundException` quando repositório retorna `null`.
4. **T4 — `EventsController`**: `@Get('slug/:slugOrId')`, Swagger (`@ApiOkResponse`,
   `@ApiNotFoundResponse`).
5. **T5 — Testes** (ver seção própria abaixo).
6. **T6 — Docs**: nova entrada no `SPRINT.md` do backend (`D:\backendeventos-public-api\SPRINT.md`,
   "Sprint 3" — o próprio roadmap dele já reserva esse número) e atualização da tabela de endpoints
   do `README.md`.

### Frontend

7. **T7 — `eventService.js`**: adicionar `getEventBySlug(slugOrId)` (com `next: { revalidate: 30 }`).
8. **T8 — `app/eventos/[slug]/page.jsx`**: implementar `loadEvent` real (com `cache()` do React),
   receber e usar `params` (assíncrono) em `generateMetadata` e na página, `notFound()` em 404,
   `eventTags: []` por enquanto.
9. **T9 — `app/eventos/[slug]/page.test.jsx`**: reescrever — hoje só afirma que tudo rejeita.
   Cobrir: caminho feliz (evento mockado renderiza título/descrição/ações), 404 chama `notFound()`,
   erro de servidor/rede propaga pro `error.jsx` (comportamento atual do `error.test.jsx` não
   muda).
10. **T10 — `src/test/mocks/handlers.js`**: novo handler `GET /events/slug/:slugOrId` → 404 por
    padrão (mesmo espírito dos handlers de `/events/published`/`/events/featured`), com overrides
    por teste para o caminho feliz.
11. **T11 — `src/services/eventService.test.js`**: estender com testes de `getEventBySlug` (busca
    ok, encoding do slug/id na URL, erro 404 anexa `.status`).
12. **T12 (opcional, baixo custo)** — conferir se `EventCard.test.jsx`/`EventsGrid.test.jsx`
    continuam verdes sem alteração (não deveriam precisar mudar — navegação já testada e já
    correta).

## Critérios de conclusão

- [x] `GET /events/slug/{slugOrId}` retorna o evento (16 campos do DTO público) quando `slugOrId`
      bate com um `slug` publicado.
- [x] Mesmo endpoint retorna o evento quando `slugOrId` é um `id` (UUID) publicado.
- [x] Retorna 404 quando não existe evento com esse slug/id, e também quando existe mas não está
      `publicado` (nunca vaza rascunho/recusado).
- [x] Passar uma string não-UUID no lugar do id nunca gera erro 500 (branch do `OR` com `id` só
      entra quando o formato bate).
- [x] `/eventos/[slug]` no frontend renderiza dados reais: imagem, título, descrição, data/horário/
      dia da semana/modalidade, localização, CTA externo, favoritar, compartilhar, adicionar ao
      calendário. Verificado via `page.test.jsx` (RTL); pendente checagem visual num browser real.
- [x] Acessar um slug/id inexistente mostra a página 404 do site (`not-found.jsx`), não o
      `error.jsx` genérico. `loadEvent` chama `notFound()` quando `error.status === 404`.
- [x] Falha de rede/servidor (não 404) continua caindo no `error.jsx` já existente, com botão
      "Tentar novamente".
- [x] `generateMetadata` (title/description/OG/Twitter) reflete o evento real — coberto por teste;
      inspeção visual de `<head>` em produção fica para a verificação manual abaixo.
- [ ] Apenas 1 chamada de rede ao backend por visita à página (dedupe via `cache()`). `loadEvent` é
      envolvido em `cache()` do React — funciona no runtime real do App Router (RSC), mas **não é
      verificável por teste unitário**: Vitest/jsdom roda fora do contexto de request do RSC, onde
      `cache()` não dedupe (confirmado empiricamente — um teste que tentava afirmar 1 chamada só
      falhou com 2, e foi removido por não refletir o ambiente real). Fica pendente de verificação
      manual (aba Network do browser contra o dev server).
- [x] Clicar em "Saber mais sobre o evento" / "Ver evento" em qualquer ponto do site (home,
      `/eventos`, calendário) leva à página de detalhe funcionando — nenhuma alteração nesses
      componentes; suíte de regressão (`EventCard.test.jsx`, `EventsGrid.test.jsx`) continua verde.
- [x] `npm run lint && npm run test && npm run test:e2e` verdes em `D:\backendeventos-public-api`
      (65 unitários + 34 e2e/contrato), cobertura ≥ 80% mantida em `modules/events/**`.
- [x] `pnpm lint && pnpm test:run && pnpm build` verdes em `e:\agendas_eventos` (278 testes, 72
      arquivos); build gera `/eventos/[slug]` como rota dinâmica (`ƒ`).
- [ ] Verificação manual: dev server do frontend contra produção v3 — abrir um evento real a
      partir da home, da listagem e por URL direta. **Não feita nesta sessão.**

## Arquivos afetados

**Backend `D:\backendeventos-public-api` (modificados):**

- `src/modules/events/repositories/evento.repository.interface.ts`
- `src/modules/events/repositories/prisma-evento.repository.ts` (+ `.spec.ts`)
- `src/modules/events/events.service.ts` (+ `.spec.ts`)
- `src/modules/events/events.controller.ts` (+ `.spec.ts`)
- `test/events-detail.e2e-spec.ts` (novo)
- `README.md`, `SPRINT.md`

**Sem alteração:** `dto/event-public-response.dto.ts`, `test/contract.spec.ts`,
`common/interceptors/cache-control.interceptor.ts` (endpoint novo já herda o cache de classe).

**Frontend `e:\agendas_eventos` (modificados):**

- `src/services/eventService.js`
- `src/services/eventService.test.js`
- `src/app/eventos/[slug]/page.jsx`
- `src/app/eventos/[slug]/page.test.jsx`
- `src/test/mocks/handlers.js`

**Sem alteração:** `src/app/eventos/[slug]/EventActions.jsx`,
`src/app/eventos/[slug]/BackToEventsButton.jsx`, `src/app/eventos/[slug]/error.jsx`,
`src/app/eventos/[slug]/loading.jsx`, `src/components/EventCard.jsx`,
`src/components/UpcomingEvents.jsx`, `src/components/EventsGrid.jsx`,
`src/components/EventRowCompact.jsx`, `src/components/CalendarView/CalendarEventItem.jsx`,
`src/components/EventLocation.jsx`, `src/components/EventRecommendations.jsx` (continua stub, fora
de escopo), `next.config.mjs` (CSP já cobre o host), `.env.example`.

## Testes necessários

**Backend:**

- Repositório: encontra por `slug`; encontra por `id` (UUID válido); não inclui `id` no `OR`
  quando `slugOrId` não é UUID; retorna `null` para slug/id não publicado; retorna `null` quando
  não existe.
- Service: mapeia entidade → DTO corretamente; lança `NotFoundException` quando repositório
  retorna `null`.
- Controller: delega pro service com o param da rota.
- E2E: 200 com os 16 campos do DTO para slug válido; 200 para id (UUID) válido; 404 para
  inexistente; 404 para não-publicado; 404 (não 500) para string arbitrária no lugar de um UUID;
  header `Cache-Control` presente (herdado do interceptor).

**Frontend:**

- `getEventBySlug` via MSW: happy path; erro 404 anexa `.status`; slug/id com espaço/acento chega
  intacto do outro lado (percent-encoding automático de `new URL()` dentro de `apiGet`, sem
  precisar de `encodeURIComponent` manual — mesmo mecanismo já usado pelos query params).
- `page.test.jsx`: happy path renderiza campos-chave do evento; 404 aciona `notFound()` (mock de
  `next/navigation`); erro genérico propaga (mesmo comportamento coberto hoje).
- Regressão: `EventCard.test.jsx`, `EventsGrid.test.jsx` — sem mudança esperada, só rodar pra
  confirmar que nada quebrou.

## Fora de escopo (deliberado, não faz parte desta sprint)

- Tags reais na página de detalhe (`eventTags`) — endpoint `/tags`/`evento_tags` não existe ainda
  (Sprint 2 do roadmap do backend); fica `eventTags: []`, mesmo padrão já usado em `tagsMap={}` na
  listagem.
- `EventRecommendations` (seção "eventos recomendados" no fim da página) — depende de
  `GET /events/{id}/recommended`, que não existe (Sprint 6 do backend); componente já é um stub
  que retorna `null`, continua assim.
- Qualquer mudança em `EventCard`/navegação — já está correta, confirmado por leitura direta do
  código; risco desnecessário mexer no que já funciona.
- Botão "Saber mais" de `CalendarEventItem`/linha compacta que aponta pro link externo do evento
  (não pro detalhe interno) — comportamento pré-existente e deliberado nesses componentes
  específicos, não faz parte desta sprint.

## Status

Implementado (T1–T12). Backend (`D:\backendeventos-public-api`): `npm run lint`, `npm run test`
(65 unitários) e `npm run test:e2e` (34 e2e/contrato) verdes; cobertura ≥ 80% mantida em
`modules/events/**`. Frontend (`e:\agendas_eventos`): `pnpm lint`, `pnpm test:run` (278 testes, 72
arquivos) e `pnpm build` verdes; `/eventos/[slug]` compila como rota dinâmica (`ƒ`).

Duas pendências deliberadas, fora do alcance de teste automatizado, anotadas nos "Critérios de
conclusão" acima:

- Dedupe de rede via `cache()` do React entre `generateMetadata` e a página — real no runtime do
  App Router, mas não observável em teste unitário (Vitest/jsdom não roda dentro do contexto de
  request do RSC).
- Verificação manual do fluxo completo num browser real (dev server contra a API v3) — não feita
  nesta sessão.
