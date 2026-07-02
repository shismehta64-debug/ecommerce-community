import { Request, Response, NextFunction } from 'express';
import * as womenService from '../services/women.service';
import { successResponse, paginatedResponse } from '../utils/response';

export async function listProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await womenService.listProducts(req.query);
    paginatedResponse(res, result.data, result.meta);
  } catch (error) {
    next(error);
  }
}

export async function createProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await womenService.createProduct(req.user!.userId, req.body);
    successResponse(res, product, 'Product created', 201);
  } catch (error) {
    next(error);
  }
}

export async function getProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await womenService.getProductById(req.params.id as string);
    successResponse(res, product);
  } catch (error) {
    next(error);
  }
}

export async function updateProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await womenService.updateProduct(req.params.id as string, req.body);
    successResponse(res, product, 'Product updated');
  } catch (error) {
    next(error);
  }
}

export async function deleteProduct(req: Request, res: Response, next: NextFunction) {
  try {
    await womenService.deleteProduct(req.params.id as string);
    successResponse(res, null, 'Product deleted');
  } catch (error) {
    next(error);
  }
}
