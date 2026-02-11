# Fluxo de Trabalho com Docker - Guia do Dia a Dia

Guia exclusivo para quem usa **Docker** no desenvolvimento do projeto **Eventos - Comunidade Cafe Bugado**. Se voce roda o projeto localmente com `pnpm dev`, consulte o [FLUXO_DE_TRABALHO.md](FLUXO_DE_TRABALHO.md).

---

## Pre-requisitos

| Ferramenta         | Versao Minima | Como verificar           |
| ------------------ | ------------- | ------------------------ |
| **Docker**         | 24.x          | `docker --version`       |
| **Docker Compose** | 2.x           | `docker compose version` |
| **Git**            | 2.x           | `git --version`          |

> **Windows**: O Docker Desktop precisa estar **rodando** (icone na bandeja do sistema).

---

## Setup Inicial (Apenas na Primeira Vez)

Se voce ainda nao fez o setup, siga o [SETUP_INICIAL.md](SETUP_INICIAL.md) completo primeiro. Abaixo esta o resumo para Docker:

```bash
# 1. Clonar o repositorio
git clone https://github.com/cafebugado/agendas-eventos.git
cd agendas-eventos

# 2. Configurar variaveis de ambiente
cp .env.example .env
# Edite o .env com as credenciais do Supabase

# 3. Subir o container pela primeira vez (faz build automaticamente)
docker-compose up app-dev
```

Acesse: **http://localhost:5173**

---

## Fluxo Diario Completo

### Passo 1 - Abrir o Docker Desktop

**Windows/Mac**: Abra o Docker Desktop e aguarde ele iniciar completamente.

Verifique se esta funcionando:

```bash
docker info
```

### Passo 2 - Atualizar a branch developer

```bash
git checkout developer
git pull origin developer
```

### Passo 3 - Criar sua branch de trabalho

```bash
git checkout -b feature/nome-da-tarefa
```

> Nomenclatura: `feature/`, `fix/` ou `hotfix/` seguido de descricao em kebab-case.

### Passo 4 - Subir o container de desenvolvimento

```bash
# Primeira vez ou apos mudar dependencias
docker-compose up --build app-dev

# Demais vezes (mais rapido)
docker-compose up app-dev
```

Acesse: **http://localhost:5173**

> O terminal fica preso mostrando logs. Para rodar em background, adicione `-d`:
>
> ```bash
> docker-compose up -d app-dev
> ```

### Passo 5 - Desenvolver

Edite os arquivos normalmente no seu editor. O **hot reload** esta configurado - as alteracoes em `src/` aparecem automaticamente no navegador.

> **Nota Windows/Mac**: O hot reload usa polling (`CHOKIDAR_USEPOLLING=true`), pode haver um pequeno delay de 1-2 segundos.

### Passo 6 - Rodar comandos dentro do container

Para lint, testes ou qualquer comando pnpm, execute **dentro do container**:

```bash
# Verificar linting
docker-compose exec app-dev pnpm lint

# Corrigir linting
docker-compose exec app-dev pnpm lint:fix

# Formatar codigo
docker-compose exec app-dev pnpm format

# Rodar testes
docker-compose exec app-dev pnpm test:run

# Testes com cobertura
docker-compose exec app-dev pnpm test:coverage
```

> **Dica**: Se o container esta rodando em background (`-d`), esses comandos funcionam normalmente. Se esta em foreground, abra **outro terminal**.

### Passo 7 - Fazer commits

Os commits sao feitos **no seu terminal local** (nao dentro do container):

```bash
# Adicionar arquivos
git add src/pages/Home.jsx src/components/NovoComponente.jsx

# Commit seguindo o padrao
git commit -m "feat(eventos): adiciona filtro por cidade"
```

> O Husky roda o lint-staged e commitlint automaticamente. Se falhar, corrija e tente novamente.

### Passo 8 - Push e Pull Request

```bash
# Enviar para o GitHub
git push -u origin feature/nome-da-tarefa
```

Abra o PR no GitHub apontando para `developer`.

### Passo 9 - Parar o container ao terminar

```bash
# Se rodando em foreground: Ctrl+C

# Se rodando em background:
docker-compose down
```

---

## Referencia Rapida de Comandos Docker

### Gerenciamento do Container

| Comando                             | O que faz                       |
| ----------------------------------- | ------------------------------- |
| `docker-compose up app-dev`         | Inicia o container (foreground) |
| `docker-compose up -d app-dev`      | Inicia em background            |
| `docker-compose up --build app-dev` | Reconstroi e inicia             |
| `docker-compose down`               | Para e remove containers        |
| `docker-compose restart app-dev`    | Reinicia o container            |
| `docker-compose stop app-dev`       | Para sem remover                |
| `docker-compose start app-dev`      | Inicia container parado         |

### Logs e Monitoramento

| Comando                                 | O que faz                     |
| --------------------------------------- | ----------------------------- |
| `docker-compose logs app-dev`           | Ver todos os logs             |
| `docker-compose logs -f app-dev`        | Acompanhar logs em tempo real |
| `docker-compose logs --tail 50 app-dev` | Ultimas 50 linhas de log      |
| `docker-compose ps`                     | Ver containers rodando        |

### Executar Comandos no Container

