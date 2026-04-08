// src/types/auth.types.ts

/**
 * Application-level user type derived from Firebase Auth.
 * Consumed by authStore and useAuth hook.
 */
export interface AppUser {
  id: string;
  email: string;
  fullName: string;
  username: string;
  avatarUrl: string | null;
  role: 'owner' | 'user';
}

/**
 * Auth state shape for the authStore.
 */
export interface AuthState {
  isAuthenticated: boolean;
  isOwner: boolean;
  isLoading: boolean;
  user: AppUser | null;
}
