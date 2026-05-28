export const API_VERSION = 'v1';
export const APP_VERSION = '0.1.0';

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
