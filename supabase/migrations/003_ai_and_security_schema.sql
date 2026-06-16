-- ============================================================================
-- ERP Enterprise OS - AI Schema + Security Hardening
-- ============================================================================

-- ============================================================================
-- 1. SECURITY FIX: invoice_items was missing RLS (cross-tenant leak)
-- ============================================================================

ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;

-- Access to invoice items is derived from the parent invoice's company.
CREATE POLICY "Users can view invoice items of their company"
  ON public.invoice_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.invoices i
      JOIN public.permissions p ON p.company_id = i.company_id
      WHERE i.id = invoice_items.invoice_id
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert invoice items in their company"
  ON public.invoice_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.invoices i
      JOIN public.permissions p ON p.company_id = i.company_id
      WHERE i.id = invoice_items.invoice_id
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update invoice items in their company"
  ON public.invoice_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.invoices i
      JOIN public.permissions p ON p.company_id = i.company_id
      WHERE i.id = invoice_items.invoice_id
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete invoice items in their company"
  ON public.invoice_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM public.invoices i
      JOIN public.permissions p ON p.company_id = i.company_id
      WHERE i.id = invoice_items.invoice_id
      AND p.user_id = auth.uid()
    )
  );

-- ============================================================================
-- 2. AI AGENT EXECUTIONS (referenced by BaseAgent.logExecution)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.ai_agent_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  agent_id TEXT NOT NULL,
  trigger_type VARCHAR(50) DEFAULT 'user_request',
  input JSONB DEFAULT '{}',
  output JSONB,
  status VARCHAR(50) DEFAULT 'pending',
  error_message TEXT,
  execution_time_ms INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.ai_agent_executions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view agent executions of their company"
  ON public.ai_agent_executions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.permissions
      WHERE permissions.company_id = ai_agent_executions.company_id
      AND permissions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert agent executions in their company"
  ON public.ai_agent_executions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.permissions
      WHERE permissions.company_id = ai_agent_executions.company_id
      AND permissions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update agent executions in their company"
  ON public.ai_agent_executions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.permissions
      WHERE permissions.company_id = ai_agent_executions.company_id
      AND permissions.user_id = auth.uid()
    )
  );

-- ============================================================================
-- 3. AI INSIGHTS (persisted recommendations from agents)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.ai_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  agent_id TEXT NOT NULL,
  category VARCHAR(50),
  priority VARCHAR(20) DEFAULT 'medium',
  title TEXT NOT NULL,
  description TEXT,
  data JSONB DEFAULT '{}',
  status VARCHAR(50) DEFAULT 'new',
  dismissed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view insights of their company"
  ON public.ai_insights FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.permissions
      WHERE permissions.company_id = ai_insights.company_id
      AND permissions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage insights of their company"
  ON public.ai_insights FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.permissions
      WHERE permissions.company_id = ai_insights.company_id
      AND permissions.user_id = auth.uid()
    )
  );

-- ============================================================================
-- 4. AI AUTOMATIONS (scheduled/event-driven agent runs)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.ai_automations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  agent_id TEXT NOT NULL,
  trigger_type VARCHAR(50) DEFAULT 'schedule',
  trigger_config JSONB DEFAULT '{}',
  actions JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT TRUE,
  execution_count INTEGER DEFAULT 0,
  last_execution TIMESTAMP WITH TIME ZONE,
  next_execution TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.ai_automations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage automations of their company"
  ON public.ai_automations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.permissions
      WHERE permissions.company_id = ai_automations.company_id
      AND permissions.user_id = auth.uid()
      AND permissions.role IN ('owner', 'admin', 'manager')
    )
  );

-- ============================================================================
-- 5. INDEXES
-- ============================================================================

CREATE INDEX idx_ai_executions_company ON public.ai_agent_executions(company_id);
CREATE INDEX idx_ai_executions_agent ON public.ai_agent_executions(agent_id);
CREATE INDEX idx_ai_executions_created ON public.ai_agent_executions(created_at);
CREATE INDEX idx_ai_insights_company ON public.ai_insights(company_id);
CREATE INDEX idx_ai_insights_status ON public.ai_insights(status);
CREATE INDEX idx_ai_automations_company ON public.ai_automations(company_id);
CREATE INDEX idx_ai_automations_next ON public.ai_automations(next_execution);

-- ============================================================================
-- 6. TRIGGERS
-- ============================================================================

CREATE TRIGGER update_ai_automations_updated_at BEFORE UPDATE ON ai_automations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- END
-- ============================================================================
