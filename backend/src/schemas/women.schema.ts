import { z } from 'zod';

const womenProductCategories = [
  'HANDICRAFTS', 'FOOD_PICKLES', 'CLOTHING_BOUTIQUE',
  'JEWELLERY_ACCESSORIES', 'BEAUTY_WELLNESS', 'HOME_DECOR', 'OTHERS',
] as const;

export const createWomenProductSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().min(1, 'Description is required'),
  category: z.enum(womenProductCategories),
  price: z.number().positive('Price must be positive'),
  stockQuantity: z.number().int().min(0, 'Stock must be non-negative'),
  images: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
});

export const updateWomenProductSchema = createWomenProductSchema.partial();
