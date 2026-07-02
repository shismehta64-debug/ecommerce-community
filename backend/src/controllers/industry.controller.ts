import { Request, Response, NextFunction } from 'express';
import * as industryService from '../services/industry.service';
import { successResponse, paginatedResponse } from '../utils/response';

export async function getSegments(_req: Request, res: Response) {
  const segments = industryService.getSegments();
  successResponse(res, segments);
}

// ─── Businesses ──────────────────────────────────────────

export async function listBusinesses(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await industryService.listBusinesses(req.query);
    paginatedResponse(res, result.data, result.meta);
  } catch (error) {
    next(error);
  }
}

export async function createBusiness(req: Request, res: Response, next: NextFunction) {
  try {
    const business = await industryService.createBusiness(req.user!.userId, req.body);
    successResponse(res, business, 'Business created', 201);
  } catch (error) {
    next(error);
  }
}

export async function getBusiness(req: Request, res: Response, next: NextFunction) {
  try {
    const business = await industryService.getBusinessById(req.params.businessId as string);
    successResponse(res, business);
  } catch (error) {
    next(error);
  }
}

export async function updateBusiness(req: Request, res: Response, next: NextFunction) {
  try {
    const business = await industryService.updateBusiness(req.params.businessId as string, req.body);
    successResponse(res, business, 'Business updated');
  } catch (error) {
    next(error);
  }
}

export async function deleteBusiness(req: Request, res: Response, next: NextFunction) {
  try {
    await industryService.deleteBusiness(req.params.businessId as string);
    successResponse(res, null, 'Business deleted');
  } catch (error) {
    next(error);
  }
}

// ─── Products ────────────────────────────────────────────

export async function listProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const products = await industryService.listProducts(req.params.businessId as string);
    successResponse(res, products);
  } catch (error) {
    next(error);
  }
}

export async function createProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await industryService.createProduct(req.params.businessId as string, req.body);
    successResponse(res, product, 'Product created', 201);
  } catch (error) {
    next(error);
  }
}

export async function getProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await industryService.getProductById(req.params.productId as string);
    successResponse(res, product);
  } catch (error) {
    next(error);
  }
}

export async function updateProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await industryService.updateProduct(req.params.productId as string, req.body);
    successResponse(res, product, 'Product updated');
  } catch (error) {
    next(error);
  }
}

export async function deleteProduct(req: Request, res: Response, next: NextFunction) {
  try {
    await industryService.deleteProduct(req.params.productId as string);
    successResponse(res, null, 'Product deleted');
  } catch (error) {
    next(error);
  }
}
