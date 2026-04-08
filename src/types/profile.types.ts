// src/types/profile.types.ts
import type { Database } from './database.types';

/**
 * Profile type derived directly from the database schema.
 * Ensures absolute parity between TypeScript and Firestore.
 */
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export type Experience = Database['public']['Tables']['experience']['Row'];
export type ExperienceInsert = Database['public']['Tables']['experience']['Insert'];

export type Skill = Database['public']['Tables']['skills']['Row'];
export type SkillInsert = Database['public']['Tables']['skills']['Insert'];

export type Project = Database['public']['Tables']['projects']['Row'];
export type ProjectInsert = Database['public']['Tables']['projects']['Insert'];

export type Certificate = Database['public']['Tables']['certificates']['Row'];
export type CertificateInsert = Database['public']['Tables']['certificates']['Insert'];

export type BlogPost = Database['public']['Tables']['blog_posts']['Row'];
export type BlogPostInsert = Database['public']['Tables']['blog_posts']['Insert'];

export type GalleryItem = Database['public']['Tables']['gallery_items']['Row'];
export type Testimonial = Database['public']['Tables']['testimonials']['Row'];

/**
 * Composite type for the full portfolio data loaded by React Router loaders.
 */
export interface PortfolioData {
  profile: Profile;
  experiences: Experience[];
  skills: Skill[];
  projects: Project[];
  certificates: Certificate[];
}
