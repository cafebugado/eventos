-- Adiciona campo status nos eventos (rascunho, publicado, arquivado)
-- Eventos existentes recebem 'publicado' como padrão

ALTER TABLE eventos
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'publicado'
CHECK (status IN ('rascunho', 'publicado', 'arquivado'));

-- Atualizar todos os eventos existentes para 'publicado'
UPDATE eventos SET status = 'publicado' WHERE status IS NULL;

-- Índice para filtrar por status eficientemente
CREATE INDEX IF NOT EXISTS idx_eventos_status ON eventos(status);

-- Atualizar a política de SELECT público para mostrar apenas eventos publicados
DROP POLICY IF EXISTS "Eventos são públicos para leitura" ON eventos;

CREATE POLICY "Eventos publicados são públicos para leitura" ON eventos
  FOR SELECT USING (
    status = 'publicado'
    OR auth.role() = 'authenticated'
  );
