// src/forms/authSchemas.ts
import { z } from 'zod';
import { emailFieldSchema, passwordFieldSchema } from './shared';

export const loginSchema = z.object({
  email: emailFieldSchema,
  password: z.string().min(1, 'Password is required'),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  email: emailFieldSchema,
  password: passwordFieldSchema,
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const resetPasswordSchema = z.object({
  email: emailFieldSchema,
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const updatePasswordSchema = z
  .object({
    newPassword: passwordFieldSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
