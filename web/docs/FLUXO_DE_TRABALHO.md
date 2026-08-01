# Fluxo de Trabalho - Guia do Dia a Dia

Guia para trabalhar no projeto **Eventos - Comunidade Cafe Bugado**. Siga este passo a passo toda vez que for implementar algo novo, corrigir um bug ou fazer qualquer alteracao.

---

## Visao Geral do Fluxo

```
feature/* ───┐
fix/*     ───┼──► developer ──► main (producao)
hotfix/*  ───┘
               (1 aprovacao)    (2 aprovacoes)
```

- **Voce nunca faz push direto em `main` ou `developer`**
- Sempre trabalha em uma branch separada
- Abre Pull Request (PR) para `developer`
- Depois de acumuladas features, `developer` vai para `main`

---

## Passo 1 - Atualizar a Branch developer

Antes de comecar qualquer trabalho, sincronize sua branch `developer` local:

```bash
# Mude para a branch developer
git checkout developer

# Baixe as atualizacoes do repositorio remoto
git pull origin developer
```

---

## Passo 2 - Criar sua Branch de Trabalho

### Nomenclatura de branches

| Tipo de trabalho          | Prefixo    | Exemplo                           |
| ------------------------- | ---------- | --------------------------------- |
| Nova funcionalidade       | `feature/` | `feature/adicionar-filtro-cidade` |
| Correcao de bug           | `fix/`     | `fix/corrigir-paginacao`          |
| Correcao urgente producao | `hotfix/`  | `hotfix/corrigir-crash-login`     |

### Criando a branch

```bash
# A partir da developer atualizada, crie sua branch
git checkout -b feature/nome-descritivo-da-tarefa
```

Exemplos:

```bash
git checkout -b feature/exportar-eventos-csv
git checkout -b fix/resolver-erro-upload-imagem
git checkout -b hotfix/corrigir-exibicao-data
```

> Use nomes curtos, descritivos e em kebab-case (palavras-separadas-por-hifen).

---

## Passo 3 - Desenvolver

### 3.1 Iniciar o servidor de desenvolvimento

```bash
# Localmente
pnpm dev

# OU via Docker
docker-compose up app-dev
```

Acesse: **http://localhost:5173**

### 3.2 Faca suas alteracoes

Edite os arquivos necessarios. Algumas dicas:

- Componentes de paginas ficam em `src/pages/`
- Componentes do admin ficam em `src/admin/`
- Componentes reutilizaveis ficam em `src/components/`
- Servicos de API ficam em `src/services/`
- Configuracoes ficam em `src/lib/`

### 3.3 Verifique o codigo enquanto desenvolve

```bash
# Verificar linting
pnpm lint

# Corrigir linting automaticamente
pnpm lint:fix

# Formatar codigo
pnpm format

# Rodar testes
pnpm test:run
```

---

## Passo 4 - Fazer Commits

### 4.1 Padrao de mensagem de commit (Obrigatorio)

O projeto usa **Conventional Commits**. O formato e:

```
tipo(escopo): descricao curta
```

### 4.2 Tipos permitidos

| Tipo       | Quando usar                         | Exemplo                                       |
| ---------- | ----------------------------------- | --------------------------------------------- |
| `feat`     | Nova funcionalidade                 | `feat(eventos): adiciona filtro por cidade`   |
| `fix`      | Correcao de bug                     | `fix(admin): corrige validacao de formulario` |
| `docs`     | Apenas documentacao                 | `docs: atualiza README`                       |
| `style`    | Formatacao (nao altera logica)      | `style: aplica prettier`                      |
| `refactor` | Refatoracao sem mudar comportamento | `refactor(api): simplifica chamadas HTTP`     |
| `perf`     | Melhoria de performance             | `perf(lista): adiciona lazy loading`          |
| `test`     | Adicionar ou corrigir testes        | `test(auth): adiciona testes de login`        |
| `build`    | Alteracoes no build/dependencias    | `build: atualiza vite para v7`                |
| `ci`       | Alteracoes no CI/CD                 | `ci: adiciona workflow de deploy`             |
| `chore`    | Tarefas gerais                      | `chore: atualiza dependencias`                |
| `revert`   | Reverter commit anterior            | `revert: reverte feat(auth)`                  |

### 4.3 Regras da mensagem

- Tipo em **minusculas** (nunca `FEAT` ou `Fix`)
- Descricao em **minusculas** (nunca `Adiciona filtro`)
- Maximo **72 caracteres** no subject
- Maximo **100 caracteres** no header total
- Sem ponto final na descricao

### 4.4 Fazendo o commit

```bash
# Adicione os arquivos modificados
git add src/pages/Home.jsx src/components/FilterCity.jsx

# Faca o commit com mensagem no padrao
git commit -m "feat(eventos): adiciona filtro por cidade"
```

> **Dica**: Prefira `git add` com arquivos especificos em vez de `git add .` para evitar commitar arquivos indesejados.

### 4.5 O que acontece automaticamente no commit

Ao fazer `git commit`, o Husky executa automaticamente:

1. **lint-staged**: Roda ESLint e Prettier nos arquivos que voce modificou
2. **commitlint**: Valida se a mensagem segue o padrao

Se algum falhar, o commit e **bloqueado**. Corrija os problemas e tente novamente:

```bash
# Se o lint falhou, corrija automaticamente
pnpm lint:fix
pnpm format

# Adicione os arquivos corrigidos novamente
git add .

# Tente o commit novamente
git commit -m "feat(eventos): adiciona filtro por cidade"
```

---

## Passo 5 - Manter sua Branch Atualizada

Se outras pessoas fizeram merges na `developer` enquanto voce trabalhava, atualize sua branch:

