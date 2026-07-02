import { Router } from 'express';
import * as industryController from '../controllers/industry.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { businessOwnership, industryProductOwnership } from '../middleware/ownership';
import {
  createBusinessSchema,
  updateBusinessSchema,
  createProductSchema,
  updateProductSchema,
} from '../schemas/industry.schema';

const router = Router();

// GET /api/industry/segments
router.get('/segments', industryController.getSegments);

// GET /api/industry/businesses
router.get('/businesses', industryController.listBusinesses);

// POST /api/industry/businesses
router.post('/businesses', authenticate, validate(createBusinessSchema), industryController.createBusiness);

// GET /api/industry/businesses/:businessId
router.get('/businesses/:businessId', industryController.getBusiness);

// PUT /api/industry/businesses/:businessId
router.put(
  '/businesses/:businessId',
  authenticate,
  businessOwnership,
  validate(updateBusinessSchema),
  industryController.updateBusiness
);

// DELETE /api/industry/businesses/:businessId
router.delete('/businesses/:businessId', authenticate, businessOwnership, industryController.deleteBusiness);

// GET /api/industry/businesses/:businessId/products
router.get('/businesses/:businessId/products', industryController.listProducts);

// POST /api/industry/businesses/:businessId/products
router.post(
  '/businesses/:businessId/products',
  authenticate,
  businessOwnership,
  validate(createProductSchema),
  industryController.createProduct
);

// GET /api/industry/products/:productId
router.get('/products/:productId', industryController.getProduct);

// PUT /api/industry/products/:productId
router.put(
  '/products/:productId',
  authenticate,
  industryProductOwnership,
  validate(updateProductSchema),
  industryController.updateProduct
);

// DELETE /api/industry/products/:productId
router.delete('/products/:productId', authenticate, industryProductOwnership, industryController.deleteProduct);

export default router;
