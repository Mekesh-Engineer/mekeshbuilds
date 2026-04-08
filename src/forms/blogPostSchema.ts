// src/forms/blogPostSchema.ts
import { z } from 'zod';

export const blogPostSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  slug: z
    .string()
    .min(3, 'Slug must be at least 3 characters')
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be URL-safe (lowercase, hyphens only)'),
  content: z.string().optional(),
  description: z.string().max(300, 'Description must be under 300 characters').optional(),
  cover_image_url: z.string().url().or(z.literal('')).optional(),
  tags: z.array(z.string().max(30)).max(10).default([]),
  published: z.boolean().default(false),
});

export type BlogPostInput = z.infer<typeof blogPostSchema>;
