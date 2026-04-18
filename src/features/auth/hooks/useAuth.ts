// src/hooks/useAuth.ts
// Thin wrapper around authStore — consumed by all components that need auth state.
// This indirection means the underlying store implementation could change
// (e.g., to Context API) without touching any component that calls useAuth().
import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { useAuthStore } from '@/stores/authStore';
import { auth } from '@/services/firebase/client';

export const useAuth = () => {
  const store = useAuthStore();

  useEffect(() => {
    // Listen for auth state changes (login, logout, token refresh)
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      void store.setFirebaseUser(user);
    });

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    user: store.user,
    firebaseUser: store.firebaseUser,
    isAuthenticated: store.isAuthenticated,
    isOwner: store.isOwner,
    isLoading: store.isLoading,
    signOut: store.signOut,
  };
};
