import { Request, Response } from 'express';
import prisma from '../config/db';
import { ApiError } from '../utils/apiError';
import { asyncHandler } from '../utils/asyncHandler';

/** POST /api/v1/reviews — Create a review */
export const createReview = asyncHandler(async (req: Request, res: Response) => {
  const { productId, rating, title, comment } = req.body;
  const userId = req.user!.userId;

  // Check if product exists
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw ApiError.notFound('Product not found');

  // Check if user already reviewed this product
  const existing = await prisma.review.findFirst({ where: { userId, productId } });
  if (existing) throw ApiError.conflict('You have already reviewed this product');

  const review = await prisma.review.create({
    data: { userId, productId, rating, title, comment },
    include: {
      user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
    },
  });

  res.status(201).json({ success: true, data: review });
});

/** GET /api/v1/reviews/product/:productId — Get reviews for a product */
export const getProductReviews = asyncHandler(async (req: Request, res: Response) => {
  const { productId } = req.params;
  const { page = 1, limit = 10 } = req.query as any;

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: { productId },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    }),
    prisma.review.count({ where: { productId } }),
  ]);

  const avgRating = await prisma.review.aggregate({
    where: { productId },
    _avg: { rating: true },
  });

  res.json({
    success: true,
    data: {
      reviews,
      avgRating: avgRating._avg.rating || 0,
      total,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    },
  });
});

// ─── Address CRUD ────────────────────────────────────────────────

/** GET /api/v1/addresses */
export const getAddresses = asyncHandler(async (req: Request, res: Response) => {
  const addresses = await prisma.address.findMany({
    where: { userId: req.user!.userId },
    orderBy: { isDefault: 'desc' },
  });
  res.json({ success: true, data: addresses });
});

/** POST /api/v1/addresses */
export const createAddress = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;

  // If this is the default, remove default from others
  if (req.body.isDefault) {
    await prisma.address.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });
  }

  const address = await prisma.address.create({
    data: { ...req.body, userId },
  });

  res.status(201).json({ success: true, data: address });
});

/** PUT /api/v1/addresses/:id */
export const updateAddress = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.userId;

  const existing = await prisma.address.findFirst({ where: { id, userId } });
  if (!existing) throw ApiError.notFound('Address not found');

  if (req.body.isDefault) {
    await prisma.address.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });
  }

  const address = await prisma.address.update({
    where: { id },
    data: req.body,
  });

  res.json({ success: true, data: address });
});

/** DELETE /api/v1/addresses/:id */
export const deleteAddress = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const existing = await prisma.address.findFirst({ where: { id, userId: req.user!.userId } });
  if (!existing) throw ApiError.notFound('Address not found');

  await prisma.address.delete({ where: { id } });
  res.json({ success: true, message: 'Address deleted' });
});

// ─── Profile ─────────────────────────────────────────────────────

/** PUT /api/v1/profile */
export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const { firstName, lastName, avatar } = req.body;

  const user = await prisma.user.update({
    where: { id: req.user!.userId },
    data: { firstName, lastName, avatar },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      avatar: true,
      emailVerified: true,
    },
  });

  res.json({ success: true, data: user });
});
