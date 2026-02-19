-- =============================================
-- MIGRATION: Permitir que moderador crie eventos
-- =============================================

-- Remover politica antiga (apenas admins podiam inserir)
DROP POLICY IF EXISTS "Admins podem criar eventos" ON eventos;

-- Nova politica: super_admin, admin e moderador podem criar eventos
CREATE POLICY "Admins e moderadores podem criar eventos" ON eventos
  FOR INSERT
  WITH CHECK (has_role(ARRAY['super_admin', 'admin', 'moderador']::app_role[]));
