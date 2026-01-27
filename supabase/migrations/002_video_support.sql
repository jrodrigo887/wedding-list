-- Adicionar suporte a vídeo na tabela fotos
ALTER TABLE fotos ADD COLUMN IF NOT EXISTS media_type VARCHAR(10) DEFAULT 'photo'
  CHECK (media_type IN ('photo', 'video'));
ALTER TABLE fotos ADD COLUMN IF NOT EXISTS duration INTEGER
  CHECK (duration IS NULL OR (duration >= 0 AND duration <= 60));
ALTER TABLE fotos ADD COLUMN IF NOT EXISTS poster_path VARCHAR(500);

-- Índice para filtrar por tipo
CREATE INDEX IF NOT EXISTS idx_fotos_media_type ON fotos(media_type);

-- Atualizar registros existentes
UPDATE fotos SET media_type = 'photo' WHERE media_type IS NULL;
