-- =============================================
-- MIGRATION: Galeria de Fotos
-- Execute este arquivo no SQL Editor do Supabase
-- =============================================

-- =============================================
-- 1. CRIAR TABELA DE ÁLBUNS
-- =============================================
CREATE TABLE IF NOT EXISTS galeria_albuns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  evento_id UUID REFERENCES eventos(id) ON DELETE SET NULL,
  comunidade_id UUID REFERENCES comunidades(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Garantir unicidade por evento (um álbum por evento)
ALTER TABLE galeria_albuns
  DROP CONSTRAINT IF EXISTS galeria_albuns_evento_id_unique,
  ADD CONSTRAINT galeria_albuns_evento_id_unique UNIQUE (evento_id);

-- Índices
CREATE INDEX IF NOT EXISTS idx_galeria_albuns_evento_id ON galeria_albuns(evento_id);
CREATE INDEX IF NOT EXISTS idx_galeria_albuns_comunidade_id ON galeria_albuns(comunidade_id);
CREATE INDEX IF NOT EXISTS idx_galeria_albuns_created_by ON galeria_albuns(created_by);

-- =============================================
-- 2. CRIAR TABELA DE FOTOS
-- =============================================
CREATE TABLE IF NOT EXISTS galeria_fotos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  album_id UUID NOT NULL REFERENCES galeria_albuns(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  storage_path TEXT,           -- caminho no bucket (para deletar do storage)
  legenda TEXT,
  ordem INTEGER DEFAULT 0,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_galeria_fotos_album_id ON galeria_fotos(album_id);
CREATE INDEX IF NOT EXISTS idx_galeria_fotos_uploaded_by ON galeria_fotos(uploaded_by);

-- =============================================
-- 3. TRIGGER: set created_by no INSERT de álbum
-- =============================================
CREATE OR REPLACE FUNCTION set_galeria_album_created_by()
RETURNS TRIGGER AS $$
BEGIN
  NEW.created_by := auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_set_galeria_album_created_by ON galeria_albuns;
CREATE TRIGGER trigger_set_galeria_album_created_by
  BEFORE INSERT ON galeria_albuns
  FOR EACH ROW
  EXECUTE FUNCTION set_galeria_album_created_by();

-- =============================================
-- 4. TRIGGER: set uploaded_by no INSERT de foto
-- =============================================
CREATE OR REPLACE FUNCTION set_galeria_foto_uploaded_by()
RETURNS TRIGGER AS $$
BEGIN
  NEW.uploaded_by := auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_set_galeria_foto_uploaded_by ON galeria_fotos;
CREATE TRIGGER trigger_set_galeria_foto_uploaded_by
  BEFORE INSERT ON galeria_fotos
  FOR EACH ROW
  EXECUTE FUNCTION set_galeria_foto_uploaded_by();

-- =============================================
-- 5. TRIGGER: updated_at nos álbuns
-- =============================================
DROP TRIGGER IF EXISTS update_galeria_albuns_updated_at ON galeria_albuns;
CREATE TRIGGER update_galeria_albuns_updated_at
  BEFORE UPDATE ON galeria_albuns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 6. ROW LEVEL SECURITY — galeria_albuns
-- =============================================
ALTER TABLE galeria_albuns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Álbuns são públicos para leitura" ON galeria_albuns;
DROP POLICY IF EXISTS "Admins e moderadores podem criar álbuns" ON galeria_albuns;
DROP POLICY IF EXISTS "Admins podem atualizar qualquer álbum" ON galeria_albuns;
DROP POLICY IF EXISTS "Moderador pode atualizar seus próprios álbuns" ON galeria_albuns;
DROP POLICY IF EXISTS "Admins podem deletar álbuns" ON galeria_albuns;
DROP POLICY IF EXISTS "Moderador pode deletar seus próprios álbuns" ON galeria_albuns;

-- SELECT: leitura pública
CREATE POLICY "Álbuns são públicos para leitura" ON galeria_albuns
  FOR SELECT USING (true);

-- INSERT
CREATE POLICY "Admins e moderadores podem criar álbuns" ON galeria_albuns
  FOR INSERT
  WITH CHECK (has_role(ARRAY['super_admin', 'admin', 'moderador']::app_role[]));

-- UPDATE
CREATE POLICY "Admins podem atualizar qualquer álbum" ON galeria_albuns
  FOR UPDATE
  USING (has_role(ARRAY['super_admin', 'admin']::app_role[]));

CREATE POLICY "Moderador pode atualizar seus próprios álbuns" ON galeria_albuns
  FOR UPDATE
  USING (
    has_role(ARRAY['moderador']::app_role[])
    AND created_by = auth.uid()
  );

-- DELETE
CREATE POLICY "Admins podem deletar álbuns" ON galeria_albuns
  FOR DELETE
  USING (has_role(ARRAY['super_admin', 'admin']::app_role[]));

CREATE POLICY "Moderador pode deletar seus próprios álbuns" ON galeria_albuns
  FOR DELETE
  USING (
    has_role(ARRAY['moderador']::app_role[])
    AND created_by = auth.uid()
  );

-- =============================================
-- 7. ROW LEVEL SECURITY — galeria_fotos
-- =============================================
ALTER TABLE galeria_fotos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Fotos são públicas para leitura" ON galeria_fotos;
DROP POLICY IF EXISTS "Admins e moderadores podem inserir fotos" ON galeria_fotos;
DROP POLICY IF EXISTS "Admins podem deletar qualquer foto" ON galeria_fotos;
DROP POLICY IF EXISTS "Moderador pode deletar suas próprias fotos" ON galeria_fotos;

-- SELECT: leitura pública
CREATE POLICY "Fotos são públicas para leitura" ON galeria_fotos
  FOR SELECT USING (true);

-- INSERT: quem tem acesso ao álbum pode inserir fotos
CREATE POLICY "Admins e moderadores podem inserir fotos" ON galeria_fotos
  FOR INSERT
  WITH CHECK (has_role(ARRAY['super_admin', 'admin', 'moderador']::app_role[]));

-- DELETE: admins deletam qualquer; moderador só as próprias
CREATE POLICY "Admins podem deletar qualquer foto" ON galeria_fotos
  FOR DELETE
  USING (has_role(ARRAY['super_admin', 'admin']::app_role[]));

CREATE POLICY "Moderador pode deletar suas próprias fotos" ON galeria_fotos
  FOR DELETE
  USING (
    has_role(ARRAY['moderador']::app_role[])
    AND uploaded_by = auth.uid()
  );

-- =============================================
-- MIGRATION COMPLETA!
--
-- Resumo:
-- 1. Tabela 'galeria_albuns' (id, evento_id, comunidade_id, created_by, timestamps)
-- 2. Tabela 'galeria_fotos'  (id, album_id, url, storage_path, legenda, ordem, uploaded_by, created_at)
-- 3. Trigger: created_by / uploaded_by preenchidos automaticamente no INSERT
-- 4. Trigger: updated_at atualizado automaticamente nos álbuns
-- 5. RLS galeria_albuns: leitura pública | escrita/edição/deleção por role
-- 6. RLS galeria_fotos:  leitura pública | inserção/deleção por role
--
-- Pré-requisitos:
--   - Tabela 'eventos' já existe  (migration 001)
--   - Tabela 'comunidades' já existe (migration 014)
--   - Função 'has_role'  já existe  (migration 004)
--   - Função 'update_updated_at_column' já existe (migration 001)
--
-- Próximos passos:
-- 1. Execute esta migration no SQL Editor do Supabase
-- 2. No Storage > Buckets, certifique-se que o bucket 'imagens' existe e é público
-- 3. Adicione a policy no bucket para permitir upload (se não existir):
--    INSERT policy: authenticated users pode fazer upload em galeria/**
-- =============================================
