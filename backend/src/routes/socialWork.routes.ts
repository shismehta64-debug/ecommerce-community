import { Router } from 'express';
import * as socialWorkController from '../controllers/socialWork.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { socialServiceOwnership } from '../middleware/ownership';
import { createSocialServiceSchema, updateSocialServiceSchema } from '../schemas/socialWork.schema';

const router = Router();

// GET /api/social-work/services
router.get('/services', socialWorkController.listServices);

// POST /api/social-work/services
router.post('/services', authenticate, validate(createSocialServiceSchema), socialWorkController.createService);

// GET /api/social-work/services/:id
router.get('/services/:id', socialWorkController.getService);

// PUT /api/social-work/services/:id
router.put(
  '/services/:id',
  authenticate,
  socialServiceOwnership,
  validate(updateSocialServiceSchema),
  socialWorkController.updateService
);

// DELETE /api/social-work/services/:id
router.delete('/services/:id', authenticate, socialServiceOwnership, socialWorkController.deleteService);

export default router;
