import { Router } from 'express';
import * as farmerController from '../controllers/farmer.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { farmerProduceOwnership } from '../middleware/ownership';
import { createProduceSchema, updateProduceSchema } from '../schemas/farmer.schema';

const router = Router();

// GET /api/farmer/produce
router.get('/produce', farmerController.listProduce);

// POST /api/farmer/produce
router.post('/produce', authenticate, validate(createProduceSchema), farmerController.createProduce);

// GET /api/farmer/produce/:id
router.get('/produce/:id', farmerController.getProduce);

// PUT /api/farmer/produce/:id
router.put(
  '/produce/:id',
  authenticate,
  farmerProduceOwnership,
  validate(updateProduceSchema),
  farmerController.updateProduce
);

// DELETE /api/farmer/produce/:id
router.delete('/produce/:id', authenticate, farmerProduceOwnership, farmerController.deleteProduce);

export default router;
