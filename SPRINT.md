# SPRINT.md — Reduzir consumo na Vercel (cache/ISR)

> Documento de planejamento. Nenhum código foi implementado ainda.
>
> A sprint anterior (galeria, `/galeria`) foi concluída e está preservada no histórico do git
> (`git log -- SPRINT.md`).

## Contexto

O plano Hobby da Vercel estourou dois limites mensais:

| Métrica              | Uso      | Limite Hobby |
| -------------------- | -------- | ------------ |
| Fluid Active CPU     | 5h 34min | 4h           |
| Fast Origin Transfer | 12,65 GB | 10 GB        |

Decisão: **manter o app na Vercel** e corrigir a causa no código, em vez de migrar de plataforma.
Com o padrão atual, qualquer outro host gratuito serverless (Cloudflare Workers, Netlify, etc.)
bateria no mesmo teto.

## Diagnóstico (causa raiz)

1. **Todas as páginas são `force-dynamic`.** São `/`, `/eventos`, `/eventos/[slug]`, `/galeria`,
   `/sobre` e `/favoritos`. Cada visita (humano, Googlebot, crawler de IA, preview de link no
   WhatsApp/Discord, precache do service worker) executa uma função serverless: fetch na API,
   SSR do MUI/Emotion e HTML devolvido pela origem. Isso gera **Active CPU** e **Origin
   Transfer** a cada request.
2. **Os `revalidate` dos services não têm efeito.** `getTags`, `getEventsTagsMap`,
   `getContributors`, `getEventStats`, `getGalleryEvents` e `getEventDetail` já passam
   `next: { revalidate }`, mas o `force-dynamic` no segmento da rota desliga o cache.
3. **`/eventos` é a rota mais cara.** `fetchAllPublishedEvents()` faz até **20 chamadas
   sequenciais** de 100 eventos por request (`getPublishedEvents` usa `no-store`) e serializa a
   lista inteira no HTML e no payload RSC. O client depois descarta os eventos passados
   (`EventsPageClient` → `agenda`), então boa parte do que trafega é jogada fora.
4. **`/favoritos` não precisa ser dinâmica.** Os favoritos vêm do `localStorage`, e o único dado
   de servidor é o `tagsMap`, que já tolera 5 min de cache.
5. **`/eventos` lê `searchParams` no servidor à toa.** `readSearchParam(..., 'q')` descarta o
   valor, e os filtros já rodam 100% no client (`useEventFilters` via `useSearchParams`).
   Mesmo assim, ler `searchParams` no servidor obriga a rota a ser dinâmica.

**Meta:** servir as páginas públicas a partir do cache da CDN (ISR), para que a função rode no
máximo 1x por janela de revalidação por rota, e não 1x por visita. Estimativa: **redução de 90%
ou mais** em Active CPU e Origin Transfer.

**Trade-off aceito:** um evento novo ou editado leva até ~60s para aparecer em `/` e `/eventos`
(ver T2). Isso é aceitável para uma agenda de eventos.

## Branch e fluxo

- Branch: `fix/vercel-cache-isr`, criada a partir de `developer`
- PR → `developer` (1 aprovação) → `main` (2 aprovações) → deploy automático
- Um commit por tarefa, no padrão `tipo(escopo): descrição`

## Tarefas

### T0 — Linha de base (manual, antes de mergear)

Anotar os números atuais para comparar depois:

- Vercel → Usage: Fluid Active CPU e Fast Origin Transfer do ciclo atual.
- Vercel → Observability → Functions/Routes: quais rotas mais consomem CPU e transferência
  (a expectativa é `/eventos` e `/eventos/[slug]` no topo).

**Critério de conclusão:** números anotados na descrição do PR.

---

### T1 — Cache nos fetches que ainda são `no-store`

`src/services/eventService.js`:

```js
export async function getFeaturedEvents(limit = 3) {
  return apiGet('/events/featured', {
    params: { limit },
    context: 'getFeaturedEvents',
    next: { revalidate: 60 },
  })
}

export async function getPublishedEvents({ cidade, modalidade, limit, offset } = {}) {
  return apiGet('/events/published', {
    params: { cidade, modalidade, limit, offset },
    context: 'getPublishedEvents',
    next: { revalidate: 60 },
  })
}
```

`getRecommendedEvents` **continua sem cache**. Ele roda no browser (`EventRecommendations`, sob
demanda), chama a API direto e não passa pela Vercel.

Também atualizar o comentário de `apiGet` em `src/lib/api/eventosApi.js`: o default
`no-store` continua, mas as rotas de página agora usam cache.

**Arquivos:** `src/services/eventService.js`, `src/services/eventService.test.js` (se houver
assert sobre as opções do fetch), `src/lib/api/eventosApi.js` (só o comentário).

---

### T2 — Trocar `force-dynamic` por ISR em cada rota

