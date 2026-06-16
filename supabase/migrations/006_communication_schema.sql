-- Communication channels configuration
CREATE TABLE communication_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK (channel IN ('whatsapp', 'email', 'sms', 'instagram', 'facebook', 'telegram')),
  enabled BOOLEAN DEFAULT FALSE,
  credentials JSONB NOT NULL DEFAULT '{}',
  webhook_url TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(company_id, channel)
);

CREATE INDEX idx_communication_channels_company ON communication_channels(company_id);

-- Communication contacts
CREATE TABLE communication_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  emails TEXT[] DEFAULT '{}',
  phones TEXT[] DEFAULT '{}',
  whatsapp TEXT,
  instagram TEXT,
  facebook TEXT,
  telegram TEXT,
  last_contacted_at TIMESTAMP,
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_communication_contacts_company ON communication_contacts(company_id);
CREATE INDEX idx_communication_contacts_name ON communication_contacts(name);

-- Communication threads (conversations)
CREATE TABLE communication_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES communication_contacts(id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK (channel IN ('whatsapp', 'email', 'sms', 'instagram', 'facebook', 'telegram')),
  subject TEXT NOT NULL,
  last_message_at TIMESTAMP NOT NULL,
  unread_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed', 'archived')),
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_communication_threads_company ON communication_threads(company_id);
CREATE INDEX idx_communication_threads_contact ON communication_threads(contact_id);
CREATE INDEX idx_communication_threads_channel ON communication_threads(channel);

-- Communication messages
CREATE TABLE communication_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES communication_threads(id) ON DELETE CASCADE,
  company_id UUID NOT NULL,
  channel TEXT NOT NULL,
  contact_id UUID NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  content TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'failed')),
  sent_at TIMESTAMP NOT NULL,
  delivered_at TIMESTAMP,
  read_at TIMESTAMP,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_communication_messages_thread ON communication_messages(thread_id);
CREATE INDEX idx_communication_messages_company ON communication_messages(company_id);
CREATE INDEX idx_communication_messages_sent_at ON communication_messages(sent_at);

-- Enable RLS
ALTER TABLE communication_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their company's channels"
  ON communication_channels
  FOR SELECT
  USING (company_id IN (
    SELECT company_id FROM profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Admins can manage channels"
  ON communication_channels
  FOR ALL
  USING (company_id IN (
    SELECT company_id FROM profiles WHERE user_id = auth.uid()
  ) AND (
    SELECT role FROM permissions
    WHERE user_id = auth.uid() AND company_id = communication_channels.company_id
  ) IN ('owner', 'admin'));

CREATE POLICY "Users can view their company's contacts"
  ON communication_contacts
  FOR SELECT
  USING (company_id IN (
    SELECT company_id FROM profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can manage contacts"
  ON communication_contacts
  FOR ALL
  USING (company_id IN (
    SELECT company_id FROM profiles WHERE user_id = auth.uid()
  ) AND (
    SELECT role FROM permissions
    WHERE user_id = auth.uid() AND company_id = communication_contacts.company_id
  ) IN ('owner', 'admin', 'manager'));

CREATE POLICY "Users can view their company's threads"
  ON communication_threads
  FOR SELECT
  USING (company_id IN (
    SELECT company_id FROM profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can manage threads"
  ON communication_threads
  FOR ALL
  USING (company_id IN (
    SELECT company_id FROM profiles WHERE user_id = auth.uid()
  ) AND (
    SELECT role FROM permissions
    WHERE user_id = auth.uid() AND company_id = communication_threads.company_id
  ) IN ('owner', 'admin', 'manager', 'operator'));

CREATE POLICY "Users can view messages from their company"
  ON communication_messages
  FOR SELECT
  USING (company_id IN (
    SELECT company_id FROM profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can create messages"
  ON communication_messages
  FOR INSERT
  WITH CHECK (company_id IN (
    SELECT company_id FROM profiles WHERE user_id = auth.uid()
  ) AND (
    SELECT role FROM permissions
    WHERE user_id = auth.uid() AND company_id = communication_messages.company_id
  ) IN ('owner', 'admin', 'manager', 'operator'));

-- Audit table for communication activities
CREATE TABLE communication_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  action TEXT NOT NULL,
  channel TEXT,
  contact_id UUID,
  details JSONB,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_communication_audit_company ON communication_audit(company_id);
CREATE INDEX idx_communication_audit_created_at ON communication_audit(created_at);
