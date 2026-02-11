# =============================================
# Dockerfile - Produção (Multi-stage Build)
# Eventos - Comunidade Café Bugado
# =============================================

# Estágio 1: Instala dependências e faz o build
FROM node:20-alpine AS builder

WORKDIR /app

# Instala pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copia arquivos de dependências primeiro (melhor cache)
COPY package.json pnpm-lock.yaml ./

# Instala dependências
RUN pnpm install --frozen-lockfile

# Copia o restante do código
COPY . .

# Variáveis de ambiente para o build (passadas via --build-arg ou .env)
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY

# Build da aplicação
RUN pnpm build

# Estágio 2: Serve com Nginx (imagem final ~25MB)
FROM nginx:alpine

# Remove configuração padrão do Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copia configuração customizada para SPA (React Router)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia arquivos do build
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

# Health check para orquestradores (Docker Swarm, Kubernetes)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
