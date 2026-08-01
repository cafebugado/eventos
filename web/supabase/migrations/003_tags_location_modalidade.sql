-- =============================================
-- MIGRATION: Tags, Localização e Modalidade
-- Execute este arquivo no SQL Editor do Supabase
-- =============================================

-- =============================================
-- 1. CRIAR TABELA DE TAGS
-- =============================================
CREATE TABLE IF NOT EXISTS tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL UNIQUE,
  cor TEXT DEFAULT '#2563eb',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índice para ordenação por nome
CREATE INDEX IF NOT EXISTS idx_tags_nome ON tags(nome);

-- =============================================
-- 2. CRIAR TABELA DE JUNÇÃO EVENTOS <-> TAGS
-- =============================================
CREATE TABLE IF NOT EXISTS evento_tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  evento_id UUID NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(evento_id, tag_id)
);

-- Índices para performance nas buscas
CREATE INDEX IF NOT EXISTS idx_evento_tags_evento ON evento_tags(evento_id);
CREATE INDEX IF NOT EXISTS idx_evento_tags_tag ON evento_tags(tag_id);

-- =============================================
-- 3. ADICIONAR COLUNAS DE LOCALIZAÇÃO E MODALIDADE NA TABELA EVENTOS
-- (Campos nullable para não afetar eventos já cadastrados)
-- =============================================
ALTER TABLE eventos ADD COLUMN IF NOT EXISTS modalidade TEXT DEFAULT NULL;
ALTER TABLE eventos ADD COLUMN IF NOT EXISTS endereco TEXT DEFAULT NULL;
ALTER TABLE eventos ADD COLUMN IF NOT EXISTS cidade TEXT DEFAULT NULL;
ALTER TABLE eventos ADD COLUMN IF NOT EXISTS estado TEXT DEFAULT NULL;

-- =============================================
-- 4. ROW LEVEL SECURITY (RLS) - TABELA TAGS
-- =============================================
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes (se houver)
DROP POLICY IF EXISTS "Tags são públicas para leitura" ON tags;
DROP POLICY IF EXISTS "Usuários autenticados podem criar tags" ON tags;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar tags" ON tags;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar tags" ON tags;

-- Política: Leitura pública
CREATE POLICY "Tags são públicas para leitura" ON tags
  FOR SELECT
  USING (true);

-- Política: Inserção apenas por usuários autenticados
CREATE POLICY "Usuários autenticados podem criar tags" ON tags
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Política: Atualização apenas por usuários autenticados
CREATE POLICY "Usuários autenticados podem atualizar tags" ON tags
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Política: Exclusão apenas por usuários autenticados
CREATE POLICY "Usuários autenticados podem deletar tags" ON tags
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- =============================================
-- 5. ROW LEVEL SECURITY (RLS) - TABELA EVENTO_TAGS
-- =============================================
ALTER TABLE evento_tags ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes (se houver)
DROP POLICY IF EXISTS "Evento tags são públicas para leitura" ON evento_tags;
DROP POLICY IF EXISTS "Usuários autenticados podem criar evento tags" ON evento_tags;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar evento tags" ON evento_tags;

-- Política: Leitura pública
CREATE POLICY "Evento tags são públicas para leitura" ON evento_tags
  FOR SELECT
  USING (true);

-- Política: Inserção apenas por usuários autenticados
CREATE POLICY "Usuários autenticados podem criar evento tags" ON evento_tags
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Política: Exclusão apenas por usuários autenticados
CREATE POLICY "Usuários autenticados podem deletar evento tags" ON evento_tags
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- =============================================
-- 6. TRIGGERS PARA ATUALIZAR updated_at
-- =============================================
DROP TRIGGER IF EXISTS update_tags_updated_at ON tags;

CREATE TRIGGER update_tags_updated_at
  BEFORE UPDATE ON tags
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- MIGRATION COMPLETA!
--
-- Resumo das alterações:
-- 1. Tabela 'tags' criada (nome, cor)
-- 2. Tabela 'evento_tags' criada (junção N:N entre eventos e tags)
-- 3. Colunas adicionadas em 'eventos': modalidade, endereco, cidade, estado
-- 4. Todos os novos campos são nullable (eventos existentes não são afetados)
-- 5. RLS configurado para tags e evento_tags
-- 6. Trigger de updated_at para tags
--
-- Próximos passos:
-- 1. Execute esta migration no SQL Editor do Supabase
-- 2. Crie tags pelo Dashboard Admin > Tags
-- 3. Ao criar/editar eventos, associe tags e preencha localização
-- =============================================
