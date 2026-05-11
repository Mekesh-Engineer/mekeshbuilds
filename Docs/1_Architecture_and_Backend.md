# --- Backend-Firebase.md ---

# Firebase Backend Documentation

## Purpose

This document defines how Firebase services are used in MekeshBuilds, how they connect to the frontend service layer, and how to operate them safely in development and production.

The goal is to provide a single implementation reference for:

1. Service selection and responsibility
2. Connection architecture and data flow
3. Security and reliability controls
4. Deployment and monitoring practices

---

## 1. Architecture Summary

MekeshBuilds uses a serverless backend centered on Firebase. The application is organized into the following layers:

1. UI layer: pages and components
2. Orchestration layer: hooks and store
3. Service layer: typed async modules
4. Firebase layer: Auth, Firestore, Functions, and supporting services

### Target connection flow

```text
UI Components / Pages
  -> Hooks + Store
	 -> Service Modules
		-> firebaseClient singleton
		  -> Firebase Services (Auth, Firestore, Functions, etc.)
```

Design rule:

1. UI does not import Firebase SDK directly.
2. Service modules own SDK calls.
3. Types and validation are enforced at service boundaries.

---

## 2. Core Services (Use Now)

## 2.1 Authentication

### Why

Authentication protects all admin routes and supports owner-only content management.

### Required features

1. Email and password login
2. Google sign-in
3. Owner authorization hierarchy:
   - Custom claims
   - Profile role lookup
   - Owner email fallback

### Connection behavior

1. App boots and subscribes to auth state changes.
2. On session detection, owner check is executed.
3. Unauthorized authenticated users are signed out.
4. Route guards consume isAuthenticated and isOwner from store state.

### Data fields used

1. request.auth.uid
2. request.auth.token.admin or request.auth.token.owner
3. profile.role
4. VITE_OWNER_EMAIL

---

## 2.2 Cloud Firestore

### Why

Firestore stores all portfolio and admin data with offline support and fast document reads.

### Core collections

1. profiles
2. experience
3. skills
4. projects
5. certificates
6. blog_posts
7. gallery_items
8. testimonials
9. analytics_events
10. ai_preferences
11. error_logs

### Query model

1. Flat collections at root level
2. ownerId field for ownership scoping
3. username for public lookup
4. Composite indexes for ordered and filtered list retrieval

### Connection pattern

1. Build collection or doc references in service module.
2. Execute reads and writes in async functions.
3. Normalize errors before throwing to UI.
4. Use strict field naming consistency.

---

## 2.3 Hosting

### Why

Hosting delivers the PWA with edge caching and supports SPA rewrite behavior.

### Requirements

1. Dist folder deployment
2. Unknown route rewrite to index.html
3. Immutable static asset caching for chunked bundles

---

## 2.4 App Check

### Why

App Check reduces abuse against Firestore, Functions, and other endpoints.

### Integration notes

1. Enable App Check provider for web app.
2. Start in monitoring mode, then enforce.
3. Roll out after initial QA to avoid blocking legitimate traffic.

---

## 2.5 Analytics Dashboard

### Why

Analytics tracks user behavior and validates product decisions.

### Recommended events

1. page_view_landing
2. page_view_profile
3. click_project
4. resume_download
5. cta_contact_click
6. admin_login_success
7. builder_save_success
8. builder_save_error

Event properties should include:

1. username
2. route
3. source
4. recruiterIntent if available

---

## 2.6 Performance Monitoring

### Why

Performance Monitoring highlights slow routes and backend operations.

### Metrics focus

1. Landing route load time
2. Public profile hydration time
3. Admin dashboard first interactive
4. Firestore query latency for key collections

---

## 2.7 Genkit and AI Logic

### Why

AI personalization requires controlled prompt pipelines and secure execution.

### Recommended use

1. Recruiter intent classification
2. Dynamic section priority suggestions
3. AI summary generation for profile and resume variants

4. UI requests AI action through service function.
5. Service calls Cloud Function endpoint via `aiService.ts` **[PLANNED — not yet implemented]**.
6. Function executes Genkit flow.
7. Sanitized output returns to UI.

Security note:

1. Never expose model keys in client code.
2. Keep AI logic in Functions only.

---

## 3. Growth Services (Use Next)

## 3.1 Remote Config

