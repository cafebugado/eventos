-- =============================================
-- MIGRATION: Perfil de usuario
-- Todos os perfis podem editar nome, sobrenome e github (avatar)
-- =============================================

-- 1. Criar tabela user_profiles
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT,
  sobrenome TEXT,
  github_username TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indice para busca rapida
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

-- 2. RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Cada usuario so ve o proprio perfil
CREATE POLICY "Usuario pode ver seu proprio perfil"
  ON user_profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Cada usuario so insere o proprio perfil
CREATE POLICY "Usuario pode criar seu proprio perfil"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Cada usuario so edita o proprio perfil
CREATE POLICY "Usuario pode atualizar seu proprio perfil"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- 3. Trigger updated_at (reutiliza funcao da migration 001)
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
