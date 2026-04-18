// src/services/authService.ts
// Data access layer for Firebase authentication operations.
// Pure async functions — throw on error, never return { data, error } tuples.
import {
  AuthError,
  GoogleAuthProvider,
  User,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updatePassword as firebaseUpdatePassword,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/services/firebase/client';
import { ServiceError, assertRequiredString, toServiceError } from '@/services/serviceError';

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Wraps a network-facing Firebase call and translates the opaque
 * "Failed to fetch" TypeError into an actionable message.
 */
async function withConnectionGuard<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (
      err instanceof TypeError &&
      typeof err.message === 'string' &&
      err.message.toLowerCase().includes('failed to fetch')
    ) {
      throw new Error(
        'A network error occurred while contacting Firebase. Please check your internet connection and try again.',
      );
    }
    throw err;
  }
}

function mapFirebaseAuthError(error: unknown, fallbackMessage: string): ServiceError {
  if (error instanceof ServiceError) return error;

  const authError = error as Partial<AuthError>;
  const code = authError?.code ?? '';

  switch (code) {
    case 'auth/email-already-in-use':
      return new ServiceError(
        'validation',
        'This email is already registered. Please sign in or use "Forgot password".',
        error,
      );
    case 'auth/invalid-email':
      return new ServiceError('validation', 'Please enter a valid email address.', error);
    case 'auth/weak-password':
      return new ServiceError(
        'validation',
        'Password is too weak. Use at least 6 characters.',
        error,
      );
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return new ServiceError('auth', 'Invalid email or password. Please try again.', error);
    case 'auth/popup-closed-by-user':
      return new ServiceError('auth', 'Google sign-in was cancelled before completion.', error);
    case 'auth/popup-blocked':
      return new ServiceError(
        'auth',
        'Popup was blocked. Please allow popups and try Google sign-in again.',
        error,
      );
    case 'auth/account-exists-with-different-credential':
      return new ServiceError(
        'auth',
        'An account already exists with this email using a different sign-in method.',
        error,
      );
    case 'auth/too-many-requests':
      return new ServiceError(
        'auth',
        'Too many attempts. Please wait a few minutes and try again.',
        error,
      );
    case 'auth/network-request-failed':
      return new ServiceError(
        'network',
        'Network error while contacting Firebase. Check your connection and retry.',
        error,
      );
    default:
      return toServiceError(error, fallbackMessage);
  }
}

const resolvedAppUrl = (() => {
  const configured = (import.meta.env.VITE_APP_URL as string | undefined)?.trim();
  if (typeof window !== 'undefined') {
    const runtimeOrigin = window.location.origin;
    if (import.meta.env.DEV) return runtimeOrigin;
    return configured ?? runtimeOrigin;
  }

  if (configured) return configured;

  return 'http://localhost:5173';
})();

const configuredOwnerEmail = (import.meta.env.VITE_OWNER_EMAIL as string | undefined)
  ?.trim()
  .toLowerCase();

const OWNER_ROLES = new Set(['owner', 'admin', 'super_admin', 'superadmin', 'root']);

function isOwnerRole(role: string | null | undefined): boolean {
  return OWNER_ROLES.has((role ?? '').trim().toLowerCase());
}

function isConfiguredOwner(email: string | null | undefined): boolean {
  return Boolean(
    configuredOwnerEmail && email && email.trim().toLowerCase() === configuredOwnerEmail,
  );
}

interface UserDocument {
  email: string;
  username: string;
  role: string;
  fullName: string;
  avatarUrl: string | null;
  provider: string;
  createdAt: string;
  updatedAt: string;
}

async function ensureUserDocument(user: User, fallbackRole = 'user'): Promise<void> {
  const normalizedRole = isConfiguredOwner(user.email) ? 'owner' : fallbackRole.toLowerCase();
  const now = new Date().toISOString();

  const userRef = doc(db, 'user', user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    const payload: UserDocument = {
      email: user.email ?? '',
      username: user.email ? user.email.split('@')[0] || user.uid : user.displayName || user.uid,
      role: normalizedRole,
      fullName: user.displayName ?? '',
      avatarUrl: user.photoURL ?? null,
      provider: user.providerData[0]?.providerId ?? 'password',
      createdAt: now,
      updatedAt: now,
    };
    await setDoc(userRef, payload);
  } else {
    // Only update safe fields. Leaving out role and email so they remain stable
    // and do not violate firestore rules.
    await setDoc(
      userRef,
      {
        fullName: user.displayName ?? userSnap.data().fullName ?? '',
        avatarUrl: user.photoURL ?? userSnap.data().avatarUrl ?? null,
        updatedAt: now,
      },
      { merge: true },
    );
  }
}

