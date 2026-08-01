# Eventos Café Bugado — web/

App novo da plataforma de eventos da Comunidade Café Bugado, em migração de Vite/React para **Next.js (App Router)**.

## Stack

- **Framework:** Next.js 16 (App Router, Server Components)
- **UI:** MUI (Material UI) + Emotion
- **Estado global:** Zustand
- **Backend:** Supabase (PostgreSQL + Auth + Storage) via `@supabase/ssr`
- **Erros:** Sentry (`@sentry/nextjs`)
- **Analytics:** Vercel Analytics + Speed Insights + Web Vitals
- **Testes:** Vitest + Testing Library + MSW + Playwright (E2E) + Storybook

## Rodando localmente

```bash
pnpm install
cp .env.example .env.local   # preencher com as credenciais do Supabase
pnpm dev                      # http://localhost:3000
```

## Scripts

| Script                               | Descrição                           |
| ------------------------------------ | ----------------------------------- |
| `pnpm dev`                           | Servidor de desenvolvimento         |
| `pnpm build`                         | Build de produção                   |
| `pnpm start`                         | Roda o build de produção localmente |
| `pnpm lint` / `lint:fix`             | ESLint                              |
| `pnpm format` / `format:check`       | Prettier                            |
| `pnpm test` / `test:run`             | Vitest (watch / single run)         |
| `pnpm test:coverage`                 | Vitest com cobertura                |
| `pnpm test:e2e`                      | Playwright (Chromium)               |
| `pnpm storybook` / `build-storybook` | Storybook                           |

## Variáveis de ambiente

Ver [`.env.example`](.env.example). As obrigatórias são `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`; `NEXT_PUBLIC_SITE_URL` e `NEXT_PUBLIC_SENTRY_DSN` são opcionais (têm default/no-op).

## Padrões do projeto

- Chamadas ao Supabase sempre via `withRetry` (`lib/apiClient.js`).
- Server Components usam `lib/supabase/server.js` (async); Client Components usam `lib/supabase/client.js` (síncrono).
- Busca de dados acontece em Server Components (`app/**/page.jsx`), sem hooks client-side de fetch.
- Modais usam `components/Modal/`.

Ver `CLAUDE.md` na raiz do repositório para o guia completo de convenções.

## Deploy

Deploy via Vercel, com o **Root Directory do projeto Vercel apontando para `web/`**.
