import { z } from 'zod';

export const productQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(12),
  search: z.string().optional(),
  category: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  sort: z.enum(['price_asc', 'price_desc', 'newest', 'oldest', 'name', 'popular']).default('newest'),
  featured: z.coerce.boolean().optional(),
});

// Schema for product image data (sent from frontend after Cloudinary upload)
const productImageSchema = z.object({
  url: z.string().url('Invalid image URL'),
  position: z.number().int().min(0).default(0),
});

// Schema for product variant data
const productVariantSchema = z.object({
  name: z.string().min(1, 'Variant name is required'),
  sku: z.string().min(1, 'Variant SKU is required'),
  price: z.number().positive('Variant price must be positive'),
  stock: z.number().int().min(0).default(0),
});

export const createProductSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  description: z.string().min(1, 'Description is required'),
  price: z.number().positive('Price must be positive'),
  compareAtPrice: z.number().positive().optional(),
  stock: z.number().int().min(0).default(0),
  sku: z.string().optional(),
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
  categoryId: z.string().uuid('Invalid category ID'),
  images: z.array(productImageSchema).optional().default([]),
  variants: z.array(productVariantSchema).optional().default([]),
});

export const updateProductSchema = createProductSchema.partial();

export const productIdSchema = z.object({
  id: z.string().min(1, 'Product ID or Slug is required'),
});
