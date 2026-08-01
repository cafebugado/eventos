# Eventos Café Bugado

Plataforma da Comunidade Café Bugado para descobrir e participar dos melhores eventos de tecnologia.

**Site:** [cafebugado.com.br](https://cafebugado.com.br)

## Stack

- **Framework:** Next.js 16 (App Router, Server Components)
- **UI:** MUI (Material UI) + Emotion
- **Estado global:** Zustand
- **Backend:** API dedicada (FastAPI) em `v2.backendeventoscfb.cafebugado.com.br` — consumida via `fetch`, só GET público
- **Erros:** Sentry (`@sentry/nextjs`)
- **Analytics:** Vercel Analytics + Speed Insights + Web Vitals
- **Testes:** Vitest + Testing Library + MSW + Playwright (E2E) + Storybook
- **CI/CD:** GitHub Actions (ci, pr-developer, pr-main, release, codeql, pr-labeler)
- **Deploy:** Vercel (produção automática no push em `main`)

Não existe painel administrativo — foi uma decisão de negócio definitiva. Gerenciar eventos/tags/contribuintes/galeria é feito direto no backend dedicado (repositório separado); este app só lê dados públicos via GET.

## Rodando localmente

```bash
git clone https://github.com/cafebugado/eventos.git
cd eventos
pnpm install
cp .env.example .env.local   # já aponta pra API de produção por padrão
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

Ver [`.env.example`](.env.example). Todas são opcionais (têm default): `NEXT_PUBLIC_API_BASE_URL` (default: API de produção), `NEXT_PUBLIC_SITE_URL` e `NEXT_PUBLIC_SENTRY_DSN`.

## Padrões do projeto

- Código do app em `src/` (convenção do Next.js); `public/`, `e2e/` e `docs/` ficam na raiz.
- Chamadas à API sempre via `withRetry` (`src/lib/apiClient.js`), pelo wrapper `apiGet` (`src/lib/api/eventosApi.js`).
- Services não recebem client nem sessão — são GETs públicos, chamáveis igual em Server e Client Components.
- Busca de dados acontece em Server Components (`src/app/**/page.jsx`), sem hooks client-side de fetch.
- Modais usam `src/components/Modal/`.

Ver [CLAUDE.md](CLAUDE.md) para o guia completo de convenções.

## Contribuindo

1. Crie uma branch a partir de `developer` (`feature/*`, `fix/*` ou `hotfix/*`)
2. Faça commits seguindo [Conventional Commits](https://www.conventionalcommits.org/)
3. Abra um Pull Request para `developer` (nunca direto para `main`)

Guia completo em [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md).

## Documentação adicional

- [CHANGELOG.md](CHANGELOG.md) — histórico de versões
- [docs/SETUP_INICIAL.md](docs/SETUP_INICIAL.md) — montagem do ambiente (primeira vez)
- [docs/FLUXO_DE_TRABALHO.md](docs/FLUXO_DE_TRABALHO.md) — fluxo de trabalho diário (Git, commits, PRs)
- [docs/OPERATIONS.md](docs/OPERATIONS.md) — runbook de deploy/rollback/monitoramento
- [docs/BRANCH_PROTECTION.md](docs/BRANCH_PROTECTION.md) — regras de proteção de branches
- [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) — solução de problemas comuns

## Deploy

Deploy automático via Vercel no push em `main` (Root Directory do projeto = raiz do repositório).

## Autores

- **Dario Reis** — [@darioreisjr](https://github.com/darioreisjr)
- **Julia Krisnarane** — [@krisnarane](https://github.com/krisnarane)
