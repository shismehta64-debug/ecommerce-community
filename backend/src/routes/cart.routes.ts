import { Router } from 'express';
import * as cartController from '../controllers/cart.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { addToCartSchema, updateCartSchema } from '../schemas/cart.schema';

const router = Router();

// GET /api/cart
router.get('/', authenticate, cartController.getCart);

// POST /api/cart
router.post('/', authenticate, validate(addToCartSchema), cartController.addToCart);

// PUT /api/cart/:itemId
router.put('/:itemId', authenticate, validate(updateCartSchema), cartController.updateCartItem);

// DELETE /api/cart/:itemId
router.delete('/:itemId', authenticate, cartController.removeCartItem);

export default router;
