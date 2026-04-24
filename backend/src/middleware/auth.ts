import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../utils/jwt';
import { ApiError } from '../utils/apiError';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

/**
 * Middleware to verify JWT access token from Authorization header.
 * Attaches decoded user payload to req.user.
 */
export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Access token required');
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error: any) {
    if (error instanceof ApiError) {
      next(error);
    } else if (error.name === 'TokenExpiredError') {
      next(ApiError.unauthorized('Access token expired'));
    } else if (error.name === 'JsonWebTokenError') {
      next(ApiError.unauthorized('Invalid access token'));
    } else {
      next(ApiError.unauthorized('Authentication failed'));
    }
  }
};

/**
 * Optional authentication — doesn't throw if no token provided,
 * but still decodes the user if a valid token exists.
 */
export const optionalAuth = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      req.user = verifyAccessToken(token);
    }
  } catch {
    // Silently ignore invalid tokens for optional auth
  }
  next();
};
