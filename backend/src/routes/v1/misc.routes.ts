import { Router } from 'express';
import * as miscController from '../../controllers/misc.controller';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { createReviewSchema, addressSchema } from '../../validators/misc.validator';

const router = Router();

// ─── Reviews ─────────────────────────────────────────────────────
router.post('/reviews', authenticate, validate({ body: createReviewSchema }), miscController.createReview);
router.get('/reviews/product/:productId', miscController.getProductReviews);

// ─── Addresses ───────────────────────────────────────────────────
router.get('/addresses', authenticate, miscController.getAddresses);
router.post('/addresses', authenticate, validate({ body: addressSchema }), miscController.createAddress);
router.put('/addresses/:id', authenticate, validate({ body: addressSchema.partial() }), miscController.updateAddress);
router.delete('/addresses/:id', authenticate, miscController.deleteAddress);

// ─── Profile ─────────────────────────────────────────────────────
router.put('/profile', authenticate, miscController.updateProfile);

export default router;
