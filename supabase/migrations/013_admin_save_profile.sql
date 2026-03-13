-- =============================================
-- MIGRATION: Garantir que admin e moderador possam salvar configurações de perfil
-- A policy original (009) usava apenas auth.uid() = user_id sem WITH CHECK no UPDATE
-- Esta migration corrige adicionando WITH CHECK e mantendo o acesso para todos os roles válidos
-- =============================================

-- 1. Remover policies existentes de INSERT e UPDATE (criadas na 009 e tentativas anteriores)
DROP POLICY IF EXISTS "Usuario pode criar seu proprio perfil" ON user_profiles;
DROP POLICY IF EXISTS "Usuario pode atualizar seu proprio perfil" ON user_profiles;
DROP POLICY IF EXISTS "Usuario autenticado pode criar seu proprio perfil" ON user_profiles;
DROP POLICY IF EXISTS "Usuario autenticado pode atualizar seu proprio perfil" ON user_profiles;

-- 2. Nova policy de INSERT: qualquer usuário autenticado insere o próprio perfil
CREATE POLICY "Usuario autenticado pode criar seu proprio perfil"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 3. Nova policy de UPDATE com WITH CHECK explícito (corrige upsert via .upsert())
CREATE POLICY "Usuario autenticado pode atualizar seu proprio perfil"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
