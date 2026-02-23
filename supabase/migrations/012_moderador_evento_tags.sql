-- =============================================
-- MIGRATION: Permitir que moderador gerencie evento_tags
-- Moderador pode associar/desassociar tags de eventos
-- =============================================

-- Remover politicas antigas que excluiam o moderador
DROP POLICY IF EXISTS "Admins podem criar evento tags" ON evento_tags;
DROP POLICY IF EXISTS "Admins podem deletar evento tags" ON evento_tags;

-- INSERT: admins e moderadores podem associar tags a eventos
CREATE POLICY "Admins e moderadores podem criar evento tags" ON evento_tags
  FOR INSERT
  WITH CHECK (has_role(ARRAY['super_admin', 'admin', 'moderador']::app_role[]));

-- DELETE: admins e moderadores podem remover tags de eventos
CREATE POLICY "Admins e moderadores podem deletar evento tags" ON evento_tags
  FOR DELETE
  USING (has_role(ARRAY['super_admin', 'admin', 'moderador']::app_role[]));
