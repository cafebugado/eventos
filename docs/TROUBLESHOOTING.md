# Troubleshooting - Solucao de Problemas

Guia de resolucao dos erros mais comuns no projeto **Eventos - Comunidade Cafe Bugado**.

---

## Problemas de Instalacao

### `pnpm: command not found`

O pnpm nao esta instalado ou nao esta no PATH.

```bash
# Instalar via npm
npm install -g pnpm

# OU via corepack
corepack enable
corepack prepare pnpm@latest --activate
```

Feche e reabra o terminal apos instalar.

### `ERR_PNPM_FROZEN_LOCKFILE` ao rodar `pnpm install`

O lockfile esta desatualizado em relacao ao `package.json`.

```bash
# Se voce nao alterou o package.json, atualize o lockfile
pnpm install --no-frozen-lockfile
```

### `node: --openssl-legacy-provider is not allowed`

Voce esta usando uma versao antiga do Node.js. Atualize para Node 20+.

```bash
node --version
# Se for menor que 20, atualize no site https://nodejs.org
```

---

## Problemas ao Rodar o Projeto

### Tela branca / Erro de conexao com Supabase

**Causa**: Arquivo `.env` ausente ou com credenciais erradas.

```bash
# Verifique se o .env existe
ls .env

# Se nao existe, crie a partir do exemplo
cp .env.example .env

# Edite e preencha com as credenciais corretas
# VITE_SUPABASE_URL=https://...
# VITE_SUPABASE_ANON_KEY=...
```

Apos editar o `.env`, reinicie o servidor:

```bash
# Pare o servidor (Ctrl+C)
# Inicie novamente
pnpm dev
```

### Porta 5173 ja esta em uso

```bash
# Windows - encontrar o processo usando a porta
netstat -ano | findstr :5173

# Matar o processo (substitua PID pelo numero encontrado)
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :5173
kill -9 <PID>
```

Ou mude a porta no `vite.config.js` temporariamente.

### Hot reload nao funciona (alteracoes nao aparecem)

**No Docker (Windows/Mac)**:

O hot reload via Docker pode ser lento. Verifique se o polling esta ativo:

```bash
# Ja esta configurado no docker-compose.yml:
# CHOKIDAR_USEPOLLING=true
```

Se ainda nao funcionar, tente rodar localmente em vez de Docker:

```bash
docker-compose down
pnpm dev
```

**Localmente**: Tente limpar o cache do Vite:

```bash
# Pare o servidor e limpe cache
rm -rf node_modules/.vite
pnpm dev
```

---

## Problemas com Git

### Commit rejeitado pelo lint (pre-commit hook)

O Husky bloqueia commits com erros de lint.

```bash
# Veja os erros
pnpm lint

# Corrija automaticamente
pnpm lint:fix
pnpm format

# Adicione as correcoes
git add .

# Tente novamente
git commit -m "feat(escopo): descricao"
```

### Commit rejeitado pelo commitlint (mensagem invalida)

A mensagem nao segue o padrao Conventional Commits.

**Exemplos de mensagens ERRADAS:**

```bash
git commit -m "Adicionei feature"           # Sem tipo
git commit -m "FEAT: nova feature"           # Maiusculas
git commit -m "feat: Adiciona filtro"        # Subject com maiuscula
git commit -m "feat: adiciona filtro."       # Ponto final
git commit -m "feat: mensagem muito longa que ultrapassa o limite de setenta e dois caracteres no subject"
```

**Exemplos de mensagens CORRETAS:**

```bash
git commit -m "feat(eventos): adiciona filtro por cidade"
git commit -m "fix(admin): corrige validacao de formulario"
git commit -m "docs: atualiza guia de contribuicao"
git commit -m "style: aplica prettier nos componentes"
```

### Conflitos no rebase

```bash
# 1. O Git mostra quais arquivos tem conflito
git status

# 2. Abra cada arquivo com conflito
#    Procure por marcadores:
#    <<<<<<< HEAD
#    (seu codigo)
#    =======
#    (codigo da developer)
#    >>>>>>> developer

# 3. Resolva manualmente: escolha qual codigo manter
#    e remova os marcadores (<<<<, ====, >>>>)

# 4. Marque como resolvido
git add arquivo-resolvido.jsx

# 5. Continue o rebase
git rebase --continue

# Se quiser cancelar o rebase e voltar ao estado anterior
git rebase --abort
```

