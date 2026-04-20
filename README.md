# Eventos - Comunidade Café Bugado

Uma plataforma moderna e minimalista da Comunidade Café Bugado para descobrir e participar dos melhores eventos, com design limpo, dark mode, painel administrativo, galeria de fotos e animações suaves.

**Site:** [cafebugado.com.br](https://cafebugado.com.br)

## Funcionalidades

### Área Pública

- **Design Minimalista** - Interface limpa com paleta azul, branco e preto
- **Dark/Light Mode** - Alternância suave entre temas com persistência em localStorage
- **Animações Fluidas** - Transições suaves baseadas em Intersection Observer
- **Responsivo** - Design mobile-first que funciona em todos os dispositivos
- **Tempo Real** - Sincronização automática com banco de dados Supabase
- **Curadoria** - Eventos selecionados e verificados pela comunidade
- **Favoritos** - Marque eventos favoritos com persistência em localStorage
- **Recomendações** - Sugestões baseadas em tags e proximidade de data (lazy-load)
- **Galeria de Fotos** - Galeria pública de fotos da comunidade por álbuns de evento
- **Compartilhamento** - Botões para compartilhar eventos em redes sociais
- **SEO Otimizado** - Meta tags dinâmicas e Open Graph por página

### Painel Administrativo

- **Autenticação** - Login seguro via Supabase Auth
- **CRUD de Eventos** - Criar, editar, visualizar e excluir eventos com upload de imagem
- **Tags de Tecnologia** - CRUD de tags com cor customizada e preview em tempo real
- **Modalidade** - Presencial, Online ou Híbrido para cada evento
- **Localização** - Endereço, cidade e estado com link para Google Maps
- **Estatísticas** - Visualização de eventos por período com stats clicáveis
- **Validação de Formulários** - React Hook Form com validações
- **RBAC** - Controle de acesso granular por papel: `super_admin`, `admin` e `moderador`
- **Perfil de Usuário** - Todos os papéis editam nome, sobrenome e avatar via GitHub
- **Comunidades** - CRUD de comunidades com controle de acesso por papel
- **Galeria Admin** - Gerenciamento de álbuns e fotos por evento (upload, legenda, ordem)
- **Contribuintes** - CRUD de contribuintes com validação de perfil GitHub
- **Estatísticas GitHub** - Stats do repositório diretamente no dashboard
- **Gerenciamento de Usuários** - Atribuição de papéis (apenas `super_admin`)
- **EventCard Reutilizável** - Componente unificado com variantes `compact` e `full`
- **Sistema de Modal Unificado** - Componente `Modal` base e `ConfirmModal` com acessibilidade completa (ARIA, ESC, scroll-lock, foco gerenciado)

## Tecnologias Utilizadas

### Frontend

| Tecnologia       | Versão  | Descrição                    |
| ---------------- | ------- | ---------------------------- |
| React            | 19.2.5  | Biblioteca para interfaces   |
| React Router DOM | 7.14.1  | Roteamento SPA               |
| React Hook Form  | 7.72.1  | Gerenciamento de formulários |
| Lucide React     | 0.577.0 | Biblioteca de ícones         |
| Vite             | 7.1.2   | Build tool moderno           |

### Backend & Database

| Tecnologia | Versão  | Descrição                  |
| ---------- | ------- | -------------------------- |
| Supabase   | 2.104.0 | PostgreSQL, Auth e Storage |

### Monitoramento & Analytics

| Ferramenta            | Descrição                         |
| --------------------- | --------------------------------- |
| Sentry                | Rastreamento de erros em produção |
| Vercel Analytics      | Análise de tráfego                |
| Vercel Speed Insights | Métricas de performance           |

### Qualidade de Código

| Ferramenta  | Versão | Descrição                  |
| ----------- | ------ | -------------------------- |
| ESLint      | 9.33.0 | Linting de código          |
| Prettier    | 3.8.3  | Formatação de código       |
| Husky       | 9.1.0  | Git hooks                  |
| Commitlint  | 20.5.0 | Validação de commits       |
| lint-staged | 16.3.2 | Linting em arquivos staged |

### Testes

| Ferramenta      | Versão | Descrição                  |
| --------------- | ------ | -------------------------- |
| Vitest          | 4.0.18 | Framework de testes        |
| Testing Library | 16.3.2 | Utilitários de teste React |
| Playwright      | 1.59.1 | Testes E2E                 |
| MSW             | 2.13.4 | Mock de APIs               |
| jsdom           | 29.0.2 | Ambiente DOM para testes   |

## Instalação

### Pré-requisitos

- Node.js 20+
- pnpm (recomendado) ou npm
- Docker e Docker Compose (opcional)

### Passos (Tradicional)

1. Clone o repositório:

```bash
git clone https://github.com/cafebugado/agendas_eventos.git
cd agendas_eventos
```

2. Instale as dependências:

```bash
pnpm install
# ou
npm install
```

3. Configure as variáveis de ambiente:

```bash
cp .env.example .env
```

4. Edite o arquivo `.env`:

```env
# Supabase (obrigatório)
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key-aqui

# Sentry (opcional - rastreamento de erros em produção)
VITE_SENTRY_DSN=https://examplePublicKey@o0.ingest.sentry.io/0

# GitHub (opcional - stats do repositório no dashboard)
VITE_GITHUB_TOKEN=ghp_seu_token_aqui
VITE_GITHUB_REPO=cafebugado/agendas_eventos
VITE_GITHUB_REPO_BACKEND=cafebugado/backendEventos
```

5. Execute o projeto:

```bash
pnpm dev
# ou
npm run dev
```

### Passos (Docker)

1. Clone o repositório:

```bash
git clone https://github.com/cafebugado/agendas_eventos.git
cd agendas_eventos
```

2. Configure as variáveis de ambiente:

```bash
cp .env.example .env
# Edite o .env com suas credenciais do Supabase
```

3. Inicie o ambiente de desenvolvimento:

```bash
docker-compose up app-dev
```

4. Acesse no navegador: `http://localhost:5173`

> **Nota:** Não é necessário ter Node.js ou pnpm instalados localmente ao usar Docker.

## Scripts Disponíveis

```bash
# Desenvolvimento
pnpm dev              # Inicia servidor de desenvolvimento

# Build
pnpm build            # Build para produção
pnpm preview          # Preview da build

# Qualidade de Código
pnpm lint             # Verifica problemas de linting
pnpm lint:fix         # Corrige problemas automaticamente
pnpm format           # Formata todos os arquivos
pnpm format:check     # Verifica formatação

# Testes
pnpm test             # Executa testes em modo watch
pnpm test:run         # Executa testes uma vez
pnpm test:ui          # Interface visual para testes
pnpm test:coverage    # Relatório de cobertura
pnpm test:e2e         # Testes E2E com Playwright
pnpm test:e2e:ui      # Testes E2E com interface visual
```

## Docker

### Desenvolvimento

```bash
# Inicia o ambiente de desenvolvimento com hot reload
docker-compose up app-dev

# Inicia em segundo plano
docker-compose up app-dev -d

# Acesse: http://localhost:5173
```

### Staging

```bash
docker-compose --profile staging up app-staging

# Acesse: http://localhost:3000
```

### Produção

```bash
# Build e inicia o ambiente de produção
docker-compose --profile production up app-prod

# Em segundo plano
docker-compose --profile production up app-prod -d

# Acesse: http://localhost
```

### Comandos Docker

```bash
# Rebuild após mudanças no Dockerfile
docker-compose up app-dev --build

# Ver logs em tempo real
docker-compose logs -f app-dev

# Executar comandos dentro do container
docker-compose exec app-dev pnpm test
docker-compose exec app-dev pnpm lint

# Parar todos os containers
docker-compose down

# Parar e remover volumes
docker-compose down -v

# Build sem cache
docker-compose build --no-cache
```

## Estrutura do Projeto

```
agendas_eventos/
├── src/
│   ├── admin/                        # Painel administrativo
│   │   ├── Login.jsx                 # Página de login
│   │   ├── Login.test.jsx
│   │   ├── Dashboard.jsx             # Dashboard multi-abas (~1500 linhas)
│   │   ├── Dashboard.test.jsx
│   │   ├── AdminSidebar.jsx          # Sidebar colapsável
│   │   ├── AdminSidebar.test.jsx
│   │   ├── GalleryAdmin.jsx          # Gerenciamento de álbuns e fotos
│   │   ├── GalleryAdmin.test.jsx
│   │   ├── CommunityAdmin.jsx        # Gerenciamento de comunidades
│   │   ├── CommunityAdmin.test.jsx
│   │   ├── GithubStats.jsx           # Stats do repositório GitHub
│   │   └── Admin.css
│   │
│   ├── components/                   # Componentes reutilizáveis
│   │   ├── Modal/                    # Sistema unificado de modais
│   │   │   ├── Modal.jsx             # Componente base (portal, ESC, scroll-lock, ARIA)
│   │   │   ├── Modal.css             # Variantes sm/md/lg + confirm
│   │   │   ├── ConfirmModal.jsx      # Variante de confirmação destrutiva
│   │   │   ├── Modal.test.jsx        # 25 testes unitários
│   │   │   └── index.js              # Barrel export
│   │   ├── EventCard.jsx             # Card de evento (variant compact/full)
│   │   ├── EventCard.test.jsx
│   │   ├── EventCard.css
│   │   ├── EventRecommendations.jsx  # Recomendações lazy no detalhe
│   │   ├── EventRecommendations.css
│   │   ├── UpcomingEvents.jsx        # Próximos eventos (home)
│   │   ├── Header.jsx                # Navegação com toggle de tema
│   │   ├── Footer.jsx
│   │   ├── Pagination.jsx
│   │   ├── ShareButtons.jsx          # Compartilhamento em redes sociais
│   │   ├── SEOHead.jsx               # Meta tags dinâmicas
│   │   ├── SEOHead.test.jsx
│   │   ├── ErrorBoundary.jsx
│   │   ├── Testimonials.jsx
│   │   ├── ContributorsGrid.jsx
│   │   ├── gallery/
│   │   │   ├── GalleryEventCard.jsx  # Card de evento na galeria
│   │   │   ├── GalleryEventCard.test.jsx
│   │   │   └── GalleryPhotoModal.jsx # Modal de visualização de foto (lightbox)
│   │   └── favourite-event/
│   │       └── favouriteEventButton.jsx
│   │
│   ├── pages/                        # Páginas públicas
│   │   ├── Home.jsx                  # Landing page
│   │   ├── Home.test.jsx
│   │   ├── About.jsx                 # Sobre + grid de contribuintes
│   │   ├── About.test.jsx
│   │   ├── Contact.jsx               # Formulário de contato
│   │   ├── Gallery.jsx               # Galeria de fotos da comunidade
│   │   ├── EventDetails.jsx          # Detalhe de evento
│   │   ├── NotFound.jsx
│   │   └── NotFound.test.jsx
│   │
│   ├── services/                     # Serviços e lógica de negócio
│   │   ├── authService.js            # Autenticação
│   │   ├── authService.test.js
│   │   ├── eventService.js           # CRUD eventos + recomendações
│   │   ├── eventService.test.js
│   │   ├── tagService.js             # CRUD tags + associação evento-tag
│   │   ├── contributorService.js     # CRUD contribuintes + validação GitHub
│   │   ├── contributorService.test.js
│   │   ├── communityService.js       # CRUD comunidades
│   │   ├── communityService.test.js
│   │   ├── galeriaService.js         # Álbuns e fotos da galeria
│   │   ├── galeriaService.test.js
│   │   ├── profileService.js         # Perfil do usuário
│   │   ├── profileService.test.js
│   │   ├── roleService.js            # Gerenciamento de papéis (RBAC)
│   │   └── githubService.js          # GitHub API
│   │
│   ├── lib/                          # Configurações e utilitários base
│   │   ├── supabase.js               # Cliente Supabase
│   │   ├── apiClient.js              # withRetry() para todas as chamadas
│   │   └── sentry.js                 # Configuração do Sentry
│   │
│   ├── hooks/                        # Custom React hooks
│   │   ├── useUserRole.js            # Papel do usuário autenticado
│   │   ├── useMediaQuery.js          # Responsividade
│   │   ├── usePagination.js          # Paginação
│   │   ├── useSidebarCollapse.js     # Estado da sidebar (localStorage)
│   │   └── useGallery.js             # Lógica da galeria
│   │
│   ├── utils/                        # Funções utilitárias
│   │   ├── eventSearch.js            # Lógica de filtro de eventos
│   │   └── richText.js               # Utilitários de texto rico
│   │
│   ├── constants/                    # Constantes
│   │   └── messages.js
│   │
│   ├── test/                         # Infraestrutura de testes
│   │   ├── setup.js
│   │   ├── utils.jsx
│   │   └── mocks/
│   │       ├── server.js             # Servidor MSW
│   │       └── handlers.js           # Handlers de mock
│   │
│   ├── assets/
│   ├── App.jsx                       # Listagem de eventos (/eventos)
│   ├── App.css
│   └── main.jsx                      # Entrada com rotas
│
├── e2e/                              # Testes E2E (Playwright)
├── docs/                             # Documentação adicional
├── api/                              # Serverless functions (Vercel)
├── public/
│
├── supabase/
│   └── migrations/                   # 17 migrations (schema completo)
│
├── .github/
│   └── workflows/
│       ├── ci.yml                    # Pipeline principal
│       ├── pr-developer.yml          # PRs para developer
│       ├── pr-main.yml               # PRs para main
│       ├── release.yml               # Releases com versionamento semântico
│       ├── codeql.yml                # Análise de segurança estática
│       └── pr-labeler.yml            # Etiquetagem automática de PRs
│
├── Dockerfile                        # Build de produção (multi-stage)
├── Dockerfile.dev                    # Build de desenvolvimento
├── docker-compose.yml                # Orquestração (dev/staging/prod)
├── nginx.conf                        # Nginx com headers de segurança
├── vercel.json                       # Configuração Vercel
└── dist/                             # Build de produção
```

## Rotas da Aplicação

| Rota                    | Componente   | Descrição                                |
| ----------------------- | ------------ | ---------------------------------------- |
| `/`                     | Home         | Landing page                             |
| `/eventos`              | App          | Listagem de eventos com filtros          |
| `/eventos/:id`          | EventDetails | Detalhe do evento                        |
| `/sobre`                | About        | Sobre a comunidade                       |
| `/contato`              | Contact      | Formulário de contato                    |
| `/galeria`              | Gallery      | Galeria de fotos da comunidade           |
| `/admin`                | Login        | Login administrativo                     |
| `/admin/dashboard`      | Dashboard    | Painel de gerenciamento (aba padrão)     |
| `/admin/dashboard/:tab` | Dashboard    | Painel de gerenciamento (aba específica) |
| `/*`                    | NotFound     | Página 404                               |

## Configuração do Supabase

Para configurar o Supabase, consulte o guia detalhado em [SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md).

O schema completo está em `supabase/migrations/` (17 arquivos).

### Tabelas Principais

| Tabela           | Descrição                                          |
| ---------------- | -------------------------------------------------- |
| `eventos`        | Eventos da comunidade com modalidade e localização |
| `tags`           | Tags de tecnologia com cor customizada             |
| `evento_tags`    | Associação N:N entre eventos e tags                |
| `contribuintes`  | Contribuintes com perfil GitHub                    |
| `comunidades`    | Comunidades associadas a eventos                   |
| `galeria_albuns` | Álbuns de fotos por evento/comunidade              |
| `galeria_fotos`  | Fotos com legenda, ordem e storage_path            |
| `user_roles`     | Papéis dos usuários (RBAC)                         |
| `user_profiles`  | Perfis dos usuários autenticados                   |
| `audit_log`      | Log de auditoria de ações administrativas          |

### Controle de Acesso (RBAC)

| Permissão                   | super_admin | admin | moderador          |
| --------------------------- | ----------- | ----- | ------------------ |
| Criar eventos               | ✅          | ✅    | ✅                 |
| Editar eventos              | ✅          | ✅    | ✅                 |
| Excluir eventos             | ✅          | ✅    | Apenas os próprios |
| Criar/editar tags           | ✅          | ✅    | Apenas as próprias |
| Excluir tags                | ✅          | ✅    | Apenas as próprias |
| Gerenciar contribuintes     | ✅          | ✅    | ❌                 |
| Gerenciar comunidades       | ✅          | ✅    | Apenas as próprias |
| Gerenciar galeria (álbuns)  | ✅          | ✅    | ✅                 |
| Upload de imagens/fotos     | ✅          | ✅    | ✅                 |
| Gerenciar usuários (papéis) | ✅          | ❌    | ❌                 |
| Editar próprio perfil       | ✅          | ✅    | ✅                 |

> **Bootstrap:** O primeiro usuário a se cadastrar recebe automaticamente o papel `super_admin`.

### Configuração do Storage

No painel do Supabase, certifique-se de que o bucket `imagens` existe e é público. Adicione as policies de upload para usuários autenticados em `imagens/galeria/**`.

### Períodos Disponíveis

- Matinal · Diurno · Vespertino · Noturno

### Modalidades Disponíveis

- Presencial · Online · Híbrido

## CI/CD

O projeto utiliza GitHub Actions para integração e entrega contínuas.

### Workflows

| Workflow           | Trigger          | Descrição                                              |
| ------------------ | ---------------- | ------------------------------------------------------ |
| `ci.yml`           | Push/PR          | Lint, segurança, testes (cobertura), build             |
| `pr-developer.yml` | PR → developer   | Validação de origem + CI (1 aprovação)                 |
| `pr-main.yml`      | PR → main        | Validação rigorosa + análise de bundle (2 aprovações)  |
| `release.yml`      | Push em main     | Versionamento semântico + PR automático para developer |
| `codeql.yml`       | Push/PR/schedule | Análise de segurança estática (CodeQL)                 |
| `pr-labeler.yml`   | PR aberto        | Etiquetagem automática de PRs por caminhos alterados   |

### Etapas do CI

1. **Lint** — Prettier + ESLint
2. **Security** — `pnpm audit` + scan de secrets expostos + validação de headers do nginx
3. **Test** — Vitest com relatório de cobertura (Codecov)
4. **Build** — Build de produção + upload do artefato `dist/`

### Fluxo de Branches

```
feature/* ──┐
fix/*     ──┼──► developer (1 aprovação) ──► main (2 aprovações)
hotfix/*  ──┘
```

## Padrões de Código

### Commits (Conventional Commits)

```
tipo(escopo): descrição

Tipos: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert
```

Exemplos:

```bash
feat(galeria): adiciona upload de fotos por álbum
fix(eventos): corrige filtro por período
docs(readme): atualiza instruções de instalação
```

### ESLint

- Igualdade estrita (`===`)
- Sem `console.log` em produção
- Preferência por `const`
- Arrow functions para callbacks
- Validação de React Hooks

### Prettier

- Sem ponto e vírgula
- Aspas simples
- 2 espaços de indentação
- Vírgulas trailing (ES5)
- Máximo 100 caracteres por linha

## Testes

### Executando Testes

```bash
# Modo watch (desenvolvimento)
pnpm test

# Execução única
pnpm test:run

# Com interface visual
pnpm test:ui

# Com cobertura
pnpm test:coverage

# Testes E2E
pnpm test:e2e
pnpm test:e2e:ui
```

### Estrutura de Testes

- **Unit tests** — Serviços: `authService`, `eventService`, `contributorService`, `communityService`, `profileService`, `galeriaService`
- **Component tests** — `Modal`, `ConfirmModal`, `EventCard`, `SEOHead`, `Home`, `About`, `NotFound`, `GalleryEventCard`, `AdminSidebar`, `CommunityAdmin`, `GalleryAdmin`, `Dashboard`, `Login`
- **Hook tests** — `useSidebarCollapse`
- **E2E tests** — Playwright em `e2e/`
- **Mocks** — MSW para simular APIs do Supabase

## Componentes Reutilizáveis

### Sistema de Modal

Todos os diálogos e confirmações da aplicação usam o sistema unificado em `src/components/Modal/`.

```jsx
import { Modal, ConfirmModal } from '../components/Modal'

// Modal de formulário
<Modal isOpen={open} onClose={close} title="Criar Evento" size="lg" footer={null}>
  <form>...</form>
</Modal>

// Modal de confirmação destrutiva
<ConfirmModal
  isOpen={Boolean(itemParaExcluir)}
  onClose={() => setItem(null)}
  onConfirm={handleDelete}
  title="Excluir Item"
  message={<>Deseja excluir <strong>{item.nome}</strong>?</>}
  isLoading={deleting}
/>
```

| Prop             | Tipo                   | Padrão      | Descrição                               |
| ---------------- | ---------------------- | ----------- | --------------------------------------- |
| `isOpen`         | `boolean`              | —           | Controla visibilidade                   |
| `onClose`        | `() => void`           | —           | Fecha ao clicar no X, overlay ou Escape |
| `title`          | `string`               | —           | Título do header                        |
| `size`           | `'sm' \| 'md' \| 'lg'` | `'md'`      | Largura máxima: 400 / 600 / 740px       |
| `footer`         | `ReactNode \| null`    | `undefined` | Botões de ação; `null` oculta o footer  |
| `closeOnOverlay` | `boolean`              | `true`      | Fecha ao clicar fora                    |

Recursos incluídos automaticamente: `role="dialog"`, `aria-modal`, `aria-labelledby`, trava de scroll no body, fechamento com `Escape`, movimentação e restauração de foco.

> **Exceções intencionais:** `GalleryPhotoModal` (lightbox de mídia, z-index 2000) e `FloatingMenu` (drawer de navegação mobile) não usam o sistema de Modal pois possuem UI especializada.

## Personalização

### Cores do Tema

As cores estão definidas em CSS custom properties:

```css
:root {
  --primary-blue: #2563eb;
  --dark-blue: #1d4ed8;
  --light-blue: #3b82f6;
  --background: #ffffff;
  --surface: #f8fafc;
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --border: #e2e8f0;
}

[data-theme='dark'] {
  --primary-blue: #3b82f6;
  --background: #0f172a;
  --surface: #1e293b;
  --text-primary: #f1f5f9;
}
```

### Responsividade

| Breakpoint | Tamanho       |
| ---------- | ------------- |
| Desktop    | >= 768px      |
| Tablet     | 481px - 767px |
| Mobile     | <= 480px      |

## Deploy

O projeto está configurado para deploy na Vercel com geração automática de imagens Open Graph.

### Vercel (recomendado)

Deploy automático a cada push na branch `main`. Configure as variáveis de ambiente no painel da Vercel.

```json
// vercel.json (SPA routing)
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }]
}
```

### Deploy Manual

```bash
pnpm build
# Upload da pasta dist/ para sua plataforma
```

## Contribuindo

Consulte o guia completo em [CONTRIBUTING.md](docs/CONTRIBUTING.md).

### Resumo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Faça commits seguindo o padrão Conventional Commits
4. Abra um Pull Request para `developer`
5. Aguarde revisão e aprovação

## Documentação Adicional

- [CHANGELOG.md](CHANGELOG.md) - Histórico de versões e mudanças
- [SETUP_INICIAL.md](docs/SETUP_INICIAL.md) - Montagem do ambiente (primeira vez)
- [FLUXO_DE_TRABALHO.md](docs/FLUXO_DE_TRABALHO.md) - Fluxo de trabalho diário (Git, commits, PRs)
- [FLUXO_DOCKER.md](docs/FLUXO_DOCKER.md) - Fluxo de trabalho com Docker
- [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) - Solução de problemas comuns
- [CONTRIBUTING.md](docs/CONTRIBUTING.md) - Guia de contribuição
- [SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md) - Configuração do Supabase
- [DOCKER_SETUP.md](docs/DOCKER_SETUP.md) - Instalação e configuração do Docker
- [BRANCH_PROTECTION.md](docs/BRANCH_PROTECTION.md) - Regras de proteção de branches

## Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## Autores

- **Dario Reis** - _Desenvolvedor Full Stack | React, Node.js, AWS e IA_ - [@darioreisjr](https://github.com/darioreisjr)
- **Julia Krisnarane** - _Back-end | Java | Spring Boot | AWS Cloud & IA_ - [@krisnarane](https://github.com/krisnarane)

## Agradecimentos

- Design inspirado nas melhores práticas de UX/UI
- Cores baseadas na paleta Tailwind CSS
- Comunidade Café Bugado pelo apoio e feedback
