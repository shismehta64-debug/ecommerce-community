import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';

// Load env vars before anything else
dotenv.config();

import { errorHandler } from './middleware/errorHandler';

// Route imports
import healthRoutes from './routes/health.routes';
import authRoutes from './routes/auth.routes';
import industryRoutes from './routes/industry.routes';
import farmerRoutes from './routes/farmer.routes';
import womenRoutes from './routes/women.routes';
import cartRoutes from './routes/cart.routes';
import orderRoutes from './routes/order.routes';
import socialWorkRoutes from './routes/socialWork.routes';
import enquiryRoutes from './routes/enquiry.routes';
import familyRoutes from './routes/family.routes';
import familyMemberRoutes from './routes/familyMember.routes';
import uploadRoutes from './routes/upload.routes';
import adminRoutes from './routes/admin.routes';

const app = express();

// ─── Global Middleware ───────────────────────────────────

// CORS — allow frontend origin
app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
    credentials: true,
  })
);

// JSON body parsing
app.use(express.json());

// URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// ─── API Routes ──────────────────────────────────────────

app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/industry', industryRoutes);
app.use('/api/farmer', farmerRoutes);
app.use('/api/women', womenRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/social-work', socialWorkRoutes);
app.use('/api/enquiries', enquiryRoutes);
app.use('/api/families', familyRoutes);
app.use('/api/family-members', familyMemberRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/admin', adminRoutes);

// ─── 404 Handler ─────────────────────────────────────────

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: 'Endpoint not found' },
  });
});

// ─── Centralized Error Handler ───────────────────────────

app.use(errorHandler);

export default app;
