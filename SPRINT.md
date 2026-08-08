# SPRINT: Página de Favoritos (`/favoritos`)

> Documento de planejamento. Ver seção "Status" no final.

## Contexto

O app já tem toda a infraestrutura de favoritos (persistência em `localStorage` via `useFavouritesStore`, botão de favoritar em `EventCard`/`EventActions`, filtro "só favoritos" _dentro_ de `/eventos`), mas **não existe uma página dedicada** para o usuário ver só os eventos que favoritou. Hoje, pra revisitar favoritos, o usuário precisa ir em `/eventos` e ativar um filtro — não há link de navegação, não há uma visão própria.

Isso foi identificado como o gap de **maior impacto / menor complexidade** do momento, depois de mapear o repo inteiro (páginas, componentes, services, endpoints da API dedicada e testes):

- **Alto impacto**: fecha o ciclo de uma feature que o usuário já usa (favoritar) mas não tem onde "colher" o resultado — item de navegação novo, visível, sem necessidade de conta/login.
- **Baixa complexidade**: zero mudança de backend (favoritos são só locais), zero endpoint novo, e quase todos os blocos de construção já existem e são reaproveitáveis: `useFavouritesStore`, `EventsGrid` (que já sabe renderizar grid + estado vazio + calcula `isPast`/`isToday` por evento), `EventCard`/`FavouriteEventButton`, `sortEventsByDate`, `getAllEventTags()`, e o padrão de página Server+Client já usado em `/eventos`.

Outros candidatos considerados e descartados por menor payoff/relação impacto-esforço:

- Filtro por período (diurno/noturno) em `/eventos` — incremento marginal sobre filtros que já existem.
- Breakdown diurno/noturno na página `/sobre` — trivial mas é só um dado estatístico a mais, baixo impacto de produto.
- Página de "Comunidades" (endpoint `GET /communities` não usado) — maior esforço (novo service + página do zero) e não há sinal de demanda hoje (nome da comunidade só aparece embutido na galeria).

## Comportamento esperado

Nova rota `/favoritos`, acessível pelo menu principal (desktop `Header` e FAB mobile `MobileNav`, ambos já leem de `NAVIGATION_ITEMS`):

- Lista os eventos favoritados (via `useFavouritesStore`), ordenados cronologicamente com `sortEventsByDate`, reaproveitando o mesmo grid/card de `/eventos` (`EventsGrid` em `viewMode="grid"`, sem toggle de view nem paginação — lista tende a ser pequena).
- Cada card mantém o botão de desfavoritar funcionando (remove da lista imediatamente, já que a UI é 100% reativa ao store).
- Estado vazio dedicado (não reaproveitar o `EmptyState` genérico do `EventsGrid`, que fala de "nenhum evento no momento"): mensagem tipo "Você ainda não favoritou nenhum evento" + botão/link para `/eventos`.
- Tags dos eventos favoritados vêm de `getAllEventTags()` (buscado no Server Component da página, mesmo padrão de `/eventos/page.jsx`), passado como `tagsMap` para o client — sem chamada nova à API.
- Página **não** entra no `sitemap.js` (conteúdo por usuário, sem valor de SEO) e ganha `robots: { index: false }` no metadata.

## Tarefas

1. **Constante de navegação** — `src/constants/navigation.js`: adicionar `ROUTES.FAVOURITES = '/favoritos'` e um item em `NAVIGATION_ITEMS` (ícone sugerido: `FavoriteBorderOutlined`, label "Favoritos"). Como `Header.jsx` e `MobileNav.jsx` já iteram `NAVIGATION_ITEMS`, nenhuma mudança extra é necessária nesses dois arquivos além de conferir visualmente que o item novo cabe no layout (desktop tem espaço horizontal limitado — avaliar se cabe ao lado de Início/Eventos/Sobre/Galeria/Contato ou se precisa de ajuste de espaçamento).

2. **Página `/favoritos`** — criar `src/app/favoritos/page.jsx` (Server Component), seguindo o padrão de `src/app/eventos/page.jsx`:
   - `export const metadata` (title "Favoritos | Eventos Café Bugado" + description) e `metadata.robots = { index: false, follow: true }`.
   - **Não** precisa de `export const dynamic = 'force-dynamic'` do mesmo jeito que as outras — avaliar: como só busca `getAllEventTags()` (tolera cache), pode ficar estático/ISR; mas por consistência e simplicidade, replicar o padrão existente (`force-dynamic`) a menos que se decida otimizar depois.
   - `loadTags()`: chama só `getAllEventTags()` com fallback pra `{}` em caso de erro (igual ao tratamento em `EventsPage.loadEvents.tagsMap`), reportando via `captureError`.
   - Renderiza `<FavoritosPageClient tagsMap={tagsMap} />`.

