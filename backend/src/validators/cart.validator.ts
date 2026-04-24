import { z } from 'zod';

export const addToCartSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  variantId: z.string().uuid('Invalid variant ID').optional(),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').default(1),
});

export const updateCartItemSchema = z.object({
  cartItemId: z.string().uuid('Invalid cart item ID'),
  quantity: z.number().int().min(0, 'Quantity cannot be negative'),
});

export const removeCartItemSchema = z.object({
  cartItemId: z.string().uuid('Invalid cart item ID'),
});
