import { Request, Response, NextFunction } from 'express';
import * as adminService from '../services/admin.service';
import { successResponse } from '../utils/response';

export async function getPendingVerifications(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await adminService.getPendingVerifications();
    successResponse(res, data);
  } catch (error) {
    next(error);
  }
}

export async function verify(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await adminService.verify(req.params.type as string, req.params.id as string);
    successResponse(res, result, 'Verified successfully');
  } catch (error) {
    next(error);
  }
}
