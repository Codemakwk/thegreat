import { z } from 'zod';

export const checkoutSchema = z.object({
  shippingAddressId: z.string().uuid('Invalid address ID'),
  couponCode: z.string().optional(),
  notes: z.string().max(500).optional(),
});

export const orderIdSchema = z.object({
  id: z.string().uuid('Invalid order ID'),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']),
});