Remover `export const dynamic = 'force-dynamic'` e declarar `revalidate` por rota:

| Rota              | Arquivo                           | `revalidate` | Motivo                                         |
| ----------------- | --------------------------------- | ------------ | ---------------------------------------------- |
| `/`               | `src/app/page.jsx`                | `60`         | destaques mudam com frequência                 |
| `/eventos`        | `src/app/eventos/page.jsx`        | `60`         | lista principal; ver T3                        |
| `/eventos/[slug]` | `src/app/eventos/[slug]/page.jsx` | `300`        | detalhe muda pouco depois de publicado; ver T4 |
| `/galeria`        | `src/app/galeria/page.jsx`        | `300`        | álbuns mudam raramente                         |
| `/sobre`          | `src/app/sobre/page.jsx`          | `600`        | contribuidores/estatísticas mudam raramente    |
| `/favoritos`      | `src/app/favoritos/page.jsx`      | `300`        | só busca `tagsMap` no servidor                 |

```js
export const revalidate = 60
```

Nota: a config de segmento (`revalidate`) funciona porque o projeto **não** usa
`cacheComponents` (Next 16). Se isso for ativado no futuro, a migração passa a ser para
`'use cache'` + `cacheLife`.

O intervalo efetivo de cada rota é o **menor** entre o `revalidate` da página e os `revalidate`
dos fetches que ela faz. Por isso `/galeria` (`getGalleryEvents`, 120s) e `/sobre`
(`getEventStats`, 120s) aparecem no build com **2 min**, e não 5 e 10 min.

**Critério de conclusão:** `pnpm build` lista essas rotas como `○`/`●` (estática/ISR) com a
coluna de revalidate preenchida, e nenhuma como `ƒ` (dinâmica).

---

### T3 — `/eventos`: tirar a leitura de `searchParams` do servidor e reduzir o payload

`src/app/eventos/page.jsx`:

1. **Remover `searchParams` da assinatura da página e remover `readSearchParam`.** O valor já
   era descartado, e ler `searchParams` no servidor força a rota a ser dinâmica. A busca `q`
   continua funcionando, porque `useEventFilters` lê a URL no client.
2. **Envolver `<EventsPageClient />` em `<Suspense>`.** Com a rota estática, o Next exige
   boundary de Suspense para componentes client que usam `useSearchParams`. Sem isso, o
   `next build` falha com _"useSearchParams() should be wrapped in a suspense boundary"_. O
   fallback pode ser o mesmo conteúdo de `src/app/eventos/loading.jsx`.
3. **Filtrar eventos passados no servidor** antes de passar a lista para o client. O client já
   descarta com `isEventPast` (`EventsPageClient` → `agenda`), então isso só elimina bytes
   inúteis do HTML/RSC, que hoje é o maior item de Origin Transfer. Manter o filtro do client
   também, porque ele cobre a janela entre revalidações.

```jsx
import { Suspense } from 'react'
// ...
export const revalidate = 60

export default async function EventsPage() {
  const { events, tags, tagsMap, error } = await loadEvents()
  const upcoming = events.filter((event) => !isEventPast(event.data_evento))

  return (
    <Suspense fallback={<EventsLoading />}>
      <EventsPageClient events={upcoming} tagsMap={tagsMap} tags={tags} error={error} />
    </Suspense>
  )
}
```

Pontos de atenção:

- `CalendarView` recebe `agenda` (só futuros), não `events`, então filtrar no servidor não
  muda o calendário. Conferir isso durante a implementação.
- `useFavouritesStore.toggleFavourite(eventId, allEvents)` guarda o objeto do evento. Por isso,
  **não** remover campos dos eventos nesta sprint, só filtrar quais eventos vão.
- Falha da API durante uma revalidação: o Next só mantém a última versão boa quando a
  renderização **lança** erro (caso de `/eventos/[slug]`). Em `/`, `/eventos`, `/galeria` e
  `/sobre`, a falha é tratada com degradação graciosa (lista vazia ou "Erro ao carregar"), e
  essa versão **fica em cache** até a próxima revalidação (60s em `/eventos`, 2 min em
  `/sobre`). Isso é aceitável porque `withRetry` já tenta de novo antes de desistir, fetch com
  falha não entra no Data Cache e a janela é curta. `captureError` continua sendo chamado
  normalmente.

**Arquivos:** `src/app/eventos/page.jsx`, `src/app/eventos/page.test.jsx`.

**Testes:**

- remover/ajustar o teste _"mantém a leitura de q sem repassar para a API"_ (a página não
  recebe mais `searchParams`);
- novo caso: eventos passados não chegam em `EventsPageClient`;
- manter os testes de paginação em lotes de 100 (T1 não muda essa lógica).

---

### T4 — `/eventos/[slug]`: ISR sob demanda

`src/app/eventos/[slug]/page.jsx`:

