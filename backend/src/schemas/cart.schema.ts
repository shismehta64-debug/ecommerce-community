import { z } from 'zod';

const cartItemTypes = ['FARMER_PRODUCE', 'WOMEN_PRODUCT'] as const;

export const addToCartSchema = z.object({
  itemType: z.enum(cartItemTypes),
  itemId: z.string().uuid('Invalid item ID'),
  quantity: z.number().int().positive('Quantity must be a positive integer'),
});

export const updateCartSchema = z.object({
  quantity: z.number().int().positive('Quantity must be a positive integer'),
});
