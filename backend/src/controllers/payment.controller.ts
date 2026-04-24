import { Request, Response } from 'express';
import stripe from '../config/stripe';
import prisma from '../config/db';
import env from '../config/env';
import { ApiError } from '../utils/apiError';
import { asyncHandler } from '../utils/asyncHandler';
import { sendEmail } from '../config/email';
import { orderConfirmationEmail } from '../utils/emailTemplates';

/** POST /api/v1/payments/create-intent — Create Stripe PaymentIntent */
export const createPaymentIntent = asyncHandler(async (req: Request, res: Response) => {
  const { orderId } = req.body;

  const order = await prisma.order.findFirst({
    where: { id: orderId, userId: req.user!.userId },
  });

  if (!order) {
    throw ApiError.notFound('Order not found');
  }

  if (order.stripePaymentIntentId) {
    // Return existing client secret
    const existing = await stripe.paymentIntents.retrieve(order.stripePaymentIntentId);
    return res.json({
      success: true,
      data: { clientSecret: existing.client_secret },
    });
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(order.total * 100),
    currency: 'usd',
    metadata: {
      orderId: order.id,
      userId: req.user!.userId,
    },
  });

  await prisma.order.update({
    where: { id: orderId },
    data: { stripePaymentIntentId: paymentIntent.id },
  });

  res.json({
    success: true,
    data: { clientSecret: paymentIntent.client_secret },
  });
});

/** POST /api/v1/payments/webhook — Stripe webhook handler */
export const handleWebhook = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, env.STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    console.error('⚠️ Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object as any;

      // Update payment and order status
      await prisma.payment.updateMany({
        where: { stripePaymentIntentId: paymentIntent.id },
        data: { status: 'SUCCEEDED' },
      });

      const order = await prisma.order.findFirst({
        where: { stripePaymentIntentId: paymentIntent.id },
        include: {
          user: true,
          items: true,
        },
      });

      if (order) {
        await prisma.order.update({
          where: { id: order.id },
          data: { status: 'PROCESSING' },
        });

        // Send confirmation email
        await sendEmail({
          to: order.user.email,
          subject: `Order Confirmed #${order.id.slice(0, 8).toUpperCase()}`,
          html: orderConfirmationEmail(
            order.user.firstName,
            order.id,
            order.total,
            order.items.map((i) => ({
              name: i.name,
              quantity: i.quantity,
              price: i.price * i.quantity,
            }))
          ),
        });
      }
      break;
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object as any;
      await prisma.payment.updateMany({
        where: { stripePaymentIntentId: paymentIntent.id },
        data: { status: 'FAILED' },
      });
      break;
    }
  }

  res.json({ received: true });
};

/** POST /api/v1/payments/refund — Issue refund (admin only) */
export const refundPayment = asyncHandler(async (req: Request, res: Response) => {
  const { orderId, amount } = req.body;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { payment: true },
  });

  if (!order || !order.payment) {
    throw ApiError.notFound('Order or payment not found');
  }

  if (order.payment.status !== 'SUCCEEDED') {
    throw ApiError.badRequest('Can only refund succeeded payments');
  }

  const refundAmount = amount ? Math.round(amount * 100) : Math.round(order.total * 100);

  await stripe.refunds.create({
    payment_intent: order.stripePaymentIntentId!,
    amount: refundAmount,
  });

  const isFullRefund = !amount || amount >= order.total;

  await prisma.payment.update({
    where: { id: order.payment.id },
    data: {
      status: isFullRefund ? 'REFUNDED' : 'PARTIALLY_REFUNDED',
      refundedAmount: (order.payment.refundedAmount || 0) + (amount || order.total),
      refundedAt: new Date(),
    },
  });

  if (isFullRefund) {
    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'REFUNDED' },
    });
  }

  res.json({ success: true, message: 'Refund processed successfully' });
});