```bash
# Baixe as atualizacoes da developer
git pull origin developer --rebase
```

> O `--rebase` coloca seus commits por cima dos novos, mantendo o historico limpo.

### Se houver conflitos

```bash
# 1. O Git vai avisar quais arquivos tem conflito
# 2. Abra cada arquivo e resolva os conflitos manualmente
#    (procure por <<<<<<< , ======= , >>>>>>>)
# 3. Apos resolver, marque como resolvido:
git add arquivo-resolvido.jsx

# 4. Continue o rebase
git rebase --continue
```

---

## Passo 6 - Enviar sua Branch para o GitHub

```bash
# Primeira vez enviando essa branch
git push -u origin feature/nome-da-tarefa

# Vezes seguintes (na mesma branch)
git push
```

---

## Passo 7 - Abrir Pull Request (PR)

### 7.1 Pelo GitHub (interface web)

1. Acesse o repositorio no GitHub
2. Voce vera um banner amarelo: **"feature/nome-da-tarefa had recent pushes"**
3. Clique em **"Compare & pull request"**
4. Configure:
   - **Base**: `developer` (NUNCA `main` direto!)
   - **Compare**: `feature/nome-da-tarefa`
5. Preencha:
   - **Titulo**: Descricao clara e curta da mudanca
   - **Descricao**: O que foi feito, por que, e como testar
6. Clique em **"Create pull request"**

### 7.2 Pela CLI (GitHub CLI)

```bash
# Se tiver o gh instalado
gh pr create --base developer --title "feat: adiciona filtro por cidade" --body "Descricao do que foi feito"
```

### 7.3 Modelo de descricao do PR

```markdown
## O que foi feito

- Adicionado filtro de eventos por cidade
- Criado componente FilterCity reutilizavel

## Como testar

1. Acesse a pagina de eventos
2. Clique no filtro de cidade
3. Selecione uma cidade e verifique os resultados

## Screenshots (se aplicavel)

[Cole imagens aqui]
```

---

## Passo 8 - Aguardar CI e Revisao

Apos abrir o PR, automaticamente:

1. **CI roda**: lint, testes, build
2. **Revisor analisa**: 1 aprovacao necessaria para `developer`

### Se o CI falhar

Verifique os logs no GitHub (aba "Checks" do PR). Problemas comuns:

```bash
# Erro de lint
pnpm lint:fix

# Erro de formatacao
pnpm format

# Testes falhando
pnpm test:run

# Build falhando
pnpm build
```

Corrija, faca commit, e push. O CI roda novamente automaticamente.

---

## Passo 9 - Merge do PR

Apos aprovacao e CI verde:

1. Clique em **"Merge pull request"** no GitHub
2. Confirme o merge
3. Delete a branch remota (o GitHub oferece essa opcao)

### Limpeza local

```bash
# Volte para a developer
git checkout developer

# Atualize com o merge que acabou de ser feito
git pull origin developer

# Delete a branch local que ja foi mergeada
git branch -d feature/nome-da-tarefa
```

---

## Fluxo Completo Resumido (Checklist)

Use este checklist como referencia rapida toda vez que for trabalhar:

```bash
# 1. Atualizar developer
git checkout developer
git pull origin developer

# 2. Criar branch
git checkout -b feature/minha-tarefa

# 3. Desenvolver
pnpm dev
# ... faca suas alteracoes ...

# 4. Verificar codigo
pnpm lint
pnpm test:run

# 5. Commit
git add arquivos-modificados
git commit -m "feat(escopo): descricao"

# 6. Atualizar com developer (se necessario)
git pull origin developer --rebase

# 7. Push
git push -u origin feature/minha-tarefa

# 8. Abrir PR para developer no GitHub

# 9. Aguardar CI + Aprovacao

# 10. Merge + Limpeza
git checkout developer
git pull origin developer
git branch -d feature/minha-tarefa
```

---

## Docker no Dia a Dia

### Comandos mais usados

```bash
# Iniciar ambiente de desenvolvimento
docker-compose up app-dev

# Iniciar em background (sem travar o terminal)
docker-compose up -d app-dev

# Ver logs do container
docker-compose logs -f app-dev

# Parar os containers
docker-compose down

# Reconstruir o container (apos mudar Dockerfile ou dependencias)
docker-compose up --build app-dev

# Testar build de staging
docker-compose --profile staging up app-staging

# Testar build de producao
docker-compose --profile production up app-prod
```

### Quando reconstruir o container

Reconstrua (`--build`) quando:

- Alterar o `package.json` (novas dependencias)
- Alterar o `Dockerfile.dev`
- Alterar o `docker-compose.yml`

**NAO precisa** reconstruir quando:

- Altera arquivos do `src/` (o hot reload cuida disso)
- Altera o `.env` (apenas reinicie: `docker-compose restart app-dev`)

---

## Regras Importantes

### O que FAZER

- Sempre criar branch a partir de `developer`
- Sempre seguir o padrao de commits
- Sempre rodar lint e testes antes do push
- Sempre abrir PR para `developer` (nunca para `main` diretamente)
- Sempre manter sua branch atualizada com `developer`
- Sempre descrever bem o PR

### O que NAO fazer

- Push direto em `main`
- Push direto em `developer`
- PR de feature diretamente para `main`
- Merge com CI falhando
- Merge sem as aprovacoes necessarias
- Commitar o arquivo `.env`
- Usar `console.log` no codigo (use `console.warn` ou `console.error` se necessario)

---

## Proximo Passo

Se encontrar problemas durante o desenvolvimento, consulte o guia [TROUBLESHOOTING.md](TROUBLESHOOTING.md) para solucoes dos erros mais comuns.
