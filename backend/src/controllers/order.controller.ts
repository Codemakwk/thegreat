import { Request, Response } from 'express';
import prisma from '../config/db';
import stripe from '../config/stripe';
import { ApiError } from '../utils/apiError';
import { asyncHandler } from '../utils/asyncHandler';
import { sendEmail } from '../config/email';
import { orderConfirmationEmail } from '../utils/emailTemplates';
import { generateReceiptPDF } from '../services/pdf.service';

/** POST /api/v1/orders/checkout — Create order from cart */
export const checkout = asyncHandler(async (req: Request, res: Response) => {
  const { shippingAddressId, couponCode, notes } = req.body;
  const userId = req.user!.userId;

  // Get cart with items
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: true,
          variant: true,
        },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    throw ApiError.badRequest('Cart is empty');
  }

  // Verify address
  const address = await prisma.address.findFirst({
    where: { id: shippingAddressId, userId },
  });
  if (!address) {
    throw ApiError.badRequest('Invalid shipping address');
  }

  // Calculate subtotal
  let subtotal = 0;
  const orderItems: { productId: string; variantId: string | null; quantity: number; price: number; name: string }[] = [];

  for (const item of cart.items) {
    const price = item.variant?.price || item.product.price;

    // Verify stock
    if (item.product.stock < item.quantity) {
      throw ApiError.badRequest(`Insufficient stock for "${item.product.name}"`);
    }

    subtotal += price * item.quantity;
    orderItems.push({
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
      price,
      name: item.variant ? `${item.product.name} (${item.variant.name})` : item.product.name,
    });
  }

  // Apply coupon if provided
  let discountAmount = 0;
  if (couponCode) {
    const coupon = await prisma.coupon.findUnique({ where: { code: couponCode } });
    if (!coupon || !coupon.active) {
      throw ApiError.badRequest('Invalid coupon code');
    }
    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      throw ApiError.badRequest('Coupon has expired');
    }
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      throw ApiError.badRequest('Coupon has reached maximum uses');
    }
    if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
      throw ApiError.badRequest(`Minimum order amount for this coupon is $${coupon.minOrderAmount}`);
    }

    discountAmount = Math.round(subtotal * (coupon.discountPercent / 100) * 100) / 100;

    // Increment coupon usage
    await prisma.coupon.update({
      where: { id: coupon.id },
      data: { usedCount: { increment: 1 } },
    });
  }

  const tax = Math.round(subtotal * 0.08 * 100) / 100; // 8% tax
  const shippingCost = subtotal > 100 ? 0 : 9.99; // Free shipping over $100
  const total = Math.round((subtotal - discountAmount + tax + shippingCost) * 100) / 100;

  // Create Stripe PaymentIntent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(total * 100), // Stripe uses cents
    currency: 'usd',
    metadata: { userId },
  });

  // Create order
  const order = await prisma.order.create({
    data: {
      userId,
      status: 'PENDING',
      subtotal,
      tax,
      shippingCost,
      discountAmount,
      couponCode: couponCode || null,
      total,
      shippingAddressId,
      stripePaymentIntentId: paymentIntent.id,
      notes: notes || null,
      items: {
        create: orderItems,
      },
    },
    include: { items: true },
  });

  // Create payment record
  await prisma.payment.create({
    data: {
      orderId: order.id,
      stripePaymentIntentId: paymentIntent.id,
      amount: total,
      status: 'PENDING',
    },
  });

  // Reduce stock
  for (const item of cart.items) {
    await prisma.product.update({
      where: { id: item.productId },
      data: { stock: { decrement: item.quantity } },
    });
    if (item.variantId) {
      await prisma.productVariant.update({
        where: { id: item.variantId },
        data: { stock: { decrement: item.quantity } },
      });
    }
  }

  // Clear cart
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

  res.status(201).json({
    success: true,
    data: {
      order,
      clientSecret: paymentIntent.client_secret,
    },
  });
});

/** GET /api/v1/orders — Get user's orders */
export const getOrders = asyncHandler(async (req: Request, res: Response) => {
  const orders = await prisma.order.findMany({
    where: { userId: req.user!.userId },
    include: {
      items: {
        include: {
          product: {
            include: { images: { take: 1, orderBy: { position: 'asc' } } },
          },
        },
      },
      shippingAddress: true,
      payment: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({ success: true, data: orders });
});

/** GET /api/v1/orders/:id — Get order by ID */
export const getOrderById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const order = await prisma.order.findFirst({
    where: {
      id,
      userId: req.user!.userId,
    },
    include: {
      items: {
        include: {
          product: {
            include: { images: { take: 1, orderBy: { position: 'asc' } } },
          },
          variant: true,
        },
      },
      shippingAddress: true,
      payment: true,
    },
  });

  if (!order) {
    throw ApiError.notFound('Order not found');
  }

  res.json({ success: true, data: order });
});

/** GET /api/v1/orders/:id/receipt — Download PDF receipt */
export const downloadReceipt = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const order = await prisma.order.findFirst({
    where: {
      id,
      userId: req.user!.userId,
    },
    include: {
      items: {
        include: {
          product: true,
          variant: true,
        },
      },
      shippingAddress: true,
      payment: true,
    },
  });

  if (!order) {
    throw ApiError.notFound('Order not found');
  }

  // Generate and pipe the PDF
  await generateReceiptPDF(order, res);
});
