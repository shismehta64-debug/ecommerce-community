import { Response } from 'express';

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function successResponse(res: Response, data: any, message?: string, statusCode: number = 200) {
  const response: any = { success: true, data };
  if (message) response.message = message;
  return res.status(statusCode).json(response);
}

export function paginatedResponse(res: Response, data: any[], meta: PaginationMeta) {
  return res.status(200).json({
    success: true,
    data,
    meta,
  });
}

export function errorResponse(res: Response, code: string, message: string, statusCode: number = 400) {
  return res.status(statusCode).json({
    success: false,
    error: { code, message },
  });
}
