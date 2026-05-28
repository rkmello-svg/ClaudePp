import { z } from 'zod';

// Authentication Schemas
export const LoginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

export const RegisterSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  name: z.string().min(1, 'Nome é obrigatório'),
  role: z.enum(['admin', 'manager', 'cashier']),
  storeId: z.string().min(1, 'ID da loja é obrigatório'),
});

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string(),
  role: z.enum(['admin', 'manager', 'cashier']),
  storeId: z.string().uuid(),
  active: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date().optional(),
});

export const PaymentMethodSchema = z.enum(['cash', 'card', 'check', 'pix']);

export const PaymentInfoSchema = z.object({
  method: PaymentMethodSchema,
  amount: z.number().positive(),
  installments: z.number().optional(),
  cardBrand: z.string().optional(),
  transactionId: z.string().optional(),
  status: z.enum(['pending', 'approved', 'declined', 'cancelled']),
});

export const SaleItemSchema = z.object({
  id: z.string().uuid(),
  productId: z.string().uuid(),
  quantity: z.number().positive(),
  unitPrice: z.number().positive(),
  discount: z.number().nonnegative().default(0),
  subtotal: z.number().positive(),
});

export const SaleSchema = z.object({
  id: z.string().uuid(),
  storeId: z.string().uuid(),
  cashierId: z.string().uuid(),
  items: z.array(SaleItemSchema),
  subtotal: z.number().nonnegative(),
  discount: z.number().nonnegative().default(0),
  tax: z.number().nonnegative().default(0),
  total: z.number().positive(),
  payment: PaymentInfoSchema,
  status: z.enum(['draft', 'completed', 'cancelled']),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const ProductSchema = z.object({
  id: z.string().uuid(),
  storeId: z.string().uuid(),
  name: z.string().min(1).max(255),
  description: z.string().max(500).optional(),
  barcode: z.string().regex(/^[0-9]{13}$/),
  price: z.number().positive(),
  cost: z.number().nonnegative(),
  stock: z.number().nonnegative().default(0),
  category: z.string(),
  active: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// ============================================
// PHASE 3: MACHINE INTEGRATION SCHEMAS
// ============================================

// Payment Schemas
export const PaymentTransactionSchema = z.object({
  id: z.string().uuid(),
  storeId: z.string().uuid(),
  saleId: z.string().uuid(),
  amount: z.number().positive(),
  method: z.enum(['card', 'pix', 'cash']),
  provider: z.string(),
  status: z.enum(['pending', 'processing', 'approved', 'declined', 'failed']),
  transactionId: z.string(),
  authCode: z.string().optional(),
  errorMessage: z.string().optional(),
  installments: z.number().optional(),
  cardBrand: z.string().optional(),
  last4Digits: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const ProcessPaymentSchema = z.object({
  saleId: z.string().uuid(),
  amount: z.number().positive(),
  method: z.enum(['card', 'pix', 'cash']),
  installments: z.number().optional(),
  cardData: z.object({
    number: z.string().regex(/^[0-9]{13,19}$/),
    holderName: z.string(),
    expiryMonth: z.number().min(1).max(12),
    expiryYear: z.number(),
    cvv: z.string().regex(/^[0-9]{3,4}$/),
  }).optional(),
  pixData: z.object({
    cpfCnpj: z.string(),
  }).optional(),
});

export const IntegrationConfigSchema = z.object({
  id: z.string().uuid(),
  storeId: z.string().uuid(),
  type: z.enum(['tef', 'printer', 'barcode', 'webhook']),
  name: z.string(),
  enabled: z.boolean().default(true),
  config: z.record(z.any()),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Printer Schemas
export const PrintJobSchema = z.object({
  id: z.string().uuid(),
  storeId: z.string().uuid(),
  type: z.enum(['receipt', 'report', 'label']),
  content: z.string(),
  status: z.enum(['pending', 'printing', 'completed', 'failed']),
  error: z.string().optional(),
  createdAt: z.date(),
  completedAt: z.date().optional(),
});

export const PrintReceiptSchema = z.object({
  saleId: z.string().uuid(),
  includeBarcode: z.boolean().default(false),
  copies: z.number().min(1).default(1),
});

// Barcode Schemas
export const BarcodeValidationSchema = z.object({
  barcode: z.string().min(6).max(20),
  format: z.enum(['ean13', 'upc', 'code128']).optional(),
});

export const BarcodeSearchSchema = z.object({
  code: z.string().min(6).max(20),
  storeId: z.string().uuid(),
});

// ============================================
// PHASE 4: ENTERPRISE FEATURES SCHEMAS
// ============================================

// Stock Schemas
export const StockMovementSchema = z.object({
  id: z.string().uuid(),
  storeId: z.string().uuid(),
  productId: z.string().uuid(),
  quantity: z.number().int(),
  type: z.enum(['in', 'out', 'adjustment', 'return']),
  reason: z.string(),
  reference: z.string().optional(),
  userId: z.string().uuid(),
  createdAt: z.date(),
});

export const StockAdjustmentSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int(),
  reason: z.string(),
  reference: z.string().optional(),
});

export const StockFilterSchema = z.object({
  storeId: z.string().uuid(),
  productId: z.string().uuid().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  type: z.enum(['in', 'out', 'adjustment', 'return']).optional(),
  page: z.number().positive().default(1),
  limit: z.number().positive().default(50),
});

// Report Schemas
export const ReportFilterSchema = z.object({
  startDate: z.date(),
  endDate: z.date(),
  storeId: z.string().uuid().optional(),
  productId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  paymentMethod: z.string().optional(),
});

export const SalesReportSchema = z.object({
  period: z.object({
    startDate: z.date(),
    endDate: z.date(),
  }),
  storeId: z.string().uuid().optional(),
  totalSales: z.number(),
  totalItems: z.number(),
  totalRevenue: z.number(),
  totalTax: z.number(),
  averageTicket: z.number(),
  paymentMethods: z.array(z.object({
    method: z.string(),
    count: z.number(),
    amount: z.number(),
  })),
});

// Audit Schemas
export const AuditLogSchema = z.object({
  id: z.string().uuid(),
  storeId: z.string().uuid(),
  userId: z.string().uuid(),
  action: z.string(),
  resource: z.string(),
  resourceId: z.string(),
  changes: z.array(z.object({
    field: z.string(),
    before: z.any(),
    after: z.any(),
  })).optional(),
  ipAddress: z.string().ip().optional(),
  userAgent: z.string().optional(),
  status: z.enum(['success', 'failure']),
  errorMessage: z.string().optional(),
  createdAt: z.date(),
});

export const AuditFilterSchema = z.object({
  storeId: z.string().uuid(),
  userId: z.string().uuid().optional(),
  action: z.string().optional(),
  resource: z.string().optional(),
  resourceId: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  status: z.enum(['success', 'failure']).optional(),
  page: z.number().positive().default(1),
  limit: z.number().positive().default(50),
});

// Store Schemas
export const StoreSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255),
  cnpj: z.string().regex(/^[0-9]{14}$/),
  address: z.string(),
  phone: z.string(),
  email: z.string().email(),
  timezone: z.string().default('America/Sao_Paulo'),
  currency: z.string().default('BRL'),
  language: z.string().default('pt-BR'),
  active: z.boolean().default(true),
});

// Cash Register Schemas
export const CashRegisterSchema = z.object({
  id: z.string().uuid(),
  storeId: z.string().uuid(),
  name: z.string(),
  number: z.number().positive(),
  active: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const ShiftSchema = z.object({
  id: z.string().uuid(),
  cashRegisterId: z.string().uuid(),
  cashierId: z.string().uuid(),
  openedAt: z.date(),
  closedAt: z.date().optional(),
  openingBalance: z.number().nonnegative(),
  expectedClosingBalance: z.number().optional(),
  actualClosingBalance: z.number().optional(),
  discrepancy: z.number().optional(),
  status: z.enum(['open', 'closed']),
  transactions: z.array(z.string().uuid()),
});

export const OpenShiftSchema = z.object({
  cashRegisterId: z.string().uuid(),
  cashierId: z.string().uuid(),
  openingBalance: z.number().nonnegative(),
});

export const CloseShiftSchema = z.object({
  actualClosingBalance: z.number().nonnegative(),
  notes: z.string().optional(),
});
