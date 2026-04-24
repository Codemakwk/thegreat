import { z } from 'zod';

export const createReviewSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(100).optional(),
  comment: z.string().max(1000).optional(),
});

export const addressSchema = z.object({
  label: z.string().max(50).default('Home'),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  street: z.string().min(1).max(200),
  city: z.string().min(1).max(100),
  state: z.string().min(1).max(100),
  zipCode: z.string().min(1).max(20),
  country: z.string().max(2).default('US'),
  phone: z.string().max(20).optional(),
  isDefault: z.boolean().default(false),
});

export const couponSchema = z.object({
  code: z.string().min(3).max(20).toUpperCase(),
  discountPercent: z.number().min(1).max(100),
  maxUses: z.number().int().positive().optional(),
  minOrderAmount: z.number().min(0).optional(),
  active: z.boolean().default(true),
  expiresAt: z.string().datetime().optional(),
});
