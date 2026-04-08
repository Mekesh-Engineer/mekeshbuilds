// src/forms/projectsSchema.ts
import { z } from 'zod';
import { urlFieldSchema } from './shared';

export const projectSchema = z.object({
  title: z.string().min(2, 'Project title is required').max(100),
  description: z.string().max(2000).optional(),
  tags: z.array(z.string().max(30)).max(10, 'Maximum 10 tags').default([]),
  cover_image_url: urlFieldSchema,
  github_url: urlFieldSchema,
  demo_url: urlFieldSchema,
  status: z.enum(['draft', 'published']).default('draft'),
});

export type ProjectInput = z.infer<typeof projectSchema>;
