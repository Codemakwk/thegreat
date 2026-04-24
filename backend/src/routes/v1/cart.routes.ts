import { Router } from 'express';
import * as cartController from '../../controllers/cart.controller';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { addToCartSchema, updateCartItemSchema, removeCartItemSchema } from '../../validators/cart.validator';

const router = Router();

// All cart routes require authentication
router.use(authenticate);

router.get('/', cartController.getCart);
router.post('/add', validate({ body: addToCartSchema }), cartController.addToCart);
router.put('/update', validate({ body: updateCartItemSchema }), cartController.updateCartItem);
router.delete('/remove', validate({ body: removeCartItemSchema }), cartController.removeCartItem);

export default router;
