// src/types/database.types.ts
// Firestore collection type definitions — mirrors the Firestore document schemas.
// Keep in sync with Firestore collections.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          full_name: string | null;
          email: string | null;
          avatar_url: string | null;
          headline: string | null;
          bio: string | null;
          bio_extended: string | null;
          location_context: string | null;
          phone: string | null;
          city: string | null;
          website_url: string | null;
          github_url: string | null;
          linkedin_url: string | null;
          twitter_url: string | null;
          resume_url: string | null;
          resume_download_enabled: boolean;
          theme_color: string;
          secondary_color: string;
          font_pairing: string;
          theme_mode: string;
          meta_title: string | null;
          meta_description: string | null;
          og_image_url: string | null;
          noindex: boolean;
          is_published: boolean;
          availability_status: string;
          location_lat: number | null;
          location_lng: number | null;
          about_photo_url: string | null;
          role: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          full_name?: string | null;
          email?: string | null;
          avatar_url?: string | null;
          headline?: string | null;
          bio?: string | null;
          bio_extended?: string | null;
          location_context?: string | null;
          phone?: string | null;
          city?: string | null;
          website_url?: string | null;
          github_url?: string | null;
          linkedin_url?: string | null;
          twitter_url?: string | null;
          resume_url?: string | null;
          resume_download_enabled?: boolean;
          theme_color?: string;
          secondary_color?: string;
          font_pairing?: string;
          theme_mode?: string;
          meta_title?: string | null;
          meta_description?: string | null;
          og_image_url?: string | null;
          noindex?: boolean;
          is_published?: boolean;
          availability_status?: string;
          location_lat?: number | null;
          location_lng?: number | null;
          about_photo_url?: string | null;
          role?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          full_name?: string | null;
          email?: string | null;
          avatar_url?: string | null;
          headline?: string | null;
          bio?: string | null;
          bio_extended?: string | null;
          location_context?: string | null;
          phone?: string | null;
          city?: string | null;
          website_url?: string | null;
          github_url?: string | null;
          linkedin_url?: string | null;
          twitter_url?: string | null;
          resume_url?: string | null;
          resume_download_enabled?: boolean;
          theme_color?: string;
          secondary_color?: string;
          font_pairing?: string;
          theme_mode?: string;
          meta_title?: string | null;
          meta_description?: string | null;
          og_image_url?: string | null;
          noindex?: boolean;
          is_published?: boolean;
          availability_status?: string;
          location_lat?: number | null;
          location_lng?: number | null;
          about_photo_url?: string | null;
          role?: string;
          created_at?: string;
          updated_at?: string;
        };
      Relationships: [];
      };
      experience: {
        Row: {
          id: string;
          owner_id: string;
          type: string;
          title: string;
          institution: string;
          employment_type: string | null;
          start_date: string;
          end_date: string | null;
          description: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          type: string;
          title: string;
          institution: string;
          employment_type?: string | null;
          start_date: string;
          end_date?: string | null;
          description?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          type?: string;
          title?: string;
          institution?: string;
          employment_type?: string | null;
          start_date?: string;
          end_date?: string | null;
          description?: string | null;
          sort_order?: number;
          created_at?: string;
        };
      Relationships: [];
      };
      skills: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          category: string;
          proficiency: number;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          category: string;
          proficiency: number;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          name?: string;
          category?: string;
          proficiency?: number;
          sort_order?: number;
          created_at?: string;
        };
      Relationships: [];
      };
      projects: {
        Row: {
          id: string;
          owner_id: string;
          title: string;
          description: string | null;
          tags: string[];
          cover_image_url: string | null;
          image_urls: string[];
          github_url: string | null;
          demo_url: string | null;
          status: string;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          title: string;
          description?: string | null;
          tags?: string[];
          cover_image_url?: string | null;
          image_urls?: string[];
          github_url?: string | null;
          demo_url?: string | null;
          status?: string;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          title?: string;
          description?: string | null;
          tags?: string[];
          cover_image_url?: string | null;
          image_urls?: string[];
          github_url?: string | null;
          demo_url?: string | null;
          status?: string;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      Relationships: [];
      };
      certificates: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          issuer: string | null;
          year: number | null;
          url: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          issuer?: string | null;
          year?: number | null;
          url?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          name?: string;
          issuer?: string | null;
          year?: number | null;
          url?: string | null;
          sort_order?: number;
          created_at?: string;
        };
      Relationships: [];
      };
      blog_posts: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          slug: string;
          content: string | null;
          description: string | null;
          cover_image_url: string | null;
          tags: string[];
          published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          slug: string;
          content?: string | null;
          description?: string | null;
          cover_image_url?: string | null;
          tags?: string[];
          published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          slug?: string;
          content?: string | null;
          description?: string | null;
          cover_image_url?: string | null;
          tags?: string[];
          published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      Relationships: [];
      };
      gallery_items: {
        Row: {
          id: string;
          user_id: string;
          image_url: string;
          caption: string | null;
          category: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          image_url: string;
          caption?: string | null;
          category?: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          image_url?: string;
          caption?: string | null;
          category?: string;
          sort_order?: number;
          created_at?: string;
        };
      Relationships: [];
      };
      testimonials: {
        Row: {
          id: string;
          user_id: string;
          reviewer_name: string;
          reviewer_role: string | null;
          reviewer_company: string | null;
          reviewer_avatar_url: string | null;
          quote: string;
          star_rating: number | null;
          linkedin_url: string | null;
          featured: boolean;
          category: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          reviewer_name: string;
          reviewer_role?: string | null;
          reviewer_company?: string | null;
          reviewer_avatar_url?: string | null;
          quote: string;
          star_rating?: number | null;
          linkedin_url?: string | null;
          featured?: boolean;
          category?: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          reviewer_name?: string;
          reviewer_role?: string | null;
          reviewer_company?: string | null;
          reviewer_avatar_url?: string | null;
          quote?: string;
          star_rating?: number | null;
          linkedin_url?: string | null;
          featured?: boolean;
          category?: string;
          sort_order?: number;
          created_at?: string;
        };
      Relationships: [];
      };
      contact_submissions: {
        Row: {
          id: string;
          owner_user_id: string;
          sender_name: string;
          sender_email: string;
          subject: string | null;
          message: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          owner_user_id: string;
          sender_name: string;
          sender_email: string;
          subject?: string | null;
          message: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          owner_user_id?: string;
          sender_name?: string;
          sender_email?: string;
          subject?: string | null;
          message?: string;
          created_at?: string;
        };
      Relationships: [];
      };
      page_views: {
        Row: {
          id: string;
          owner_user_id: string;
          path: string;
          referrer: string | null;
          device_type: string | null;
          country: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          owner_user_id: string;
          path: string;
          referrer?: string | null;
          device_type?: string | null;
          country?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          owner_user_id?: string;
          path?: string;
          referrer?: string | null;
          device_type?: string | null;
          country?: string | null;
          created_at?: string;
        };
      Relationships: [];
      };
      project_clicks: {
        Row: {
          id: string;
          project_id: string;
          owner_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          owner_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          owner_id?: string;
          created_at?: string;
        };
      Relationships: [];
      };
      resume_versions: {
        Row: {
          id: string;
          user_id: string;
          file_url: string;
          file_size: number | null;
          is_active: boolean;
          uploaded_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          file_url: string;
          file_size?: number | null;
          is_active?: boolean;
          uploaded_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          file_url?: string;
          file_size?: number | null;
          is_active?: boolean;
          uploaded_at?: string;
        };
      Relationships: [];
      };
      admin_access_logs: {
        Row: {
          id: string;
          hashed_ip: string | null;
          success: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          hashed_ip?: string | null;
          success: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          hashed_ip?: string | null;
          success?: boolean;
          created_at?: string;
        };
      Relationships: [];
      };
      error_logs: {
        Row: {
          id: string;
          path: string | null;
          referrer: string | null;
          error_type: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          path?: string | null;
          referrer?: string | null;
          error_type?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          path?: string | null;
          referrer?: string | null;
          error_type?: string | null;
          created_at?: string;
        };
      Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

// ── Convenience type aliases ──────────────────────────────────────────
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Experience = Database['public']['Tables']['experience']['Row'];
export type Skill = Database['public']['Tables']['skills']['Row'];
export type Project = Database['public']['Tables']['projects']['Row'];
export type Certificate = Database['public']['Tables']['certificates']['Row'];
export type BlogPost = Database['public']['Tables']['blog_posts']['Row'];
export type GalleryItem = Database['public']['Tables']['gallery_items']['Row'];
export type Testimonial = Database['public']['Tables']['testimonials']['Row'];
export type ContactSubmission = Database['public']['Tables']['contact_submissions']['Row'];
export type PageView = Database['public']['Tables']['page_views']['Row'];
export type ProjectClick = Database['public']['Tables']['project_clicks']['Row'];
export type ResumeVersion = Database['public']['Tables']['resume_versions']['Row'];
export type AdminAccessLog = Database['public']['Tables']['admin_access_logs']['Row'];
export type ErrorLog = Database['public']['Tables']['error_logs']['Row'];
