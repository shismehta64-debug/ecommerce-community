import { z } from 'zod';

const providerTypes = ['INDIVIDUAL', 'NGO'] as const;
const serviceCategories = [
  'EDUCATION_TUITION', 'HEALTHCARE_CAMP', 'SKILL_TRAINING',
  'COUNSELING', 'LEGAL_AID', 'OTHERS',
] as const;

export const createSocialServiceSchema = z.object({
  providerType: z.enum(providerTypes),
  serviceName: z.string().min(1, 'Service name is required'),
  category: z.enum(serviceCategories),
  description: z.string().min(1, 'Description is required'),
  schedule: z.string().optional().nullable(),
  city: z.string().min(1, 'City is required'),
  address: z.string().optional().nullable(),
  contactPhone: z.string().min(10, 'Contact phone is required'),
  isActive: z.boolean().default(true),
});

export const updateSocialServiceSchema = createSocialServiceSchema.partial();
