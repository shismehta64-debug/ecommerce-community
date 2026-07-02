import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { registerSchema, loginSchema, updateProfileSchema } from '../schemas/auth.schema';
import { googleAuthSchema } from '../schemas/googleAuth.schema';

const router = Router();

// POST /api/auth/google
router.post('/google', validate(googleAuthSchema), authController.googleLogin);

// POST /api/auth/register
router.post('/register', validate(registerSchema), authController.register);

// POST /api/auth/login
router.post('/login', validate(loginSchema), authController.login);

// GET /api/auth/me
router.get('/me', authenticate, authController.getMe);

// PUT /api/auth/me
router.put('/me', authenticate, validate(updateProfileSchema), authController.updateMe);

// POST /api/auth/logout
router.post('/logout', authenticate, authController.logout);

export default router;
