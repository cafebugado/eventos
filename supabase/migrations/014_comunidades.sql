-- =============================================
-- MIGRATION: Comunidades
-- Execute este arquivo no SQL Editor do Supabase
-- =============================================

-- =============================================
-- 1. CRIAR TABELA DE COMUNIDADES
-- =============================================
CREATE TABLE IF NOT EXISTS comunidades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar created_by separadamente (idempotente, caso a tabela já existisse)
ALTER TABLE comunidades ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Índices
CREATE INDEX IF NOT EXISTS idx_comunidades_nome ON comunidades(nome);
CREATE INDEX IF NOT EXISTS idx_comunidades_created_by ON comunidades(created_by);

-- =============================================
-- 2. TRIGGER PARA PREENCHER created_by NO INSERT
-- =============================================
CREATE OR REPLACE FUNCTION set_comunidade_created_by()
RETURNS TRIGGER AS $$
BEGIN
  NEW.created_by := auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_set_comunidade_created_by ON comunidades;

CREATE TRIGGER trigger_set_comunidade_created_by
  BEFORE INSERT ON comunidades
  FOR EACH ROW
  EXECUTE FUNCTION set_comunidade_created_by();

-- =============================================
-- 3. TRIGGER PARA ATUALIZAR updated_at
-- =============================================
DROP TRIGGER IF EXISTS update_comunidades_updated_at ON comunidades;

CREATE TRIGGER update_comunidades_updated_at
  BEFORE UPDATE ON comunidades
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 4. ROW LEVEL SECURITY (RLS)
-- =============================================
ALTER TABLE comunidades ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes (idempotente)
DROP POLICY IF EXISTS "Comunidades são públicas para leitura" ON comunidades;
DROP POLICY IF EXISTS "Admins e moderadores podem criar comunidades" ON comunidades;
DROP POLICY IF EXISTS "Admins podem atualizar qualquer comunidade" ON comunidades;
DROP POLICY IF EXISTS "Moderador pode atualizar suas proprias comunidades" ON comunidades;
DROP POLICY IF EXISTS "Admins podem deletar comunidades" ON comunidades;
DROP POLICY IF EXISTS "Moderador pode deletar suas proprias comunidades" ON comunidades;

-- SELECT: leitura pública
CREATE POLICY "Comunidades são públicas para leitura" ON comunidades
  FOR SELECT
  USING (true);

-- INSERT: admins e moderadores podem criar
CREATE POLICY "Admins e moderadores podem criar comunidades" ON comunidades
  FOR INSERT
  WITH CHECK (has_role(ARRAY['super_admin', 'admin', 'moderador']::app_role[]));

-- UPDATE: admins editam qualquer uma; moderador só edita as próprias
CREATE POLICY "Admins podem atualizar qualquer comunidade" ON comunidades
  FOR UPDATE
  USING (has_role(ARRAY['super_admin', 'admin']::app_role[]));

CREATE POLICY "Moderador pode atualizar suas proprias comunidades" ON comunidades
  FOR UPDATE
  USING (
    has_role(ARRAY['moderador']::app_role[])
    AND created_by = auth.uid()
  );

-- DELETE: admins deletam qualquer uma; moderador só deleta as próprias
CREATE POLICY "Admins podem deletar comunidades" ON comunidades
  FOR DELETE
  USING (has_role(ARRAY['super_admin', 'admin']::app_role[]));

CREATE POLICY "Moderador pode deletar suas proprias comunidades" ON comunidades
  FOR DELETE
  USING (
    has_role(ARRAY['moderador']::app_role[])
    AND created_by = auth.uid()
  );

-- =============================================
-- MIGRATION COMPLETA!
--
-- Resumo das alterações:
-- 1. Tabela 'comunidades' criada (id, nome, created_by, created_at, updated_at)
-- 2. Trigger: created_by preenchido automaticamente no INSERT
-- 3. Trigger: updated_at atualizado automaticamente no UPDATE
-- 4. RLS:
--    - SELECT: público
--    - INSERT: admins e moderadores
--    - UPDATE: admins (qualquer) | moderador (só as próprias)
--    - DELETE: admins (qualquer) | moderador (só as próprias)
--
-- Próximos passos:
-- 1. Execute esta migration no SQL Editor do Supabase
-- 2. Cadastre comunidades pelo Dashboard Admin > Comunidades
-- =============================================
