-- =============================================
-- MIGRATION: Role-Based Access Control (RBAC)
-- Execute este arquivo no SQL Editor do Supabase
-- IMPORTANTE: Migracao nao-destrutiva, preserva dados existentes
-- =============================================

-- =============================================
-- 1. CRIAR TIPO ENUM PARA ROLES
-- =============================================
DO $$ BEGIN
  CREATE TYPE app_role AS ENUM ('super_admin', 'admin', 'moderador');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- =============================================
-- 2. CRIAR TABELA user_roles
-- =============================================
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'moderador',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Indices para busca rapida
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);

-- =============================================
-- 3. FUNCAO HELPER: get_user_role(user_uuid)
-- Retorna a role do usuario ou NULL se nao tiver role
-- =============================================
CREATE OR REPLACE FUNCTION get_user_role(user_uuid UUID)
RETURNS app_role AS $$
  SELECT role FROM user_roles WHERE user_id = user_uuid LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- =============================================
-- 4. FUNCAO HELPER: has_role(roles_array)
-- Verifica se o usuario atual tem uma das roles especificadas
-- =============================================
CREATE OR REPLACE FUNCTION has_role(allowed_roles app_role[])
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = ANY(allowed_roles)
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- =============================================
-- 5. RLS PARA user_roles
-- =============================================
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Qualquer usuario autenticado pode ler sua propria role
CREATE POLICY "Usuarios podem ver sua propria role"
  ON user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- super_admin pode ver todas as roles
CREATE POLICY "Super admin pode ver todas as roles"
  ON user_roles FOR SELECT
  USING (has_role(ARRAY['super_admin']::app_role[]));

-- Apenas super_admin pode inserir roles
CREATE POLICY "Super admin pode criar roles"
  ON user_roles FOR INSERT
  WITH CHECK (has_role(ARRAY['super_admin']::app_role[]));

-- Apenas super_admin pode atualizar roles
CREATE POLICY "Super admin pode atualizar roles"
  ON user_roles FOR UPDATE
  USING (has_role(ARRAY['super_admin']::app_role[]));

-- Apenas super_admin pode deletar roles
CREATE POLICY "Super admin pode deletar roles"
  ON user_roles FOR DELETE
  USING (has_role(ARRAY['super_admin']::app_role[]));

-- =============================================
-- 6. TRIGGER updated_at PARA user_roles
-- (Reutiliza funcao update_updated_at_column da migration 001)
-- =============================================
DROP TRIGGER IF EXISTS update_user_roles_updated_at ON user_roles;

CREATE TRIGGER update_user_roles_updated_at
  BEFORE UPDATE ON user_roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 7. ATUALIZAR RLS DA TABELA eventos
-- =============================================

-- Remover politicas antigas de escrita
DROP POLICY IF EXISTS "Usuários autenticados podem criar eventos" ON eventos;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar eventos" ON eventos;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar eventos" ON eventos;

-- INSERT: super_admin e admin apenas
CREATE POLICY "Admins podem criar eventos" ON eventos
  FOR INSERT
  WITH CHECK (has_role(ARRAY['super_admin', 'admin']::app_role[]));

-- UPDATE: super_admin, admin e moderador
CREATE POLICY "Admins e moderadores podem atualizar eventos" ON eventos
  FOR UPDATE
  USING (has_role(ARRAY['super_admin', 'admin', 'moderador']::app_role[]));

-- DELETE: super_admin e admin apenas
CREATE POLICY "Admins podem deletar eventos" ON eventos
  FOR DELETE
  USING (has_role(ARRAY['super_admin', 'admin']::app_role[]));

-- =============================================
-- 8. ATUALIZAR RLS DA TABELA contribuintes
-- =============================================
DROP POLICY IF EXISTS "Usuários autenticados podem criar contribuintes" ON contribuintes;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar contribuintes" ON contribuintes;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar contribuintes" ON contribuintes;

CREATE POLICY "Admins podem criar contribuintes" ON contribuintes
  FOR INSERT
  WITH CHECK (has_role(ARRAY['super_admin', 'admin']::app_role[]));

CREATE POLICY "Admins podem atualizar contribuintes" ON contribuintes
  FOR UPDATE
  USING (has_role(ARRAY['super_admin', 'admin']::app_role[]));

CREATE POLICY "Admins podem deletar contribuintes" ON contribuintes
  FOR DELETE
  USING (has_role(ARRAY['super_admin', 'admin']::app_role[]));

-- =============================================
-- 9. ATUALIZAR RLS DA TABELA tags
-- =============================================
DROP POLICY IF EXISTS "Usuários autenticados podem criar tags" ON tags;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar tags" ON tags;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar tags" ON tags;

CREATE POLICY "Admins podem criar tags" ON tags
  FOR INSERT
  WITH CHECK (has_role(ARRAY['super_admin', 'admin']::app_role[]));