| Comando                                          | O que faz                       |
| ------------------------------------------------ | ------------------------------- |
| `docker-compose exec app-dev pnpm lint`          | Rodar lint                      |
| `docker-compose exec app-dev pnpm lint:fix`      | Corrigir lint                   |
| `docker-compose exec app-dev pnpm format`        | Formatar codigo                 |
| `docker-compose exec app-dev pnpm test:run`      | Rodar testes                    |
| `docker-compose exec app-dev pnpm test:coverage` | Testes com cobertura            |
| `docker-compose exec app-dev pnpm build`         | Gerar build                     |
| `docker-compose exec app-dev sh`                 | Abrir shell dentro do container |

### Limpeza

| Comando                         | O que faz                          |
| ------------------------------- | ---------------------------------- |
| `docker-compose down --volumes` | Remove containers e volumes        |
| `docker system prune`           | Remove recursos nao usados         |
| `docker system prune -a`        | Remove tudo (imagens, cache, etc.) |
| `docker images`                 | Listar imagens                     |
| `docker rmi <image_id>`         | Remover imagem especifica          |

---

## Ambientes Docker Disponiveis

O projeto tem 3 ambientes Docker configurados:

### 1. Desenvolvimento (uso diario)

```bash
docker-compose up app-dev
```

- **Porta**: 5173
- **Hot reload**: Sim (alteracoes em `src/` refletem automaticamente)
- **Volume**: Codigo local montado no container
- **Recursos**: CPU 1.0 / Memoria 1GB

### 2. Staging (validacao pre-producao)

```bash
docker-compose --profile staging up app-staging
```

- **Porta**: 3000
- **Hot reload**: Nao (build estatico com Nginx)
- **Uso**: Testar a build antes de ir para producao
- **Recursos**: CPU 0.5 / Memoria 256MB

### 3. Producao (simular producao local)

```bash
docker-compose --profile production up app-prod
```

- **Porta**: 80
- **Hot reload**: Nao (build estatico com Nginx + gzip)
- **Uso**: Simular exatamente o ambiente de producao
- **Recursos**: CPU 1.0 / Memoria 512MB

---

## Quando Reconstruir o Container

### PRECISA reconstruir (`--build`):

- Adicionou/removeu dependencia no `package.json`
- Alterou o `Dockerfile.dev`
- Alterou o `docker-compose.yml`

```bash
docker-compose up --build app-dev
```

### NAO precisa reconstruir:

- Alterou arquivos em `src/` (hot reload cuida disso)
- Alterou o `.env` (apenas reinicie)

```bash
# Para mudancas no .env
docker-compose restart app-dev
```

---

## Checklist Diario com Docker

```bash
# 1. Abrir Docker Desktop (Windows/Mac)

# 2. Atualizar developer
git checkout developer
git pull origin developer

# 3. Criar branch
git checkout -b feature/minha-tarefa

# 4. Subir container
docker-compose up app-dev

# 5. Desenvolver (editar arquivos normalmente)

# 6. Testar (em outro terminal)
docker-compose exec app-dev pnpm lint
docker-compose exec app-dev pnpm test:run

# 7. Commit (terminal local)
git add arquivos-modificados
git commit -m "feat(escopo): descricao"

# 8. Push
git push -u origin feature/minha-tarefa

# 9. Abrir PR no GitHub para developer

# 10. Parar container
docker-compose down

# 11. Apos merge, limpeza
git checkout developer
git pull origin developer
git branch -d feature/minha-tarefa
```

---

## Solucao de Problemas Docker

### Container nao inicia

```bash
# Reconstrua do zero
docker-compose down
docker-compose up --build app-dev
```

### Hot reload nao funciona

O polling ja esta configurado. Se ainda nao funcionar:

```bash
# Reinicie o container
docker-compose restart app-dev

# Se persistir, reconstrua
docker-compose down
docker-compose up --build app-dev
```

### Porta 5173 em uso

```bash
# Verifique o que esta usando a porta
# Windows
netstat -ano | findstr :5173

# Pare qualquer processo usando a porta e tente novamente
```

### Erro "no space left on device"

```bash
# Limpar cache do Docker
docker system prune -a
```

### Dependencias desatualizadas no container

```bash
# Reconstrua para reinstalar
docker-compose down
docker-compose up --build app-dev
```

### Container lento (Windows)

O Docker no Windows pode ser mais lento por causa do WSL2. Dicas:

- Certifique-se de que o Docker Desktop usa WSL2 (Settings > General)
- Mantenha o projeto dentro do filesystem do WSL para melhor performance
- Feche programas pesados durante o desenvolvimento

---

## Dicas de Produtividade

### Alias uteis (adicione ao seu .bashrc ou .zshrc)

```bash
# Alias para comandos frequentes
alias dcup="docker-compose up app-dev"
alias dcupd="docker-compose up -d app-dev"
alias dcdown="docker-compose down"
alias dcbuild="docker-compose up --build app-dev"
alias dclogs="docker-compose logs -f app-dev"
alias dclint="docker-compose exec app-dev pnpm lint"
alias dctest="docker-compose exec app-dev pnpm test:run"
alias dcsh="docker-compose exec app-dev sh"
```

Com os alias:

```bash
dcup        # Inicia container
dclint      # Roda lint
dctest      # Roda testes
dcdown      # Para container
```

### VS Code + Docker

Instale a extensao **Dev Containers** (`ms-vscode-remote.remote-containers`) para editar arquivos diretamente dentro do container com suporte completo de IntelliSense.

---

Para mais detalhes sobre o fluxo de Git (commits, PRs, branches), consulte o [FLUXO_DE_TRABALHO.md](FLUXO_DE_TRABALHO.md).

Para problemas gerais (nao relacionados ao Docker), consulte o [TROUBLESHOOTING.md](TROUBLESHOOTING.md).
