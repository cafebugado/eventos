# Changelog

Todas as mudanças notáveis neste projeto estão documentadas aqui.

O formato segue [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/), e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

---

## [Não lançado]

## [0.6.x] - 2026-04

### Corrigido

- `fix(release)`: release workflow agora cria PR automático para `developer` em vez de push direto
- `fix`: corrige versão do `react-dom` e remove `papaparse`

### Dependências

- `react` 19.2.4 → 19.2.5
- `@supabase/supabase-js` 2.103.3 → 2.104.0
- `@playwright/test` 1.58.2 → 1.59.1
- `msw` 2.12.14 → 2.13.4
- `prettier` 3.8.1 → 3.8.3
- `web-vitals` 5.1.0 → 5.2.0
- `@brazilian-utils/brazilian-utils` 2.0.0 → 2.3.0
- `eslint-plugin-react-hooks` 7.0.1 → 7.1.1
- `react-router-dom` 7.13.1 → 7.14.1
- `@sentry/react` 10.42.0 → 10.49.0
- `react-hook-form` 7.72.0 → 7.72.1

---

## [0.5.x] - 2025-2026

### Adicionado

- `feat(eventos)`: notificações em tempo real de novos eventos (`NewEventToast`)
- `feat(eventos)`: exportação de evento para calendário (`.ics`)
- `feat(home)`: redesenho da seção de depoimentos com layout em grid
- `feat(home)`: redesenho da seção de próximos eventos
- `feat(admin)`: rotas por aba no dashboard (`/admin/dashboard/:tab`), validação de data
- `feat(dashboard)`: botão de copiar link do evento
- `feat(header)`: imagem PNG no logo em vez de texto
- `feat`: banner e botão de instalação PWA
- `feat`: suporte PWA completo com service worker e instalação mobile
- `feat`: visualização em calendário mensal na página de eventos (`CalendarView`)
- `feat`: sistema de auditoria no painel admin (`AuditLog`)
- `feat`: campo de status nos eventos (rascunho, publicado, arquivado)
- `feat`: meta tag de verificação do Google Search Console
- `feat`: robots.txt e sitemap.xml dinâmico para SEO
- `feat`: lazy loading de páginas com code splitting por rota
- `feat(cache)`: cache SWR-like para eventos com TTL de 5 minutos
- `feat`: modo de visualização grade/lista/compacto e melhorias de filtros
- `ci`: CodeQL para análise de segurança estática
- `ci`: CODEOWNERS, auto-assign de revisores e labels automáticas em PRs

### Corrigido

- `fix(ci)`: limite de tamanho do bundle ajustado de 512 KB para 1300 KB
- `fix(ci)`: thresholds de cobertura ajustados (55% linhas, 50% funções, 48% branches)
- `fix(pwa)`: service worker não cacheia assets com hash do Vite
- `fix(moderador)`: permissões de status de evento
- `fix(admin)`: mensagem de compartilhamento de link
- `fix(favourite)`: carregamento de estilos no `FavouriteEventButton`

### Refatorado

- `refactor(ui)`: sistema de design padronizado com variáveis CSS globais
- `refactor(pages)`: `EventsPage` e `NotFound` padronizados para usar layout
- `refactor`: separação de `App.jsx` em página, hooks e componentes reutilizáveis

---

## [0.4.x] - 2025

### Adicionado

- `feat`: galeria de fotos pública por álbuns de evento (`Gallery`, `GalleryAdmin`, `GalleryPhotoModal`)
- `feat`: comunidades associadas a eventos (`CommunityAdmin`)
- `feat`: perfil de usuário editável (nome, sobrenome, avatar via GitHub)
- `feat`: gerenciamento de usuários e papéis para `super_admin`
- `feat`: estatísticas do GitHub no dashboard (`GithubStats`)
- `feat`: recomendações de eventos com lazy load via `IntersectionObserver`
- `feat`: sistema unificado de modais (`Modal`, `ConfirmModal`) com ARIA completo
- `feat`: compartilhamento de eventos em redes sociais (`ShareButtons`)
- `feat`: SEO otimizado com meta tags dinâmicas e Open Graph (`SEOHead`)
- `feat`: `EventCard` reutilizável com variantes `compact` e `full`
- `feat`: `ContributorsGrid` na página Sobre
- `feat(paginacao)`: paginação de eventos na listagem

### Corrigido

- Correções de RLS policies no Supabase para moderadores
- Correções de upload de imagens na galeria

---

## [0.3.x] - 2025

### Adicionado

- `feat`: painel administrativo multi-abas (`Dashboard`)
- `feat`: CRUD de contribuintes com validação de perfil GitHub
- `feat`: RBAC completo (`super_admin`, `admin`, `moderador`)
- `feat`: `AdminSidebar` colapsável com persistência em localStorage
- `feat`: `AdminMobileNav` para navegação mobile no admin
- `feat(tags)`: CRUD de tags com cor customizada e preview em tempo real
- `feat(eventos)`: modalidade (Presencial/Online/Híbrido) e localização com Google Maps
- `feat`: dark/light mode com `ThemeProvider` e persistência em localStorage
- `feat`: integração Sentry para rastreamento de erros em produção
- `feat`: Vercel Analytics e Speed Insights
- `feat`: Web Vitals (LCP, FID, CLS, TTFB, INP)

---

## [0.2.x] - 2024-2025

### Adicionado

- `feat`: listagem de eventos com filtros (período, modalidade, tag)
- `feat`: página de detalhe de evento (`EventDetails`)
- `feat`: página Home com próximos eventos e depoimentos
- `feat`: página Sobre com informações da comunidade
- `feat`: página de Contato
- `feat`: 404 (`NotFound`)
- `feat`: autenticação via Supabase Auth (`authService`)
- `feat`: Docker multi-stage (dev, staging, produção)
- `feat`: pipeline CI/CD com GitHub Actions
- `feat`: proteção de branches (`pr-developer.yml`, `pr-main.yml`)
- `feat`: release automático com versionamento semântico (`release.yml`)
- `feat`: Conventional Commits com Husky + commitlint

---

## [0.1.x] - 2024

### Adicionado

- Estrutura inicial do projeto (Vite + React 19)
- Configuração do Supabase (tabelas `eventos`, `tags`, `evento_tags`)
- Design minimalista com paleta azul/branco/preto
- Responsividade mobile-first
- Configuração de linting (ESLint + Prettier)
- Testes unitários com Vitest + Testing Library
- Testes E2E com Playwright
