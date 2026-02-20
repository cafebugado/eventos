# Eventos - Comunidade Café Bugado

Uma plataforma moderna e minimalista da Comunidade Café Bugado para descobrir e participar dos melhores eventos, com design limpo, dark mode, painel administrativo e animações suaves.

**Site:** [cafebugado.com.br](https://cafebugado.com.br)

## Funcionalidades

### Área Pública

- **Design Minimalista** - Interface limpa com paleta azul, branco e preto
- **Dark/Light Mode** - Alternância suave entre temas com persistência em localStorage
- **Animações Fluidas** - Transições suaves baseadas em Intersection Observer
- **Responsivo** - Design mobile-first que funciona em todos os dispositivos
- **Tempo Real** - Sincronização automática com banco de dados Supabase
- **Curadoria** - Eventos selecionados e verificados pela comunidade

### Painel Administrativo

- **Autenticação** - Login seguro via Supabase Auth
- **CRUD de Eventos** - Criar, editar, visualizar e excluir eventos
- **Tags de Tecnologia** - CRUD de tags com cor customizada e preview em tempo real
- **Modalidade** - Presencial, Online ou Híbrido para cada evento
- **Localização** - Endereço, cidade e estado com link para Google Maps
- **Upload de Imagens** - Upload direto para Supabase Storage
- **Estatísticas** - Visualização de eventos por período
- **Validação de Formulários** - React Hook Form com validações
- **Controle de Acesso (RBAC)** - Permissões granulares por papel: super_admin, admin e moderador
- **Perfil de Usuário** - Todos os papéis podem configurar nome, sobrenome e avatar via GitHub
- **Dashboard do Moderador** - Stats clicáveis com visualização de contribuições, eventos da semana e próximos eventos
- **Recomendações de Eventos** - Sugestões baseadas em tags e proximidade de data carregadas via lazy-load na página de detalhe
- **EventCard Reutilizável** - Componente unificado com variantes `compact` e `full` usado em toda a aplicação

## Tecnologias Utilizadas

### Frontend

| Tecnologia       | Versão  | Descrição                    |
| ---------------- | ------- | ---------------------------- |
| React            | 19.1.1  | Biblioteca para interfaces   |
| React Router DOM | 7.13.0  | Roteamento SPA               |
| React Hook Form  | 7.54.2  | Gerenciamento de formulários |
| Lucide React     | 0.469.0 | Biblioteca de ícones         |
| Vite             | 7.1.2   | Build tool moderno           |

### Backend & Database

| Tecnologia | Versão | Descrição                  |
| ---------- | ------ | -------------------------- |
| Supabase   | 2.93.2 | PostgreSQL, Auth e Storage |

### Qualidade de Código

| Ferramenta  | Versão | Descrição                  |
| ----------- | ------ | -------------------------- |
| ESLint      | 9.33.0 | Linting de código          |
| Prettier    | 3.5.0  | Formatação de código       |
| Husky       | 9.1.0  | Git hooks                  |
| Commitlint  | 19.8.0 | Validação de commits       |
| lint-staged | 15.5.0 | Linting em arquivos staged |

### Testes

| Ferramenta      | Versão | Descrição                  |
| --------------- | ------ | -------------------------- |
| Vitest          | 4.0.18 | Framework de testes        |
| Testing Library | 16.3.2 | Utilitários de teste React |
| MSW             | 2.12.7 | Mock de APIs               |
| jsdom           | 27.4.0 | Ambiente DOM para testes   |

## Instalação

### Pré-requisitos

- Node.js 20+
- pnpm (recomendado) ou npm
- Docker e Docker Compose (opcional)

### Passos (Tradicional)

1. Clone o repositório:

```bash
git clone https://github.com/seu-usuario/agendas_eventos.git
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

# Google Sheets (opcional - legado)
VITE_GOOGLE_SHEET_URL=https://docs.google.com/spreadsheets/...
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
git clone https://github.com/seu-usuario/agendas_eventos.git
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
│   ├── admin/                    # Painel administrativo
│   │   ├── Login.jsx             # Página de login
│   │   ├── Login.test.jsx        # Testes do login
│   │   ├── Dashboard.jsx         # Dashboard de eventos
│   │   ├── Dashboard.test.jsx    # Testes do dashboard
│   │   └── Admin.css             # Estilos do admin
│   │
│   ├── components/               # Componentes reutilizáveis
│   │   ├── EventCard.jsx         # Card de evento (variant compact/full)
│   │   ├── EventCard.test.jsx    # Testes do EventCard
│   │   ├── EventCard.css         # Estilos do EventCard
│   │   ├── EventRecommendations.jsx  # Recomendações lazy no detalhe do evento
│   │   ├── EventRecommendations.css  # Estilos das recomendações
│   │   ├── UpcomingEvents.jsx    # Seção de próximos eventos (home)
│   │   └── ...                   # Demais componentes
│   │
│   ├── pages/                    # Páginas públicas
│   │   ├── Home.jsx              # Landing page
│   │   ├── Home.test.jsx         # Testes da home
│   │   ├── NotFound.jsx          # Página 404
│   │   └── NotFound.test.jsx     # Testes do 404
│   │
│   ├── services/                 # Serviços e API
│   │   ├── authService.js        # Autenticação
│   │   ├── authService.test.js   # Testes de auth
│   │   ├── eventService.js       # CRUD de eventos
│   │   ├── eventService.test.js  # Testes de eventos
│   │   ├── contributorService.js # CRUD de contribuintes
│   │   ├── profileService.js     # Perfil do usuário (nome, sobrenome, avatar)
│   │   └── tagService.js         # CRUD de tags e associação
│   │
│   ├── lib/                      # Configurações
│   │   └── supabase.js           # Cliente Supabase
│   │
│   ├── test/                     # Infraestrutura de testes
│   │   ├── setup.js              # Configuração global
│   │   ├── utils.jsx             # Utilitários de teste
│   │   └── mocks/                # Mocks de API
│   │       ├── server.js         # Servidor MSW
│   │       └── handlers.js       # Handlers de mock
│   │
│   ├── assets/                   # Assets estáticos
│   ├── App.jsx                   # Listagem de eventos
│   ├── App.css                   # Estilos principais
│   └── main.jsx                  # Entrada com rotas
│
├── public/                       # Arquivos públicos
│   └── eventos.png               # Imagem padrão
│
├── .github/
│   ├── workflows/                # CI/CD
│   │   ├── ci.yml                # Pipeline principal
│   │   ├── pr-developer.yml      # PRs para developer
│   │   └── pr-main.yml           # PRs para main
│   └── (workflows apenas)
│
├── supabase/                     # Configurações Supabase
├── Dockerfile                    # Build de produção (multi-stage)
├── Dockerfile.dev                # Build de desenvolvimento
├── docker-compose.yml            # Orquestração dos containers
├── nginx.conf                    # Configuração do Nginx (produção)
├── .dockerignore                 # Arquivos ignorados pelo Docker
└── dist/                         # Build de produção
```

## Rotas da Aplicação

| Rota               | Componente   | Descrição                |
| ------------------ | ------------ | ------------------------ |
| `/`                | Home         | Landing page             |
| `/eventos`         | App          | Listagem de eventos      |
| `/evento/:id`      | EventDetails | Detalhes do evento       |
| `/admin`           | Login        | Login administrativo     |
| `/admin/dashboard` | Dashboard    | Gerenciamento de eventos |
| `/*`               | NotFound     | Página 404               |

## Configuração do Supabase

Para configurar o Supabase, consulte o guia detalhado em [SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md).

### Tabela de Eventos

```sql
CREATE TABLE eventos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  data_evento DATE NOT NULL,
  horario TIME NOT NULL,
  dia_semana VARCHAR(20),
  periodo VARCHAR(20),
  link TEXT,
  imagem TEXT,
  modalidade TEXT,
  endereco TEXT,
  cidade TEXT,
  estado TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Tabela de Tags

```sql
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL UNIQUE,
  cor TEXT DEFAULT '#2563eb',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Tabela de Associação Evento-Tags

```sql
CREATE TABLE evento_tags (
  evento_id UUID REFERENCES eventos(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (evento_id, tag_id)
);
```

### Controle de Acesso (RBAC)

| Permissão               | super_admin | admin | moderador          |
| ----------------------- | ----------- | ----- | ------------------ |
| Criar eventos           | ✅          | ✅    | ✅                 |
| Editar eventos          | ✅          | ✅    | ✅                 |
| Excluir eventos         | ✅          | ✅    | Apenas os próprios |
| Criar tags              | ✅          | ✅    | ✅                 |
| Editar tags             | ✅          | ✅    | Apenas as próprias |
| Excluir tags            | ✅          | ✅    | Apenas as próprias |
| Gerenciar contribuintes | ✅          | ✅    | ❌                 |
| Gerenciar usuários      | ✅          | ❌    | ❌                 |
| Upload de imagens       | ✅          | ✅    | ✅                 |

### Períodos Disponíveis

- Matinal
- Diurno
- Vespertino
- Noturno

### Modalidades Disponíveis

- Presencial
- Online
- Híbrido

## CI/CD

O projeto utiliza GitHub Actions para integração e entrega contínuas.

### Workflows

| Workflow           | Trigger        | Descrição                              |
| ------------------ | -------------- | -------------------------------------- |
| `ci.yml`           | Push/PR        | Lint, build e upload de artefatos      |
| `pr-developer.yml` | PR → developer | Validação de origem + CI               |
| `pr-main.yml`      | PR → main      | Validação rigorosa + análise de bundle |

### Fluxo de Branches

```
feature/* ──┐
fix/*     ──┼──► developer (1 aprovação) ──► main (2 aprovações)
hotfix/*  ──┘
```

### Requisitos para Merge

**Branch `developer`:**

- Origem: `feature/*`, `fix/*` ou `hotfix/*`
- CI passando (lint + build)
- 1 aprovação de revisão

**Branch `main` (produção):**

- Origem: apenas `developer`
- CI passando (lint + build)
- 2 aprovações de revisão

## Padrões de Código

### Commits (Conventional Commits)

```
tipo(escopo): descrição

Tipos: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert
```

Exemplos:

```bash
feat(admin): adiciona upload de imagens
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
```

### Estrutura de Testes

- **Unit tests**: Serviços (`authService`, `eventService`)
- **Component tests**: Componentes React com Testing Library
- **Mocks**: MSW para simular APIs do Supabase

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

O projeto está configurado para deploy na Vercel.

### Configuração (vercel.json)

```json
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

- [SETUP_INICIAL.md](docs/SETUP_INICIAL.md) - Montagem do ambiente (primeira vez)
- [FLUXO_DE_TRABALHO.md](docs/FLUXO_DE_TRABALHO.md) - Fluxo de trabalho diario (Git, commits, PRs)
- [FLUXO_DOCKER.md](docs/FLUXO_DOCKER.md) - Fluxo de trabalho com Docker
- [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) - Solucao de problemas comuns
- [CONTRIBUTING.md](docs/CONTRIBUTING.md) - Guia de contribuicao
- [SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md) - Configuracao do Supabase
- [DOCKER_SETUP.md](docs/DOCKER_SETUP.md) - Instalacao e configuracao do Docker
- [BRANCH_PROTECTION.md](docs/BRANCH_PROTECTION.md) - Regras de protecao de branches

## Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## Autores

- **Dario Reis** - _Desenvolvedor Full Stack | Criando soluções com React, Node.js, AWS e IA_ - [@darioreisjr](https://github.com/darioreisjr)
- **Julia Krisnarane** - _Back-end | Java | Spring Boot | AWS Cloud & IA_ - [@krisnarane](https://github.com/krisnarane)

## Agradecimentos

- Design inspirado nas melhores práticas de UX/UI
- Cores baseadas na paleta Tailwind CSS
- Comunidade Café Bugado pelo apoio e feedback
