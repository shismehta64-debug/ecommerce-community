import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { errorResponse } from '../utils/response';

/**
 * Validates req.body against a Zod schema.
 * On failure, returns 400 with VALIDATION_ERROR and lists failing fields.
 */
export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const fieldErrors = error.errors.map((e) => {
          const path = e.path.join('.');
          return path ? `${path}: ${e.message}` : e.message;
        });
        errorResponse(res, 'VALIDATION_ERROR', fieldErrors.join('; '), 400);
        return;
      }
      next(error);
    }
  };
}
