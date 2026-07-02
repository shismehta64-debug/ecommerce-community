import { Router } from 'express';
import * as uploadController from '../controllers/upload.controller';
import { authenticate } from '../middleware/auth';
import { upload } from '../utils/upload';

const router = Router();

// POST /api/uploads/image
router.post('/image', authenticate, upload.single('image'), uploadController.uploadImage);

export default router;
