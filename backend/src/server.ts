import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import passport from './config/passport';
import env from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimiter';

// Route imports
import authRoutes from './routes/v1/auth.routes';
import productRoutes from './routes/v1/product.routes';
import cartRoutes from './routes/v1/cart.routes';
import orderRoutes from './routes/v1/order.routes';
import paymentRoutes from './routes/v1/payment.routes';
import adminRoutes from './routes/v1/admin.routes';
import miscRoutes from './routes/v1/misc.routes';
import uploadRoutes from './routes/v1/upload.routes';
import addressRoutes from './routes/v1/address.routes';
import path from 'path';

const app = express();

// ─── Security Middleware ──────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ─── Body Parsing ─────────────────────────────────────────────────
// Note: Stripe webhook needs raw body, handled in its route
app.use((req, res, next) => {
  if (req.originalUrl === '/api/v1/payments/webhook') {
    next();
  } else {
    express.json({ limit: '10mb' })(req, res, next);
  }
});
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());

// ─── Rate Limiting ────────────────────────────────────────────────
app.use('/api/', apiLimiter);

// ─── Static Files ─────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));
app.use(express.static(path.join(__dirname, '../public')));

// ─── Health Check ─────────────────────────────────────────────────
app.get('/api/v1/health', (_req, res) => {
  res.json({
    success: true,
    message: 'TheGreat API is running',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

// ─── API Routes (v1) ─────────────────────────────────────────────
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/cart', cartRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/upload', uploadRoutes);
app.use('/api/v1/addresses', addressRoutes);
app.use('/api/v1', miscRoutes);

// ─── 404 Handler ──────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// ─── Global Error Handler ─────────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ──────────────────────────────────────────────────
const PORT = env.PORT;

app.listen(PORT, () => {
  console.log(`
  ╔════════════════════════════════════════════╗
  ║                                            ║
  ║   🚀 TheGreat API Server                   ║
  ║                                            ║
  ║   Port:  ${String(PORT).padEnd(33)}║
  ║   Mode:  ${env.NODE_ENV.padEnd(33)}║
  ║   URL:   http://localhost:${String(PORT).padEnd(16)}║
  ║                                            ║
  ╚════════════════════════════════════════════╝
  `);
});

export default app;
