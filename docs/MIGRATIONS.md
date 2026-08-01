# Guia de Migrations

## Estrutura

As migrations ficam em `supabase/migrations/` e devem ser executadas em ordem:

| Arquivo                                | Descrição                                                     |
| -------------------------------------- | ------------------------------------------------------------- |
| `001_initial_setup.sql`                | Tabela `eventos`, RLS, trigger `updated_at`, bucket `imagens` |
| `002_contributors.sql`                 | Tabela `contribuintes` com GitHub integration                 |
| `003_tags_location_modalidade.sql`     | Tabelas `tags` e `evento_tags`, colunas de localização        |
| `004_user_roles.sql`                   | RBAC (roles de usuário)                                       |
| `006_moderador_create_events.sql`      | Permissão de moderador criar eventos                          |
| `007_moderador_manage_tags.sql`        | Permissões de tags para moderador                             |
| `008_moderador_permissions_update.sql` | Moderador pode fazer upload de imagens                        |
| `009_user_profiles.sql`                | Perfil de usuário (nome, sobrenome, github)                   |
| `010_admin_manage_users.sql`           | Admin gerencia usuários de nível moderador e abaixo           |
| `011_users_with_profiles.sql`          | JOIN de nome/sobrenome nas listagens de usuários              |
| `012_moderador_evento_tags.sql`        | Moderador associa/desassocia tags de eventos                  |
| `013_admin_save_profile.sql`           | Correção de policy de UPDATE em perfil (WITH CHECK)           |
| `014_comunidades.sql`                  | Tabela `comunidades`                                          |
| `015_galeria.sql`                      | Tabelas de galeria de fotos (álbuns/fotos)                    |
| `016_event_status.sql`                 | Campo `status` em eventos (rascunho/publicado/arquivado)      |
| `017_audit_log_complete.sql`           | Sistema completo de auditoria (versão consolidada)            |
| `018_add_slug_to_eventos.sql`          | Coluna `slug` para URLs amigáveis (`/eventos/:slug`)          |

(não há `005` — número pulado no histórico do projeto)

## Como executar

### Primeiro setup (banco novo)

1. Acesse o **Supabase Dashboard** > **SQL Editor**
2. Execute cada arquivo na ordem numérica
3. Crie um usuário admin em **Authentication** > **Users** > **Add User** (necessário para gerenciar dados via Supabase Studio, já que o app novo não tem mais painel administrativo próprio)

### Nova migration

1. Crie o arquivo `supabase/migrations/NNN_descricao.sql`
2. Use `IF NOT EXISTS` e `IF EXISTS` para idempotência
3. Teste no ambiente de staging primeiro
4. Execute em produção via SQL Editor

### Convenções

- Nomeie como `NNN_descricao_curta.sql` (ex: `019_add_categories.sql`)
- Sempre adicione `DROP POLICY IF EXISTS` antes de `CREATE POLICY`
- Use `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` para novas colunas
- Documente o que cada bloco faz com comentários

## Rollback

O Supabase não tem rollback automático. Para reverter:

1. Crie uma migration reversa (ex: `019_rollback_018.sql`)
2. Use `DROP TABLE IF EXISTS`, `DROP COLUMN IF EXISTS`, etc.
3. Teste em staging antes de aplicar em produção

## Schema atual

```
eventos (id, nome, descricao, data_evento, horario, dia_semana, periodo, link, imagem, modalidade, endereco, cidade, estado, status, slug, created_at, updated_at)
contribuintes (id, github_username, nome, avatar_url, github_url, linkedin_url, portfolio_url, created_at, updated_at)
tags (id, nome, cor, created_at, updated_at)
evento_tags (id, evento_id, tag_id, created_at) -- junction table N:N
comunidades (id, nome, ...)
galeria_albuns / galeria_fotos -- álbuns de fotos por evento
user_profiles, user_roles -- perfis e RBAC (super_admin > admin > moderador)
audit_log -- log de auditoria de ações administrativas
storage.buckets.imagens -- bucket público para imagens de eventos
```

> Nota: RBAC, perfis, auditoria e comunidades continuam existindo no banco (usados via Supabase Studio), mesmo sem um painel administrativo dedicado no app novo.
