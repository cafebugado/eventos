# Estrategia de Backup e Disaster Recovery

## Backups automaticos (Supabase)

O Supabase gerencia backups automaticamente:

- **Plano Free**: Backups diarios, retencao de 7 dias
- **Plano Pro**: Backups diarios, retencao de 30 dias + PITR (Point-in-Time Recovery)

Acesse em: **Supabase Dashboard** > **Database** > **Backups**

## Backup manual

### Exportar dados via Dashboard

1. Acesse **Supabase Dashboard** > **Table Editor**
2. Selecione a tabela
3. Clique em **Export** > **CSV**

### Exportar via SQL

```sql
-- No SQL Editor do Supabase
COPY (SELECT * FROM eventos) TO STDOUT WITH CSV HEADER;
COPY (SELECT * FROM contribuintes) TO STDOUT WITH CSV HEADER;
COPY (SELECT * FROM tags) TO STDOUT WITH CSV HEADER;
COPY (SELECT * FROM evento_tags) TO STDOUT WITH CSV HEADER;
```

## Recuperacao

### Restaurar a partir de backup do Supabase

1. Acesse **Database** > **Backups**
2. Selecione o ponto de restauracao
3. Clique em **Restore**

### Restaurar a partir de CSV

1. Execute as migrations (ver `docs/MIGRATIONS.md`)
2. Importe os CSVs via **Table Editor** > **Import**

## Objetivos

| Metrica                            | Alvo                           |
| ---------------------------------- | ------------------------------ |
| **RTO** (Recovery Time Objective)  | 4 horas                        |
| **RPO** (Recovery Point Objective) | 24 horas (free) / 1 hora (pro) |

## Storage (imagens)

As imagens ficam no Supabase Storage (bucket `imagens`).
Para backup de imagens, use a API de listagem:

```bash
# Listar todas as imagens
curl -H "Authorization: Bearer YOUR_SERVICE_KEY" \
  "https://YOUR_PROJECT.supabase.co/storage/v1/object/list/imagens"
```

## Checklist mensal

- [ ] Verificar que backups automaticos estao funcionando
- [ ] Testar restauracao em ambiente de staging
- [ ] Verificar espaco de storage utilizado
- [ ] Revisar logs de erro do ultimo mes
