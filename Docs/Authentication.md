# Authentication Architecture

## Overview

MekeshBuilds implements a robust, zero-trust authentication architecture powered by **Firebase Authentication**. The system is designed around a strict "single-owner" authorization model, ensuring that while the portfolio remains highly accessible to the public, the administrative dashboard and live builder are secured behind enterprise-grade access controls.

Identity sources for owner validation follow a strict hierarchy:

1. **Firebase Custom Claims**: Validating `admin` or `owner` roles directly on the auth token.
2. **Firestore Document Lookup**: Checking the `role` field within the user's secure `profiles` document.
3. **Environment Variable Fallback**: Comparing the authenticated email against `VITE_OWNER_EMAIL`.

If a user successfully authenticates but fails the authorization (owner) check, their session is immediately and explicitly terminated to prevent unauthorized access.

## Login Flows

### Email & Password Authentication

**Entry point:** - The secure `AdminAccessPage` form submission triggers `signInWithEmailAndPassword(auth, email, password)`.

**Service Behavior:**

```ts
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebaseClient';

const userCredential = await signInWithEmailAndPassword(auth, email, password);
const user = userCredential.user;

const isOwner = await ensureOwnerSession(user);
if (!isOwner) {
  await auth.signOut();
  throw new Error('Unauthorized: Owner access only.');
}
```

### Google OAuth Login

**Entry point:** - `signInWithGoogle()` exposed via the frontend auth service.

**OAuth Configuration Snippet:**

```ts
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../lib/firebaseClient';

const provider = new GoogleAuthProvider();
// Triggers modern popup flow, falling back to redirect on mobile PWAs
const userCredential = await signInWithPopup(auth, provider);
```

**Callback Handling:** - The `AuthCallbackPage` seamlessly intercepts the provider's response, validates the session and owner status, and redirects the user to the `/dashboard`.

### Credential Management

Implemented within the auth service layer:

- `sendPasswordResetEmail(auth, email)`
- `updatePassword(user, newPassword)`

## Session Lifecycle

**Initialization & Hydration:** - The custom `useAuth()` hook initializes the session state upon the React app's mount, preventing UI layout shift during auth resolution.

**Real-time Auth Subscriptions:** - Firebase's observer pattern guarantees state consistency across tabs and offline PWA usage.

```ts
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const isOwner = await checkOwnerStatus(user);
    setSession({ user, isOwner, isAuthenticated: true });
  } else {
    clearSession();
  }
});
```

**Zustand Store Outputs:**

- `user` (Firebase User object)
- `isAuthenticated` (boolean)
- `isOwner` (boolean)
- `isLoading` (boolean)

## Route Protection Strategy

Admin routes are secured using a declarative, two-step guard chain to ensure UI components never render without proper clearance:

```tsx
<AuthGuard>
  <AdminGuard>
    <AdminLayout />
  </AdminGuard>
</AuthGuard>
```

**Guard Behaviors:**

- `AuthGuard`: Intercepts unauthenticated traffic and redirects to `/admin-access?redirectBack=[current_path]`.
- `AdminGuard`: Intercepts authenticated _non-owner_ traffic and redirects immediately to the public root (`/`).

## Brute Force Mitigation

While Firebase Authentication natively limits repeated login attempts from malicious IPs, the `AdminAccessPage` implements an additional client-side lockout mechanism to deter manual brute-force attacks and reduce unnecessary API calls.

**Ruleset:**

- Max attempts: 5
- Lockout duration: 15 minutes
- State: Persisted securely in `localStorage` via the `__access_lockout` key.

## Client Security and Resilience

The `firebaseClient.ts` validates the environment configuration at startup, ensuring the app fails safely and informatively if deployed with missing credentials.

**Environment Requirements:**

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

**Network Failure Handling:** - The auth service wrapper translates generic Firebase SDK errors (e.g., `auth/network-request-failed`) into actionable, user-friendly UI toasts, crucial for maintaining experience quality in offline PWA scenarios.

## Recommended Operational Security

1. **Firestore Security Rules**: Ensure rules strictly enforce owner-only read/write access to sensitive collections (e.g., `allow write: if request.auth != null && request.auth.token.email == "owner@example.com";`).
2. **Authorized Domains**: Whitelist only production and specific staging domains in the Firebase Console under Authentication > Settings to prevent API key hijacking.
3. **Strong Owner Credentials**: Maintain a unique, highly complex password combined with Google's native 2FA for the owner account.
4. **Environment Integrity**: Keep `VITE_OWNER_EMAIL` aligned precisely with the intended owner identity.

## QA & Verification Checklist

- [ ] The owner can successfully authenticate via `/admin-access`.
- [ ] Authenticated non-owner accounts are caught by the service layer and automatically signed out.
- [ ] Google OAuth popup successfully resolves and lands on `/dashboard` (for the owner).
- [ ] The `redirectBack` URL parameter correctly routes the user post-login.
- [ ] Session state perfectly survives a hard refresh and correctly clears upon sign-out.


