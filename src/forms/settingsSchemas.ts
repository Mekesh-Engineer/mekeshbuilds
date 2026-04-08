// src/forms/settingsSchemas.ts
import { z } from 'zod';
import { urlFieldSchema, passwordFieldSchema } from './shared';

export const accountSettingsSchema = z.object({
  full_name: z.string().min(2).max(100),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30)
    .regex(/^[a-z0-9_-]+$/, 'Username must be lowercase with hyphens or underscores only'),
  email: z.string().email(),
});

export type AccountSettingsInput = z.infer<typeof accountSettingsSchema>;

export const seoSettingsSchema = z.object({
  meta_title: z.string().max(60, 'Meta title must be under 60 characters').optional(),
  meta_description: z.string().max(160, 'Meta description must be under 160 characters').optional(),
  og_image_url: urlFieldSchema,
  noindex: z.boolean().default(false),
});

export type SeoSettingsInput = z.infer<typeof seoSettingsSchema>;

export const securitySettingsSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordFieldSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type SecuritySettingsInput = z.infer<typeof securitySettingsSchema>;
