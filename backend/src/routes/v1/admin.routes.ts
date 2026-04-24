import { Router } from 'express';
import * as adminController from '../../controllers/admin.controller';
import { authenticate } from '../../middleware/auth';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { updateOrderStatusSchema } from '../../validators/order.validator';
import { couponSchema } from '../../validators/misc.validator';

const router = Router();

// All admin routes require authentication + ADMIN role
router.use(authenticate, authorize('ADMIN'));

// Dashboard
router.get('/dashboard', adminController.getDashboardStats);

// Orders
router.get('/orders', adminController.getAllOrders);
router.patch('/orders/:id/status', validate({ body: updateOrderStatusSchema }), adminController.updateOrderStatus);

// Users
router.get('/users', adminController.getAllUsers);
router.delete('/users/:id', adminController.deleteUser);
router.patch('/users/:id/ban', adminController.toggleBanUser);

// Coupons
router.get('/coupons', adminController.getCoupons);
router.post('/coupons', validate({ body: couponSchema }), adminController.createCoupon);
router.put('/coupons/:id', adminController.updateCoupon);
router.delete('/coupons/:id', adminController.deleteCoupon);

export default router;
