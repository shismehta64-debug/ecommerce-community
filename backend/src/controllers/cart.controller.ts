import { Request, Response, NextFunction } from 'express';
import * as cartService from '../services/cart.service';
import { successResponse } from '../utils/response';

export async function getCart(req: Request, res: Response, next: NextFunction) {
  try {
    const items = await cartService.getCart(req.user!.userId);
    successResponse(res, items);
  } catch (error) {
    next(error);
  }
}

export async function addToCart(req: Request, res: Response, next: NextFunction) {
  try {
    const item = await cartService.addToCart(req.user!.userId, req.body);
    successResponse(res, item, 'Added to cart', 201);
  } catch (error) {
    next(error);
  }
}

export async function updateCartItem(req: Request, res: Response, next: NextFunction) {
  try {
    const item = await cartService.updateCartItem(req.user!.userId, req.params.itemId as string, req.body.quantity);
    successResponse(res, item, 'Cart item updated');
  } catch (error) {
    next(error);
  }
}

export async function removeCartItem(req: Request, res: Response, next: NextFunction) {
  try {
    await cartService.removeCartItem(req.user!.userId, req.params.itemId as string);
    successResponse(res, null, 'Item removed from cart');
  } catch (error) {
    next(error);
  }
}