Use for feature flags and runtime behavior toggles.

Good toggles:

1. Enable AI personalization
2. Toggle heavy motion effects
3. Switch section ordering strategy

## 3.2 A/B Testing

Use to compare conversion variants:

1. Hero copy
2. CTA button text
3. Bento order presets
4. Theme palettes

## 3.3 Audiences

Use to segment traffic:

1. First-time visitors
2. Returning visitors
3. High-intent recruiter traffic

## 3.4 Cloud Messaging

Use for admin and engagement notifications:

1. Resume download spikes
2. Publish reminders
3. Portfolio contact events

---

## 4. Optional and Conditional Services

## 4.1 Realtime Database

Use only if you need ultra-low latency live presence or collaborative editing signals.

## 4.2 Data Connect

Use if relational querying and SQL patterns become necessary. Keep Firestore as default while document access patterns remain dominant.

## 4.3 App Distribution and Test Lab

Use when mobile native apps are introduced. Not required for web-only PWA.

## 4.4 Crashlytics

Primary value is native mobile apps. For web-only app, prioritize web error telemetry first, then Crashlytics if mobile wrappers are added.

## 4.5 Dynamic Links

Use only for legacy deep-link requirements. Prefer standard web routes and campaign parameters in current architecture.

---

## 5. Connection Features and Implementation Standards

## 5.1 Singleton Initialization

Firebase app, auth, and db are created once and exported from a single module.

Connection guarantees:

1. No duplicate SDK initialization
2. Predictable environment validation
3. Centralized persistence setup

## 5.2 Fail-Fast Environment Validation

Required environment keys:

1. VITE_FIREBASE_API_KEY
2. VITE_FIREBASE_AUTH_DOMAIN
3. VITE_FIREBASE_PROJECT_ID
4. VITE_FIREBASE_STORAGE_BUCKET
5. VITE_FIREBASE_MESSAGING_SENDER_ID
6. VITE_FIREBASE_APP_ID
7. VITE_APP_URL
8. VITE_OWNER_EMAIL

If any core key is missing, the app should throw a clear startup error in development.

## 5.3 Offline-First Behavior

Enable Firestore local cache persistence at startup using `initializeFirestore` with `persistentLocalCache`.

Expected behavior:

1. Cached reads available after first online load
2. Multi-tab behavior handled by `persistentMultipleTabManager`
3. Graceful operation when persistence is unsupported

## 5.4 Typed Services and Converters

Use typed models and Firestore converters where practical.

Rules:

1. Service methods return typed domain objects.
2. Service methods normalize and throw user-safe errors.
3. Field names are consistent between Firestore docs and TypeScript types.

## 5.5 Guard and Store Integration

Auth-related service calls feed store state.

Minimum state contract:

1. user
2. isAuthenticated
3. isOwner
4. isLoading

Route guards should depend only on store state, not direct SDK calls.

---

## 6. Security Architecture

## 6.1 Firestore Security Rules Principles

1. Public read for intended public documents only
2. Owner-only write for profile and content collections
3. Admin-only access for analytics and sensitive collections
4. Schema checks for critical fields and data types

## 6.2 Owner Validation Model

Enforce owner through layered checks:

1. Custom claims
2. profile.role
3. configured owner email fallback

Non-owner authenticated users must be signed out before admin views render.

## 6.3 App Check Enforcement

1. Start in monitor mode
2. Validate traffic behavior
3. Enforce across Firestore and Functions

---

## 7. Indexing and Query Performance

Minimum composite index set:

1. skills: ownerId ascending, sortOrder ascending
2. projects: ownerId ascending, status ascending, sortOrder ascending
3. analytics_events: ownerId ascending, timestamp descending

Performance guidelines:

1. Keep queries predictable and index-backed
2. Avoid broad unbounded scans
3. Denormalize arrays where read efficiency matters

---

## 8. Cloud Functions and AI Endpoints

Use Functions for:

1. AI workflows via Genkit
2. Sanitized prompt handling
3. Sensitive business logic
4. Controlled writes for privileged operations

Function design standards:

1. Validate input shape
2. Enforce auth and ownership
3. Log errors with correlation metadata
4. Return stable response schema

---

## 9. DevOps and Release Integration

## 9.1 CI Pipeline Expectations

