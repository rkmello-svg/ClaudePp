// Auth Types
export type User = {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  current_company_id: string
}

export type Company = {
  id: string
  name: string
  slug: string
  segment: BusinessSegment
  cnpj: string
  employees_count: number
  annual_revenue: number
  tax_regime: TaxRegime
  active: boolean
  created_at: string
  updated_at: string
}

export type Branch = {
  id: string
  company_id: string
  name: string
  city: string
  state: string
  is_headquarters: boolean
  created_at: string
  updated_at: string
}

export enum BusinessSegment {
  PADARIA = 'padaria',
  RESTAURANTE = 'restaurante',
  FARMACIA = 'farmacia',
  OFICINA = 'oficina',
  HOTEL = 'hotel',
  SALAO = 'salao',
  MERCEARIA = 'mercearia',
  CONSTRUCAO = 'construcao',
  OUTROS = 'outros',
}

export enum TaxRegime {
  MEI = 'mei',
  SIMPLES = 'simples_nacional',
  PRESUMIDO = 'lucro_presumido',
  REAL = 'lucro_real',
}

// Permission Types
export enum Role {
  OWNER = 'owner',
  ADMIN = 'admin',
  MANAGER = 'manager',
  OPERATOR = 'operator',
  VIEWER = 'viewer',
}

export type Permission = {
  id: string
  company_id: string
  user_id: string
  role: Role
  created_at: string
  updated_at: string
}

// Financial Types
export type Customer = {
  id: string
  company_id: string
  branch_id: string
  name: string
  email: string | null
  phone: string | null
  cpf_cnpj: string | null
  address: string | null
  city: string | null
  state: string | null
  zip_code: string | null
  active: boolean
  created_at: string
  updated_at: string
}

export type Invoice = {
  id: string
  company_id: string
  branch_id: string
  customer_id: string
  number: string
  issue_date: string
  due_date: string
  total_amount: number
  status: InvoiceStatus
  created_at: string
  updated_at: string
}

export enum InvoiceStatus {
  DRAFT = 'draft',
  ISSUED = 'issued',
  PAID = 'paid',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled',
}

// Audit Types
export type AuditLog = {
  id: string
  company_id: string
  user_id: string
  action: string
  entity_type: string
  entity_id: string
  changes: Record<string, unknown>
  ip_address: string | null
  created_at: string
}

// Response Types
export type ApiResponse<T> = {
  data: T | null
  error: string | null
  success: boolean
}
