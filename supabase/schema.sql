
-- ========================================
-- TABELA: convidados
-- Lista de convidados para RSVP e check-in
-- ========================================
CREATE TABLE IF NOT EXISTS convidados (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    nome VARCHAR(255) NOT NULL,
    parceiro VARCHAR(255),
    email VARCHAR(255),
    telefone VARCHAR(50),
    acompanhantes INTEGER DEFAULT 0,
    confirmado BOOLEAN DEFAULT FALSE,
    data_confirmacao TIMESTAMP WITH TIME ZONE,
    checkin BOOLEAN DEFAULT FALSE,
    horario_entrada TIMESTAMP WITH TIME ZONE,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indice para busca por codigo (case insensitive)
CREATE INDEX IF NOT EXISTS idx_convidados_codigo ON convidados(LOWER(codigo));

-- Indice para filtrar confirmados
CREATE INDEX IF NOT EXISTS idx_convidados_confirmado ON convidados(confirmado);

-- ========================================
-- FUNCAO: Atualizar updated_at automaticamente
-- ========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';


-- Trigger para convidados
DROP TRIGGER IF EXISTS update_convidados_updated_at ON convidados;
CREATE TRIGGER update_convidados_updated_at
    BEFORE UPDATE ON convidados
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- ROW LEVEL SECURITY (RLS)
-- ========================================

-- Habilitar RLS nas tabelas
ALTER TABLE convidados ENABLE ROW LEVEL SECURITY;

-- Politica para convidados: leitura e atualizacao publica (por codigo)
CREATE POLICY "Convidados podem ser lidos publicamente"
    ON convidados FOR SELECT
    USING (true);

CREATE POLICY "Convidados podem ser atualizados publicamente"
    ON convidados FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- ========================================
-- TABELA: fotos
-- Fotos enviadas pelos convidados
-- ========================================
CREATE TABLE IF NOT EXISTS fotos (
    id BIGSERIAL PRIMARY KEY,
    codigo_convidado VARCHAR(50) NOT NULL,
    nome_convidado VARCHAR(255) NOT NULL,
    storage_path VARCHAR(500) NOT NULL,
    thumbnail_path VARCHAR(500),
    original_filename VARCHAR(255),
    file_size INTEGER,
    mime_type VARCHAR(50),
    caption TEXT,
    aprovado BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indices para fotos
CREATE INDEX IF NOT EXISTS idx_fotos_codigo ON fotos(codigo_convidado);
CREATE INDEX IF NOT EXISTS idx_fotos_aprovado ON fotos(aprovado);
CREATE INDEX IF NOT EXISTS idx_fotos_created_at ON fotos(created_at DESC);

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_fotos_updated_at ON fotos;
CREATE TRIGGER update_fotos_updated_at
    BEFORE UPDATE ON fotos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- TABELA: foto_likes
-- Curtidas nas fotos
-- ========================================
CREATE TABLE IF NOT EXISTS foto_likes (
    id BIGSERIAL PRIMARY KEY,
    foto_id BIGINT NOT NULL REFERENCES fotos(id) ON DELETE CASCADE,
    codigo_convidado VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(foto_id, codigo_convidado)
);

-- Indices para likes
CREATE INDEX IF NOT EXISTS idx_foto_likes_foto_id ON foto_likes(foto_id);
CREATE INDEX IF NOT EXISTS idx_foto_likes_codigo ON foto_likes(codigo_convidado);

-- ========================================
-- TABELA: foto_comentarios
-- Comentarios nas fotos
-- ========================================
CREATE TABLE IF NOT EXISTS foto_comentarios (
    id BIGSERIAL PRIMARY KEY,
    foto_id BIGINT NOT NULL REFERENCES fotos(id) ON DELETE CASCADE,
    codigo_convidado VARCHAR(50) NOT NULL,
    nome_convidado VARCHAR(255) NOT NULL,
    texto TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indice para comentarios
CREATE INDEX IF NOT EXISTS idx_foto_comentarios_foto_id ON foto_comentarios(foto_id);

-- ========================================
-- RLS para tabelas de fotos
-- ========================================

-- Habilitar RLS
ALTER TABLE fotos ENABLE ROW LEVEL SECURITY;
ALTER TABLE foto_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE foto_comentarios ENABLE ROW LEVEL SECURITY;

-- Politicas para fotos
DROP POLICY IF EXISTS "Fotos aprovadas podem ser lidas publicamente" ON fotos;
CREATE POLICY "Fotos aprovadas podem ser lidas publicamente"
    ON fotos FOR SELECT
    USING (aprovado = true);

DROP POLICY IF EXISTS "Fotos podem ser inseridas publicamente" ON fotos;
CREATE POLICY "Fotos podem ser inseridas publicamente"
    ON fotos FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Fotos podem ser atualizadas publicamente" ON fotos;
CREATE POLICY "Fotos podem ser atualizadas publicamente"
    ON fotos FOR UPDATE
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Fotos podem ser deletadas publicamente" ON fotos;
CREATE POLICY "Fotos podem ser deletadas publicamente"
    ON fotos FOR DELETE
    USING (true);

-- Politicas para likes
DROP POLICY IF EXISTS "Likes podem ser gerenciados publicamente" ON foto_likes;
CREATE POLICY "Likes podem ser gerenciados publicamente"
    ON foto_likes FOR ALL
    USING (true)
    WITH CHECK (true);

-- Politicas para comentarios
DROP POLICY IF EXISTS "Comentarios podem ser gerenciados publicamente" ON foto_comentarios;
CREATE POLICY "Comentarios podem ser gerenciados publicamente"
    ON foto_comentarios FOR ALL
    USING (true)
    WITH CHECK (true);

-- ========================================
-- DADOS DE EXEMPLO (opcional)
-- ========================================

-- Descomente para inserir dados de teste
/*
INSERT INTO convidados (codigo, nome, parceiro, acompanhantes) VALUES
('CASAM001', 'Joao Silva', 'Maria Silva', 0),
('CASAM002', 'Pedro Santos', NULL, 1),
('CASAM003', 'Ana Oliveira', 'Carlos Oliveira', 2);
*/
