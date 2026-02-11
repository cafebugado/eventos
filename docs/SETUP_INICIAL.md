# Setup Inicial - Primeira Vez no Projeto

Guia completo para montar o ambiente de desenvolvimento do projeto **Eventos - Comunidade Cafe Bugado** pela primeira vez.

---

## Pre-requisitos

Antes de comecar, instale as ferramentas abaixo no seu computador:

| Ferramenta  | Versao Minima | Link para Download                                                                  |
| ----------- | ------------- | ----------------------------------------------------------------------------------- |
| **Node.js** | 20.x          | [https://nodejs.org](https://nodejs.org) (versao LTS)                               |
| **pnpm**    | 9.x           | [https://pnpm.io/installation](https://pnpm.io/installation)                        |
| **Git**     | 2.x           | [https://git-scm.com](https://git-scm.com)                                          |
| **Docker**  | 24.x          | [https://www.docker.com/get-started](https://www.docker.com/get-started) (opcional) |
| **VS Code** | Qualquer      | [https://code.visualstudio.com](https://code.visualstudio.com) (recomendado)        |

### Verificando as instalacoes

Abra o terminal e execute cada comando para confirmar:

```bash
node --version
# Esperado: v20.x.x ou superior

pnpm --version
# Esperado: 9.x.x ou superior

git --version
# Esperado: git version 2.x.x

docker --version
# Esperado: Docker version 24.x.x (se instalado)
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
# Clone o projeto do GitHub
git clone https://github.com/cafebugado/agendas-eventos.git

# Entre na pasta do projeto
cd agendas-eventos
```

> Se voce usa SSH em vez de HTTPS:
>
> ```bash
> git clone git@github.com:cafebugado/agendas-eventos.git
> ```

---

## Passo 2 - Instalar Dependencias

```bash
pnpm install
```

Esse comando instala todas as dependencias listadas no `package.json`. Aguarde a conclusao (pode levar alguns minutos na primeira vez).

> O `pnpm-lock.yaml` garante que todos usem as mesmas versoes. Nunca delete esse arquivo.

---

## Passo 3 - Configurar Variaveis de Ambiente

### 3.1 Criar o arquivo `.env`

```bash
# Copie o arquivo de exemplo
cp .env.example .env
```

### 3.2 Preencher as credenciais

Abra o arquivo `.env` no seu editor e preencha:

```env
# URL do seu projeto Supabase
VITE_SUPABASE_URL=https://seu-projeto.supabase.co

# Chave publica (anon key) do Supabase
VITE_SUPABASE_ANON_KEY=sua-anon-key-aqui
```

### 3.3 Onde encontrar as credenciais

Peca ao lider do projeto ou acesse o Supabase Dashboard:

1. Acesse [https://supabase.com](https://supabase.com) e faca login
2. Selecione o projeto do Cafe Bugado
3. Va em **Settings** > **API**
4. Copie:
   - **Project URL** -> cole em `VITE_SUPABASE_URL`
   - **anon public key** (em Project API keys) -> cole em `VITE_SUPABASE_ANON_KEY`

> **IMPORTANTE**: NUNCA commite o arquivo `.env`! Ele ja esta no `.gitignore`.

> Se precisar configurar o Supabase do zero (criar tabelas, storage, etc.), siga o guia completo em [SUPABASE_SETUP.md](SUPABASE_SETUP.md).

---

## Passo 4 - Configurar Git Hooks (Husky)

Os hooks sao configurados automaticamente ao instalar as dependencias, mas confirme que estao funcionando:

```bash
pnpm prepare
```

Isso configura o Husky para executar automaticamente:

- **Pre-commit**: Roda ESLint e Prettier nos arquivos modificados
- **Commit-msg**: Valida se a mensagem de commit segue o padrao Conventional Commits

---

## Passo 5 - Rodar o Projeto

Voce pode rodar de **duas formas**: localmente ou via Docker.

### Opcao A: Rodar Localmente (Recomendado para Desenvolvimento)

```bash
pnpm dev
```

Acesse no navegador: **http://localhost:5173**

### Opcao B: Rodar via Docker

```bash
# Inicia o container de desenvolvimento
docker-compose up app-dev
```

Acesse no navegador: **http://localhost:5173**

Para parar o container:

```bash
# Ctrl+C no terminal, ou em outro terminal:
docker-compose down
```

---

## Passo 6 - Verificar se Tudo Funciona

### 6.1 Pagina publica

Acesse `http://localhost:5173` - voce deve ver a pagina inicial com a listagem de eventos.

### 6.2 Painel administrativo

Acesse `http://localhost:5173/admin` - voce deve ver a tela de login.

### 6.3 Rodar os testes

```bash
# Testes unitarios (modo unico)
pnpm test:run

# Testes com cobertura
pnpm test:coverage
```

### 6.4 Verificar linting e formatacao

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

| Extensao     | ID                            | Para que serve          |
| ------------ | ----------------------------- | ----------------------- |
| ESLint       | `dbaeumer.vscode-eslint`      | Mostra erros de linting |
| Prettier     | `esbenp.prettier-vscode`      | Formatacao automatica   |
| EditorConfig | `editorconfig.editorconfig`   | Configuracoes do editor |
| Docker       | `ms-azuretools.vscode-docker` | Suporte a Docker        |

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
agendas-eventos/
├── src/
│   ├── admin/           # Painel administrativo (Login, Dashboard)
│   ├── pages/           # Paginas publicas (Home, About, Contact, etc.)
│   ├── components/      # Componentes reutilizaveis (Header, Footer, etc.)
│   ├── services/        # Servicos de API (Supabase)
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Configuracoes (Supabase, Sentry)
│   ├── utils/           # Funcoes utilitarias
│   ├── assets/          # Arquivos estaticos
│   ├── test/            # Setup e mocks de testes
│   ├── App.jsx          # Componente principal + rotas
│   └── main.jsx         # Entry point da aplicacao
├── api/                 # Funcoes serverless (OG images)
├── e2e/                 # Testes end-to-end (Playwright)
├── supabase/            # Migracoes SQL
├── docs/                # Documentacao do projeto
├── .github/             # Workflows CI/CD
├── docker-compose.yml   # Configuracao Docker
├── vite.config.js       # Configuracao do Vite
├── package.json         # Dependencias e scripts
└── .env                 # Variaveis de ambiente (NAO commitar!)
```

---

## Scripts Disponiveis

| Comando              | O que faz                                 |
| -------------------- | ----------------------------------------- |
| `pnpm dev`           | Inicia servidor de desenvolvimento        |
| `pnpm build`         | Gera build de producao                    |
| `pnpm preview`       | Preview da build de producao              |
| `pnpm lint`          | Verifica erros de linting                 |
| `pnpm lint:fix`      | Corrige erros de linting automaticamente  |
| `pnpm format`        | Formata todos os arquivos com Prettier    |
| `pnpm format:check`  | Verifica se os arquivos estao formatados  |
| `pnpm test`          | Executa testes em modo watch              |
| `pnpm test:run`      | Executa testes uma vez                    |
| `pnpm test:coverage` | Executa testes com relatorio de cobertura |
| `pnpm test:ui`       | Abre interface visual para testes         |
| `pnpm test:e2e`      | Executa testes E2E (Playwright)           |

---

## Tecnologias Principais

| Tecnologia         | Uso                                   |
| ------------------ | ------------------------------------- |
| React 19           | Biblioteca UI                         |
| Vite 7             | Build tool e dev server               |
| React Router DOM 7 | Roteamento SPA                        |
| Supabase           | Backend (PostgreSQL + Auth + Storage) |
| Vitest             | Framework de testes                   |
| Playwright         | Testes end-to-end                     |
| ESLint + Prettier  | Qualidade e formatacao de codigo      |
| Husky + Commitlint | Git hooks e padrao de commits         |
| Docker             | Containerizacao                       |

---

## Proximo Passo

Ambiente pronto! Agora leia o guia [FLUXO_DE_TRABALHO.md](FLUXO_DE_TRABALHO.md) para aprender como trabalhar no projeto no dia a dia (criar branches, fazer commits, abrir PRs, etc.).
