import { Request, Response } from 'express';
import prisma from '../config/db';
import { ApiError } from '../utils/apiError';
import { asyncHandler } from '../utils/asyncHandler';

/** GET /api/v1/cart — Get user's cart */
export const getCart = asyncHandler(async (req: Request, res: Response) => {
  let cart = await prisma.cart.findUnique({
    where: { userId: req.userPayload!.userId },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: { take: 1, orderBy: { position: 'asc' } },
            },
          },
          variant: true,
        },
      },
    },
  });

  // Create cart if it doesn't exist
  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId: req.userPayload!.userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { take: 1, orderBy: { position: 'asc' } },
              },
            },
            variant: true,
          },
        },
      },
    });
  }

  // Calculate totals
  const subtotal = cart.items.reduce((sum, item) => {
    const price = item.variant?.price || item.product.price;
    return sum + price * item.quantity;
  }, 0);

  res.json({
    success: true,
    data: {
      ...cart,
      subtotal: Math.round(subtotal * 100) / 100,
      itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
    },
  });
});

/** POST /api/v1/cart/add — Add item to cart */
export const addToCart = asyncHandler(async (req: Request, res: Response) => {
  const { productId, variantId, quantity = 1 } = req.body;

  // Verify product exists and is active
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || !product.active) {
    throw ApiError.notFound('Product not found');
  }

  // Check stock
  if (product.stock < quantity) {
    throw ApiError.badRequest('Insufficient stock');
  }

  // Get or create cart
  let cart = await prisma.cart.findUnique({ where: { userId: req.userPayload!.userId } });
  if (!cart) {
    cart = await prisma.cart.create({ data: { userId: req.userPayload!.userId } });
  }

  // Check if item already in cart
  const existingItem = await prisma.cartItem.findFirst({
    where: {
      cartId: cart.id,
      productId,
      variantId: variantId || null,
    },
  });

  if (existingItem) {
    // Update quantity
    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: existingItem.quantity + quantity },
    });
  } else {
    // Add new item
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        variantId: variantId || null,
        quantity,
      },
    });
  }

  res.status(201).json({ success: true, message: 'Item added to cart' });
});

/** PUT /api/v1/cart/update — Update cart item quantity */
export const updateCartItem = asyncHandler(async (req: Request, res: Response) => {
  const { cartItemId, quantity } = req.body;

  const item = await prisma.cartItem.findUnique({
    where: { id: cartItemId },
    include: { cart: true, product: true },
  });

  if (!item || item.cart.userId !== req.userPayload!.userId) {
    throw ApiError.notFound('Cart item not found');
  }

  if (quantity === 0) {
    await prisma.cartItem.delete({ where: { id: cartItemId } });
    return res.json({ success: true, message: 'Item removed from cart' });
  }

  if (item.product.stock < quantity) {
    throw ApiError.badRequest('Insufficient stock');
  }

  await prisma.cartItem.update({
    where: { id: cartItemId },
    data: { quantity },
  });

  res.json({ success: true, message: 'Cart updated' });
});

/** DELETE /api/v1/cart/remove — Remove item from cart */
export const removeCartItem = asyncHandler(async (req: Request, res: Response) => {
  const { cartItemId } = req.body;

  const item = await prisma.cartItem.findUnique({
    where: { id: cartItemId },
    include: { cart: true },
  });

  if (!item || item.cart.userId !== req.userPayload!.userId) {
    throw ApiError.notFound('Cart item not found');
  }

  await prisma.cartItem.delete({ where: { id: cartItemId } });

  res.json({ success: true, message: 'Item removed from cart' });
});
