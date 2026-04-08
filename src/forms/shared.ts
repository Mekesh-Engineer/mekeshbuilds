// src/forms/shared.ts
// Field-level schemas shared across multiple forms
import { z } from 'zod';

export const urlFieldSchema = z
  .string()
  .url('Please enter a valid URL')
  .or(z.literal(''))
  .optional();

export const emailFieldSchema = z
  .string()
  .email('Please enter a valid email address');

export const passwordFieldSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Must include uppercase, lowercase, and a number',
  );
