# Guia de Migrations

## Estrutura

As migrations ficam em `supabase/migrations/` e devem ser executadas em ordem:

| Arquivo                            | Descrição                                                     |
| ---------------------------------- | ------------------------------------------------------------- |
| `001_initial_setup.sql`            | Tabela `eventos`, RLS, trigger `updated_at`, bucket `imagens` |
| `002_contributors.sql`             | Tabela `contribuintes` com GitHub integration                 |
| `003_tags_location_modalidade.sql` | Tabelas `tags` e `evento_tags`, colunas de localização        |

## Como executar

### Primeiro setup (banco novo)

1. Acesse o **Supabase Dashboard** > **SQL Editor**
2. Execute cada arquivo na ordem (001, 002, 003)
3. Crie um usuário admin em **Authentication** > **Users** > **Add User**

### Nova migration

1. Crie o arquivo `supabase/migrations/NNN_descricao.sql`
2. Use `IF NOT EXISTS` e `IF EXISTS` para idempotência
3. Teste no ambiente de staging primeiro
4. Execute em produção via SQL Editor

### Convenções

- Nomeie como `NNN_descricao_curta.sql` (ex: `004_add_categories.sql`)
- Sempre adicione `DROP POLICY IF EXISTS` antes de `CREATE POLICY`
- Use `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` para novas colunas
- Documente o que cada bloco faz com comentários

## Rollback

O Supabase não tem rollback automático. Para reverter:

1. Crie uma migration reversa (ex: `004_rollback_003.sql`)
2. Use `DROP TABLE IF EXISTS`, `DROP COLUMN IF EXISTS`, etc.
3. Teste em staging antes de aplicar em produção

## Schema atual

```
eventos (id, nome, descricao, data_evento, horario, dia_semana, periodo, link, imagem, modalidade, endereco, cidade, estado, created_at, updated_at)
contribuintes (id, github_username, nome, avatar_url, github_url, linkedin_url, portfolio_url, created_at, updated_at)
tags (id, nome, cor, created_at, updated_at)
evento_tags (id, evento_id, tag_id, created_at) -- junction table N:N
storage.buckets.imagens -- bucket público para imagens de eventos
```
