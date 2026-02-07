-- =============================================
-- MIGRATION: Contribuintes do Projeto
-- Execute este arquivo no SQL Editor do Supabase
-- =============================================

-- =============================================
-- 1. CRIAR TABELA DE CONTRIBUINTES
-- =============================================
CREATE TABLE IF NOT EXISTS contribuintes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  github_username TEXT NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  avatar_url TEXT NOT NULL,
  github_url TEXT NOT NULL,
  linkedin_url TEXT,
  portfolio_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índice para ordenação por nome
CREATE INDEX IF NOT EXISTS idx_contribuintes_nome ON contribuintes(nome);

-- =============================================
-- 2. ROW LEVEL SECURITY (RLS) - TABELA CONTRIBUINTES
-- =============================================
ALTER TABLE contribuintes ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes (se houver)
DROP POLICY IF EXISTS "Contribuintes são públicos para leitura" ON contribuintes;
DROP POLICY IF EXISTS "Usuários autenticados podem criar contribuintes" ON contribuintes;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar contribuintes" ON contribuintes;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar contribuintes" ON contribuintes;

-- Política: Leitura pública (qualquer um pode ver contribuintes)
CREATE POLICY "Contribuintes são públicos para leitura" ON contribuintes
  FOR SELECT
  USING (true);

-- Política: Inserção apenas por usuários autenticados
CREATE POLICY "Usuários autenticados podem criar contribuintes" ON contribuintes
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Política: Atualização apenas por usuários autenticados
CREATE POLICY "Usuários autenticados podem atualizar contribuintes" ON contribuintes
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Política: Exclusão apenas por usuários autenticados
CREATE POLICY "Usuários autenticados podem deletar contribuintes" ON contribuintes
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- =============================================
-- 3. TRIGGER PARA ATUALIZAR updated_at
-- =============================================
DROP TRIGGER IF EXISTS update_contribuintes_updated_at ON contribuintes;

CREATE TRIGGER update_contribuintes_updated_at
  BEFORE UPDATE ON contribuintes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- MIGRATION COMPLETA!
--
-- Próximos passos:
-- 1. Execute esta migration no SQL Editor do Supabase
-- 2. Os contribuintes aparecerão na página Sobre
-- 3. Gerencie pelo Dashboard Admin > Contribuintes
-- =============================================
