import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/apiError';

/**
 * Role-based authorization middleware.
 * Must be used AFTER the authenticate middleware.
 */
export const authorize = (...roles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.userPayload) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    if (!roles.includes(req.userPayload.role)) {
      return next(
        ApiError.forbidden(`Access denied. Required role: ${roles.join(' or ')}`)
      );
    }

    next();
  };
};
