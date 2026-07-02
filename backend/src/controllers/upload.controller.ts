import { Request, Response, NextFunction } from 'express';
import { successResponse, errorResponse } from '../utils/response';

export async function uploadImage(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) {
      errorResponse(res, 'NO_FILE', 'No image file provided', 400);
      return;
    }

    const url = `/uploads/${req.file.filename}`;
    successResponse(res, { url }, 'Image uploaded successfully');
  } catch (error) {
    next(error);
  }
}