### `fatal: not a git repository`

Voce nao esta na pasta do projeto.

```bash
cd agendas-eventos
git status
```

### Branch local desatualizada

```bash
git checkout developer
git pull origin developer
```

---

## Problemas com Docker

### `docker: command not found`

Docker nao esta instalado. Baixe em [https://www.docker.com/get-started](https://www.docker.com/get-started).

**Windows**: Certifique-se de que o Docker Desktop esta rodando (icone na bandeja do sistema).

### Container nao inicia / erro de build

```bash
# Reconstrua o container do zero
docker-compose down
docker-compose up --build app-dev
```

### `ENOSPC: no space left on device` (Docker)

Espaco em disco cheio no Docker.

```bash
# Limpar imagens e containers antigos
docker system prune -a
```

### Dependencias novas nao aparecem no container

Apos adicionar dependencias ao `package.json`, reconstrua:

```bash
docker-compose down
docker-compose up --build app-dev
```

---

## Problemas com Testes

### Testes falhando com erro de import/module

```bash
# Limpe o cache e rode novamente
pnpm test:run
```

### Testes de E2E falhando

```bash
# Instale os browsers do Playwright (primeira vez)
npx playwright install

# Certifique-se de que o servidor esta rodando
pnpm dev

# Em outro terminal, rode os testes
pnpm test:e2e
```

### Coverage abaixo do minimo (60%)

O projeto exige cobertura minima de 60%. Adicione testes para o codigo novo:

```bash
# Veja o relatorio detalhado
pnpm test:coverage

# O relatorio mostra quais arquivos precisam de mais testes
```

---

## Problemas com CI/CD (GitHub Actions)

### CI falhou no PR

Clique em **"Details"** ao lado do check que falhou no PR para ver o log completo.

**Erros comuns:**

| Erro no CI                   | Solucao                              |
| ---------------------------- | ------------------------------------ |
| Lint failed                  | `pnpm lint:fix && pnpm format`       |
| Tests failed                 | `pnpm test:run` e corrija            |
| Build failed                 | `pnpm build` e corrija               |
| Branch origin invalid        | Verifique se o PR e para `developer` |
| Bundle size exceeded (512KB) | Reduza o tamanho do bundle           |

### PR nao pode ser mergeado

Verifique:

1. CI esta verde (todos os checks passaram)?
2. Tem aprovacoes suficientes? (1 para developer, 2 para main)
3. Nao ha conversas nao resolvidas?
4. A branch esta atualizada com a base?

```bash
# Atualizar branch com a base
git pull origin developer --rebase
git push --force-with-lease
```

---

## Problemas com Supabase

### Erro de autenticacao no admin

1. Verifique se o usuario existe no Supabase Dashboard > Authentication > Users
2. Verifique se o email e senha estao corretos
3. Verifique se o usuario foi confirmado (Auto Confirm ativado)

### Imagens nao carregam

1. Verifique se o bucket `imagens` existe no Supabase Storage
2. Verifique se o bucket esta marcado como **Public**
3. Verifique as politicas de acesso do bucket

### Dados nao aparecem

1. Verifique as credenciais no `.env`
2. Verifique se as tabelas existem no Supabase (SQL Editor > ver tabelas)
3. Verifique o console do navegador (F12) para erros de API

---

## Comandos Uteis de Emergencia

```bash
# Desfazer alteracoes em um arquivo (volta ao ultimo commit)
git checkout -- nome-do-arquivo.jsx

# Desfazer todas as alteracoes nao commitadas
git checkout -- .

# Desfazer o ultimo commit (mantendo as alteracoes)
git reset --soft HEAD~1

# Ver historico de commits da branch
git log --oneline -20

# Ver diferenca entre sua branch e developer
git diff developer

# Verificar status dos arquivos
git status

# Ver branches locais
git branch

# Ver branches remotas
git branch -r
```

---

## Contato e Ajuda

Se nenhuma das solucoes acima resolver:

1. Procure o erro no historico de Issues do GitHub
2. Pergunte no canal da equipe
3. Abra uma Issue detalhando o problema, incluindo:
   - Sistema operacional
   - Versao do Node.js (`node --version`)
   - Mensagem de erro completa
   - Passos para reproduzir