3. **Client Component** — criar `src/app/favoritos/FavoritosPageClient.jsx`, inspirado em `EventsPageClient.jsx`:
   - Lê `favourites` e `favouriteIds`/`toggleFavourite` de `useFavouritesStore`.
   - `const agenda = useMemo(() => sortEventsByDate(favourites), [favourites])`.
   - Se `agenda.length === 0`: renderiza estado vazio custom (ícone + texto + `Button`/`Link` pra `/eventos`, usando `next/link`).
   - Caso contrário: heading ("Meus favoritos") + `<EventsGrid loading={false} error={null} filteredEvents={agenda} totalEvents={agenda.length} viewMode="grid" pageSize={agenda.length} eventTagsMap={tagsMap} favouriteIds={favouriteIds} toggleFavourite={(id) => toggleFavourite(id, agenda)} />`.
   - Não precisa de `EventsFilters`, `ViewToggle` nem `Pagination` no MVP — manter simples.

4. **Verificação visual do item de navegação** — rodar a app localmente e conferir que o novo item de menu não quebra o layout do `Header` (desktop) nem do `MobileNav` (FAB mobile), em ambos os temas (light/dark).

## Critérios de conclusão

- Rota `/favoritos` acessível pelo menu (desktop e mobile), navegando corretamente via `next/link`.
- Favoritar um evento em qualquer página (`/`, `/eventos`, `/eventos/[slug]`) e depois abrir `/favoritos` mostra esse evento na lista.
- Desfavoritar em `/favoritos` remove o card imediatamente da própria página (sem reload).
- Sem favoritos: mostra estado vazio com CTA pra `/eventos`, não o `EmptyState` genérico do `EventsGrid`.
- Tags aparecem corretamente nos cards (mesmo `tagsMap` de `/eventos`).
- `/favoritos` não aparece em `sitemap.xml` e tem `noindex`.
- `pnpm lint`, `pnpm test:run` e `pnpm build` passam limpos; cobertura não cai abaixo dos thresholds atuais (`vitest.config.js`: 55% linhas / 50% funções / 48% branches).
- Sem uso de `console.log` (usar `console.warn`/`console.error` se necessário, seguindo `captureError` do Sentry como já é padrão nas outras páginas).

## Arquivos afetados

**Novos:**

- `src/app/favoritos/page.jsx`
- `src/app/favoritos/FavoritosPageClient.jsx`
- `src/app/favoritos/page.test.jsx`
- `src/app/favoritos/FavoritosPageClient.test.jsx`
- `e2e/favoritos.spec.js`

**Modificados:**

- `src/constants/navigation.js` (novo `ROUTES.FAVOURITES` + item em `NAVIGATION_ITEMS`)

**Reaproveitados sem alteração** (referência, não precisam mudar):

- `src/store/useFavouritesStore.js`
- `src/components/EventsGrid.jsx`, `src/components/EventCard.jsx`, `src/components/FavouriteEventButton.jsx`
- `src/utils/eventDate.js` (`sortEventsByDate`)
- `src/services/tagService.js` (`getAllEventTags`)
- `src/components/Header.jsx`, `src/components/MobileNav.jsx` (consomem `NAVIGATION_ITEMS` automaticamente)

## Testes necessários

- **Unit — `FavoritosPageClient.test.jsx`** (padrão de `EventsPageClient.test.jsx`): mock de `useFavouritesStore` (zustand) com lista vazia → assert estado vazio + link pra `/eventos`; com favoritos → assert cards renderizados via `EventCard`/`EventsGrid`, ordenados por data; clicar em desfavoritar → assert que o card some da lista.
- **Unit — `page.test.jsx`**: mock de `tagService.getAllEventTags` (sucesso e erro/fallback `{}`, com `captureError` chamado no caso de erro), seguindo o padrão de `src/app/eventos/[slug]/page.test.jsx` (chamar o Server Component como função async).
- **E2E — `e2e/favoritos.spec.js`** (Playwright): fluxo completo — abrir `/eventos`, favoritar um evento, navegar para `/favoritos` pelo menu, confirmar que o evento aparece; desfavoritar na própria página `/favoritos`, confirmar estado vazio.
- **Verificação manual de navegação**: conferir item novo no `Header` (desktop) e no `MobileNav` (FAB mobile), luz e escuro.
- Rodar suíte completa (`pnpm test:run`) pra garantir que os thresholds de cobertura do `vitest.config.js` continuam sendo atingidos com os arquivos novos.

## Fora de escopo (deliberado, para manter baixa complexidade)

- Sincronizar favoritos entre dispositivos/servidor (exigiria conta de usuário + endpoints de escrita na API — fora do escopo deste app, que é só-leitura).
- `ViewToggle`/paginação/filtros dentro de `/favoritos` — pode ser adicionado depois se a lista de favoritos crescer muito, mas não é necessário para o MVP.
- Badge de contagem de favoritos no ícone do menu — cosmético, pode ser uma iteração futura.

## Status

Implementado. Todas as tarefas concluídas: rota `/favoritos` + item de navegação, testes unitários (`FavoritosPageClient.test.jsx`, `page.test.jsx`) e E2E (`e2e/favoritos.spec.js`), verificação visual (desktop/mobile, claro/escuro) via dev server. `pnpm lint`, `pnpm test:run` (288 testes), `pnpm test:coverage` (thresholds ok) e `pnpm build` passando limpos.
