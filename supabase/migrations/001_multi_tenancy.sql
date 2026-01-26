-- ========================================
-- MIGRATION: Multi-Tenancy Support
-- Adiciona suporte a múltiplos clientes (white-label)
-- ========================================

-- ========================================
-- TABELA: tenants
-- Configuração de cada cliente/tenant
-- ========================================
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,

    -- Configuração de features
    features JSONB NOT NULL DEFAULT '{
        "photos": true,
        "rsvp": true,
        "contracts": true,
        "checkin": true,
        "pix": true
    }',

    -- Limites do plano
    limits JSONB NOT NULL DEFAULT '{
        "maxGuests": 500,
        "maxPhotos": 1000,
        "maxAdmins": 5
    }',

    -- Customização visual
    theme JSONB NOT NULL DEFAULT '{
        "primaryColor": "#8B5A5A",
        "secondaryColor": "#D4A574",
        "logoUrl": "",
        "faviconUrl": ""
    }',

    -- Configuração de backend e integrações
    config JSONB NOT NULL DEFAULT '{
        "backend": "supabase",
        "integrations": {
            "payment": "pix"
        }
    }',

    -- Plano e status
    plan VARCHAR(50) DEFAULT 'basic',
    is_active BOOLEAN DEFAULT TRUE,

    -- Domínios personalizados
    custom_domain VARCHAR(255),

    -- Datas
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Índices para tenants
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug);
CREATE INDEX IF NOT EXISTS idx_tenants_custom_domain ON tenants(custom_domain) WHERE custom_domain IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tenants_is_active ON tenants(is_active);

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_tenants_updated_at ON tenants;
CREATE TRIGGER update_tenants_updated_at
    BEFORE UPDATE ON tenants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- ADICIONAR tenant_id NAS TABELAS EXISTENTES
-- ========================================

-- Convidados
ALTER TABLE convidados
    ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_convidados_tenant_id ON convidados(tenant_id);

-- Contratos (se existir)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'contratos') THEN
        ALTER TABLE contratos
            ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
        CREATE INDEX IF NOT EXISTS idx_contratos_tenant_id ON contratos(tenant_id);
    END IF;
END $$;

-- Fotos
ALTER TABLE fotos
    ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_fotos_tenant_id ON fotos(tenant_id);

-- Foto Likes
ALTER TABLE foto_likes
    ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_foto_likes_tenant_id ON foto_likes(tenant_id);

-- Foto Comentários
ALTER TABLE foto_comentarios
    ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_foto_comentarios_tenant_id ON foto_comentarios(tenant_id);

