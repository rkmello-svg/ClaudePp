export interface Sale {
  id: string;
  storeId: string;
  cashierId: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  payment: PaymentInfo;
  status: 'draft' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface SaleItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  subtotal: number;
}

export interface Product {
  id: string;
  storeId: string;
  name: string;
  description: string;
  barcode: string;
  price: number;
  cost: number;
  stock: number;
  category: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentInfo {
  method: 'cash' | 'card' | 'check' | 'pix';
  amount: number;
  installments?: number;
  cardBrand?: string;
  transactionId?: string;
  status: 'pending' | 'approved' | 'declined' | 'cancelled';
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'cashier';
  storeId: string;
  active: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

export interface AuthTokenPayload {
  sub: string;
  email: string;
  uid: string;
  role: string;
  storeId: string;
  iat?: number;
  exp?: number;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role: string;
  storeId: string;
}

export interface Store {
  id: string;
  name: string;
  cnpj: string;
  address: string;
  phone: string;
  email: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
}

// API Request/Response DTOs
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role: string;
  storeId: string;
}

export interface CreateProductRequest {
  name: string;
  description?: string;
  barcode: string;
  price: number;
  cost?: number;
  stock?: number;
  category?: string;
}

export interface CreateSaleRequest {
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
  }>;
  payment: PaymentInfo;
  discountPercent?: number;
  status?: 'draft' | 'completed';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface CartItem extends SaleItem {
  name?: string;
  description?: string;
}

export interface SearchProductsRequest {
  query: string;
  category?: string;
  limit?: number;
}

export interface UpdateSaleStatusRequest {
  status: 'draft' | 'completed' | 'cancelled';
}

// ============================================
// PHASE 3: MACHINE INTEGRATION TYPES
// ============================================

// Payment Integration Types
export interface PaymentMethod {
  id: string;
  name: string;
  type: 'card' | 'pix' | 'cash' | 'check';
  provider?: string;
  enabled: boolean;
  config?: Record<string, unknown>;
}

export interface PaymentTransaction {
  id: string;
  storeId: string;
  saleId: string;
  amount: number;
  method: 'card' | 'pix' | 'cash';
  provider: string;
  status: 'pending' | 'processing' | 'approved' | 'declined' | 'failed';
  transactionId: string;
  authCode?: string;
  errorMessage?: string;
  installments?: number;
  cardBrand?: string;
  last4Digits?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TefProvider {
  name: string;
  type: 'stone' | 'elo' | 'ingenico';
  enabled: boolean;
  merchantId?: string;
  terminalId?: string;
  apiKey?: string;
  apiSecret?: string;
}

// Printer Integration Types
export interface PrinterConfig {
  id: string;
  storeId: string;
  type: 'escpos' | 'thermal';
  name: string;
  port: string; // COM port, USB port, or IP address
  baudRate?: number;
  enabled: boolean;
  paperWidth?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PrintJob {
  id: string;
  storeId: string;
  type: 'receipt' | 'report' | 'label';
  content: string;
  status: 'pending' | 'printing' | 'completed' | 'failed';
  error?: string;
  createdAt: Date;
  completedAt?: Date;
}

// Barcode Types
export interface BarcodeValidationResult {
  valid: boolean;
  format: string;
  value: string;
  error?: string;
}

export interface BarcodeProduct {
  productId: string;
  barcode: string;
  name: string;
  price: number;
  stock: number;
}

// Integration Status Types
export interface IntegrationStatus {
  type: string;
  status: 'online' | 'offline' | 'error';
  lastCheck: Date;
  errorMessage?: string;
}

export interface IntegrationConfig {
  id: string;
  storeId: string;
  type: 'tef' | 'printer' | 'barcode' | 'webhook';
  name: string;
  enabled: boolean;
  config: Record<string, unknown>;
  status?: IntegrationStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface TransactionLog {
  id: string;
  storeId: string;
  type: 'payment' | 'print' | 'barcode' | 'other';
  action: string;
  result: 'success' | 'failure';
  message: string;
  details?: Record<string, unknown>;
  createdAt: Date;
}

// ============================================
// PHASE 4: ENTERPRISE FEATURES TYPES
// ============================================

// Stock Management Types
export interface StockMovement {
  id: string;
  storeId: string;
  productId: string;
  quantity: number;
  type: 'in' | 'out' | 'adjustment' | 'return';
  reason: string;
  reference?: string; // Sale ID, PO ID, etc.
  userId: string;
  createdAt: Date;
}

export interface StockAlert {
  id: string;
  storeId: string;
  productId: string;
  minThreshold: number;
  currentStock: number;
  triggered: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Report Types
export interface SalesReport {
  period: {
    startDate: Date;
    endDate: Date;
  };
  storeId?: string;
  totalSales: number;
  totalItems: number;
  totalRevenue: number;
  totalTax: number;
  averageTicket: number;
  paymentMethods: {
    method: string;
    count: number;
    amount: number;
  }[];
}

export interface ProductRanking {
  productId: string;
  name: string;
  unitsSold: number;
  revenue: number;
  costOfGoods: number;
  profit: number;
  margin: number;
}

export interface CashierPerformance {
  userId: string;
  name: string;
  totalSales: number;
  totalRevenue: number;
  averageTicket: number;
  discountsGiven: number;
  returnedItems: number;
}

export interface RevenueMetrics {
  date: Date;
  revenue: number;
  transactionCount: number;
  averageTicket: number;
}

export interface Report {
  id: string;
  storeId: string;
  type: 'sales' | 'products' | 'cashier' | 'revenue' | 'stock';
  startDate: Date;
  endDate: Date;
  data: Record<string, unknown>;
  generatedAt: Date;
  generatedBy: string;
}

// Audit Types
export interface AuditLog {
  id: string;
  storeId: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  changes?: {
    field: string;
    before: unknown;
    after: unknown;
  }[];
  ipAddress?: string;
  userAgent?: string;
  status: 'success' | 'failure';
  errorMessage?: string;
  createdAt: Date;
}

export interface AuditFilter {
  userId?: string;
  action?: string;
  resource?: string;
  resourceId?: string;
  startDate?: Date;
  endDate?: Date;
  status?: 'success' | 'failure';
}

// Multi-Store Types
export interface StoreConfig {
  storeId: string;
  name: string;
  cnpj: string;
  address: string;
  phone: string;
  email: string;
  timezone: string;
  currency: string;
  language: string;
  active: boolean;
}

export interface StoreKPIs {
  storeId: string;
  period: {
    startDate: Date;
    endDate: Date;
  };
  totalRevenue: number;
  totalTransactions: number;
  averageTicket: number;
  topProduct: string;
  topCashier: string;
  stockTurnover: number;
}

// Cash Register Types
export interface CashRegister {
  id: string;
  storeId: string;
  name: string;
  number: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Shift {
  id: string;
  cashRegisterId: string;
  cashierId: string;
  openedAt: Date;
  closedAt?: Date;
  openingBalance: number;
  expectedClosingBalance?: number;
  actualClosingBalance?: number;
  discrepancy?: number;
  status: 'open' | 'closed';
  transactions: string[]; // Transaction IDs
}

export interface ShiftSummary {
  shiftId: string;
  cashierName: string;
  openedAt: Date;
  closedAt?: Date;
  openingBalance: number;
  expectedClosingBalance: number;
  actualClosingBalance?: number;
  discrepancy?: number;
  totalSales: number;
  totalTransactions: number;
  paymentMethods: {
    method: string;
    count: number;
    amount: number;
  }[];
}
