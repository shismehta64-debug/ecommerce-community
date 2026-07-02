import { Request, Response, NextFunction } from 'express';
import * as orderService from '../services/order.service';
import { successResponse } from '../utils/response';

export async function createOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const order = await orderService.checkout(req.user!.userId, req.body.shippingAddress);
    successResponse(res, order, 'Order placed successfully', 201);
  } catch (error) {
    next(error);
  }
}

export async function listOrders(req: Request, res: Response, next: NextFunction) {
  try {
    const orders = await orderService.listOrders(req.user!.userId);
    successResponse(res, orders);
  } catch (error) {
    next(error);
  }
}

export async function getOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const order = await orderService.getOrderById(req.user!.userId, req.params.id as string);
    successResponse(res, order);
  } catch (error) {
    next(error);
  }
}
