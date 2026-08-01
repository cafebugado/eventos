# Runbook de Operacoes

## Ambientes

| Ambiente     | URL                                      |
| ------------ | ---------------------------------------- |
| **Dev**      | http://localhost:3000                    |
| **Preview**  | URL gerada pela Vercel a cada PR/push    |
| **Producao** | domínio configurado no projeto da Vercel |

## Deploy

### Desenvolvimento local

```bash
pnpm dev
```

### Producao (Vercel)

O deploy e automatico via push para `main`. Toda outra branch/PR gera um deploy de preview automaticamente.

## Rollback

### Vercel

1. Acesse **Vercel Dashboard** > **Deployments**
2. Encontre o deploy anterior
3. Clique nos **3 pontos** > **Promote to Production**

## Monitoramento

| Servico              | O que monitora               | Dashboard         |
| -------------------- | ---------------------------- | ----------------- |
| **Vercel Analytics** | Pageviews, Web Vitals        | Vercel Dashboard  |
| **Sentry**           | Erros, crashes, stack traces | sentry.io         |
| **Dependabot**       | Vulnerabilidades em deps     | GitHub > Security |

## Problemas comuns

### App nao carrega (tela branca)

1. Verificar console do browser (F12)
2. Verificar se as env vars estao configuradas no projeto Vercel (Settings > Environment Variables)
3. Verificar logs de build/runtime no Vercel Dashboard

### Erro de CORS

1. Verificar `connect-src` no CSP declarado em `next.config.mjs` (`headers()`)
2. Verificar `NEXT_PUBLIC_API_BASE_URL` nas env vars do projeto
3. Verificar `CORS_ORIGINS` no backend (repositorio `backendEventos`) — precisa incluir a origem deste app

### Build falha no CI

1. Verificar logs no GitHub Actions
2. Rodar `pnpm build` localmente
3. Verificar se `pnpm-lock.yaml` esta atualizado

### API nao responde

1. Verificar `GET https://v2.backendeventoscfb.cafebugado.com.br/health`
2. Verificar deploy/logs do backend (repositorio `backendEventos`)
3. Verificar se `NEXT_PUBLIC_API_BASE_URL` esta correta nas env vars do projeto

## Contatos de emergencia

| Papel           | Responsavel                  |
| --------------- | ---------------------------- |
| **Mantenedor**  | @cafebugado                  |
| **Backend/API** | repositorio `backendEventos` |
| **Vercel**      | suporte via dashboard        |
