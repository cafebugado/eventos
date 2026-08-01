-- =============================================
-- MIGRATION: EventFlow - Setup Inicial Completo
-- Execute este arquivo no SQL Editor do Supabase
-- =============================================

-- =============================================
-- 1. CRIAR TABELA DE EVENTOS
-- =============================================
CREATE TABLE IF NOT EXISTS eventos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  data_evento TEXT NOT NULL,
  horario TEXT NOT NULL,
  dia_semana TEXT NOT NULL,
  periodo TEXT NOT NULL CHECK (periodo IN ('Matinal', 'Diurno', 'Vespertino', 'Noturno')),
  link TEXT NOT NULL,
  imagem TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar coluna descricao se não existir (para tabelas já criadas)
ALTER TABLE eventos ADD COLUMN IF NOT EXISTS descricao TEXT;

-- Criar índice para ordenação por data
CREATE INDEX IF NOT EXISTS idx_eventos_data ON eventos(data_evento);

-- =============================================
-- 2. ROW LEVEL SECURITY (RLS) - TABELA EVENTOS
-- =============================================
ALTER TABLE eventos ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes (se houver)
DROP POLICY IF EXISTS "Eventos são públicos para leitura" ON eventos;
DROP POLICY IF EXISTS "Usuários autenticados podem criar eventos" ON eventos;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar eventos" ON eventos;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar eventos" ON eventos;

-- Política: Leitura pública (qualquer um pode ver eventos)
CREATE POLICY "Eventos são públicos para leitura" ON eventos
  FOR SELECT
  USING (true);

-- Política: Inserção apenas por usuários autenticados
CREATE POLICY "Usuários autenticados podem criar eventos" ON eventos
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Política: Atualização apenas por usuários autenticados
CREATE POLICY "Usuários autenticados podem atualizar eventos" ON eventos
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Política: Exclusão apenas por usuários autenticados
CREATE POLICY "Usuários autenticados podem deletar eventos" ON eventos
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- =============================================
-- 3. TRIGGER PARA ATUALIZAR updated_at
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Remover trigger existente (se houver)
DROP TRIGGER IF EXISTS update_eventos_updated_at ON eventos;

CREATE TRIGGER update_eventos_updated_at
  BEFORE UPDATE ON eventos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 4. CRIAR BUCKET DE STORAGE PARA IMAGENS
-- =============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('imagens', 'imagens', true)
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- 5. POLÍTICAS DE STORAGE - BUCKET IMAGENS
-- =============================================

-- Remover políticas existentes (se houver)
DROP POLICY IF EXISTS "Imagens são públicas para leitura" ON storage.objects;
DROP POLICY IF EXISTS "Usuários autenticados podem fazer upload" ON storage.objects;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar imagens" ON storage.objects;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar imagens" ON storage.objects;

-- Política: Leitura pública de imagens
CREATE POLICY "Imagens são públicas para leitura" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'imagens');

-- Política: Upload apenas por usuários autenticados
CREATE POLICY "Usuários autenticados podem fazer upload" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'imagens' AND auth.role() = 'authenticated');

-- Política: Atualização apenas por usuários autenticados
CREATE POLICY "Usuários autenticados podem atualizar imagens" ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'imagens' AND auth.role() = 'authenticated');

-- Política: Deleção apenas por usuários autenticados
CREATE POLICY "Usuários autenticados podem deletar imagens" ON storage.objects
  FOR DELETE
  USING (bucket_id = 'imagens' AND auth.role() = 'authenticated');

-- =============================================
-- MIGRATION COMPLETA!
--
-- Próximos passos:
-- 1. Vá em Authentication > Users > Add User
-- 2. Crie seu usuário admin com email e senha
-- 3. Configure o .env com VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY
-- 4. Execute: pnpm dev
-- =============================================
