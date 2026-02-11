# Guia de Contribuição

Este documento descreve os padrões e práticas para contribuir com o projeto **Eventos - Comunidade Café Bugado**.

## Configuração do Ambiente

```bash
# Instalar dependências
pnpm install

# Iniciar ambiente de desenvolvimento
pnpm dev
```

## Scripts Disponíveis

| Comando             | Descrição                                |
| ------------------- | ---------------------------------------- |
| `pnpm dev`          | Inicia o servidor de desenvolvimento     |
| `pnpm build`        | Gera build de produção                   |
| `pnpm lint`         | Verifica erros de linting                |
| `pnpm lint:fix`     | Corrige erros de linting automaticamente |
| `pnpm format`       | Formata todos os arquivos com Prettier   |
| `pnpm format:check` | Verifica se os arquivos estão formatados |

## Padrão de Commits (Conventional Commits)

Utilizamos o padrão **Conventional Commits** para manter um histórico limpo e gerar changelogs automaticamente.

### Formato

```
<tipo>(<escopo>): <descrição>

[corpo opcional]

[rodapé opcional]
```

### Tipos Permitidos

| Tipo       | Descrição                     | Exemplo                                   |
| ---------- | ----------------------------- | ----------------------------------------- |
| `feat`     | Nova funcionalidade           | `feat(auth): adiciona login com Google`   |
| `fix`      | Correção de bug               | `fix(eventos): corrige filtro de data`    |
| `docs`     | Documentação                  | `docs: atualiza README`                   |
| `style`    | Formatação (não afeta código) | `style: aplica prettier`                  |
| `refactor` | Refatoração de código         | `refactor(api): simplifica chamadas HTTP` |
| `perf`     | Melhorias de performance      | `perf(lista): adiciona virtualização`     |
| `test`     | Adição/correção de testes     | `test(auth): adiciona testes de login`    |
| `build`    | Alterações no build           | `build: atualiza vite para v7`            |
| `ci`       | Alterações no CI/CD           | `ci: adiciona workflow de deploy`         |
| `chore`    | Tarefas gerais                | `chore: atualiza dependências`            |
| `revert`   | Reverter commit anterior      | `revert: reverte feat(auth)`              |

### Regras

- **Tipo**: obrigatório, minúsculas
- **Escopo**: opcional, entre parênteses
- **Descrição**: obrigatória, minúsculas, máximo 72 caracteres
- **Header total**: máximo 100 caracteres

### Exemplos

```bash
# Boa prática
git commit -m "feat(eventos): adiciona exportação para CSV"
git commit -m "fix(admin): corrige validação de formulário"
git commit -m "docs: adiciona guia de contribuição"

# Evitar
git commit -m "Adicionei feature"  # Sem tipo
git commit -m "FEAT: nova feature"  # Maiúsculas
git commit -m "feat: implementei a funcionalidade de exportação de eventos para arquivo CSV com suporte a múltiplos formatos"  # Muito longo
```

## Regras de Código

### ESLint

O projeto utiliza ESLint com regras específicas:

- **Sem `console.log`**: Use `console.warn` ou `console.error` quando necessário
- **Sempre use `===`**: Comparações estritas
- **Prefira `const`**: Use `let` apenas quando necessário
- **Arrow functions**: Prefira em callbacks
- **Sem variáveis não utilizadas**: Exceto as que começam com `_` ou maiúsculas

### Prettier

Formatação automática configurada:

- Sem ponto e vírgula
- Aspas simples
- 2 espaços de indentação
- Vírgula final (trailing comma)
- Máximo 100 caracteres por linha

## Git Hooks

Os hooks são executados automaticamente:

### Pre-commit

Antes de cada commit:

1. Executa ESLint nos arquivos modificados
2. Formata com Prettier
3. Bloqueia commit se houver erros

### Commit-msg

Valida a mensagem de commit seguindo o padrão Conventional Commits.

## Fluxo de Trabalho (Git Flow)

Este projeto segue um fluxo de branches rigoroso para garantir qualidade e revisão de código.

### Estrutura de Branches

```
feature/* ──┐
fix/*     ──┼──► developer ──► main (produção)
hotfix/*  ──┘
              (1 aprovação)    (2 aprovações)
```

### Regras Importantes

| Branch      | Pode receber PR de               | Aprovações necessárias |
| ----------- | -------------------------------- | ---------------------- |
| `developer` | `feature/*`, `fix/*`, `hotfix/*` | 1 aprovação            |
| `main`      | **Apenas** `developer`           | 2 aprovações           |

### Passo a Passo

1. **Crie uma branch** a partir de `developer`:

   ```bash
   # Atualize a developer primeiro
   git checkout developer
   git pull origin developer

   # Crie sua branch de feature
   git checkout -b feature/nome-da-feature
   ```

2. **Faça commits** seguindo o padrão:

   ```bash
   git commit -m "feat(escopo): descrição clara"
   ```

3. **Mantenha atualizado** com a developer:

   ```bash
   git pull origin developer --rebase
   ```

4. **Envie sua branch** para o repositório:

   ```bash
   git push -u origin feature/nome-da-feature
   ```

5. **Abra um Pull Request** para `developer`:
   - Descreva as mudanças claramente
   - Aguarde o CI passar (lint, testes, build)
   - Solicite revisão de **1 pessoa**
   - Após aprovação, faça o merge

6. **Para enviar para produção** (developer → main):
   - Abra um PR de `developer` para `main`
   - Aguarde o CI passar
   - Solicite revisão de **2 pessoas**
   - Após 2 aprovações, faça o merge

### CI/CD Pipeline

Toda branch e PR passa pelos seguintes checks:

- **Lint**: Verifica formatação (Prettier) e erros (ESLint)
- **Testes**: Executa todos os testes com Vitest
- **Build**: Garante que o projeto compila sem erros

### Exemplos de Branches

```bash
# Features
feature/adicionar-login
feature/exportar-csv
feature/melhorar-dashboard

# Correções
fix/corrigir-filtro-data
fix/resolver-erro-login

# Hotfixes (correções urgentes)
hotfix/corrigir-crash-producao
```

### O que NÃO fazer

- ❌ Push direto na `main`
- ❌ Push direto na `developer`
- ❌ PR de feature diretamente para `main`
- ❌ Merge sem aprovações necessárias
- ❌ Merge com CI falhando

## Estrutura do Projeto

```
src/
├── admin/          # Componentes do painel admin
├── pages/          # Páginas públicas
├── services/       # Serviços de API (Supabase)
├── lib/            # Utilitários e configurações
├── assets/         # Arquivos estáticos
├── App.jsx         # Componente principal
└── main.jsx        # Entry point
```

## Dúvidas

Se tiver dúvidas sobre os padrões, converse com a equipe antes de fazer alterações significativas.