-- ========================================
-- TABELA: tenant_admins
-- Administradores de cada tenant
-- ========================================
CREATE TABLE IF NOT EXISTS tenant_admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_tenant_admins_tenant_id ON tenant_admins(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_admins_user_id ON tenant_admins(user_id);

-- ========================================
-- FUNÇÕES AUXILIARES
-- ========================================

-- Função para obter tenant_id do contexto atual
CREATE OR REPLACE FUNCTION get_current_tenant_id()
RETURNS UUID AS $$
BEGIN
    RETURN NULLIF(current_setting('app.current_tenant_id', true), '')::UUID;
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;

-- Função para definir tenant_id no contexto
CREATE OR REPLACE FUNCTION set_current_tenant_id(p_tenant_id UUID)
RETURNS VOID AS $$
BEGIN
    PERFORM set_config('app.current_tenant_id', p_tenant_id::TEXT, false);
END;
$$ LANGUAGE plpgsql;

-- Função para buscar tenant por slug
CREATE OR REPLACE FUNCTION get_tenant_by_slug(p_slug VARCHAR)
RETURNS SETOF tenants AS $$
BEGIN
    RETURN QUERY SELECT * FROM tenants WHERE slug = p_slug AND is_active = true;
END;
$$ LANGUAGE plpgsql STABLE;

-- Função para buscar tenant por domínio
CREATE OR REPLACE FUNCTION get_tenant_by_domain(p_domain VARCHAR)
RETURNS SETOF tenants AS $$
BEGIN
    RETURN QUERY SELECT * FROM tenants WHERE custom_domain = p_domain AND is_active = true;
END;
$$ LANGUAGE plpgsql STABLE;

-- ========================================
-- ROW LEVEL SECURITY (RLS) - ATUALIZADO
-- ========================================

-- Remover políticas antigas de convidados
DROP POLICY IF EXISTS "Convidados podem ser lidos publicamente" ON convidados;
DROP POLICY IF EXISTS "Convidados podem ser atualizados publicamente" ON convidados;

-- Novas políticas com isolamento por tenant
CREATE POLICY "tenant_isolation_select_convidados"
    ON convidados FOR SELECT
    USING (
        tenant_id IS NULL
        OR tenant_id = get_current_tenant_id()
    );

CREATE POLICY "tenant_isolation_insert_convidados"
    ON convidados FOR INSERT
    WITH CHECK (
        tenant_id IS NULL
        OR tenant_id = get_current_tenant_id()
    );

CREATE POLICY "tenant_isolation_update_convidados"
    ON convidados FOR UPDATE
    USING (
        tenant_id IS NULL
        OR tenant_id = get_current_tenant_id()
    )
    WITH CHECK (
        tenant_id IS NULL
        OR tenant_id = get_current_tenant_id()
    );

CREATE POLICY "tenant_isolation_delete_convidados"
    ON convidados FOR DELETE
    USING (
        tenant_id IS NULL
        OR tenant_id = get_current_tenant_id()
    );

-- Remover políticas antigas de fotos
DROP POLICY IF EXISTS "Fotos aprovadas podem ser lidas publicamente" ON fotos;
DROP POLICY IF EXISTS "Fotos podem ser inseridas publicamente" ON fotos;
DROP POLICY IF EXISTS "Fotos podem ser atualizadas publicamente" ON fotos;
DROP POLICY IF EXISTS "Fotos podem ser deletadas publicamente" ON fotos;

-- Novas políticas de fotos com isolamento por tenant
CREATE POLICY "tenant_isolation_select_fotos"
    ON fotos FOR SELECT
    USING (
        (tenant_id IS NULL OR tenant_id = get_current_tenant_id())
        AND (aprovado = true OR get_current_tenant_id() IS NOT NULL)
    );

CREATE POLICY "tenant_isolation_insert_fotos"
    ON fotos FOR INSERT
    WITH CHECK (
        tenant_id IS NULL
        OR tenant_id = get_current_tenant_id()
    );

CREATE POLICY "tenant_isolation_update_fotos"
    ON fotos FOR UPDATE
    USING (
        tenant_id IS NULL
        OR tenant_id = get_current_tenant_id()
    )
    WITH CHECK (
        tenant_id IS NULL
        OR tenant_id = get_current_tenant_id()
    );

CREATE POLICY "tenant_isolation_delete_fotos"
    ON fotos FOR DELETE
    USING (
        tenant_id IS NULL
        OR tenant_id = get_current_tenant_id()
    );

-- Remover políticas antigas de likes e comentários
DROP POLICY IF EXISTS "Likes podem ser gerenciados publicamente" ON foto_likes;
DROP POLICY IF EXISTS "Comentarios podem ser gerenciados publicamente" ON foto_comentarios;

-- Novas políticas de likes com isolamento por tenant
CREATE POLICY "tenant_isolation_foto_likes"
    ON foto_likes FOR ALL
    USING (
        tenant_id IS NULL
        OR tenant_id = get_current_tenant_id()
    )
    WITH CHECK (
        tenant_id IS NULL
        OR tenant_id = get_current_tenant_id()
    );

-- Novas políticas de comentários com isolamento por tenant
CREATE POLICY "tenant_isolation_foto_comentarios"
    ON foto_comentarios FOR ALL
    USING (
        tenant_id IS NULL
        OR tenant_id = get_current_tenant_id()
    )
    WITH CHECK (
        tenant_id IS NULL
        OR tenant_id = get_current_tenant_id()
    );

-- RLS para tenants (apenas admins podem ver)
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenants_select_own"
    ON tenants FOR SELECT
    USING (
        id = get_current_tenant_id()
        OR EXISTS (
            SELECT 1 FROM tenant_admins
            WHERE tenant_admins.tenant_id = tenants.id
            AND tenant_admins.user_id = auth.uid()
        )
    );

-- RLS para tenant_admins
ALTER TABLE tenant_admins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_admins_select"
    ON tenant_admins FOR SELECT
    USING (
        tenant_id = get_current_tenant_id()
        OR user_id = auth.uid()
    );

-- ========================================
-- TENANT PADRÃO (para migração de dados existentes)
-- ========================================

-- Inserir tenant padrão para dados existentes
INSERT INTO tenants (id, slug, name, plan)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'default',
    'Lista de Casamento',
    'premium'
) ON CONFLICT (slug) DO NOTHING;

-- Atualizar registros existentes para usar o tenant padrão
UPDATE convidados SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
UPDATE fotos SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
UPDATE foto_likes SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
UPDATE foto_comentarios SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;

-- ========================================
-- COMENTÁRIOS
-- ========================================

COMMENT ON TABLE tenants IS 'Configuração de cada cliente/tenant para white-label';
COMMENT ON COLUMN tenants.slug IS 'Identificador único do tenant na URL (ex: meu-casamento)';
COMMENT ON COLUMN tenants.features IS 'Features habilitadas para este tenant';
COMMENT ON COLUMN tenants.limits IS 'Limites do plano (maxGuests, maxPhotos, maxAdmins)';
COMMENT ON COLUMN tenants.theme IS 'Customização visual (cores, logo, favicon)';
COMMENT ON COLUMN tenants.custom_domain IS 'Domínio personalizado opcional (ex: casamento.dominio.com)';
COMMENT ON FUNCTION get_current_tenant_id() IS 'Retorna o tenant_id do contexto atual da sessão';
COMMENT ON FUNCTION set_current_tenant_id(UUID) IS 'Define o tenant_id no contexto da sessão atual';
