import { Router } from 'express';
import * as orderController from '../../controllers/order.controller';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { checkoutSchema, orderIdSchema } from '../../validators/order.validator';

const router = Router();

router.use(authenticate);

router.post('/checkout', validate({ body: checkoutSchema }), orderController.checkout);
router.get('/', orderController.getOrders);
router.get('/:id', validate({ params: orderIdSchema }), orderController.getOrderById);
router.get('/:id/receipt', validate({ params: orderIdSchema }), orderController.downloadReceipt);

export default router;
