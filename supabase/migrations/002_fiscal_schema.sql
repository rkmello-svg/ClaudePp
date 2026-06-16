-- ============================================================================
-- ERP Enterprise OS - Fiscal Schema
-- ============================================================================

-- ============================================================================
-- 1. NF-e (Nota Fiscal Eletrônica)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.nfe (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
  nfe_number TEXT NOT NULL,
  nfe_series TEXT NOT NULL,
  nfe_key TEXT UNIQUE NOT NULL,
  xml_content TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'draft',
  authorization_date TIMESTAMP WITH TIME ZONE,
  authorization_protocol TEXT,
  pdf_url TEXT,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.nfe ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view nfe of their company"
  ON public.nfe FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.permissions
      WHERE permissions.company_id = nfe.company_id
      AND permissions.user_id = auth.uid()
    )
  );

-- ============================================================================
-- 2. eSocial Events
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.esocial_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  event_version VARCHAR(10),
  xml_content TEXT NOT NULL,
  transmission_date TIMESTAMP WITH TIME ZONE,
  protocol_number TEXT,
  status VARCHAR(50) DEFAULT 'draft',
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.esocial_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view esocial events of their company"
  ON public.esocial_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.permissions
      WHERE permissions.company_id = esocial_events.company_id
      AND permissions.user_id = auth.uid()
    )
  );

-- ============================================================================
-- 3. SPED Files (Fiscal, Contributions, Digital Accounting)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.sped_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  period VARCHAR(6) NOT NULL, -- YYYYMM
  file_type VARCHAR(50) NOT NULL, -- fiscal, contributions, accounting
  content TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'draft',
  transmitted_date TIMESTAMP WITH TIME ZONE,
  receipt_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.sped_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view sped files of their company"
  ON public.sped_files FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.permissions
      WHERE permissions.company_id = sped_files.company_id
      AND permissions.user_id = auth.uid()
    )
  );

-- ============================================================================
-- 4. Fiscal Obligations (Monthly/Quarterly/Annual)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.fiscal_obligations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  obligation_type VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  due_date DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  responsible_department VARCHAR(50),
  notes TEXT,
  completed_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.fiscal_obligations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view obligations of their company"
  ON public.fiscal_obligations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.permissions
      WHERE permissions.company_id = fiscal_obligations.company_id
      AND permissions.user_id = auth.uid()
    )
  );

-- ============================================================================
-- 5. Tax Planning Scenarios
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.tax_planning (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  scenario VARCHAR(100) NOT NULL,
  tax_regime VARCHAR(50) NOT NULL,
  estimated_tax NUMERIC DEFAULT 0,
  estimated_contribution NUMERIC DEFAULT 0,
  recommendation TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.tax_planning ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view tax planning of their company"
  ON public.tax_planning FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.permissions
      WHERE permissions.company_id = tax_planning.company_id
      AND permissions.user_id = auth.uid()
    )
  );

-- ============================================================================
-- 6. Fiscal Certificates (Digital Certificates for NFe/eSocial)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.fiscal_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  certificate_type VARCHAR(50), -- A1, A3
  cnpj TEXT NOT NULL,
  holder_name TEXT NOT NULL,
  issue_date DATE NOT NULL,
  expiration_date DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'active',
  certificate_file TEXT,
  password_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.fiscal_certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view certificates"
  ON public.fiscal_certificates FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.permissions
      WHERE permissions.company_id = fiscal_certificates.company_id
      AND permissions.user_id = auth.uid()
      AND permissions.role IN ('owner', 'admin')
    )
  );

-- ============================================================================
-- 7. Fiscal Audit Trail
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.fiscal_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  document_type VARCHAR(50),
  document_id TEXT,
  details JSONB,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.fiscal_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view audit of their company"
  ON public.fiscal_audit FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.permissions
      WHERE permissions.company_id = fiscal_audit.company_id
      AND permissions.user_id = auth.uid()
      AND permissions.role IN ('owner', 'admin', 'manager')
    )
  );

-- ============================================================================
-- 8. INDEXES
-- ============================================================================

CREATE INDEX idx_nfe_company ON public.nfe(company_id);
CREATE INDEX idx_nfe_key ON public.nfe(nfe_key);
CREATE INDEX idx_nfe_status ON public.nfe(status);
CREATE INDEX idx_esocial_company ON public.esocial_events(company_id);
CREATE INDEX idx_esocial_type ON public.esocial_events(event_type);
CREATE INDEX idx_sped_company ON public.sped_files(company_id);
CREATE INDEX idx_sped_period ON public.sped_files(period);
CREATE INDEX idx_obligations_company ON public.fiscal_obligations(company_id);
CREATE INDEX idx_obligations_due ON public.fiscal_obligations(due_date);
CREATE INDEX idx_certificates_company ON public.fiscal_certificates(company_id);
CREATE INDEX idx_certificates_expiration ON public.fiscal_certificates(expiration_date);
CREATE INDEX idx_fiscal_audit_company ON public.fiscal_audit(company_id);

-- ============================================================================
-- 9. FUNCTIONS
-- ============================================================================

-- Trigger for updated_at
CREATE TRIGGER update_nfe_updated_at BEFORE UPDATE ON nfe
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_esocial_updated_at BEFORE UPDATE ON esocial_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_sped_updated_at BEFORE UPDATE ON sped_files
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_obligations_updated_at BEFORE UPDATE ON fiscal_obligations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_certificates_updated_at BEFORE UPDATE ON fiscal_certificates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- END OF FISCAL SCHEMA
-- ============================================================================
