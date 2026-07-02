import { z } from 'zod';

const relations = ['SELF', 'SPOUSE', 'SON', 'DAUGHTER', 'FATHER', 'MOTHER', 'OTHER'] as const;
const genders = ['MALE', 'FEMALE', 'OTHER'] as const;
const maritalStatuses = ['SINGLE', 'MARRIED', 'ENGAGED', 'DIVORCED', 'WIDOWED'] as const;

export const createFamilySchema = z.object({
  familyName: z.string().min(1, 'Family name is required'),
  nativePlace: z.string().optional().nullable(),
  currentCity: z.string().min(1, 'Current city is required'),
  currentState: z.string().min(1, 'Current state is required'),
  currentAddress: z.string().optional().nullable(),
  contactPhone: z.string().optional().nullable(),
  contactEmail: z.string().email().optional().nullable(),
  isPublic: z.boolean().default(true),
});

export const updateFamilySchema = createFamilySchema.partial();

export const createFamilyMemberSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  relation: z.enum(relations),
  gender: z.enum(genders),
  dob: z.string().datetime().optional().nullable(),
  education: z.string().optional().nullable(),
  profession: z.string().optional().nullable(),
  companyName: z.string().optional().nullable(),
  maritalStatus: z.enum(maritalStatuses).default('SINGLE'),
  photoUrl: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
});

export const updateFamilyMemberSchema = createFamilyMemberSchema.partial();
