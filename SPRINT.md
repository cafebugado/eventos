# SPRINT.md — Estatísticas públicas: total de eventos cadastrados

> Documento de planejamento. Nenhum código foi implementado ainda.

## Contexto

A página `/sobre` não exibe o número de eventos cadastrados — o bloco de estatística some
por completo (não é erro visível, é ausência silenciosa). Causa: `src/app/sobre/page.jsx`
passa `<AboutFeatures totalEventos={null} />` fixo, e `AboutFeatures.jsx` só renderiza o
`StatCounter` de "Eventos cadastrados na plataforma" quando `totalEventos !== null`. Isso já
era conhecido e documentado como fora de escopo na sprint anterior (contribuintes em
`/sobre`): _"`AboutFeatures totalEventos={null}` (estatísticas de eventos, depende de
`GET /events/stats/public`) — backlog relacionado mas separado"_.

Do lado do backend (`D:\backendeventos-public-api`), o endpoint `GET /events/stats/public`
nunca foi implementado — está listado no `SPRINT.md` de lá como parte do Sprint 4, mas foi
deliberadamente deixado no backlog (_"Sprint 4 (restante) — GET /events/stats/public
(contagens agregadas)"_). O único endpoint de listagem hoje, `GET /events/published`, devolve
array puro sem metadata de paginação/total — não dá pra derivar a contagem dele sem buscar
tudo sem paginação.

É a lacuna de menor complexidade e maior impacto direto disponível hoje: contagem simples via
Prisma (`prisma.evento.count`), sem lógica de negócio nova, e resolve exatamente o bug
relatado.

## Dependência

`GET /events/stats/public` (backend) precisa estar disponível em produção/staging antes de
mergear o consumo no frontend.

## Tarefas — Backend (`D:\backendeventos-public-api`)

### B1 — `IEventoRepository.countPublished()`

```ts
// evento.repository.interface.ts
export interface IEventoRepository {
  findPublished(filters?: FindPublishedFilters): Promise<Evento[]>
  findFeatured(limit: number): Promise<EventoFeaturedFields[]>
  findBySlugOrId(slugOrId: string): Promise<Evento | null>
  countPublished(): Promise<number>
}
```

```ts
// prisma-evento.repository.ts
countPublished(): Promise<number> {
  return this.prisma.evento.count({ where: { status: 'publicado' } });
}
```

Mesmo filtro `status: 'publicado'` usado em `findPublished`/`findFeatured`/`findBySlugOrId`.

**Critério de conclusão:** método implementado e tipado; único filtro é `status: 'publicado'`.

**Arquivos:** `src/modules/events/repositories/evento.repository.interface.ts`,
`src/modules/events/repositories/prisma-evento.repository.ts`.

**Testes:** `prisma-evento.repository.spec.ts` — `countPublished()` chama `prisma.evento.count`
com `where: { status: 'publicado' }`.

---

### B2 — DTO `EventStatsResponseDto`

```ts
// dto/event-stats-response.dto.ts
export class EventStatsResponseDto {
  @ApiProperty()
  totalEventos!: number
}
```

Sem `fromEntity` (não vem de uma entity do Prisma) — construído direto no service.

**Critério de conclusão:** DTO documentado com Swagger, no mesmo padrão dos demais DTOs do
módulo (`event-featured-response.dto.ts`).

**Arquivos:** novo `src/modules/events/dto/event-stats-response.dto.ts`.

---

### B3 — `EventsService.getStats()`

```ts
async getStats(): Promise<EventStatsResponseDto> {
  const totalEventos = await this.eventoRepository.countPublished();
  const dto = new EventStatsResponseDto();
  dto.totalEventos = totalEventos;
  return dto;
}
```

**Critério de conclusão:** método simples, sem try/catch adicional (erro de banco propaga e
vira 500 padrão do Nest, mesmo comportamento dos outros métodos do service).

**Arquivos:** `src/modules/events/events.service.ts`.

**Testes:** `events.service.spec.ts` — `getStats()` delega ao repositório e devolve o DTO.

---

### B4 — Rota `GET /events/stats/public`

```ts
@Get('stats/public')
@ApiOkResponse({ type: EventStatsResponseDto })
findStats(): Promise<EventStatsResponseDto> {
  return this.eventsService.getStats();
}
```

**Atenção à ordem de rotas:** o controller já tem `@Get(':eventoId/tags')` e
`@Get(':id/recommended')` (parâmetros dinâmicos). `stats/public` precisa ser declarado antes
dessas rotas — posicionar logo após `findDetailBySlugOrId`, antes de `findEventTags`, ou o
Nest tentaria casar `stats` como `:eventoId`.

**Critério de conclusão:** `GET /events/stats/public` responde `200 { "totalEventos": N }`;
não conflita com `:eventoId/tags` nem `:id/recommended`.

**Arquivos:** `src/modules/events/events.controller.ts`.

**Testes:** `events.controller.spec.ts` — rota chama `eventsService.getStats()`.

## Tarefas — Frontend (este repo)

### F1 — `eventService.js`: `getEventStats()`

```js
export async function getEventStats() {
  return apiGet('/events/stats/public', { context: 'getEventStats' })
}
```

Mesmo padrão de `getContributors`/`getTags` (sem params, sem `next`/revalidate).

**Critério de conclusão:** função segue a assinatura `apiGet(path, { context })` já usada
pelas funções existentes.

**Arquivos:** `src/services/eventService.js`, `src/services/eventService.test.js`.

**Testes:** novo `describe('getEventStats')` cobrindo busca com sucesso e status não-2xx no
erro (mesmo padrão MSW dos demais testes do arquivo).

---

### F2 — `sobre/page.jsx`: busca estatísticas reais

```jsx
export default async function AboutPage() {
  let contributors = []
  let totalEventos = null
  try {
    contributors = await getContributors()
  } catch (error) {
    captureError(error, { context: 'AboutPage.loadContributors' })
  }
  try {
    ;({ totalEventos } = await getEventStats())
  } catch (error) {
    captureError(error, { context: 'AboutPage.loadEventStats' })
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 5, md: 8 } }}>
      <AboutFeatures totalEventos={totalEventos} />
      <ContributorsGrid contributors={contributors} />
    </Container>
  )
}
```

Remove o comentário que documentava a lacuna (`// Estatísticas... fora do escopo desta
mudança`), já que deixa de ser verdade. Falha na API mantém `totalEventos = null` — preserva
o comportamento atual de ocultar o stat, mesmo padrão de degradação graciosa usado para
`contributors`.

**Critério de conclusão:** em condição normal, `/sobre` exibe o `StatCounter` de eventos
cadastrados com o valor real da API; em falha da API, degrada graciosamente (stat oculto,
resto da página funciona), sem alterar `AboutFeatures.jsx` nem `StatCounter.jsx`.

**Arquivos:** `src/app/sobre/page.jsx`.

---

### F3 — Testes

`src/app/sobre/page.test.jsx`:

- mock de `getEventStats` (`vi.mock('../../services/eventService')`, já mockado para
  `getContributors`), mesmo padrão de `page.test.jsx` existente.
- caso "renderiza o total de eventos quando a API responde" (mock resolve
  `{ totalEventos: N }`, assert valor passado/renderizado).
- caso "degrada graciosamente e reporta ao Sentry quando a busca de estatísticas falha" (mock
  rejeita, assert `captureError` chamado com `context: 'AboutPage.loadEventStats'`, assert
  página ainda renderiza sem o stat).
- caso existente de falha em `getContributors` continua intacto (as duas buscas são
  independentes, uma não deve derrubar a outra).

**Critério de conclusão:** `npm run test` verde, cobertura mínima do projeto mantida (55%
linhas / 50% funções / 48% branches).

**Arquivos:** `src/app/sobre/page.test.jsx`.

## Fora de escopo

- Qualquer contagem além de "eventos publicados" (rascunhos, arquivados etc.) — `status` é
  campo interno de moderação, nunca exposto na API pública.
- Cache/`revalidate` no endpoint de stats — pode ser adicionado depois se o tráfego em
  `/sobre` justificar.
- Mudanças em `AboutFeatures.jsx` ou `StatCounter.jsx` — já funcionam corretamente, só
  precisam receber um valor não-nulo.

## Definition of Done — geral

- [x] B1–B4 concluídas com os critérios de cada uma (backend).
- [x] F1–F3 concluídas com os critérios de cada uma (frontend).
- [ ] `/sobre` exibe o total real de eventos cadastrados — pendente de confirmação manual com
      `npm run dev` (não executado nesta sessão).
- [x] Falha em `GET /events/stats/public` não quebra a página (stat some, resto continua
      funcionando) — coberto por `page.test.jsx` ("degrada graciosamente e reporta ao
      Sentry...", "uma falha na busca de estatísticas não impede a renderização dos
      contribuintes").
- [x] Backend: `npx jest` verde (20 suites, 127 testes); cobertura 100% linhas/funções em
      `events.controller.ts`, `events.service.ts`, `dto/**` e `repositories/**` (acima do
      threshold de 80%); `npx eslint` sem erros nos arquivos alterados.
- [x] Frontend: `npx vitest run` verde (72 arquivos, 308 testes); cobertura global 83.6%
      linhas / 80.65% funções / 76.3% branches (acima do mínimo de 55/50/48); `npx eslint`
      sem erros nos arquivos alterados.
- [x] Nenhum novo `console.log`.
