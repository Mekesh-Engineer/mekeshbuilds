// src/forms/experienceSchema.ts
import { z } from 'zod';

export const experienceSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('work'),
    title: z.string().min(2, 'Job title is required'),
    institution: z.string().min(2, 'Company name is required'),
    employment_type: z.enum([
      'Full-Time',
      'Part-Time',
      'Internship',
      'Freelance',
      'Contract',
    ]),
    start_date: z.string().min(1, 'Start date is required'),
    end_date: z.string().nullable(),
    description: z.string().max(2000).optional(),
  }),
  z.object({
    type: z.literal('education'),
    title: z.string().min(2, 'Degree name is required'),
    institution: z.string().min(2, 'Institution name is required'),
    field_of_study: z.string().optional(),
    start_date: z.string().min(1, 'Start date is required'),
    end_date: z.string().nullable(),
    description: z.string().max(1000).optional(),
  }),
]);

export type ExperienceInput = z.infer<typeof experienceSchema>;
