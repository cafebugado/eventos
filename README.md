# Eventos - Comunidade Café Bugado

Plataforma da Comunidade Café Bugado para descobrir e participar dos melhores eventos de tecnologia.

**Site:** [cafebugado.com.br](https://cafebugado.com.br)

## Onde está o código

Todo o app vive em [`web/`](web/) — Next.js (App Router) + MUI + Zustand + Supabase. Veja o [README de `web/`](web/README.md) para stack completa, scripts e variáveis de ambiente.

A raiz do repositório só tem infraestrutura compartilhada:

- `.github/` — workflows de CI/CD (lint, testes, build, release, CodeQL)
- `.husky/` + `package.json` (raiz) — git hooks (husky, lint-staged, commitlint), que rodam sobre `web/`

## Começando

```bash
git clone https://github.com/cafebugado/eventos.git
cd eventos/web
pnpm install
cp .env.example .env.local   # preencher com as credenciais do Supabase
pnpm dev                      # http://localhost:3000
```

Guias detalhados em [`web/docs/`](web/docs/): [setup inicial](web/docs/SETUP_INICIAL.md), [fluxo de trabalho](web/docs/FLUXO_DE_TRABALHO.md), [configuração do Supabase](web/docs/SUPABASE_SETUP.md), [troubleshooting](web/docs/TROUBLESHOOTING.md).

## Contribuindo

1. Crie uma branch a partir de `developer` (`feature/*`, `fix/*` ou `hotfix/*`)
2. Faça commits seguindo [Conventional Commits](https://www.conventionalcommits.org/)
3. Abra um Pull Request para `developer` (nunca direto para `main`)

Guia completo em [web/docs/CONTRIBUTING.md](web/docs/CONTRIBUTING.md).

## Documentação adicional

- [CHANGELOG.md](CHANGELOG.md) — histórico de versões
- [web/docs/OPERATIONS.md](web/docs/OPERATIONS.md) — runbook de deploy/rollback/monitoramento
- [web/docs/BRANCH_PROTECTION.md](web/docs/BRANCH_PROTECTION.md) — regras de proteção de branches
- [web/docs/BACKUP_STRATEGY.md](web/docs/BACKUP_STRATEGY.md) — estratégia de backup do banco
- [web/docs/MIGRATIONS.md](web/docs/MIGRATIONS.md) — schema e migrations do Supabase

## Autores

- **Dario Reis** — [@darioreisjr](https://github.com/darioreisjr)
- **Julia Krisnarane** — [@krisnarane](https://github.com/krisnarane)
