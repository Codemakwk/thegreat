import { Router } from 'express';
import * as productController from '../../controllers/product.controller';
import { authenticate } from '../../middleware/auth';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import {
  productQuerySchema,
  createProductSchema,
  updateProductSchema,
  productIdSchema,
} from '../../validators/product.validator';

const router = Router();

// Public routes
router.get('/', validate({ query: productQuerySchema }), productController.getProducts);
router.get('/categories', productController.getCategories);
router.get('/:id', validate({ params: productIdSchema }), productController.getProductById);

// Admin routes
router.post(
  '/',
  authenticate,
  authorize('ADMIN'),
  validate({ body: createProductSchema }),
  productController.createProduct
);

router.put(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  validate({ params: productIdSchema, body: updateProductSchema }),
  productController.updateProduct
);

router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  validate({ params: productIdSchema }),
  productController.deleteProduct
);

export default router;
