import { Request, Response, NextFunction } from 'express';
import * as farmerService from '../services/farmer.service';
import { successResponse, paginatedResponse } from '../utils/response';

export async function listProduce(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await farmerService.listProduce(req.query);
    paginatedResponse(res, result.data, result.meta);
  } catch (error) {
    next(error);
  }
}

export async function createProduce(req: Request, res: Response, next: NextFunction) {
  try {
    const produce = await farmerService.createProduce(req.user!.userId, req.body);
    successResponse(res, produce, 'Produce listed', 201);
  } catch (error) {
    next(error);
  }
}

export async function getProduce(req: Request, res: Response, next: NextFunction) {
  try {
    const produce = await farmerService.getProduceById(req.params.id as string);
    successResponse(res, produce);
  } catch (error) {
    next(error);
  }
}

export async function updateProduce(req: Request, res: Response, next: NextFunction) {
  try {
    const produce = await farmerService.updateProduce(req.params.id as string, req.body);
    successResponse(res, produce, 'Produce updated');
  } catch (error) {
    next(error);
  }
}

export async function deleteProduce(req: Request, res: Response, next: NextFunction) {
  try {
    await farmerService.deleteProduce(req.params.id as string);
    successResponse(res, null, 'Produce deleted');
  } catch (error) {
    next(error);
  }
}
