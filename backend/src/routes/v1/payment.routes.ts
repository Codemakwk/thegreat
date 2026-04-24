import { Router } from 'express';
import * as paymentController from '../../controllers/payment.controller';
import { authenticate } from '../../middleware/auth';
import { authorize } from '../../middleware/authorize';
import express from 'express';

const router = Router();

// Webhook needs raw body — must be registered before JSON parser
router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.handleWebhook);

// Authenticated routes
router.post('/create-intent', authenticate, paymentController.createPaymentIntent);
router.post('/refund', authenticate, authorize('ADMIN'), paymentController.refundPayment);

export default router;
