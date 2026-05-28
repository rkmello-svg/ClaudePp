export const API_VERSION = 'v1';
export const APP_VERSION = '0.1.0';
export const API_BASE_PATH = `/api/${API_VERSION}`;

export const API_ENDPOINTS = {
  // Auth
  AUTH_LOGIN: `${API_BASE_PATH}/auth/login`,
  AUTH_REGISTER: `${API_BASE_PATH}/auth/register`,
  AUTH_LOGOUT: `${API_BASE_PATH}/auth/logout`,
  AUTH_ME: `${API_BASE_PATH}/auth/me`,

  // Sales
  SALES_CREATE: `${API_BASE_PATH}/sales`,
  SALES_LIST: `${API_BASE_PATH}/sales`,
  SALES_GET: (id: string) => `${API_BASE_PATH}/sales/${id}`,
  SALES_UPDATE: (id: string) => `${API_BASE_PATH}/sales/${id}`,
  SALES_DELETE: (id: string) => `${API_BASE_PATH}/sales/${id}`,
  SALES_STATS: `${API_BASE_PATH}/sales/stats`,

  // Products
  PRODUCTS_CREATE: `${API_BASE_PATH}/products`,
  PRODUCTS_LIST: `${API_BASE_PATH}/products`,
  PRODUCTS_GET: (id: string) => `${API_BASE_PATH}/products/${id}`,
  PRODUCTS_SEARCH: `${API_BASE_PATH}/products/search`,
  PRODUCTS_BY_BARCODE: (barcode: string) => `${API_BASE_PATH}/products/barcode/${barcode}`,
  PRODUCTS_UPDATE: (id: string) => `${API_BASE_PATH}/products/${id}`,
  PRODUCTS_DELETE: (id: string) => `${API_BASE_PATH}/products/${id}`,

  // Health
  HEALTH: '/health',
  API_HEALTH: `${API_BASE_PATH}/health`,
} as const;

export const ERROR_CODES = {
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  USER_ALREADY_EXISTS: 'USER_ALREADY_EXISTS',
  PRODUCT_NOT_FOUND: 'PRODUCT_NOT_FOUND',
  SALE_NOT_FOUND: 'SALE_NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
} as const;

export const PAYMENT_METHODS = {
  CASH: 'cash',
  CARD: 'card',
  CHECK: 'check',
  PIX: 'pix',
} as const;

export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  CASHIER: 'cashier',
} as const;

export const SALE_STATUS = {
  DRAFT: 'draft',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  DECLINED: 'declined',
  CANCELLED: 'cancelled',
} as const;

export const DEFAULT_TAX_RATE = 0;
export const INSTALLMENT_LIMIT = 12;

// ============================================
// PHASE 3: MACHINE INTEGRATION CONSTANTS
// ============================================

export const INTEGRATION_TYPES = {
  TEF: 'tef',
  PRINTER: 'printer',
  BARCODE: 'barcode',
  WEBHOOK: 'webhook',
} as const;

export const TEF_PROVIDERS = {
  STONE: 'stone',
  ELO: 'elo',
  INGENICO: 'ingenico',
} as const;

export const PRINTER_TYPES = {
  ESCPOS: 'escpos',
  THERMAL: 'thermal',
} as const;

export const PAYMENT_STATUS_EXTENDED = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  APPROVED: 'approved',
  DECLINED: 'declined',
  FAILED: 'failed',
} as const;

export const BARCODE_FORMATS = {
  EAN13: 'ean13',
  UPC: 'upc',
  CODE128: 'code128',
} as const;

export const PRINT_JOB_STATUS = {
  PENDING: 'pending',
  PRINTING: 'printing',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

export const TRANSACTION_LOG_TYPES = {
  PAYMENT: 'payment',
  PRINT: 'print',
  BARCODE: 'barcode',
  OTHER: 'other',
} as const;

// ============================================
// PHASE 4: ENTERPRISE FEATURES CONSTANTS
// ============================================

export const STOCK_MOVEMENT_TYPES = {
  IN: 'in',
  OUT: 'out',
  ADJUSTMENT: 'adjustment',
  RETURN: 'return',
} as const;

export const REPORT_TYPES = {
  SALES: 'sales',
  PRODUCTS: 'products',
  CASHIER: 'cashier',
  REVENUE: 'revenue',
  STOCK: 'stock',
} as const;

export const AUDIT_ACTIONS = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  READ: 'READ',
  PAYMENT_PROCESS: 'PAYMENT_PROCESS',
  PRINT_RECEIPT: 'PRINT_RECEIPT',
  BARCODE_SCAN: 'BARCODE_SCAN',
  STOCK_ADJUST: 'STOCK_ADJUST',
  SHIFT_OPEN: 'SHIFT_OPEN',
  SHIFT_CLOSE: 'SHIFT_CLOSE',
  REPORT_GENERATE: 'REPORT_GENERATE',
} as const;

export const AUDIT_RESOURCES = {
  SALE: 'SALE',
  PRODUCT: 'PRODUCT',
  PAYMENT: 'PAYMENT',
  STOCK: 'STOCK',
  CASH_REGISTER: 'CASH_REGISTER',
  SHIFT: 'SHIFT',
  USER: 'USER',
  STORE: 'STORE',
} as const;

export const SHIFT_STATUS = {
  OPEN: 'open',
  CLOSED: 'closed',
} as const;

export const STORE_TIMEZONES = {
  SAO_PAULO: 'America/Sao_Paulo',
  BRASILIA: 'America/Araguaina',
  MANAUS: 'America/Manaus',
} as const;

export const CURRENCIES = {
  BRL: 'BRL',
  USD: 'USD',
  EUR: 'EUR',
} as const;

export const LANGUAGES = {
  PT_BR: 'pt-BR',
  EN_US: 'en-US',
  ES_ES: 'es-ES',
} as const;