1. Lint
2. Test
3. Build
4. Deploy rules and indexes
5. Deploy hosting and functions

## 9.2 Environment Strategy

1. Local development env file
2. Staging project with safe test data
3. Production project with locked secrets and domain allowlist

## 9.3 Authorized Domains

Maintain strict authorized domain list for Authentication provider settings.

---

## 10. Migration Plan — ✅ COMPLETED

> The Firebase migration from Supabase has been fully completed across all service modules. The phases below are preserved for historical reference.

Phase 1 — ✅ Done: Added Firebase client and service modules in parallel, preserved store and UI contracts.

Phase 2 — ✅ Done: Switched auth module, profile and admin services. Test suite kept green after each switch.

Phase 3 — ✅ Done: Removed Supabase dependency. App Check enforcement and security rules finalized. Production smoke checks passed.

---

## 11. Verification Checklist

## Functional checks

1. Owner login works with email and Google
2. Non-owner sessions are denied and signed out
3. Public profile data loads by username
4. Admin updates persist and reflect in public views

## Security checks

1. Unauthorized writes fail at rules layer
2. Owner writes succeed
3. Sensitive collections are not publicly writable

## Reliability checks

1. Offline reads work after first load
2. Query performance is stable on indexed collections
3. Release deploy succeeds without manual fixes

---

## 12. Recommended Rollout for MekeshBuilds

1. Foundation
   - Authentication, Firestore, Hosting, App Check, Analytics, Performance Monitoring
2. Personalization and AI
   - Genkit, AI Logic, Remote Config
3. Optimization
   - Audiences, A/B Testing, Cloud Messaging
4. Optional expansion
   - Realtime Database, Data Connect, mobile-focused services

This order maximizes delivery speed while keeping the architecture secure and scalable.


# --- Database.md ---

# Database Architecture

## Overview

MekeshBuilds leverages **Firebase Cloud Firestore**, a highly scalable, serverless NoSQL document database. This architecture is specifically chosen for its real-time synchronization capabilities, seamless integration with offline PWA service workers, and rapid document retrieval at the edge.

To maintain strict enterprise-grade data integrity across the React frontend, all Firestore interactions are wrapped in **TypeScript Data Converters** (`withConverter`), ensuring end-to-end type safety without the overhead of a traditional ORM.

**Primary Approach:**

- Document-based CRUD operations via the modular Firebase JS SDK (v9/v10+).
- Secure, client-side data access governed by strict **Firestore Security Rules**.
- Built-in offline persistence cache, enabling the portfolio to load instantly even on flaky network connections.

## Core Collections

### Identity and Profile Management

- `profiles`
  - Core owner identity, presentation data, and bio.
  - Theme configurations (Bento grid layouts, organic styling tokens).
  - Authorization metadata (`role` field for owner gating).

### Portfolio Assets

- `experience` (Document per role)
- `skills` (Document per skill, heavily utilized by the AI recommendation engine)
- `projects` (Includes media links, 3D asset references, and repository URLs)
- `certificates`

### Content & Publishing

- `blog_posts` (Markdown/Rich text content for deep-dive technical writing)
- `gallery_items`
- `testimonials`

### Analytics & AI Telemetry

- `analytics_events` (Consolidates page views, project clicks, and interaction times)
- `ai_preferences` (Stores generated contextual resumes or tailored pitch variations based on specific recruiter links)
- `error_logs` (Client-side error reporting for PWA resilience)

## Data Modeling Strategy

Unlike relational SQL databases, this NoSQL architecture relies on flat root collections to optimize query performance and indexing.

Logical ownership is maintained via standardized referencing fields across all documents:

- `ownerId` (Maps directly to the Firebase Auth UID)
- `username` (For fast, indexed public lookups)