CREATE POLICY "Admins podem atualizar tags" ON tags
  FOR UPDATE
  USING (has_role(ARRAY['super_admin', 'admin']::app_role[]));

CREATE POLICY "Admins podem deletar tags" ON tags
  FOR DELETE
  USING (has_role(ARRAY['super_admin', 'admin']::app_role[]));

-- =============================================
-- 10. ATUALIZAR RLS DA TABELA evento_tags
-- =============================================
DROP POLICY IF EXISTS "Usuários autenticados podem criar evento tags" ON evento_tags;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar evento tags" ON evento_tags;

CREATE POLICY "Admins podem criar evento tags" ON evento_tags
  FOR INSERT
  WITH CHECK (has_role(ARRAY['super_admin', 'admin']::app_role[]));

CREATE POLICY "Admins podem deletar evento tags" ON evento_tags
  FOR DELETE
  USING (has_role(ARRAY['super_admin', 'admin']::app_role[]));

-- =============================================
-- 11. ATUALIZAR RLS DO STORAGE
-- =============================================
DROP POLICY IF EXISTS "Usuários autenticados podem fazer upload" ON storage.objects;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar imagens" ON storage.objects;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar imagens" ON storage.objects;

CREATE POLICY "Admins podem fazer upload" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'imagens' AND has_role(ARRAY['super_admin', 'admin']::app_role[]));

CREATE POLICY "Admins podem atualizar imagens" ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'imagens' AND has_role(ARRAY['super_admin', 'admin']::app_role[]));

CREATE POLICY "Admins podem deletar imagens" ON storage.objects
  FOR DELETE
  USING (bucket_id = 'imagens' AND has_role(ARRAY['super_admin', 'admin']::app_role[]));

-- =============================================
-- 12. FUNCAO PARA LISTAR USUARIOS (super_admin only)
-- =============================================
CREATE OR REPLACE FUNCTION get_users_with_roles()
RETURNS TABLE (
  id UUID,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  role app_role
) AS $$
BEGIN
  IF NOT has_role(ARRAY['super_admin']::app_role[]) THEN
    RAISE EXCEPTION 'Acesso negado: apenas super_admin pode listar usuarios';
  END IF;

  RETURN QUERY
  SELECT
    u.id,
    u.email::TEXT,
    u.created_at,
    ur.role
  FROM auth.users u
  LEFT JOIN user_roles ur ON u.id = ur.user_id
  ORDER BY u.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 13. FUNCAO PARA ATRIBUIR ROLE (super_admin only)
-- =============================================
CREATE OR REPLACE FUNCTION assign_user_role(target_user_id UUID, new_role app_role)
RETURNS void AS $$
BEGIN
  IF NOT has_role(ARRAY['super_admin']::app_role[]) THEN
    RAISE EXCEPTION 'Acesso negado: apenas super_admin pode atribuir roles';
  END IF;

  IF target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Voce nao pode alterar sua propria role';
  END IF;

  INSERT INTO user_roles (user_id, role)
  VALUES (target_user_id, new_role)
  ON CONFLICT (user_id)
  DO UPDATE SET role = new_role, updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 14. FUNCAO PARA REMOVER ROLE (super_admin only)
-- =============================================
CREATE OR REPLACE FUNCTION remove_user_role(target_user_id UUID)
RETURNS void AS $$
BEGIN
  IF NOT has_role(ARRAY['super_admin']::app_role[]) THEN
    RAISE EXCEPTION 'Acesso negado: apenas super_admin pode remover roles';
  END IF;

  IF target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Voce nao pode remover sua propria role';
  END IF;

  DELETE FROM user_roles WHERE user_id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 15. AUTO-BOOTSTRAP: Atribuir super_admin ao primeiro usuario
-- Garante que pelo menos 1 usuario tenha acesso apos a migracao
-- =============================================
INSERT INTO user_roles (user_id, role)
SELECT id, 'super_admin'::app_role
FROM auth.users
ORDER BY created_at ASC
LIMIT 1
ON CONFLICT (user_id) DO NOTHING;

-- =============================================
-- MIGRATION COMPLETA!
--
-- Resumo:
-- 1. Tipo enum app_role (super_admin, admin, moderador)
-- 2. Tabela user_roles com RLS
-- 3. Funcoes helper: get_user_role(), has_role()
-- 4. RLS atualizado em: eventos, contribuintes, tags, evento_tags, storage
-- 5. Funcoes admin: get_users_with_roles(), assign_user_role(), remove_user_role()
-- 6. Auto-bootstrap: primeiro usuario recebe super_admin
--
-- Proximos passos:
-- 1. Execute esta migration no SQL Editor do Supabase
-- 2. Verifique no Dashboard > user_roles se o super_admin foi atribuido
-- 3. Use o painel de Usuarios no Dashboard para gerenciar roles
-- =============================================
