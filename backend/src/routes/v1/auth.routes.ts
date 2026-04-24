import { Router } from 'express';
import * as authController from '../../controllers/auth.controller';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { authLimiter } from '../../middleware/rateLimiter';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  refreshTokenSchema,
} from '../../validators/auth.validator';

const router = Router();

// Apply rate limiting to all auth routes
router.use(authLimiter);

router.post('/register', validate({ body: registerSchema }), authController.register);
router.post('/login', validate({ body: loginSchema }), authController.login);
router.post('/logout', authenticate, authController.logout);
router.post('/refresh', validate({ body: refreshTokenSchema }), authController.refreshAccessToken);
router.post('/forgot-password', validate({ body: forgotPasswordSchema }), authController.forgotPassword);
router.post('/reset-password', validate({ body: resetPasswordSchema }), authController.resetPassword);
router.get('/verify-email', authController.verifyEmail);
router.get('/me', authenticate, authController.getMe);

export default router;
