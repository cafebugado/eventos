-- 018_add_slug_to_eventos.sql
-- Adiciona coluna slug para URLs amigáveis em /eventos/:slug
-- Mantém compatibilidade retroativa: UUIDs antigos continuam funcionando via fallback no JS

-- 1. Adiciona coluna nullable inicialmente (para poder fazer backfill antes de aplicar NOT NULL)
ALTER TABLE eventos
  ADD COLUMN IF NOT EXISTS slug TEXT;

-- 2. Função auxiliar de transliteração
--    Deve produzir exatamente o mesmo resultado que generateSlug() em src/utils/slug.js
CREATE OR REPLACE FUNCTION fn_nome_to_slug(p_nome TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
DECLARE
  v TEXT;
BEGIN
  v := lower(p_nome);

  -- Vogais com diacríticos
  v := regexp_replace(v, '[áàâä]', 'a', 'g');
  v := regexp_replace(v, '[ãå]',   'a', 'g');
  v := regexp_replace(v, '[éèêë]', 'e', 'g');
  v := regexp_replace(v, '[íìîï]', 'i', 'g');
  v := regexp_replace(v, '[óòôö]', 'o', 'g');
  v := regexp_replace(v, '[õø]',   'o', 'g');
  v := regexp_replace(v, '[úùûü]', 'u', 'g');
  v := regexp_replace(v, '[ýÿ]',   'y', 'g');
  v := regexp_replace(v, 'ç',      'c', 'g');
  v := regexp_replace(v, 'ñ',      'n', 'g');

  -- Substitui qualquer caractere não-alfanumérico por hífen
  v := regexp_replace(v, '[^a-z0-9]+', '-', 'g');

  -- Colapsa hífens consecutivos
  v := regexp_replace(v, '-{2,}', '-', 'g');

  -- Remove hífens nas bordas
  v := regexp_replace(v, '^-+|-+$', '', 'g');

  -- Limita a 80 caracteres
  v := left(v, 80);

  -- Remove hífen final que pode surgir após truncamento
  v := regexp_replace(v, '-+$', '', 'g');

  RETURN v;
END;
$$;

-- 3. Backfill: gera slugs únicos para todos os eventos existentes
--    ORDER BY created_at ASC garante que o evento mais antigo fica com o slug canônico (sem sufixo)
DO $$
DECLARE
  rec       RECORD;
  base      TEXT;
  candidate TEXT;
  suffix    INT;
BEGIN
  FOR rec IN
    SELECT id, nome
    FROM eventos
    WHERE nome IS NOT NULL AND trim(nome) <> ''
    ORDER BY created_at ASC
  LOOP
    base      := fn_nome_to_slug(rec.nome);
    candidate := base;
    suffix    := 2;

    -- Se base ficou vazio (nome só tinha caracteres especiais), usa o id como fallback
    IF base = '' THEN
      candidate := rec.id::TEXT;
    ELSE
      LOOP
        EXIT WHEN NOT EXISTS (
          SELECT 1 FROM eventos
          WHERE slug = candidate
            AND id   <> rec.id
        );
        candidate := base || '-' || suffix;
        suffix    := suffix + 1;
      END LOOP;
    END IF;

    UPDATE eventos SET slug = candidate WHERE id = rec.id;
  END LOOP;

  -- Eventos sem nome recebem o UUID como slug (caso extremo)
  UPDATE eventos SET slug = id::TEXT WHERE slug IS NULL;
END;
$$;

-- 4. Aplica NOT NULL e UNIQUE após backfill completo
ALTER TABLE eventos
  ALTER COLUMN slug SET NOT NULL;

ALTER TABLE eventos
  ADD CONSTRAINT eventos_slug_unique UNIQUE (slug);

-- 5. Índice para buscas rápidas por slug
CREATE INDEX IF NOT EXISTS idx_eventos_slug ON eventos (slug);

-- 6. Remove função auxiliar (geração de slug passa a ser responsabilidade do JS)
DROP FUNCTION IF EXISTS fn_nome_to_slug(TEXT);
