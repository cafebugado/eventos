-- =============================================
-- MIGRATION: Incluir nome e sobrenome nas listagens de usuarios
-- Atualiza get_users_with_roles e admin_get_users para fazer JOIN com user_profiles
-- =============================================

-- =============================================
-- 1. Politica de leitura de perfis para admin+
-- Necessaria para o JOIN funcionar no SECURITY DEFINER
-- (funcoes SECURITY DEFINER ja tem acesso, mas adicionamos para clareza)
-- =============================================

-- Adiciona policy para super_admin e admin lerem todos os perfis
DROP POLICY IF EXISTS "Admin pode ver todos os perfis" ON user_profiles;

CREATE POLICY "Admin pode ver todos os perfis"
  ON user_profiles FOR SELECT
  USING (has_role(ARRAY['super_admin', 'admin']::app_role[]));

-- =============================================
-- 2. Atualizar get_users_with_roles (super_admin)
-- Inclui nome e sobrenome do user_profiles
-- =============================================
DROP FUNCTION IF EXISTS get_users_with_roles();
CREATE OR REPLACE FUNCTION get_users_with_roles()
RETURNS TABLE (
  id UUID,
  email TEXT,
  nome TEXT,
  sobrenome TEXT,
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
    p.nome,
    p.sobrenome,
    u.created_at,
    ur.role
  FROM auth.users u
  LEFT JOIN user_roles ur ON u.id = ur.user_id
  LEFT JOIN user_profiles p ON u.id = p.user_id
  ORDER BY u.email ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 3. Atualizar admin_get_users (admin+)
-- Inclui nome e sobrenome do user_profiles
-- =============================================
DROP FUNCTION IF EXISTS admin_get_users();
CREATE OR REPLACE FUNCTION admin_get_users()
RETURNS TABLE (
  id UUID,
  email TEXT,
  nome TEXT,
  sobrenome TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  role app_role
) AS $$
BEGIN
  IF NOT has_role(ARRAY['super_admin', 'admin']::app_role[]) THEN
    RAISE EXCEPTION 'Acesso negado: apenas admin ou superior pode listar usuarios';
  END IF;

  RETURN QUERY
  SELECT
    u.id,
    u.email::TEXT,
    p.nome,
    p.sobrenome,
    u.created_at,
    ur.role
  FROM auth.users u
  LEFT JOIN user_roles ur ON u.id = ur.user_id
  LEFT JOIN user_profiles p ON u.id = p.user_id
  WHERE ur.role IS NULL OR ur.role IN ('moderador', 'admin')
  ORDER BY u.email ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- MIGRATION COMPLETA!
--
-- Alteracoes:
-- - get_users_with_roles(): agora retorna nome e sobrenome
-- - admin_get_users(): agora retorna nome e sobrenome
-- - Nova policy: admin pode ler todos os perfis
-- =============================================
