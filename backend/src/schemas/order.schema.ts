import { z } from 'zod';

export const createOrderSchema = z.object({
  shippingAddress: z.string().min(1, 'Shipping address is required'),
});
