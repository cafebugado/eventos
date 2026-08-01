# Runbook de Operacoes

## Ambientes

| Ambiente     | URL                   | Docker Profile | Porta |
| ------------ | --------------------- | -------------- | ----- |
| **Dev**      | http://localhost:5173 | (default)      | 5173  |
| **Staging**  | http://localhost:3000 | `staging`      | 3000  |
| **Producao** | http://localhost      | `production`   | 80    |

## Deploy

### Desenvolvimento local

```bash
pnpm dev
# ou via Docker
docker-compose up app-dev
```

### Staging

```bash
docker-compose --profile staging up app-staging --build
```

### Producao (Docker)

```bash
docker-compose --profile production up app-prod --build -d
```

### Producao (Vercel)

O deploy e automatico via push para `main`.

## Rollback

### Vercel

1. Acesse **Vercel Dashboard** > **Deployments**
2. Encontre o deploy anterior
3. Clique nos **3 pontos** > **Promote to Production**

### Docker

```bash
# Listar imagens anteriores
docker images eventos-cafe-prod

# Recriar com a versao anterior do codigo
git checkout <commit-anterior>
docker-compose --profile production up app-prod --build -d
```

## Health Checks

```bash
# Liveness (nginx rodando?)
curl http://localhost/health/live

# Readiness (app pronto?)
curl http://localhost/health/ready

# Health geral
curl http://localhost/health
```

## Monitoramento

| Servico              | O que monitora               | Dashboard         |
| -------------------- | ---------------------------- | ----------------- |
| **Vercel Analytics** | Pageviews, Web Vitals        | Vercel Dashboard  |
| **Sentry**           | Erros, crashes, stack traces | sentry.io         |
| **Dependabot**       | Vulnerabilidades em deps     | GitHub > Security |

## Problemas comuns

### App nao carrega (tela branca)

1. Verificar console do browser (F12)
2. Verificar se as env vars estao configuradas
3. Verificar health check: `curl http://localhost/health`
4. Verificar logs: `docker logs eventos-cafe-prod`

### Erro de CORS

1. Verificar `connect-src` no CSP do `nginx.conf`
2. Verificar URL do Supabase no `.env`

### Build falha no CI

1. Verificar logs no GitHub Actions
2. Rodar `pnpm build` localmente
3. Verificar se `pnpm-lock.yaml` esta atualizado

### Supabase nao responde

1. Verificar status em https://status.supabase.com
2. Verificar se a chave anon key esta correta
3. Verificar RLS policies no dashboard

## Contatos de emergencia

| Papel          | Responsavel           |
| -------------- | --------------------- |
| **Mantenedor** | @cafebugado           |
| **Supabase**   | suporte via dashboard |
| **Vercel**     | suporte via dashboard |
