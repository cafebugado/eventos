-- =============================================================
-- 017_audit_log_complete.sql
-- Sistema completo de auditoria — versão consolidada.
--
-- O que este arquivo faz (em ordem):
--   1. Tabela audit_log + índices
--   2. RLS (leitura: admin/super_admin | insert: via trigger)
--   3. Função trigger fn_audit_log (SECURITY DEFINER)
--   4. Triggers em todas as tabelas monitoradas
--   5. Policy de leitura de user_profiles para admin/super_admin
--   6. RPCs get_audit_logs e get_audit_users (SECURITY DEFINER)
--   7. Grants
--   8. Job pg_cron para limpeza diária (retém 7 dias)
-- =============================================================


-- ---------------------------------------------------------------
-- 1. Tabela audit_log
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_log (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  action      TEXT        NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  entity      TEXT        NOT NULL,
  entity_id   TEXT        NOT NULL,
  changes     JSONB       DEFAULT '{}'::jsonb,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_user_id    ON audit_log (user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action     ON audit_log (action);
CREATE INDEX IF NOT EXISTS idx_audit_log_entity     ON audit_log (entity);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log (created_at DESC);


-- ---------------------------------------------------------------
-- 2. RLS
-- ---------------------------------------------------------------
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "audit_log_select"         ON audit_log;
DROP POLICY IF EXISTS "audit_log_insert_trigger" ON audit_log;
DROP POLICY IF EXISTS "audit_log_insert_bypass"  ON audit_log;

-- Leitura: somente super_admin e admin
CREATE POLICY "audit_log_select" ON audit_log
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND has_role(ARRAY['super_admin', 'admin']::app_role[])
  );

-- Insert: aberto (o trigger SECURITY DEFINER insere; clientes diretos não têm acesso via RPC)
CREATE POLICY "audit_log_insert_bypass" ON audit_log
  FOR INSERT
  WITH CHECK (true);


-- ---------------------------------------------------------------
-- 3. Função genérica do trigger
-- ---------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_audit_log()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id   UUID;
  v_changes   JSONB := '{}'::jsonb;
  v_entity_id TEXT;
BEGIN
  -- Captura o usuário autenticado da sessão JWT
  BEGIN
    v_user_id := auth.uid();
  EXCEPTION WHEN OTHERS THEN
    v_user_id := NULL;
  END;

  IF TG_OP = 'DELETE' THEN
    v_entity_id := (row_to_json(OLD) ->> 'id')::TEXT;
    v_changes   := jsonb_build_object('deleted_record', row_to_json(OLD)::jsonb);

    INSERT INTO audit_log (user_id, action, entity, entity_id, changes)
    VALUES (v_user_id, 'DELETE', TG_TABLE_NAME, v_entity_id, v_changes);

    RETURN OLD;

  ELSIF TG_OP = 'INSERT' THEN
    v_entity_id := (row_to_json(NEW) ->> 'id')::TEXT;
    v_changes   := jsonb_build_object('new_record', row_to_json(NEW)::jsonb);

    INSERT INTO audit_log (user_id, action, entity, entity_id, changes)
    VALUES (v_user_id, 'INSERT', TG_TABLE_NAME, v_entity_id, v_changes);

    RETURN NEW;

  ELSIF TG_OP = 'UPDATE' THEN
    v_entity_id := (row_to_json(NEW) ->> 'id')::TEXT;

    -- Registra apenas os campos que mudaram (diff)
    SELECT jsonb_object_agg(
      key,
      jsonb_build_object('before', old_row -> key, 'after', new_row -> key)
    )
    INTO v_changes
    FROM (
      SELECT row_to_json(OLD)::jsonb AS old_row, row_to_json(NEW)::jsonb AS new_row
    ) t,
    LATERAL (
      SELECT key
      FROM jsonb_each(row_to_json(NEW)::jsonb)
      WHERE row_to_json(NEW)::jsonb -> key IS DISTINCT FROM row_to_json(OLD)::jsonb -> key
        AND key NOT IN ('updated_at', 'created_at')
    ) changed_keys;

    IF v_changes IS NOT NULL AND v_changes <> '{}'::jsonb THEN
      INSERT INTO audit_log (user_id, action, entity, entity_id, changes)
      VALUES (v_user_id, 'UPDATE', TG_TABLE_NAME, v_entity_id, v_changes);
    END IF;

    RETURN NEW;
  END IF;

  RETURN NULL;
END;
$$;


-- ---------------------------------------------------------------
-- 4. Triggers em todas as tabelas monitoradas
-- ---------------------------------------------------------------

DROP TRIGGER IF EXISTS trg_audit_eventos ON eventos;
CREATE TRIGGER trg_audit_eventos
  AFTER INSERT OR UPDATE OR DELETE ON eventos
  FOR EACH ROW EXECUTE FUNCTION fn_audit_log();

DROP TRIGGER IF EXISTS trg_audit_tags ON tags;
CREATE TRIGGER trg_audit_tags
  AFTER INSERT OR UPDATE OR DELETE ON tags
  FOR EACH ROW EXECUTE FUNCTION fn_audit_log();

DROP TRIGGER IF EXISTS trg_audit_contribuintes ON contribuintes;
CREATE TRIGGER trg_audit_contribuintes
  AFTER INSERT OR UPDATE OR DELETE ON contribuintes
  FOR EACH ROW EXECUTE FUNCTION fn_audit_log();

DROP TRIGGER IF EXISTS trg_audit_comunidades ON comunidades;
CREATE TRIGGER trg_audit_comunidades
  AFTER INSERT OR UPDATE OR DELETE ON comunidades
  FOR EACH ROW EXECUTE FUNCTION fn_audit_log();

DROP TRIGGER IF EXISTS trg_audit_galeria_albuns ON galeria_albuns;
CREATE TRIGGER trg_audit_galeria_albuns
  AFTER INSERT OR UPDATE OR DELETE ON galeria_albuns
  FOR EACH ROW EXECUTE FUNCTION fn_audit_log();

DROP TRIGGER IF EXISTS trg_audit_galeria_fotos ON galeria_fotos;
CREATE TRIGGER trg_audit_galeria_fotos
  AFTER INSERT OR UPDATE OR DELETE ON galeria_fotos
  FOR EACH ROW EXECUTE FUNCTION fn_audit_log();

DROP TRIGGER IF EXISTS trg_audit_user_roles ON user_roles;
CREATE TRIGGER trg_audit_user_roles
  AFTER INSERT OR UPDATE OR DELETE ON user_roles
  FOR EACH ROW EXECUTE FUNCTION fn_audit_log();

DROP TRIGGER IF EXISTS trg_audit_user_profiles ON user_profiles;
CREATE TRIGGER trg_audit_user_profiles
  AFTER INSERT OR UPDATE OR DELETE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION fn_audit_log();


-- ---------------------------------------------------------------
-- 5. Policy de user_profiles para admin/super_admin
--    (necessário para exibir nomes nos logs)
-- ---------------------------------------------------------------
DROP POLICY IF EXISTS "Admin e moderador podem ver todos os perfis" ON user_profiles;
DROP POLICY IF EXISTS "Admin pode ver todos os perfis"              ON user_profiles;

CREATE POLICY "Admin pode ver todos os perfis"
  ON user_profiles FOR SELECT
  USING (
    has_role(ARRAY['super_admin', 'admin']::app_role[])
  );


-- ---------------------------------------------------------------
-- 6. RPC get_audit_logs
--    Retorna logs paginados com nome do usuário incluso.
--    Acesso restrito: verifica role internamente (SECURITY DEFINER).
-- ---------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_audit_logs(
  p_user_id   UUID    DEFAULT NULL,
  p_action    TEXT    DEFAULT NULL,
  p_entity    TEXT    DEFAULT NULL,
  p_date_from TEXT    DEFAULT NULL,
  p_date_to   TEXT    DEFAULT NULL,
  p_page      INT     DEFAULT 1,
  p_page_size INT     DEFAULT 20
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller_role app_role;
  v_offset      INT;
  v_data        JSON;
  v_total       BIGINT;
BEGIN
  SELECT role INTO v_caller_role
  FROM user_roles
  WHERE user_id = auth.uid()
  LIMIT 1;

  IF v_caller_role IS NULL OR v_caller_role NOT IN ('admin'::app_role, 'super_admin'::app_role) THEN
    RETURN json_build_object('data', '[]'::json, 'total', 0, 'error', 'Acesso negado');
  END IF;

  v_offset := (p_page - 1) * p_page_size;

  SELECT COUNT(*) INTO v_total
  FROM audit_log
  WHERE (p_user_id   IS NULL OR user_id  = p_user_id)
    AND (p_action    IS NULL OR action   = p_action)
    AND (p_entity    IS NULL OR entity   = p_entity)
    AND (p_date_from IS NULL OR created_at >= (p_date_from || 'T00:00:00')::timestamptz)
    AND (p_date_to   IS NULL OR created_at <= (p_date_to   || 'T23:59:59')::timestamptz);

  SELECT json_agg(row_to_json(t))
  INTO v_data
  FROM (
    SELECT
      al.id,
      al.action,
      al.entity,
      al.entity_id,
      al.changes,
      al.created_at,
      al.user_id,
      COALESCE(up.nome, '')      AS user_nome,
      COALESCE(up.sobrenome, '') AS user_sobrenome
    FROM audit_log al
    LEFT JOIN user_profiles up ON up.user_id = al.user_id
    WHERE (p_user_id   IS NULL OR al.user_id = p_user_id)
      AND (p_action    IS NULL OR al.action  = p_action)
      AND (p_entity    IS NULL OR al.entity  = p_entity)
      AND (p_date_from IS NULL OR al.created_at >= (p_date_from || 'T00:00:00')::timestamptz)
      AND (p_date_to   IS NULL OR al.created_at <= (p_date_to   || 'T23:59:59')::timestamptz)
    ORDER BY al.created_at DESC
    LIMIT p_page_size OFFSET v_offset
  ) t;

  RETURN json_build_object(
    'data',  COALESCE(v_data, '[]'::json),
    'total', v_total
  );
END;
$$;


-- ---------------------------------------------------------------
-- 7. RPC get_audit_users
--    Retorna todos os usuários do sistema com nome e role.
-- ---------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_audit_users()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller_role app_role;
  v_data        JSON;
BEGIN
  SELECT role INTO v_caller_role
  FROM user_roles
  WHERE user_id = auth.uid()
  LIMIT 1;

  IF v_caller_role IS NULL OR v_caller_role NOT IN ('admin'::app_role, 'super_admin'::app_role) THEN
    RETURN '[]'::json;
  END IF;

  SELECT json_agg(row_to_json(t) ORDER BY (t.nome || ' ' || t.sobrenome))
  INTO v_data
  FROM (
    SELECT
      ur.user_id,
      COALESCE(up.nome, '')      AS nome,
      COALESCE(up.sobrenome, '') AS sobrenome,
      ur.role::TEXT              AS role
    FROM user_roles ur
    LEFT JOIN user_profiles up ON up.user_id = ur.user_id
    ORDER BY up.nome, up.sobrenome
  ) t;

  RETURN COALESCE(v_data, '[]'::json);
END;
$$;


-- ---------------------------------------------------------------
-- 8. Grants
-- ---------------------------------------------------------------
GRANT SELECT          ON audit_log TO authenticated;
GRANT INSERT, SELECT  ON audit_log TO service_role;
GRANT EXECUTE ON FUNCTION get_audit_logs  TO authenticated;
GRANT EXECUTE ON FUNCTION get_audit_users TO authenticated;


-- ---------------------------------------------------------------
-- 9. Job pg_cron — limpeza diária, retém apenas 7 dias
--    Roda todo dia às 03:00 UTC (00:00 BRT)
-- ---------------------------------------------------------------
SELECT cron.unschedule('cleanup-audit-log')
WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'cleanup-audit-log'
);

SELECT cron.schedule(
  'cleanup-audit-log',
  '0 3 * * *',
  $$DELETE FROM public.audit_log WHERE created_at < NOW() - INTERVAL '7 days'$$
);
