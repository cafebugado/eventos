# Setup Inicial - Primeira Vez no Projeto

Guia completo para montar o ambiente de desenvolvimento do projeto **Eventos - Comunidade Cafe Bugado** pela primeira vez.

---

## Pre-requisitos

Antes de comecar, instale as ferramentas abaixo no seu computador:

| Ferramenta  | Versao Minima | Link para Download                                                           |
| ----------- | ------------- | ---------------------------------------------------------------------------- |
| **Node.js** | 20.x          | [https://nodejs.org](https://nodejs.org) (versao LTS)                        |
| **pnpm**    | 9.x           | [https://pnpm.io/installation](https://pnpm.io/installation)                 |
| **Git**     | 2.x           | [https://git-scm.com](https://git-scm.com)                                   |
| **VS Code** | Qualquer      | [https://code.visualstudio.com](https://code.visualstudio.com) (recomendado) |

### Verificando as instalacoes

Abra o terminal e execute cada comando para confirmar:

```bash
node --version
# Esperado: v20.x.x ou superior

pnpm --version
# Esperado: 9.x.x ou superior

git --version
# Esperado: git version 2.x.x
```

### Instalando o pnpm (caso nao tenha)

```bash
# Opcao 1: Via npm (mais simples)
npm install -g pnpm

# Opcao 2: Via corepack (incluso no Node.js 16.13+)
corepack enable
corepack prepare pnpm@latest --activate
```

---

## Passo 1 - Clonar o Repositorio

```bash
git clone https://github.com/cafebugado/eventos.git
cd eventos
```

> Se voce usa SSH em vez de HTTPS:
>
> ```bash
> git clone git@github.com:cafebugado/eventos.git
> ```

---

## Passo 2 - Instalar Dependencias

```bash
pnpm install
```

Esse comando instala as dependencias do app **e** configura os git hooks (Husky) automaticamente via `prepare`. Aguarde a conclusao (pode levar alguns minutos na primeira vez).

> O `pnpm-lock.yaml` garante que todos usem as mesmas versoes. Nunca delete esse arquivo.

---

## Passo 3 - Configurar Variaveis de Ambiente

### 3.1 Criar o arquivo `.env.local`

```bash
cp .env.example .env.local
```

### 3.2 Nao precisa preencher nada pra rodar local

A integração com a API dedicada foi removida (troca de backend em andamento,
ver [SPRINT.md](../SPRINT.md)) — nenhuma variavel de API e necessaria no
momento. As paginas de listagem renderizam estado vazio/erro ate a nova API
ser plugada.

> **IMPORTANTE**: NUNCA commite o arquivo `.env.local`! Ele ja esta no `.gitignore`.

---

## Passo 4 - Confirmar os Git Hooks (Husky)

Os git hooks (pre-commit, commit-msg) ja foram configurados no Passo 2 (`pnpm install` roda o `prepare` do Husky automaticamente). Para confirmar:

```bash
pnpm exec husky
```

Isso garante que o Husky execute automaticamente:

- **Pre-commit**: Roda ESLint e Prettier (`lint-staged`) nos arquivos modificados
- **Commit-msg**: Valida se a mensagem de commit segue o padrao Conventional Commits

---

## Passo 5 - Rodar o Projeto

```bash
pnpm dev
```

Acesse no navegador: **http://localhost:3000**

---

## Passo 6 - Verificar se Tudo Funciona

### 6.1 Pagina publica

Acesse `http://localhost:3000` - voce deve ver a pagina inicial com a listagem de eventos.

### 6.2 Rodar os testes

```bash
# Testes unitarios (modo unico)
pnpm test:run

# Testes com cobertura
pnpm test:coverage
```

### 6.3 Verificar linting e formatacao

```bash
# Verificar erros de linting
pnpm lint

# Verificar formatacao
pnpm format:check
```

Se tudo passou sem erros, seu ambiente esta pronto!

---

## Passo 7 - Configurar o Editor (VS Code)

### Extensoes Recomendadas

Instale as extensoes abaixo para melhor produtividade:

| Extensao     | ID                          | Para que serve          |
| ------------ | --------------------------- | ----------------------- |
| ESLint       | `dbaeumer.vscode-eslint`    | Mostra erros de linting |
| Prettier     | `esbenp.prettier-vscode`    | Formatacao automatica   |
| EditorConfig | `editorconfig.editorconfig` | Configuracoes do editor |

### Configuracao sugerida do VS Code

Adicione ao seu `settings.json` (Ctrl+Shift+P > "Open User Settings JSON"):

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  }
}
```

---

## Estrutura do Projeto

```
eventos/
├── src/
│   ├── app/           # Rotas (App Router)
│   ├── components/    # Componentes reutilizaveis
│   ├── services/      # (removido — integracao com API dedicada em troca, ver SPRINT.md)
│   ├── hooks/         # Custom hooks
│   ├── store/         # Estado global (Zustand)
│   ├── lib/           # Configuracoes (API, Sentry)
│   ├── theme/         # Tema MUI
│   ├── utils/         # Funcoes utilitarias
│   ├── test/          # Setup e mocks de testes
│   └── instrumentation*.js, sentry.*.config.js
├── e2e/               # Testes end-to-end (Playwright)
├── public/            # Arquivos estaticos
├── docs/              # Documentacao do projeto (esta pasta)
├── .github/           # Workflows CI/CD
├── .husky/            # Git hooks
├── next.config.mjs    # Configuracao do Next.js
├── package.json       # Dependencias e scripts (app + tooling de git hooks)
└── .env.local         # Variaveis de ambiente (NAO commitar!)
```

---

## Scripts Disponiveis

| Comando              | O que faz                                 |
| -------------------- | ----------------------------------------- |
| `pnpm dev`           | Inicia servidor de desenvolvimento        |
| `pnpm build`         | Gera build de producao                    |
| `pnpm start`         | Roda o build de producao localmente       |
| `pnpm lint`          | Verifica erros de linting                 |
| `pnpm lint:fix`      | Corrige erros de linting automaticamente  |
| `pnpm format`        | Formata todos os arquivos com Prettier    |
| `pnpm format:check`  | Verifica se os arquivos estao formatados  |
| `pnpm test`          | Executa testes em modo watch              |
| `pnpm test:run`      | Executa testes uma vez                    |
| `pnpm test:coverage` | Executa testes com relatorio de cobertura |
| `pnpm test:ui`       | Abre interface visual para testes         |
| `pnpm test:e2e`      | Executa testes E2E (Playwright)           |
| `pnpm storybook`     | Storybook em modo dev                     |

---

## Tecnologias Principais

| Tecnologia         | Uso                                                     |
| ------------------ | ------------------------------------------------------- |
| Next.js 16         | Framework (App Router, Server Components)               |
| MUI (Material UI)  | Componentes de UI                                       |
| Zustand            | Estado global                                           |
| API dedicada       | Removida (troca de backend em andamento, ver SPRINT.md) |
| Vitest             | Framework de testes                                     |
| Playwright         | Testes end-to-end                                       |
| Storybook          | Catalogo de componentes                                 |
| ESLint + Prettier  | Qualidade e formatacao de codigo                        |
| Husky + Commitlint | Git hooks e padrao de commits                           |

---

## Proximo Passo

Ambiente pronto! Agora leia o guia [FLUXO_DE_TRABALHO.md](FLUXO_DE_TRABALHO.md) para aprender como trabalhar no projeto no dia a dia (criar branches, fazer commits, abrir PRs, etc.).
