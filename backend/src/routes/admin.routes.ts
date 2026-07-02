import { Router } from 'express';
import * as adminController from '../controllers/admin.controller';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

// GET /api/admin/pending-verifications
router.get('/pending-verifications', authenticate, requireAdmin, adminController.getPendingVerifications);

// PUT /api/admin/verify/:type/:id
router.put('/verify/:type/:id', authenticate, requireAdmin, adminController.verify);

export default router;
