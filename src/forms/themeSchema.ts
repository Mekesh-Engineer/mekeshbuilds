// src/forms/themeSchema.ts
import { z } from 'zod';

const hexColorSchema = z
  .string()
  .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Must be a valid hex color');

export const themeSchema = z.object({
  theme_color: hexColorSchema,
  secondary_color: hexColorSchema,
  font_pairing: z.string().min(1, 'Font pairing is required'),
  theme_mode: z.enum(['light', 'dark']),
});

export type ThemeInput = z.infer<typeof themeSchema>;
