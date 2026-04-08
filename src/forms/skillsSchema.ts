// src/forms/skillsSchema.ts
import { z } from 'zod';

const skillEntrySchema = z.object({
  name: z.string().min(1, 'Skill name is required').max(50),
  category: z.string().min(1, 'Category is required').max(50),
  proficiency: z.number().min(0).max(100),
});

export const skillsSchema = z.object({
  skills: z.array(skillEntrySchema).min(0),
});

export type SkillEntry = z.infer<typeof skillEntrySchema>;
export type SkillsInput = z.infer<typeof skillsSchema>;
