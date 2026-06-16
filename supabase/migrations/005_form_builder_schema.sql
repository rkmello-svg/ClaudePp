-- Forms table
CREATE TABLE forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  fields JSONB NOT NULL DEFAULT '[]',
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_forms_company ON forms(company_id);
CREATE INDEX idx_forms_published ON forms(is_published);

-- Enable RLS
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;

-- RLS Policies for forms
CREATE POLICY "Users can view their company's forms"
  ON forms
  FOR SELECT
  USING (company_id IN (
    SELECT company_id FROM profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can create forms in their company"
  ON forms
  FOR INSERT
  WITH CHECK (company_id IN (
    SELECT company_id FROM profiles WHERE user_id = auth.uid()
  ) AND (
    SELECT role FROM permissions
    WHERE user_id = auth.uid() AND company_id = forms.company_id
  ) IN ('owner', 'admin'));

CREATE POLICY "Users can update their company's forms"
  ON forms
  FOR UPDATE
  USING (company_id IN (
    SELECT company_id FROM profiles WHERE user_id = auth.uid()
  ))
  WITH CHECK (company_id IN (
    SELECT company_id FROM profiles WHERE user_id = auth.uid()
  ) AND (
    SELECT role FROM permissions
    WHERE user_id = auth.uid() AND company_id = forms.company_id
  ) IN ('owner', 'admin'));

CREATE POLICY "Users can delete their company's forms"
  ON forms
  FOR DELETE
  USING (company_id IN (
    SELECT company_id FROM profiles WHERE user_id = auth.uid()
  ) AND (
    SELECT role FROM permissions
    WHERE user_id = auth.uid() AND company_id = forms.company_id
  ) IN ('owner', 'admin'));

-- Form submissions table
CREATE TABLE form_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  data JSONB NOT NULL,
  submitter_email TEXT,
  submitted_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_form_submissions_form ON form_submissions(form_id);
CREATE INDEX idx_form_submissions_company ON form_submissions(company_id);
CREATE INDEX idx_form_submissions_submitted_at ON form_submissions(submitted_at);

-- Enable RLS
ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for form_submissions
CREATE POLICY "Users can view submissions from their company"
  ON form_submissions
  FOR SELECT
  USING (company_id IN (
    SELECT company_id FROM profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can create submissions in their company"
  ON form_submissions
  FOR INSERT
  WITH CHECK (company_id IN (
    SELECT company_id FROM profiles WHERE user_id = auth.uid()
  ));

-- Audit log for form submissions
CREATE TABLE form_submission_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES form_submissions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_form_submission_audit_submission ON form_submission_audit(submission_id);
