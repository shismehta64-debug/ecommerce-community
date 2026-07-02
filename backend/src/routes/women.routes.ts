import { Router } from 'express';
import * as womenController from '../controllers/women.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { womenProductOwnership } from '../middleware/ownership';
import { createWomenProductSchema, updateWomenProductSchema } from '../schemas/women.schema';

const router = Router();

// GET /api/women/products
router.get('/products', womenController.listProducts);

// POST /api/women/products
router.post('/products', authenticate, validate(createWomenProductSchema), womenController.createProduct);

// GET /api/women/products/:id
router.get('/products/:id', womenController.getProduct);

// PUT /api/women/products/:id
router.put(
  '/products/:id',
  authenticate,
  womenProductOwnership,
  validate(updateWomenProductSchema),
  womenController.updateProduct
);

// DELETE /api/women/products/:id
router.delete('/products/:id', authenticate, womenProductOwnership, womenController.deleteProduct);

export default router;
