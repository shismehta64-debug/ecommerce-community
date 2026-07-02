import { Router } from 'express';
import * as familyController from '../controllers/family.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { familyOwnership, familyMemberOwnership } from '../middleware/ownership';
import {
  createFamilySchema,
  updateFamilySchema,
  createFamilyMemberSchema,
  updateFamilyMemberSchema,
} from '../schemas/family.schema';

const router = Router();

// GET /api/families
router.get('/', familyController.listFamilies);

// POST /api/families
router.post('/', authenticate, validate(createFamilySchema), familyController.createFamily);

// GET /api/families/:id
router.get('/:id', familyController.getFamily);

// PUT /api/families/:id
router.put(
  '/:id',
  authenticate,
  familyOwnership,
  validate(updateFamilySchema),
  familyController.updateFamily
);

// DELETE /api/families/:id
router.delete('/:id', authenticate, familyOwnership, familyController.deleteFamily);

// POST /api/families/:id/members
router.post(
  '/:id/members',
  authenticate,
  familyOwnership,
  validate(createFamilyMemberSchema),
  familyController.addMember
);

export default router;
