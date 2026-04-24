import rateLimit from 'express-rate-limit';

/** Rate limiter for auth endpoints — max 10 requests per minute */
export const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: {
    success: false,
    message: 'Too many requests. Please try again after a minute.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/** General API rate limiter — max 100 requests per minute */
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: 'Too many requests. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
