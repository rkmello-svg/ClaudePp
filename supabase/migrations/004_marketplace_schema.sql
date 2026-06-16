-- ============================================================================
-- ERP Enterprise OS - Marketplace & Verticals Schema
-- ============================================================================

-- ============================================================================
-- 1. MARKETPLACE MODULES (catalog of installable modules)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.marketplace_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  category VARCHAR(50),
  version VARCHAR(20) DEFAULT '1.0.0',
  author VARCHAR(255),
  icon TEXT,
  features JSONB DEFAULT '[]',
  required_permissions JSONB DEFAULT '[]',
  pricing_type VARCHAR(50) DEFAULT 'free',
  pricing_brl NUMERIC DEFAULT 0,
  rating NUMERIC DEFAULT 0,
  install_count INTEGER DEFAULT 0,
  is_official BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Catalog is public-readable to any authenticated user (shared marketplace).
ALTER TABLE public.marketplace_modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can browse the marketplace"
  ON public.marketplace_modules FOR SELECT
  TO authenticated
  USING (status = 'active');

-- ============================================================================
-- 2. MODULE INSTALLATIONS (per-company installed modules)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.module_installations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES public.marketplace_modules(id) ON DELETE CASCADE,
  module_version VARCHAR(20),
  enabled BOOLEAN DEFAULT TRUE,
  config JSONB DEFAULT '{}',
  installed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  installed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(company_id, module_id)
);

ALTER TABLE public.module_installations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view installations of their company"
  ON public.module_installations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.permissions
      WHERE permissions.company_id = module_installations.company_id
      AND permissions.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage installations of their company"
  ON public.module_installations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.permissions
      WHERE permissions.company_id = module_installations.company_id
      AND permissions.user_id = auth.uid()
      AND permissions.role IN ('owner', 'admin')
    )
  );

-- ============================================================================
-- 3. VERTICAL CONFIGURATIONS (applied business vertical per company)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.vertical_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  vertical_type VARCHAR(50) NOT NULL,
  modules JSONB DEFAULT '[]',
  settings JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  activated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(company_id, vertical_type)
);

ALTER TABLE public.vertical_configurations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view vertical config of their company"
  ON public.vertical_configurations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.permissions
      WHERE permissions.company_id = vertical_configurations.company_id
      AND permissions.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage vertical config of their company"
  ON public.vertical_configurations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.permissions
      WHERE permissions.company_id = vertical_configurations.company_id
      AND permissions.user_id = auth.uid()
      AND permissions.role IN ('owner', 'admin')
    )
  );

-- ============================================================================
-- 4. INDEXES
-- ============================================================================

CREATE INDEX idx_marketplace_category ON public.marketplace_modules(category);
CREATE INDEX idx_marketplace_slug ON public.marketplace_modules(slug);
CREATE INDEX idx_installations_company ON public.module_installations(company_id);
CREATE INDEX idx_installations_module ON public.module_installations(module_id);
CREATE INDEX idx_vertical_config_company ON public.vertical_configurations(company_id);

-- ============================================================================
-- 5. TRIGGERS
-- ============================================================================

CREATE TRIGGER update_marketplace_updated_at BEFORE UPDATE ON marketplace_modules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_installations_updated_at BEFORE UPDATE ON module_installations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- 6. SEED: Official modules catalog
-- ============================================================================

INSERT INTO public.marketplace_modules (name, slug, description, category, author, icon, features, pricing_type, is_official, is_verified)
VALUES
  ('PDV / Frente de Caixa', 'pos', 'Ponto de venda rápido com leitura de código de barras e múltiplas formas de pagamento', 'sales', 'Enterprise OS', '🛒', '["Leitura código de barras","Múltiplos pagamentos","Sangria e suprimento","Fechamento de caixa"]', 'free', TRUE, TRUE),
  ('Catálogo Digital', 'catalog', 'Catálogo de produtos compartilhável via WhatsApp com link público', 'sales', 'Enterprise OS', '📱', '["Link público","Compartilhamento WhatsApp","Promoções","Pedido online"]', 'free', TRUE, TRUE),
  ('Gestão de Mesas', 'tables', 'Controle de comandas e mesas para restaurantes e bares', 'operations', 'Enterprise OS', '🍽️', '["Mapa de mesas","Comandas","Divisão de conta","Integração cozinha"]', 'freemium', TRUE, TRUE),
  ('Agendamento', 'scheduling', 'Agenda de horários para serviços (salão, oficina, clínica)', 'operations', 'Enterprise OS', '📅', '["Calendário","Lembretes","Confirmação automática","Encaixe"]', 'freemium', TRUE, TRUE),
  ('Controle de Ponto', 'timeclock', 'Registro de ponto dos funcionários com relatórios para folha', 'hr', 'Enterprise OS', '⏰', '["Registro de ponto","Banco de horas","Espelho de ponto","Integração eSocial"]', 'paid', TRUE, TRUE),
  ('Site Builder', 'site-builder', 'Gerador automático de site institucional personalizado por segmento', 'marketing', 'Enterprise OS', '🌐', '["Páginas automáticas","Personalização por segmento","SEO","Domínio próprio"]', 'paid', TRUE, TRUE),
  ('Communication Hub', 'comms-hub', 'Central unificada de WhatsApp, Email, Instagram e Telegram', 'marketing', 'Enterprise OS', '💬', '["WhatsApp","Email","Instagram","Telegram","SMS"]', 'paid', TRUE, TRUE),
  ('Business Intelligence', 'bi', 'Dashboards avançados e relatórios personalizáveis', 'analytics', 'Enterprise OS', '📊', '["Dashboards customizáveis","Exportação","Drill-down","Compartilhamento"]', 'paid', TRUE, TRUE)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- END
-- ============================================================================
