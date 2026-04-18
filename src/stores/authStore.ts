// src/store/authStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { doc, getDoc, onSnapshot, setDoc } from 'firebase/firestore';
import { signOut as firebaseSignOut, type User } from 'firebase/auth';
import type { AppUser } from '@/types/auth.types';
import { auth, db } from '@/services/firebase/client';

const OWNER_ROLES = new Set(['owner', 'admin', 'super_admin', 'superadmin', 'root']);
const configuredOwnerEmail = (import.meta.env.VITE_OWNER_EMAIL as string | undefined)
  ?.trim()
  .toLowerCase();

function normalizeRole(role: string | null | undefined): 'owner' | 'user' {
  return OWNER_ROLES.has((role ?? '').trim().toLowerCase()) ? 'owner' : 'user';
}

function isConfiguredOwner(email: string | null | undefined): boolean {
  return Boolean(
    configuredOwnerEmail && email && email.trim().toLowerCase() === configuredOwnerEmail,
  );
}

function resolveMetadataRole(user: User): 'owner' | 'user' {
  // Firebase custom claims are accessed via getIdTokenResult; for fast
  // client-side checks we also inspect providerData and displayName as
  // possible role carriers (mirrors the original user/app metadata).
  const roleCandidates: string[] = [];

  const displayName = user.providerData[0]?.displayName;
  if (displayName) roleCandidates.push(displayName);

  return roleCandidates.some((role) => normalizeRole(role) === 'owner') ? 'owner' : 'user';
}

let userDocUnsubscribe: (() => void) | null = null;

function stopUserDocListener() {
  if (userDocUnsubscribe) {
    userDocUnsubscribe();
    userDocUnsubscribe = null;
  }
}

/**
 * Converts a Firebase auth User to the app-level AppUser type.
 */
function toAppUser(user: User, role: 'owner' | 'user'): AppUser {
  return {
    id: user.uid,
    email: user.email ?? '',
    fullName: user.displayName ?? '',
    username: user.email ? (user.email.split('@')[0] || user.uid) : (user.displayName || user.uid),
    avatarUrl: user.photoURL ?? null,
    role,
  };
}

async function resolveUserRole(user: User): Promise<'owner' | 'user'> {
  if (isConfiguredOwner(user.email)) return 'owner';

  const metadataRole = resolveMetadataRole(user);
  if (metadataRole === 'owner') return 'owner';

  // Check custom claims
  try {
    const tokenResult = await user.getIdTokenResult(true);
    const adminClaim = tokenResult.claims['admin'];
    const ownerClaim = tokenResult.claims['owner'];
    const roleClaim = tokenResult.claims['role'];
    if (adminClaim === true || ownerClaim === true) return 'owner';
    if (typeof roleClaim === 'string' && normalizeRole(roleClaim) === 'owner') return 'owner';
  } catch {
    // fall through
  }

  // Check Firestore profile
  try {
    const userSnapshot = await getDoc(doc(db, 'user', user.uid));
    if (userSnapshot.exists()) {
      const data = userSnapshot.data() as { role?: string | null };
      return normalizeRole(data.role ?? null);
    }

    const legacySnapshot = await getDoc(doc(db, 'profiles', user.uid));
    if (legacySnapshot.exists()) {
      const data = legacySnapshot.data() as { role?: string | null };
      return normalizeRole(data.role ?? null);
    }
  } catch {
    return metadataRole;
  }

  return metadataRole;
}

interface AuthStoreState {
  user: AppUser | null;
  firebaseUser: User | null;
  isAuthenticated: boolean;
  isOwner: boolean;
  isLoading: boolean;
  setFirebaseUser: (user: User | null) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthStoreState>()(
  devtools(
    (set) => ({
      user: null,
      firebaseUser: null,
      isAuthenticated: false,
      isOwner: false,
      isLoading: true,

      setFirebaseUser: async (firebaseUser) => {
        if (!firebaseUser) {
          stopUserDocListener();
          set(
            {
              firebaseUser: null,
              user: null,
              isAuthenticated: false,
              isOwner: false,
              isLoading: false,
            },
            false,
            'setFirebaseUser.empty',
          );
          return;
        }

        set({ isLoading: true }, false, 'setFirebaseUser.loading');

        const role = await resolveUserRole(firebaseUser);

        const user = toAppUser(firebaseUser, role);
        set(
          {
            firebaseUser,
            user,
            isAuthenticated: true,
            isOwner: role === 'owner',
            isLoading: false,
          },
          false,
          'setFirebaseUser.active',
        );

        stopUserDocListener();
        const userRef = doc(db, 'user', firebaseUser.uid);

        try {
          const userSnap = await getDoc(userRef);

          if (!userSnap.exists()) {
            // Create doc if it does not exist
            await setDoc(userRef, {
              email: firebaseUser.email ?? '',
              fullName: firebaseUser.displayName ?? '',
              username: firebaseUser.email ? (firebaseUser.email.split('@')[0] || firebaseUser.uid) : (firebaseUser.displayName || firebaseUser.uid),
              avatarUrl: firebaseUser.photoURL ?? null,
              role: role,
              provider: firebaseUser.providerData[0]?.providerId ?? 'password',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
          } else {
            // Update only safe-to-merge fields to prevent overwriting roles/emails or failing rules
            await setDoc(
              userRef,
              {
                fullName: firebaseUser.displayName ?? userSnap.data().fullName ?? '',
                avatarUrl: firebaseUser.photoURL ?? userSnap.data().avatarUrl ?? null,
                updatedAt: new Date().toISOString(),
              },
              { merge: true },
            );
          }
        } catch (error) {
          console.error('Error setting user doc', error);
        }

        userDocUnsubscribe = onSnapshot(
          userRef,
          (snapshot) => {
            if (!snapshot.exists()) return;

            const data = snapshot.data() as {
              fullName?: string;
              username?: string;
              avatarUrl?: string | null;
              role?: string | null;
            };

            const nextRole = normalizeRole(data.role ?? null);

            set(
              (state) => ({
                user: state.user
                  ? {
                    ...state.user,
                    fullName: data.fullName ?? state.user.fullName,
                    username: data.username ?? state.user.username,
                    avatarUrl: data.avatarUrl ?? state.user.avatarUrl,
                    role: nextRole,
                  }
                  : state.user,
                isOwner: nextRole === 'owner',
              }),
              false,
              'setFirebaseUser.realtimeProfile',
            );
          },
          () => {
            // Keep current state on transient listener failure.
          },
        );
      },

      signOut: async () => {
        stopUserDocListener();
        await firebaseSignOut(auth);
        set(
          {
            firebaseUser: null,
            user: null,
            isAuthenticated: false,
            isOwner: false,
          },
          false,
          'signOut',
        );
      },
    }),
    { name: 'AuthStore' },
  ),
);
