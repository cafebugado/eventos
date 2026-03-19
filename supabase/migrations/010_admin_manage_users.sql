-- =============================================
-- MIGRATION: Admin pode gerenciar usuarios de nivel moderador e abaixo
-- - admin pode listar usuarios (exceto super_admin e outros admins)
-- - admin pode atribuir role 'moderador' a usuarios sem role
-- - admin pode remover role de usuarios que sejam moderador
-- =============================================

-- =============================================
-- 1. FUNCAO: admin_get_users
-- Retorna usuarios com role <= moderador (exclui super_admin e admin)
-- Acessivel por admin e super_admin
-- =============================================
CREATE OR REPLACE FUNCTION admin_get_users()
RETURNS TABLE (
  id UUID,
  email TEXT,
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
    u.created_at,
    ur.role
  FROM auth.users u
  LEFT JOIN user_roles ur ON u.id = ur.user_id
  WHERE ur.role IS NULL OR ur.role IN ('moderador', 'admin')
  ORDER BY u.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 2. FUNCAO: admin_assign_user_role
-- Admin pode atribuir apenas 'moderador' a usuarios sem role ou moderadores
-- super_admin continua podendo usar assign_user_role para qualquer role
-- =============================================
CREATE OR REPLACE FUNCTION admin_assign_user_role(target_user_id UUID, new_role app_role)
RETURNS void AS $$
DECLARE
  target_current_role app_role;
BEGIN
  IF NOT has_role(ARRAY['super_admin', 'admin']::app_role[]) THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  IF target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Voce nao pode alterar sua propria role';
  END IF;

  -- Se for admin (nao super_admin), restricoes adicionais
  IF has_role(ARRAY['admin']::app_role[]) AND NOT has_role(ARRAY['super_admin']::app_role[]) THEN
    -- Admin so pode atribuir moderador
    IF new_role != 'moderador' THEN
      RAISE EXCEPTION 'Admin so pode atribuir a role moderador';
    END IF;

    -- Verificar se o alvo e super_admin ou admin (nao pode tocar)
    SELECT ur.role INTO target_current_role
    FROM user_roles ur
    WHERE ur.user_id = target_user_id;

    IF target_current_role IN ('super_admin', 'admin') THEN
      RAISE EXCEPTION 'Admin nao pode alterar a role de outro admin ou superior';
    END IF;
  END IF;

  INSERT INTO user_roles (user_id, role)
  VALUES (target_user_id, new_role)
  ON CONFLICT (user_id)
  DO UPDATE SET role = new_role, updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 3. FUNCAO: admin_remove_user_role
-- Admin pode remover role apenas de moderadores
-- super_admin continua podendo usar remove_user_role para qualquer um
-- =============================================
CREATE OR REPLACE FUNCTION admin_remove_user_role(target_user_id UUID)
RETURNS void AS $$
DECLARE
  target_current_role app_role;
BEGIN
  IF NOT has_role(ARRAY['super_admin', 'admin']::app_role[]) THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  IF target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Voce nao pode remover sua propria role';
  END IF;

  -- Se for admin (nao super_admin), restricoes adicionais
  IF has_role(ARRAY['admin']::app_role[]) AND NOT has_role(ARRAY['super_admin']::app_role[]) THEN
    SELECT ur.role INTO target_current_role
    FROM user_roles ur
    WHERE ur.user_id = target_user_id;

    IF target_current_role IN ('super_admin', 'admin') THEN
      RAISE EXCEPTION 'Admin nao pode remover a role de outro admin ou superior';
    END IF;
  END IF;

  DELETE FROM user_roles WHERE user_id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- MIGRATION COMPLETA!
--
-- Novas funcoes:
-- - admin_get_users(): lista usuarios moderador/sem role (admin+)
-- - admin_assign_user_role(): atribui role com restricoes para admin
-- - admin_remove_user_role(): remove role com restricoes para admin
-- =============================================
