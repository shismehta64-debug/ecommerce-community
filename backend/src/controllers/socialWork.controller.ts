import { Request, Response, NextFunction } from 'express';
import * as socialWorkService from '../services/socialWork.service';
import { successResponse, paginatedResponse } from '../utils/response';

export async function listServices(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await socialWorkService.listServices(req.query);
    paginatedResponse(res, result.data, result.meta);
  } catch (error) {
    next(error);
  }
}

export async function createService(req: Request, res: Response, next: NextFunction) {
  try {
    const service = await socialWorkService.createService(req.user!.userId, req.body);
    successResponse(res, service, 'Service created', 201);
  } catch (error) {
    next(error);
  }
}

export async function getService(req: Request, res: Response, next: NextFunction) {
  try {
    const service = await socialWorkService.getServiceById(req.params.id as string);
    successResponse(res, service);
  } catch (error) {
    next(error);
  }
}

export async function updateService(req: Request, res: Response, next: NextFunction) {
  try {
    const service = await socialWorkService.updateService(req.params.id as string, req.body);
    successResponse(res, service, 'Service updated');
  } catch (error) {
    next(error);
  }
}

export async function deleteService(req: Request, res: Response, next: NextFunction) {
  try {
    await socialWorkService.deleteService(req.params.id as string);
    successResponse(res, null, 'Service deleted');
  } catch (error) {
    next(error);
  }
}
