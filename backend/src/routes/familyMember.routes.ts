import { Router } from 'express';
import * as familyController from '../controllers/family.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { familyMemberOwnership } from '../middleware/ownership';
import { updateFamilyMemberSchema } from '../schemas/family.schema';

const router = Router();

// PUT /api/family-members/:memberId
router.put(
  '/:memberId',
  authenticate,
  familyMemberOwnership,
  validate(updateFamilyMemberSchema),
  familyController.updateMember
);

// DELETE /api/family-members/:memberId
router.delete('/:memberId', authenticate, familyMemberOwnership, familyController.deleteMember);

export default router;
