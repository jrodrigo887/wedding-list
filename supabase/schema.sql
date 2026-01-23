-- ========================================
-- SCHEMA DO BANCO DE DADOS SUPABASE
-- Lista de Presentes de Casamento
-- ========================================


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
-- DADOS DE EXEMPLO (opcional)
-- ========================================

-- Descomente para inserir dados de teste
/*
INSERT INTO convidados (codigo, nome, parceiro, acompanhantes) VALUES
('CASAM001', 'Joao Silva', 'Maria Silva', 0),
('CASAM002', 'Pedro Santos', NULL, 1),
('CASAM003', 'Ana Oliveira', 'Carlos Oliveira', 2);
*/