_Note: For highly nested, read-heavy data (like a single project's tags), denormalized arrays are preferred over subcollections to minimize document read counts and latency._

## Common Query Patterns

All queries utilize Firestore's modular syntax combined with custom TypeScript converters defined in `src/types/database.types.ts`.

### 1. Fetch Published Profile by Username

```ts
import { collection, query, where, limit, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebaseClient';
import { profileConverter } from '../types/database.types';

const q = query(
  collection(db, 'profiles').withConverter(profileConverter),
  where('username', '==', username),
  where('isPublished', '==', true),
  limit(1),
);
const snapshot = await getDocs(q);
const profile = snapshot.empty ? null : snapshot.docs[0].data();
```

````

### 2. Fetch Ordered Portfolio Assets (e.g., Skills)

```ts
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';

const q = query(
  collection(db, 'skills').withConverter(skillConverter),
  where('ownerId', '==', ownerId),
  orderBy('sortOrder', 'asc'),
);
const snapshot = await getDocs(q);
const skills = snapshot.docs.map((doc) => doc.data());
```

### 3. Date-Ranged Analytics via Composite Indexes

```ts
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';

const q = query(
  collection(db, 'analytics_events'),
  where('ownerId', '==', ownerId),
  where('timestamp', '>=', startDate),
  where('timestamp', '<=', endDate),
  orderBy('timestamp', 'desc'),
);
// Note: This requires a composite index to be created in the Firebase Console.
```

## Security & Data Integrity

Data integrity and authorization are enforced at the database layer using **Firestore Security Rules**, mitigating the need for a separate backend server.

**Core Rule Principles:**

1. **Public Reads, Owner Writes:** Public portfolio collections (`profiles`, `projects`) allow read access to anyone, but strict write access only if `request.auth.uid == resource.data.ownerId`.
2. **Admin-Only Collections:** Collections like `analytics_events` and `admin_access_logs` are locked behind custom claims or owner ID validation.
3. **Data Validation:** Rules enforce schema integrity (e.g., ensuring `isPublished` is a boolean, and `sortOrder` is an integer).

## Offline Caching & PWA Integration

To deliver the blistering performance expected of a 2025–2026 web app, Firestore's offline persistence is enabled upon initialization:

```ts
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore';

// Modern Firebase v10+ offline persistence — replaces enableIndexedDbPersistence
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});
```

This guarantees that once a recruiter views the portfolio, the data (and associated images/3D models via service workers) remains instantly accessible upon subsequent visits, regardless of network status.

## Suggested Composite Indexes

To support the UI's sorting and filtering requirements, the following composite indexes must be deployed via `firestore.indexes.json`:

- `skills`: `ownerId` (ASC), `sortOrder` (ASC)
- `projects`: `ownerId` (ASC), `status` (ASC), `sortOrder` (ASC)
- `analytics_events`: `ownerId` (ASC), `timestamp` (DESC)




# --- DatabaseConnection.md ---

# Database & Services Connection

## Connection Strategy

All backend services (Authentication, Firestore Database, and Cloud Functions) are initialized and exported through a single, strictly typed singleton instance located in `src/lib/firebaseClient.ts`.

By centralizing the Firebase SDK configuration, the application adheres to the following design principles:

- **Singleton Instantiation:** Guarantees a single Firebase App instance, preventing memory leaks and duplicate connections.
- **Fail-Fast Validation:** Validates required environment variables at runtime, throwing explicit developer warnings if misconfigured.
- **Offline-First Resilience:** Automatically enables Firestore IndexedDB persistence to support the core PWA offline capabilities.
- **Modular Bundling:** Utilizes the Firebase v9/v10+ modular SDK to aggressively tree-shake unused code, keeping the initial JavaScript bundle exceptionally lightweight.

## Required Environment Variables

The application relies on standard Firebase configuration keys. From `.env.example`:

```env
# Firebase Core Configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Application specific
VITE_APP_URL=http://localhost:5173
VITE_OWNER_EMAIL=your-email@example.com
```

## Client Initialization & Offline Persistence

The connection orchestrates the core services and attempts to enable offline caching immediately.

```ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Singleton initialization
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Offline-first Firestore — persistentLocalCache replaces the removed
// enableIndexedDbPersistence API (Firebase JS SDK v10+)
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(), // Multi-tab support built-in
  }),
});

// Enforce local session persistence
setPersistence(auth, browserLocalPersistence);
```

## Service Layer Usage Pattern

To maintain a clean architectural boundary (Separation of Concerns), UI components must **never** interact with the `db` instance directly. All Firebase operations are abstracted into domain-specific service files.

**Example: `src/services/profileService.ts`**

```ts
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebaseClient';
import { profileConverter } from '../types/database.types';

export async function fetchProfileById(userId: string) {
  const profileRef = doc(db, 'profiles', userId).withConverter(profileConverter);
  const snapshot = await getDoc(profileRef);

  if (!snapshot.exists()) {
    throw new Error('Profile document not found.');
  }

  return snapshot.data();
}
```

## Development Setup Steps

1. Duplicate `.env.example` and rename to `.env.local`.
2. Retrieve your Firebase config object from the Firebase Console (Project Settings > General).
3. Populate the `VITE_FIREBASE_*` variables.
4. Set `VITE_OWNER_EMAIL` to properly gate your admin workspace.
5. Run `npm run dev` and monitor the console for successful connection and persistence initialization.

## Troubleshooting

### Missing Environment Variables

**Symptom:** Firebase throws a `FirebaseError: Bad config object` or missing API key error on startup.
**Fix:** Ensure your variables are explicitly prefixed with `VITE_` and that you restarted the Vite development server after editing the `.env` file.

### Offline Persistence Fails

**Symptom:** Console warns of a `failed-precondition`.
**Fix:** IndexedDB persistence can only operate in a single browser tab at a time in development. Close other tabs running the local server, or ignore the warning (it functions normally in production PWA contexts).

### Unauthorized / Permission Denied

**Symptom:** Reads or writes to Firestore throw a `missing or insufficient permissions` error.
**Fix:** - Verify your Firebase Authentication state.

- Check the **Firestore Security Rules** in the Firebase Console to ensure your current user UID or custom claims map correctly to the attempted read/write operation.




# --- SecurityRules.md ---

# Firestore Security Rules

## Overview

MekeshBuilds enforces all data authorization at the **Firestore Security Rules layer** — eliminating the need for a separate backend security server. Rules operate on the principle of **least privilege**: everything is denied by default, and access is explicitly granted per collection.

The rules are deployed to Firebase via:

```bash
npm run deploy:rules
# which runs: firebase deploy --only firestore:rules,database:rules
```

---

## Rule Principles

| Principle | Description |
|-----------|-------------|
| **Public Read, Owner Write** | Public portfolio collections allow anyone to read published content, but only the authenticated owner can write. |
| **Admin-Only Collections** | Analytics, error logs, and AI preferences are locked behind ownership or custom claims. |
| **Schema Validation** | Critical fields are type-checked at the rule level to prevent malformed data being written. |
| **Zero Trust Default** | All access is denied unless an explicit `allow` statement grants it. |

---

## Owner Identity Check

The owner is validated via a layered hierarchy. In security rules, the simplest approach is comparing the authenticated UID against the document's `ownerId` field:

```
function isOwner(resource) {
  return request.auth != null
    && request.auth.uid == resource.data.ownerId;
}

function isAuthenticated() {
  return request.auth != null;
}

function hasAdminClaim() {
  return request.auth != null
    && (request.auth.token.admin == true || request.auth.token.owner == true);
}
```

---

## Collection-Level Rules

### `profiles` — Public Read, Owner Write

```
match /profiles/{userId} {
  // Anyone can read published profiles (for public /:username route)
  allow read: if resource.data.isPublished == true;

  // Owner can read their own unpublished profile
  allow read: if isAuthenticated() && request.auth.uid == userId;

  // Only owner can create/update their own profile
  allow create, update: if isAuthenticated()
    && request.auth.uid == userId
    && request.resource.data.ownerId == userId;

  // Owner can delete their profile
  allow delete: if isAuthenticated() && request.auth.uid == userId;
}
```

---

### `experience`, `skills`, `projects`, `certificates` — Public Read, Owner Write

These portfolio asset collections share the same pattern:

```
match /skills/{skillId} {
  // Public read for published entries
  allow read: if resource.data.isPublished == true;

  // Owner can read all their entries (including unpublished)
  allow read: if isAuthenticated()
    && request.auth.uid == resource.data.ownerId;

  // Owner-only writes, with ownerId validation
  allow create: if isAuthenticated()
    && request.resource.data.ownerId == request.auth.uid;

  allow update, delete: if isOwner(resource);
}
```

Apply the same structure to `experience`, `projects`, and `certificates`.

---

### `blog_posts`, `gallery_items`, `testimonials` — Public Read, Owner Write

```
match /blog_posts/{postId} {
  allow read: if resource.data.isPublished == true;
  allow read: if isAuthenticated() && resource.data.ownerId == request.auth.uid;
  allow write: if isOwner(resource);
}
```

---

### `analytics_events` — Owner Write, Owner/Admin Read

```
match /analytics_events/{eventId} {
  // Only the owner or admin can read analytics
  allow read: if isAuthenticated()
    && (request.auth.uid == resource.data.ownerId || hasAdminClaim());

  // Anyone can write an analytics event (page views, clicks)
  // but the ownerId must be pre-set to the site owner's UID to prevent spoofing
  allow create: if request.resource.data.ownerId is string
    && request.resource.data.timestamp is timestamp;

  // No updates or deletes from the client
  allow update, delete: if false;
}
```

---

### `ai_preferences` — Owner Only

```
match /ai_preferences/{prefId} {
  allow read, write: if isAuthenticated()
    && request.auth.uid == resource.data.ownerId;
}
```

---

### `error_logs` — Write-only from Client, Admin Read

```
match /error_logs/{logId} {
  // Client can write error logs (for PWA resilience reporting)
  allow create: if request.resource.data.timestamp is timestamp;

  // Only admin/owner can read logs
  allow read: if hasAdminClaim();

  // No client-side updates or deletes
  allow update, delete: if false;
}
```

---

## Schema Validation Examples

Validate critical field types directly in rules to prevent invalid data:

```
// Example: Validating a skill document on create
allow create: if isAuthenticated()
  && request.resource.data.ownerId == request.auth.uid
  && request.resource.data.name is string
  && request.resource.data.sortOrder is int
  && request.resource.data.isPublished is bool;
```

---

## Deployment Checklist

- [ ] Rules are deployed before any data is written to production Firestore.
- [ ] Tested with the **Firebase Emulator Suite** for each collection pattern.
- [ ] Unauthorized write attempts to sensitive collections return `permission-denied`.
- [ ] Public reads on published documents succeed without authentication.
- [ ] Owner reads on unpublished documents succeed with correct UID.
- [ ] Non-owner authenticated users cannot write to any collection.

---

## Security Operational Notes

1. **Enable App Check** after initial QA to prevent API abuse. Start in monitoring mode first.
2. **Authorized Domains**: Keep the Firebase Console authorized domain list strictly limited to production and staging URLs.
3. **Rotate Secrets**: If `VITE_FIREBASE_*` env variables are accidentally exposed, immediately rotate the API key in the Firebase Console and update all hosting environments.


# --- Authentication.md ---

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




# --- StateManagement.md ---

# State Management Architecture

## Overview

MekeshBuilds uses a two-tier state management strategy:

1. **Zustand** — Global, synchronous client state (auth session, builder drafts).
2. **TanStack React Query** — Async server state (Firestore data fetching, mutations, and caching).

These two layers are kept strictly separate. Zustand manages **who you are** and **what you're editing**. React Query manages **what data comes from the server**.

---

## Zustand Stores

Stores are located in `src/store/`. Each store follows the pattern: state slice → actions → optional devtools/immer middleware.

### `authStore.ts`

Manages Firebase authentication session state.

**State Shape:**

```ts
interface AuthState {
  user: FirebaseUser | null;
  isAuthenticated: boolean;
  isOwner: boolean;
  isLoading: boolean;
}
```

**Key Actions:**

| Action | Description |
|--------|-------------|
| `setSession(user, isOwner)` | Sets user, flips `isAuthenticated` and `isOwner` |
| `clearSession()` | Resets all fields to null/false on sign-out |
| `setLoading(bool)` | Controls loading state during auth initialization |

**Usage Rule:** Route guards (`AuthGuard`, `AdminGuard`) must **only** consume store selectors — never call Firebase SDK directly.

```ts
// Correct usage in a guard component
const { isAuthenticated, isLoading } = useAuthStore(
  (s) => ({ isAuthenticated: s.isAuthenticated, isLoading: s.isLoading })
);
```

---

### `builderStore.ts`

Manages the live builder workspace — local draft state for the WYSIWYG editor.

**State Shape (abridged):**

```ts
interface BuilderState {
  profile: ProfileDraft | null;
  isDirty: boolean;
  saveStatus: 'idle' | 'saving' | 'saved' | 'unsaved';
  lastSavedAt: Date | null;
}
```

**Key Actions:**

| Action | Description |
|--------|-------------|
| `setProfile(draft)` | Sets the working draft |
| `patchProfile(partial)` | Applies a partial update and sets `isDirty = true` |
| `setSaveStatus(status)` | Updates the autosave status indicator |
| `setLastSavedAt(date)` | Records the last successful Firestore write |
| `resetDraft()` | Clears draft state on builder unmount |

**Autosave Integration:**

The `useAutoSave` hook subscribes to `isDirty` changes, debounces them, and fires a React Query mutation when the debounce window closes:

```ts
// src/hooks/useAutoSave.ts
const { isDirty, profile, setSaveStatus } = useBuilderStore();

useEffect(() => {
  if (!isDirty || !profile) return;
  const timer = setTimeout(() => {
    setSaveStatus('saving');
    mutateAsync(profile)
      .then(() => setSaveStatus('saved'))
      .catch(() => setSaveStatus('unsaved'));
  }, 800); // 800ms debounce
  return () => clearTimeout(timer);
}, [isDirty, profile]);
```

---

### `uiStore.ts` — [PLANNED]

Will manage cross-cutting UI state that doesn't belong to auth or builder:

```ts
// Planned shape
interface UiState {
  pwaInstallPrompt: BeforeInstallPromptEvent | null;
  isOffline: boolean;
  cameraAngle: '3d-default' | '3d-top' | '3d-side';
  activeToasts: Toast[];
}
```

---

## TanStack React Query

React Query handles all async data lifecycle — fetching, caching, background refresh, and mutations.

**Client configuration (`App.tsx`):**

```ts
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // Data fresh for 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
```

### Key Queries

| Query Key | Source | Hook |
|-----------|--------|------|
| `['portfolio', username]` | Firestore `profiles` | `usePortfolioData(username)` |
| `['analytics', ownerId, range]` | Firestore `analytics_events` | `useAnalyticsData()` |

### Key Mutations

| Mutation | Service Function | Trigger |
|----------|-----------------|---------|
| `updateProfile` | `profileService.updateProfile()` | `useAutoSave` debounce |
| `uploadResume` | Firebase Storage upload | `ResumeManagerPage` form submit |

### Optimistic Updates Pattern

The builder uses optimistic updates so the UI feels instant even before Firestore confirms the write:

```ts
const mutation = useMutation({
  mutationFn: (draft: ProfileDraft) =>
    profileService.updateProfile(draft.id, draft),
  onMutate: () => store.setSaveStatus('saving'),
  onSuccess: () => {
    store.setSaveStatus('saved');
    store.setLastSavedAt(new Date());
    // Invalidate cached query to re-fetch fresh data
    queryClient.invalidateQueries({ queryKey: ['portfolio'] });
  },
  onError: () => store.setSaveStatus('unsaved'),
});
```

---

## State Flow Diagram

```text
UI Event (user types in builder)
  │
  ▼
builderStore.patchProfile() → isDirty = true
  │
  ▼ (800ms debounce)
useAutoSave hook → React Query mutation
  │
  ├─► onMutate  → setSaveStatus('saving')
  ├─► onSuccess → setSaveStatus('saved') + invalidateQueries
  └─► onError   → setSaveStatus('unsaved')
```

---

## Architecture Rules

1. **Zustand for synchronous UI state.** Never use Zustand to cache server data — that is React Query's job.
2. **React Query for all Firebase reads/writes.** Service functions return Promises; React Query manages the lifecycle.
3. **No direct Firebase SDK calls in components.** All data access flows through hooks → services → Firebase.
4. **Selector stability:** Always use shallow selectors in Zustand to avoid unnecessary re-renders:
   ```ts
   // ✅ Correct — only re-renders when isOwner changes
   const isOwner = useAuthStore((s) => s.isOwner);

   // ❌ Incorrect — creates a new object every render
   const { isOwner } = useAuthStore();
   ```

---

## Devtools

In development, both tools expose debugging capabilities:

- **Zustand Devtools**: Enabled via `devtools()` middleware wrapper. Open Redux DevTools extension in the browser to inspect store state and action history.
- **React Query Devtools**: Install `@tanstack/react-query-devtools` and add `<ReactQueryDevtools />` inside `QueryClientProvider` for development builds only.