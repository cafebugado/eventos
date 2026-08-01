-- =============================================
-- MIGRATION: Atualizar permissoes do moderador
-- - Moderador pode fazer upload de imagens
-- - Moderador pode deletar apenas eventos que ele criou
-- - Moderador pode editar qualquer evento (inclusive os que nao criou)
-- =============================================

-- =============================================
-- 1. Adicionar coluna created_by na tabela eventos
-- =============================================
ALTER TABLE eventos ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Indice para busca por criador
CREATE INDEX IF NOT EXISTS idx_eventos_created_by ON eventos(created_by);

-- =============================================
-- 2. Trigger para preencher created_by automaticamente no INSERT
-- =============================================
CREATE OR REPLACE FUNCTION set_evento_created_by()
RETURNS TRIGGER AS $$
BEGIN
  NEW.created_by := auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_set_evento_created_by ON eventos;

CREATE TRIGGER trigger_set_evento_created_by
  BEFORE INSERT ON eventos
  FOR EACH ROW
  EXECUTE FUNCTION set_evento_created_by();

-- =============================================
-- 3. Atualizar politicas de DELETE da tabela eventos
-- Moderador so pode deletar eventos que ele criou
-- =============================================

-- Remover politica antiga de delete
DROP POLICY IF EXISTS "Admins podem deletar eventos" ON eventos;

-- Admins deletam qualquer evento
CREATE POLICY "Admins podem deletar eventos" ON eventos
  FOR DELETE
  USING (has_role(ARRAY['super_admin', 'admin']::app_role[]));

-- Moderador so deleta os proprios eventos
CREATE POLICY "Moderador pode deletar seus proprios eventos" ON eventos
  FOR DELETE
  USING (
    has_role(ARRAY['moderador']::app_role[])
    AND created_by = auth.uid()
  );

-- =============================================
-- 4. Atualizar politicas de UPDATE da tabela eventos
-- Moderador pode editar qualquer evento (inclusive os que nao criou)
-- (a politica existente ja cobre isso, mas vamos garantir que esteja correta)
-- =============================================

-- Remover politica existente para recriar de forma explicita
DROP POLICY IF EXISTS "Admins e moderadores podem atualizar eventos" ON eventos;

-- Admins e moderadores podem atualizar qualquer evento
CREATE POLICY "Admins e moderadores podem atualizar eventos" ON eventos
  FOR UPDATE
  USING (has_role(ARRAY['super_admin', 'admin', 'moderador']::app_role[]));

-- =============================================
-- 5. Atualizar politicas de STORAGE para permitir upload do moderador
-- =============================================

-- Remover politicas antigas de storage
DROP POLICY IF EXISTS "Admins podem fazer upload" ON storage.objects;
DROP POLICY IF EXISTS "Admins podem atualizar imagens" ON storage.objects;
DROP POLICY IF EXISTS "Admins podem deletar imagens" ON storage.objects;

-- Upload: admins e moderadores podem fazer upload
CREATE POLICY "Admins e moderadores podem fazer upload" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'imagens' AND has_role(ARRAY['super_admin', 'admin', 'moderador']::app_role[]));

-- Atualizar imagens: admins e moderadores
CREATE POLICY "Admins e moderadores podem atualizar imagens" ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'imagens' AND has_role(ARRAY['super_admin', 'admin', 'moderador']::app_role[]));

-- Deletar imagens: apenas admins
CREATE POLICY "Admins podem deletar imagens" ON storage.objects
  FOR DELETE
  USING (bucket_id = 'imagens' AND has_role(ARRAY['super_admin', 'admin']::app_role[]));
