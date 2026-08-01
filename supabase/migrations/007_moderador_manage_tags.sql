-- =============================================
-- MIGRATION: Permissoes de tags para moderador
-- Moderador pode criar e editar apenas suas proprias tags, nao pode deletar
-- =============================================

-- 1. Adicionar coluna created_by na tabela tags
ALTER TABLE tags ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Indice para busca por criador
CREATE INDEX IF NOT EXISTS idx_tags_created_by ON tags(created_by);

-- 2. Atualizar politicas de INSERT/UPDATE/DELETE da tabela tags
--    (as antigas foram criadas na migration 004 via DROP/CREATE)

-- Remover politicas antigas (migration 004)
DROP POLICY IF EXISTS "Admins podem criar tags" ON tags;
DROP POLICY IF EXISTS "Admins podem atualizar tags" ON tags;
DROP POLICY IF EXISTS "Admins podem deletar tags" ON tags;
-- Remover politicas desta migration caso ja existam (idempotente)
DROP POLICY IF EXISTS "Admins e moderadores podem criar tags" ON tags;
DROP POLICY IF EXISTS "Admins podem atualizar qualquer tag" ON tags;
DROP POLICY IF EXISTS "Moderador pode atualizar suas proprias tags" ON tags;
DROP POLICY IF EXISTS "Moderador pode deletar suas proprias tags" ON tags;

-- INSERT: admins e moderadores podem criar tags
CREATE POLICY "Admins e moderadores podem criar tags" ON tags
  FOR INSERT
  WITH CHECK (has_role(ARRAY['super_admin', 'admin', 'moderador']::app_role[]));

-- UPDATE: admins podem editar qualquer tag; moderador so edita as proprias
CREATE POLICY "Admins podem atualizar qualquer tag" ON tags
  FOR UPDATE
  USING (has_role(ARRAY['super_admin', 'admin']::app_role[]));

CREATE POLICY "Moderador pode atualizar suas proprias tags" ON tags
  FOR UPDATE
  USING (
    has_role(ARRAY['moderador']::app_role[])
    AND created_by = auth.uid()
  );

-- DELETE: admins deletam qualquer tag; moderador so deleta as proprias
CREATE POLICY "Admins podem deletar tags" ON tags
  FOR DELETE
  USING (has_role(ARRAY['super_admin', 'admin']::app_role[]));

CREATE POLICY "Moderador pode deletar suas proprias tags" ON tags
  FOR DELETE
  USING (
    has_role(ARRAY['moderador']::app_role[])
    AND created_by = auth.uid()
  );

-- 3. Funcao trigger para preencher created_by automaticamente no INSERT
CREATE OR REPLACE FUNCTION set_tag_created_by()
RETURNS TRIGGER AS $$
BEGIN
  NEW.created_by := auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_set_tag_created_by ON tags;

CREATE TRIGGER trigger_set_tag_created_by
  BEFORE INSERT ON tags
  FOR EACH ROW
  EXECUTE FUNCTION set_tag_created_by();
