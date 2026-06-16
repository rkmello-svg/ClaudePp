-- ============================================================================
-- ERP Enterprise OS - Initial Schema
-- ============================================================================

-- ============================================================================
-- 1. PROFILES (extend Supabase Auth)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  current_company_id UUID,
  preferred_theme TEXT DEFAULT 'light',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- ============================================================================
-- 2. COMPANIES (Multi-tenant root)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  segment TEXT NOT NULL DEFAULT 'outros',
  cnpj TEXT UNIQUE,
  email TEXT,
  phone TEXT,
  website TEXT,
  logo_url TEXT,
  employees_count INTEGER DEFAULT 1,
  annual_revenue NUMERIC DEFAULT 0,
  tax_regime TEXT NOT NULL DEFAULT 'mei',
  active BOOLEAN DEFAULT TRUE,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company members can view their company"
  ON public.companies FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.permissions
      WHERE permissions.company_id = companies.id
      AND permissions.user_id = auth.uid()
    )
  );

CREATE POLICY "Company owners can update their company"
  ON public.companies FOR UPDATE
  USING (owner_id = auth.uid());

-- ============================================================================
-- 3. BRANCHES (Company branches)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  address TEXT,
  phone TEXT,
  is_headquarters BOOLEAN DEFAULT FALSE,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view branches of their company"
  ON public.branches FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.permissions
      WHERE permissions.company_id = branches.company_id
      AND permissions.user_id = auth.uid()
    )
  );

-- ============================================================================
-- 4. PERMISSIONS (RBAC)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'viewer',
  modules JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(company_id, user_id)
);

ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own permissions"
  ON public.permissions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Company admins can manage permissions"
  ON public.permissions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.permissions p
      WHERE p.company_id = permissions.company_id
      AND p.user_id = auth.uid()
      AND p.role IN ('owner', 'admin')
    )
  );

-- ============================================================================
-- 5. CUSTOMERS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  cpf_cnpj TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  country TEXT DEFAULT 'BR',
  notes TEXT,
  tags JSONB DEFAULT '[]',
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view customers of their company"
  ON public.customers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.permissions
      WHERE permissions.company_id = customers.company_id
      AND permissions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert customers in their company"
  ON public.customers FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.permissions
      WHERE permissions.company_id = customers.company_id
      AND permissions.user_id = auth.uid()
    )
  );

-- ============================================================================
-- 6. PRODUCTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  sku TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  cost NUMERIC DEFAULT 0,
  stock_quantity INTEGER DEFAULT 0,
  category TEXT,
  image_url TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view products of their company"
  ON public.products FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.permissions
      WHERE permissions.company_id = products.company_id
      AND permissions.user_id = auth.uid()
    )
  );

-- ============================================================================
-- 7. INVOICES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  number TEXT NOT NULL,
  series TEXT,
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  subtotal NUMERIC DEFAULT 0,
  tax NUMERIC DEFAULT 0,
  discount NUMERIC DEFAULT 0,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'draft',
  nfe_key TEXT,
  nfe_number TEXT,
  nfe_status TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view invoices of their company"
  ON public.invoices FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.permissions
      WHERE permissions.company_id = invoices.company_id
      AND permissions.user_id = auth.uid()
    )
  );

-- ============================================================================
-- 8. INVOICE ITEMS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  description TEXT NOT NULL,
  quantity NUMERIC NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  discount NUMERIC DEFAULT 0,
  tax NUMERIC DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 9. AUDIT LOGS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  changes JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view audit logs of their company"
  ON public.audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.permissions
      WHERE permissions.company_id = audit_logs.company_id
      AND permissions.user_id = auth.uid()
      AND role IN ('owner', 'admin', 'manager')
    )
  );

-- ============================================================================
-- 10. INDEXES
-- ============================================================================

CREATE INDEX idx_profiles_current_company ON public.profiles(current_company_id);
CREATE INDEX idx_companies_owner ON public.companies(owner_id);
CREATE INDEX idx_companies_slug ON public.companies(slug);
CREATE INDEX idx_branches_company ON public.branches(company_id);
CREATE INDEX idx_permissions_company ON public.permissions(company_id);
CREATE INDEX idx_permissions_user ON public.permissions(user_id);
CREATE INDEX idx_customers_company ON public.customers(company_id);
CREATE INDEX idx_customers_branch ON public.customers(branch_id);
CREATE INDEX idx_products_company ON public.products(company_id);
CREATE INDEX idx_invoices_company ON public.invoices(company_id);
CREATE INDEX idx_invoices_customer ON public.invoices(customer_id);
CREATE INDEX idx_invoices_date ON public.invoices(issue_date);
CREATE INDEX idx_audit_logs_company ON public.audit_logs(company_id);
CREATE INDEX idx_audit_logs_user ON public.audit_logs(user_id);

-- ============================================================================
-- 11. FUNCTIONS
-- ============================================================================

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create update_updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_branches_updated_at BEFORE UPDATE ON branches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_permissions_updated_at BEFORE UPDATE ON permissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
