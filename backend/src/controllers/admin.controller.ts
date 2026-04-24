import { Request, Response } from 'express';
import prisma from '../config/db';
import { ApiError } from '../utils/apiError';
import { asyncHandler } from '../utils/asyncHandler';

/** GET /api/v1/admin/dashboard — Dashboard stats */
export const getDashboardStats = asyncHandler(async (_req: Request, res: Response) => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    totalProducts,
    totalOrders,
    pendingOrders,
    monthlyRevenue,
    weeklyRevenue,
    recentOrders,
    topProducts,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.product.count(),
    prisma.order.count(),
    prisma.order.count({ where: { status: 'PENDING' } }),
    prisma.order.aggregate({
      where: { createdAt: { gte: thirtyDaysAgo }, status: { not: 'CANCELLED' } },
      _sum: { total: true },
    }),
    prisma.order.aggregate({
      where: { createdAt: { gte: sevenDaysAgo }, status: { not: 'CANCELLED' } },
      _sum: { total: true },
    }),
    prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
      },
    }),
    prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    }),
  ]);

  // Fetch product details for top products
  const topProductsWithDetails = await Promise.all(
    topProducts.map(async (item) => {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        include: { images: { take: 1, orderBy: { position: 'asc' } } },
      });
      return {
        product,
        totalSold: item._sum.quantity,
      };
    })
  );

  // Revenue per day (last 30 days)
  const dailyOrders = await prisma.order.findMany({
    where: { createdAt: { gte: thirtyDaysAgo }, status: { not: 'CANCELLED' } },
    select: { total: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  });

  const revenueByDay: Record<string, number> = {};
  dailyOrders.forEach((order) => {
    const day = order.createdAt.toISOString().split('T')[0];
    revenueByDay[day] = (revenueByDay[day] || 0) + order.total;
  });

  const revenueChart = Object.entries(revenueByDay).map(([date, revenue]) => ({
    date,
    revenue: Math.round(revenue * 100) / 100,
  }));

  res.json({
    success: true,
    data: {
      stats: {
        totalUsers,
        totalProducts,
        totalOrders,
        pendingOrders,
        monthlyRevenue: monthlyRevenue._sum.total || 0,
        weeklyRevenue: weeklyRevenue._sum.total || 0,
      },
      revenueChart,
      recentOrders,
      topProducts: topProductsWithDetails,
    },
  });
});

/** GET /api/v1/admin/orders — All orders */
export const getAllOrders = asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 20, status } = req.query as any;

  const where: any = {};
  if (status) where.status = status;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        items: { include: { product: { select: { name: true } } } },
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.order.count({ where }),
  ]);

  res.json({
    success: true,
    data: {
      orders,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    },
  });
});

/** PATCH /api/v1/admin/orders/:id/status — Update order status */
export const updateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) {
    throw ApiError.notFound('Order not found');
  }

  const updated = await prisma.order.update({
    where: { id },
    data: { status },
    include: {
      user: { select: { firstName: true, email: true } },
    },
  });

  res.json({ success: true, data: updated });
});

/** GET /api/v1/admin/users — All users */
export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 20 } = req.query as any;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        emailVerified: true,
        banned: true,
        createdAt: true,
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count(),
  ]);

  res.json({
    success: true,
    data: {
      users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    },
  });
});

/** DELETE /api/v1/admin/users/:id — Delete user */
export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw ApiError.notFound('User not found');
  }
  if (user.role === 'ADMIN') {
    throw ApiError.forbidden('Cannot delete admin users');
  }

  await prisma.user.delete({ where: { id } });
  res.json({ success: true, message: 'User deleted successfully' });
});

/** PATCH /api/v1/admin/users/:id/ban — Ban/unban user */
export const toggleBanUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw ApiError.notFound('User not found');
  }
  if (user.role === 'ADMIN') {
    throw ApiError.forbidden('Cannot ban admin users');
  }

  const updated = await prisma.user.update({
    where: { id },
    data: { banned: !user.banned },
  });

  res.json({
    success: true,
    message: updated.banned ? 'User banned' : 'User unbanned',
    data: { banned: updated.banned },
  });
});

// ─── Coupon Management ─────────────────────────────────────────

/** GET /api/v1/admin/coupons */
export const getCoupons = asyncHandler(async (_req: Request, res: Response) => {
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
  res.json({ success: true, data: coupons });
});

/** POST /api/v1/admin/coupons */
export const createCoupon = asyncHandler(async (req: Request, res: Response) => {
  const coupon = await prisma.coupon.create({ data: req.body });
  res.status(201).json({ success: true, data: coupon });
});

/** PUT /api/v1/admin/coupons/:id */
export const updateCoupon = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const coupon = await prisma.coupon.update({ where: { id }, data: req.body });
  res.json({ success: true, data: coupon });
});

/** DELETE /api/v1/admin/coupons/:id */
export const deleteCoupon = asyncHandler(async (req: Request, res: Response) => {
  await prisma.coupon.delete({ where: { id: req.params.id } });
  res.json({ success: true, message: 'Coupon deleted' });
});
