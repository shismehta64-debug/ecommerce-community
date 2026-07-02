import { z } from 'zod';

const produceCategories = ['VEGETABLE', 'FRUIT', 'GRAIN', 'DAIRY', 'OTHER'] as const;
const produceUnits = ['KG', 'DOZEN', 'QUINTAL'] as const;

export const createProduceSchema = z.object({
  cropName: z.string().min(1, 'Crop name is required'),
  category: z.enum(produceCategories),
  pricePerUnit: z.number().positive('Price must be positive'),
  unit: z.enum(produceUnits),
  quantityAvailable: z.number().positive('Quantity must be positive'),
  harvestDate: z.string().datetime().optional().nullable(),
  village: z.string().optional().nullable(),
  city: z.string().min(1, 'City is required'),
  images: z.array(z.string()).default([]),
  isOrganic: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export const updateProduceSchema = createProduceSchema.partial();
