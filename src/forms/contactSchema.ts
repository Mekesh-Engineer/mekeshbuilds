// src/forms/contactSchema.ts
// Shared between client-side form AND Edge Function server-side validation
import { z } from 'zod';

export const contactSchema = z.object({
  name: z.string().min(2).max(100).trim(),
  email: z.string().email(),
  subject: z.enum([
    'Job Opportunity',
    'Freelance Project',
    'General Inquiry',
    'Other',
  ]),
  message: z
    .string()
    .min(20, 'Message must be at least 20 characters')
    .max(5000)
    .trim(),
});

export type ContactInput = z.infer<typeof contactSchema>;
