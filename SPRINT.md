# SPRINT.md — Contribuintes em `/sobre`

> Documento de planejamento. Nenhum código foi implementado ainda.

## Contexto

A página `/sobre` mostra "Nenhum contribuinte cadastrado ainda." na seção "Quem mantém este
projeto" — não por falta de gente cadastrada, mas porque `src/app/sobre/page.jsx` passa
`contributors={[]}` fixo pro `ContributorsGrid`, com comentário explícito de que é
placeholder até a API existir. O componente `src/components/ContributorsGrid.jsx` já está
pronto pra renderizar contribuintes reais (nome, avatar, GitHub, LinkedIn, portfólio).

Depende do backend expor `GET /contributors` (Sprint 4 parcial de
`D:\backendeventos-public-api\SPRINT.md`), que replica um recurso que já existe e funciona
no backend legado (`D:\backendeventos`).

**Fora de escopo:** `AboutFeatures totalEventos={null}` (estatísticas de eventos, depende de
`GET /events/stats/public`) — backlog relacionado mas separado, não pedido agora, continua
hardcoded como está.

## Dependência

`GET /contributors` (Sprint 4 parcial do backend) disponível em produção/staging antes de
mergear a mudança de consumo.

## Tarefas

### F1 — `eventService.js`: `getContributors()`

```js
export async function getContributors() {
  return apiGet('/contributors', { context: 'getContributors' })
}
```

Mesmo padrão de `getTags`/`getEventsTagsMap` (sem `next`/revalidate, listagem simples, sem
parâmetros).

**Critério de conclusão:** função segue a assinatura `apiGet(path, { context })` já usada
pelas funções existentes.

**Arquivos:** `src/services/eventService.js`, `src/services/eventService.test.js`.

**Testes:** novo `describe('getContributors')` cobrindo busca com sucesso e status não-2xx
no erro.

---

### F2 — `sobre/page.jsx`: busca contribuintes reais

```jsx
import { captureError } from '../../lib/sentry'
import { getContributors } from '../../services/eventService'

export const dynamic = 'force-dynamic'

// Estatísticas (AboutFeatures totalEventos) continuam sem fonte de dados —
// depende de GET /events/stats/public, fora do escopo desta mudança.
export default async function AboutPage() {
  let contributors = []
  try {
    contributors = await getContributors()
  } catch (error) {
    captureError(error, { context: 'AboutPage.loadContributors' })
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 5, md: 8 } }}>
      <AboutFeatures totalEventos={null} />
      <ContributorsGrid contributors={contributors} />
    </Container>
  )
}
```

Falha na API não derruba a página — cai no estado vazio que o `ContributorsGrid` já trata,
mesmo padrão de degradação graciosa já usado em `EventDetailsPage.loadEvent`.

**Critério de conclusão:** `/sobre` renderiza contribuintes reais quando a API devolve
dados; falha na API mantém o estado vazio sem quebrar a página.

**Arquivos:** `src/app/sobre/page.jsx`.

---

### F3 — Testes

`src/app/sobre/page.test.jsx` (reescreve o `it` único de hoje, que assume sempre-vazio e
fica obsoleto):

- mock de `getContributors` (`vi.mock('../../services/eventService')`) e de `captureError`
  (`vi.mock('../../lib/sentry')`), mesmo padrão de `eventos/[slug]/page.test.jsx`.
- `AboutPage()` passa a ser `async` — todo teste precisa `await AboutPage()` antes de
  `renderWithTheme`.
- caso "renderiza contribuintes reais" (mock resolve com 1-2 itens, assert nome aparece).
- caso "estado vazio quando não há contribuintes" (mock resolve `[]`).
- caso "degrada graciosamente e reporta ao Sentry quando a busca falha" (mock rejeita,
  assert `captureError` chamado com `context: 'AboutPage.loadContributors'`, assert página
  ainda renderiza o estado vazio).
- teste de `metadata` continua igual.

**Critério de conclusão:** `npm run test` verde, cobertura mínima do projeto mantida (55%
linhas / 50% funções / 48% branches).

**Arquivos:** `src/app/sobre/page.test.jsx`.

## Definition of Done — geral

- [ ] F1–F3 concluídas com os critérios de cada uma.
- [ ] `/sobre` renderiza contribuintes reais quando a API devolve dados — confirmado
      manualmente com `npm run dev`.
- [ ] Falha na API não quebra a página (continua no estado vazio).
- [ ] `npm run test` verde; `npm run lint` sem erros novos.
- [ ] Nenhum novo `console.log`.
- [ ] `AboutFeatures totalEventos={null}` inalterado (fora de escopo, confirmado).
