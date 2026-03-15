## Descrição

<!-- Descreva de forma clara e objetiva o que este PR faz. Ex: "Corrige o bug onde a imagem do EventCard não cobria o card completamente" -->

## Tipo de mudança

<!-- Marque com [x] os tipos aplicáveis -->

- [ ] `fix` — Correção de bug
- [ ] `feat` — Nova funcionalidade
- [ ] `refactor` — Refatoração sem mudança de comportamento
- [ ] `style` — Ajustes de estilo/CSS (sem lógica)
- [ ] `test` — Adição ou correção de testes
- [ ] `docs` — Documentação
- [ ] `chore` — Manutenção, dependências, config

## Issue relacionada

<!-- Referencia a issue que este PR resolve. Ex: Closes #42 -->

Closes #

## Checklist — antes de solicitar review

### Qualidade de código

- [ ] O código segue os padrões do projeto (ESLint passa: `pnpm lint`)
- [ ] A formatação está correta (Prettier passa: `pnpm format:check`)
- [ ] Não há `console.log` ou código de debug esquecido
- [ ] Não há secrets ou variáveis de ambiente hardcoded

### Testes

- [ ] Os testes existentes continuam passando (`pnpm test:run`)
- [ ] Adicionei testes para a mudança implementada (quando aplicável)
- [ ] A cobertura de testes não regrediu (`pnpm test:coverage`)

### Build

- [ ] O build de produção passa sem erros (`pnpm build`)

### Componentes e UI (se aplicável)

- [ ] Testei nas variantes aplicáveis do `EventCard` (`variant="compact"` e `variant="full"`)
- [ ] Verifiquei responsividade (mobile, tablet, desktop)
- [ ] As variáveis CSS do projeto foram usadas (`--primary-blue`, `--surface`, `--background`, etc.)
- [ ] Não quebrei estilos de outras telas

### Dados e serviços (se aplicável)

- [ ] Chamadas ao Supabase usam `withRetry` de `apiClient.js`
- [ ] Datas estão no formato correto (`DD/MM/YYYY` para exibição, `YYYY-MM-DD` para input date nativo)
- [ ] Imports circulares foram evitados (usar import dinâmico quando necessário)

## Como testar

<!-- Passo a passo para o reviewer reproduzir e validar a mudança -->

1. Checkout nesta branch: `git checkout <nome-da-branch>`
2. Instalar dependências: `pnpm install`
3. Subir ambiente local: `pnpm dev`
4. Navegar até: `<!-- ex: /eventos ou /eventos/:id -->`
5. <!-- Descreva o que verificar -->

## Screenshots / Gravação (se aplicável)

<!-- Antes e depois para mudanças visuais. Arraste as imagens aqui ou cole do clipboard -->

| Antes | Depois |
| ----- | ------ |
|       |        |

## Contexto adicional

<!-- Qualquer informação extra que ajude o reviewer: decisões de design, trade-offs, limitações conhecidas, débito técnico gerado -->
