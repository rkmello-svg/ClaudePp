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
