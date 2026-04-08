// src/forms/personalInfoSchema.ts
import { z } from 'zod';
import { urlFieldSchema, emailFieldSchema } from './shared';

export const personalInfoSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  headline: z.string().max(120, 'Tagline must be under 120 characters').optional(),
  email: emailFieldSchema,
  phone: z
    .string()
    .regex(/^[\d\s+\-()]+$/, 'Invalid phone number')
    .optional()
    .or(z.literal('')),
  city: z.string().max(100).optional(),
  github_url: urlFieldSchema,
  linkedin_url: urlFieldSchema,
  twitter_url: urlFieldSchema,
  website_url: urlFieldSchema,
  bio: z.string().max(500, 'Bio must be under 500 characters').optional(),
});

export type PersonalInfoInput = z.infer<typeof personalInfoSchema>;
