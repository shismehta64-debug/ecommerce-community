import { Router } from 'express';
import { successResponse } from '../utils/response';

const router = Router();

// GET /api/health — no auth, no DB call, responds fast for uptime pinger
router.get('/', (_req, res) => {
  successResponse(res, { status: 'ok' });
});

export default router;
