import { z } from 'zod';

const industrySegments = [
  'TEXTILE', 'CHEMICAL', 'MECHANICAL_ENGINEERING', 'DIAMOND_JEWELLERY',
  'PLASTICS', 'CERAMICS', 'PHARMA', 'FOOD_PROCESSING', 'IT_SERVICES',
  'REAL_ESTATE', 'LOGISTICS', 'AUTOMOBILE_PARTS', 'HANDICRAFTS', 'OTHERS',
] as const;

export const createBusinessSchema = z.object({
  businessName: z.string().min(1, 'Business name is required'),
  segment: z.enum(industrySegments),
  description: z.string().min(1, 'Description is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  address: z.string().min(1, 'Address is required'),
  contactPhone: z.string().min(10, 'Contact phone is required'),
  whatsappNumber: z.string().optional().nullable(),
  contactEmail: z.string().email().optional().nullable(),
  logoUrl: z.string().optional().nullable(),
  gstNumber: z.string().optional().nullable(),
});

export const updateBusinessSchema = createBusinessSchema.partial();

export const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().min(1, 'Description is required'),
  category: z.string().min(1, 'Category is required'),
  priceRange: z.string().min(1, 'Price range is required'),
  unit: z.string().min(1, 'Unit is required'),
  images: z.array(z.string()).default([]),
  moq: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

export const updateProductSchema = createProductSchema.partial();
