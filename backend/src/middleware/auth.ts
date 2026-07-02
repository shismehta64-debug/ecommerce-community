import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../utils/jwt';
import { errorResponse } from '../utils/response';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    errorResponse(res, 'UNAUTHORIZED', 'Missing or invalid authorization header', 401);
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch (error) {
    errorResponse(res, 'UNAUTHORIZED', 'Invalid or expired token', 401);
    return;
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.user || req.user.role !== 'ADMIN') {
    errorResponse(res, 'FORBIDDEN', 'Admin access required', 403);
    return;
  }
  next();
}