export async function fetchProfileRole(userId: string): Promise<string | null> {
  assertRequiredString(userId, 'userId');

  try {
    const userSnapshot = await getDoc(doc(db, 'user', userId));
    if (userSnapshot.exists()) {
      const data = userSnapshot.data() as { role?: string | null };
      return data.role ?? null;
    }

    const legacySnapshot = await getDoc(doc(db, 'profiles', userId));
    if (legacySnapshot.exists()) {
      const data = legacySnapshot.data() as { role?: string | null };
      return data.role ?? null;
    }

    return null;
  } catch (error) {
    throw toServiceError(error, 'Unable to resolve profile role. Please try again.');
  }
}

export interface EnsureOwnerSessionDeps {
  fetchProfileRole?: (userId: string) => Promise<string | null>;
  signOut?: () => Promise<unknown>;
}

export async function ensureOwnerSession(
  user: User | null,
  deps: EnsureOwnerSessionDeps = {},
): Promise<boolean> {
  if (!user) return false;

  const resolveProfileRole = deps.fetchProfileRole ?? fetchProfileRole;
  const performSignOut = deps.signOut ?? signOut;

  // Strict priority order: custom claims -> Firestore role -> configured owner email.
  try {
    const tokenResult = await user.getIdTokenResult(true);
    const adminClaim = tokenResult.claims['admin'];
    const ownerClaim = tokenResult.claims['owner'];
    const roleClaim = tokenResult.claims['role'];

    if (adminClaim === true || ownerClaim === true) return true;
    if (typeof roleClaim === 'string' && isOwnerRole(roleClaim)) return true;
  } catch {
    // fall through to profile-role check
  }

  try {
    const profileRole = await resolveProfileRole(user.uid);
    if (isOwnerRole(profileRole)) return true;
  } catch {
    // fall through to configured owner fallback
  }

  if (isConfiguredOwner(user.email)) return true;

  try {
    await performSignOut();
  } catch {
    // If sign-out fails, still reject the session.
  }

  return false;
}

/**
 * Signs in a user with email and password.
 * Throws on failure — caught by React Query at the UI layer.
 */
export async function signInWithEmail(email: string, password: string) {
  assertRequiredString(email, 'email');
  assertRequiredString(password, 'password');

  let credential;
  try {
    credential = await withConnectionGuard(() => signInWithEmailAndPassword(auth, email, password));
  } catch (error) {
    throw mapFirebaseAuthError(error, 'Login failed. Please try again.');
  }

  try {
    await ensureUserDocument(credential.user);
  } catch {
    // Non-blocking: owner check can still run even if profile sync fails temporarily.
  }

  return credential;
}

/**
 * Signs up a new user with email/password and provisions a safe default role.
 * Throws on failure.
 */
export async function signUpWithEmail(email: string, password: string) {
  assertRequiredString(email, 'email');
  assertRequiredString(password, 'password');

  let credential;
  try {
    credential = await withConnectionGuard(() =>
      createUserWithEmailAndPassword(auth, email, password),
    );
  } catch (error) {
    throw mapFirebaseAuthError(error, 'Registration failed. Please try again.');
  }

  // Always provision standard users from public registration.
  // Owner elevation is handled by configured owner email/custom claims.
  try {
    await ensureUserDocument(credential.user, 'user');
  } catch (error) {
    // User exists in Auth, but profile provisioning failed.
    throw toServiceError(
      error,
      'User account created but failed to assign role properly. Please contact support.',
    );
  }

  return credential;
}

/**
 * Signs in with Google OAuth.
 */
export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  let credential;
  try {
    credential = await withConnectionGuard(() => signInWithPopup(auth, provider));
  } catch (error) {
    throw mapFirebaseAuthError(error, 'Google sign-in failed. Please try again.');
  }

  try {
    await ensureUserDocument(credential.user);
  } catch {
    // Non-blocking fallback: auth flow still validates owner session.
  }

  return credential;
}

/**
 * Signs out the current user.
 */
export async function signOut() {
  await withConnectionGuard(() => firebaseSignOut(auth));
}

/**
 * Sends a password reset email.
 */
export async function resetPassword(email: string) {
  assertRequiredString(email, 'email');

  await withConnectionGuard(() =>
    sendPasswordResetEmail(auth, email, {
      url: `${resolvedAppUrl}/auth/reset-password`,
    }),
  );
}

/**
 * Updates the user's password (while authenticated).
 */
export async function updatePassword(newPassword: string) {
  assertRequiredString(newPassword, 'newPassword');

  if (!auth.currentUser) {
    throw new ServiceError('auth', 'No active user session. Please sign in again.');
  }

  await withConnectionGuard(() => firebaseUpdatePassword(auth.currentUser as User, newPassword));
}

/**
 * Retrieves the current Firebase user.
 */
export async function getSession() {
  return auth.currentUser;
}

export function subscribeToAuthChanges(handler: (user: User | null) => void): () => void {
  const unsubscribe = onAuthStateChanged(auth, handler);
  return () => unsubscribe();
}
