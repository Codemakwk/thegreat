import { Request, Response } from 'express';
import prisma from '../config/db';
import redis from '../config/redis';
import { ApiError } from '../utils/apiError';
import { asyncHandler } from '../utils/asyncHandler';

/** GET /api/v1/products — List products with filtering, search, sort, pagination */
export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  const {
    page = 1,
    limit = 12,
    search,
    category,
    minPrice,
    maxPrice,
    sort = 'newest',
    featured,
  } = req.query as any;

  // Build where clause
  const where: any = { active: true };

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (category) {
    where.category = { slug: category };
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {};
    if (minPrice !== undefined) where.price.gte = Number(minPrice);
    if (maxPrice !== undefined) where.price.lte = Number(maxPrice);
  }

  if (featured !== undefined) {
    where.featured = featured === 'true' || featured === true;
  }

  // Build sort
  let orderBy: any = { createdAt: 'desc' };
  switch (sort) {
    case 'price_asc':
      orderBy = { price: 'asc' };
      break;
    case 'price_desc':
      orderBy = { price: 'desc' };
      break;
    case 'newest':
      orderBy = { createdAt: 'desc' };
      break;
    case 'oldest':
      orderBy = { createdAt: 'asc' };
      break;
    case 'name':
      orderBy = { name: 'asc' };
      break;
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: Number(limit),
      include: {
        images: { orderBy: { position: 'asc' }, take: 2 },
        category: { select: { id: true, name: true, slug: true } },
        variants: { select: { id: true, name: true, price: true, stock: true } },
        _count: { select: { reviews: true } },
      },
    }),
    prisma.product.count({ where }),
  ]);

  // Calculate average rating for each product
  const productsWithRating = await Promise.all(
    products.map(async (product) => {
      const avgRating = await prisma.review.aggregate({
        where: { productId: product.id },
        _avg: { rating: true },
      });
      return {
        ...product,
        avgRating: avgRating._avg.rating || 0,
        reviewCount: product._count.reviews,
      };
    })
  );

  res.json({
    success: true,
    data: {
      products: productsWithRating,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    },
  });
});

/** GET /api/v1/products/:id — Get product by ID or Slug */
export const getProductById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  // Try cache first (if redis is healthy)
  const cacheKey = `product:${id}`;
  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.json({ success: true, data: JSON.parse(cached) });
    }
  } catch (error) {
    console.warn('Redis cache get failed:', error);
  }

  // Find by ID or Slug
  const product = await prisma.product.findFirst({
    where: {
      OR: [
        { id: id.length === 36 ? id : undefined }, // Check if it looks like a UUID
        { slug: id },
      ],
    },
    include: {
      images: { orderBy: { position: 'asc' } },
      category: { select: { id: true, name: true, slug: true } },
      variants: true,
      reviews: {
        include: {
          user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      _count: { select: { reviews: true } },
    },
  });

  if (!product) {
    throw ApiError.notFound('Product not found');
  }

  // Calculate average rating
  const avgRating = await prisma.review.aggregate({
    where: { productId: product.id },
    _avg: { rating: true },
  });

  const data = {
    ...product,
    avgRating: avgRating._avg.rating || 0,
    reviewCount: product._count.reviews,
  };

  // Cache for 5 minutes (non-blocking)
  try {
    await redis.setex(cacheKey, 300, JSON.stringify(data));
  } catch (error) {
    console.warn('Redis cache set failed:', error);
  }

  res.json({ success: true, data });
});

/** POST /api/v1/products — Create product (admin only) */
export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const { name, ...rest } = req.body;

  // Generate slug from name
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  // Check for slug uniqueness
  const existingSlug = await prisma.product.findUnique({ where: { slug } });
  const finalSlug = existingSlug ? `${slug}-${Date.now()}` : slug;

  const product = await prisma.product.create({
    data: {
      name,
      slug: finalSlug,
      ...rest,
      images: {
        create: rest.images || [],
      },
      variants: {
        create: rest.variants || [],
      },
    },
    include: {
      images: true,
      category: { select: { id: true, name: true, slug: true } },
      variants: true,
    },
  });

  res.status(201).json({ success: true, data: product });
});

/** PUT /api/v1/products/:id — Update product (admin only) */
export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    throw ApiError.notFound('Product not found');
  }

  const { images, variants, ...rest } = req.body;
  let updateData = { ...rest };
  
  if (req.body.name && req.body.name !== existing.name) {
    const slug = req.body.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const existingSlug = await prisma.product.findFirst({
      where: { slug, id: { not: id } },
    });
    updateData.slug = existingSlug ? `${slug}-${Date.now()}` : slug;
  }

  // Handle nested updates (Simple strategy: delete and recreate)
  const product = await prisma.product.update({
    where: { id },
    data: {
      ...updateData,
      images: images && images.length > 0 ? {
        deleteMany: {},
        create: images,
      } : undefined,
      variants: variants && variants.length > 0 ? {
        deleteMany: {},
        create: variants,
      } : undefined,
    },
    include: {
      images: true,
      category: { select: { id: true, name: true, slug: true } },
      variants: true,
    },
  });

  // Invalidate cache
  await redis.del(`product:${id}`);

  res.json({ success: true, data: product });
});

/** DELETE /api/v1/products/:id — Delete product (admin only) */
export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    throw ApiError.notFound('Product not found');
  }

  await prisma.product.delete({ where: { id } });
  await redis.del(`product:${id}`);

  res.json({ success: true, message: 'Product deleted successfully' });
});

/** GET /api/v1/products/categories — List all categories */
export const getCategories = asyncHandler(async (_req: Request, res: Response) => {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: 'asc' },
  });

  res.json({ success: true, data: categories });
});
