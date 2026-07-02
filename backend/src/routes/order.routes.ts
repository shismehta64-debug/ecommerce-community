import { Router } from 'express';
import * as orderController from '../controllers/order.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createOrderSchema } from '../schemas/order.schema';

const router = Router();

// POST /api/orders — checkout entire cart
router.post('/', authenticate, validate(createOrderSchema), orderController.createOrder);

// GET /api/orders
router.get('/', authenticate, orderController.listOrders);

// GET /api/orders/:id
router.get('/:id', authenticate, orderController.getOrder);

export default router;
