import { Router } from 'express';
import * as enquiryController from '../controllers/enquiry.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createEnquirySchema } from '../schemas/enquiry.schema';

const router = Router();

// POST /api/enquiries
router.post('/', authenticate, validate(createEnquirySchema), enquiryController.createEnquiry);

// GET /api/enquiries/received
router.get('/received', authenticate, enquiryController.getReceivedEnquiries);

// GET /api/enquiries/sent
router.get('/sent', authenticate, enquiryController.getSentEnquiries);

export default router;
