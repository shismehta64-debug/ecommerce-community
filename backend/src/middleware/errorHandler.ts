import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  statusCode: number;
  code: string;

  constructor(code: string, message: string, statusCode: number = 400) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.name = 'AppError';
  }
}

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  // Multer errors
  if (err.name === 'MulterError') {
    res.status(400).json({
      success: false,
      error: {
        code: 'UPLOAD_ERROR',
        message: err.message === 'File too large' ? 'File size must be under 5MB' : err.message,
      },
    });
    return;
  }

  // Custom Multer file filter error
  if (err.message && err.message.includes('Only image files')) {
    res.status(400).json({
      success: false,
      error: { code: 'UPLOAD_ERROR', message: err.message },
    });
    return;
  }

  // Known application errors
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: { code: err.code, message: err.message },
    });
    return;
  }

  // Unknown errors — never leak stack traces
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' },
  });
}
