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
