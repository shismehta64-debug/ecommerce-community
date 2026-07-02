import { z } from 'zod';

const listingTypes = ['INDUSTRY_PRODUCT', 'SOCIAL_SERVICE'] as const;

export const createEnquirySchema = z.object({
  listingType: z.enum(listingTypes),
  listingId: z.string().uuid('Invalid listing ID'),
  message: z.string().min(1, 'Message is required'),
  contactPhone: z.string().min(10, 'Contact phone is required'),
});
