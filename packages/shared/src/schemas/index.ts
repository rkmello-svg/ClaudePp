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