```js
export const revalidate = 300
export const dynamicParams = true

// Nenhum slug pré-gerado no build: cada evento é renderizado na primeira visita
// e depois servido do cache até a próxima revalidação (ISR sob demanda).
export async function generateStaticParams() {
  return []
}
```

- `loadEvent` com `cache()` do React continua deduplicando `generateMetadata` + página.
- `notFound()` para slug inexistente continua funcionando. O 404 também fica em cache pela
  janela de revalidate, o que é aceitável.
- `isPast` é calculado no servidor (fuso **UTC** da Vercel). Com cache de 5 min, o selo
  "Encerrado" pode atrasar até 5 min na virada do dia. É aceitável; registrar isso no PR.

**Arquivos:** `src/app/eventos/[slug]/page.jsx`, teste da rota se houver assert de
`dynamic`.

---

### T5 — Reduzir overhead do Sentry no servidor (opcional, baixo esforço)

`src/sentry.server.config.js` e `src/sentry.edge.config.js`: `tracesSampleRate: 0.2` →
`0.05`. Com ISR o volume de execuções já cai muito, então isso é ganho marginal. Fazer só se
T0 mostrar que o tracing pesa. **Não** mexer no `instrumentation-client.js`, que roda no
browser e não conta CPU da Vercel.

---

### T6 — Validação local

```bash
pnpm build        # conferir a tabela de rotas: ○/● com revalidate, nenhuma ƒ
pnpm start        # testar com build de produção
```

Checklist manual em `pnpm start`:

- [ ] `/`, `/eventos`, `/galeria`, `/sobre`, `/favoritos` e um `/eventos/<slug>` abrem
      normalmente
- [ ] a resposta traz `x-nextjs-cache: HIT` a partir da 2ª requisição
      (`curl -I http://localhost:3000/eventos`)
- [ ] em `/eventos`, os filtros `?q=`, `?tag=`, `?fav=`, `?from=`/`?to=` e a paginação funcionam
      ao recarregar a URL
- [ ] slug inexistente → 404
- [ ] favoritar/desfavoritar funciona em `/eventos` e aparece em `/favoritos`
- [ ] dark mode sem flash/hydration warning no console

Automatizados:

- [ ] `pnpm test:run` verde, com cobertura ≥ 55% linhas / 50% funções / 48% branches
- [ ] `pnpm lint` sem erros
- [ ] `pnpm test:e2e` verde (Chromium)

---

### T7 — Monitorar após deploy (manual, 3 a 7 dias)

- Vercel → Observability: execuções por rota devem cair drasticamente. Com cache HIT, a
  função nem roda.
- Vercel → Usage: comparar com a linha de base do T0. Se o ciclo já estourou, o efeito aparece
  de forma clara no próximo ciclo.
- `curl -I https://eventos.cafebugado.com.br/eventos` → header `x-vercel-cache: HIT` (ou
  `STALE` durante uma revalidação).

**Critério de sucesso da sprint:** projeção mensal abaixo de **4h de Active CPU** e
**10 GB de Origin Transfer**, com folga.

## Se não bastar (backlog, fora desta sprint)

Em ordem de custo/benefício:

1. **Bloquear bots de IA/crawlers agressivos** (Vercel → Firewall → Bot Management / regra
   customizada, disponível no Hobby). É configuração no painel, então fica **a cargo do dono do
   projeto**, e não é feita por automação.
2. **Revalidação sob demanda:** criar `src/app/api/revalidate/route.js` protegido por segredo,
   chamado pelo backend ao publicar/editar um evento (`revalidatePath('/eventos')`, etc.).
   Permite subir o `revalidate` para 1h sem perder frescor. Depende de mudança no backend
   (repo separado), por isso fica fora daqui.
3. **Endpoint dedicado no backend** para "eventos futuros publicados" (sem paginar 20x no
   front), com só os campos usados pelos cards. Reduz o payload na origem.
4. **`prefetch={false}`** nos links do Header/Footer, se Observability mostrar muitas
   execuções vindas de prefetch RSC. Com ISR, os prefetches passam a bater em cache, então
   provavelmente não será necessário.

## Fora de escopo

- Migrar de plataforma (decisão: ficar na Vercel).
- Trocar Vercel Analytics / Speed Insights por outra ferramenta. Eles rodam no browser e não
  impactam Active CPU nem Origin Transfer.
- Mudar a forma/campos dos objetos de evento (impacta favoritos persistidos no `localStorage`).
- Qualquer escrita na API (continua só GET).

## Definition of Done — geral

- [ ] T1–T4 implementadas, um commit por tarefa, PR para `developer`.
- [ ] `pnpm build` sem nenhuma rota de página como `ƒ` (dinâmica).
- [ ] T6 completo (build, testes, lint, E2E, checklist manual).
- [ ] Linha de base (T0) e resultado pós-deploy (T7) registrados no PR.
- [ ] Nenhum novo `console.log`.
