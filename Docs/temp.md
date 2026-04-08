# About

## Project Overview

MekeshBuilds is a next-generation, performance-driven personal portfolio platform built as a Progressive Web App (PWA). Utilizing a React + TypeScript frontend and a serverless Firebase backend, it represents the bleeding edge of 2025â€“2026 web design trends.

The platform merges interactive storytelling with deep technical precision, featuring:

- A dynamic, AI-personalized public portfolio experience (`/:username`).
- Immersive 3D/AR elements and organic, hand-drawn UI aesthetics.
- A minimalist, highly responsive Bento Grid architecture.
- An exclusive, authenticated admin workspace (`/dashboard`, `/builder`, `/analytics`) with real-time editing and autosave.

This application is designed not just to display a resume, but to demonstrate architectural mastery, exceptional UX design, and forward-thinking engineering to recruiters and engineering managers.

## Purpose

MekeshBuilds solves the practical challenge of fragmented professional identities by providing a single, intelligent source of truth for portfolio content, technical showcases, and resume generation.

Core outcomes:

- **Edit Once, Reflect Everywhere**: Seamlessly sync data across the public profile, PDF resume exports, and admin modules.
- **Recruiter-First Experience**: Deliver blazing-fast load times (PWA offline caching) and AI-curated content highlighting relevant skills based on visitor intent.
- **Serverless Scale**: Maintain robust, strictly typed data in Firebase Firestore, queried effortlessly via modern frontend hooks.
- **Secure Control**: Ensure strict owner-only access for content management while keeping the public face highly discoverable and SEO-optimized.

## Primary Goals

1. **Maximized Engagement**: Capture recruiter attention through functional motion design, micro-interactions, and 3D data visualization.
2. **Blistering Performance**: Achieve near-instant First Contentful Paint (FCP) and reliable offline access via service workers.
3. **Type-Safe Architecture**: Enforce strict end-to-end type safety from UI components to Firestore database converters.
4. **Intelligent Adaptability**: Leverage AI (via Firebase Cloud Functions) to dynamically tailor layouts and summaries.
5. **Modular Separation of Concerns**: Maintain a clean, scalable codebase (pages, hooks, services, global stores, and types).

## High-Level Architecture

```text
React Pages/Components (Bento Grid UI, 3D Canvas)
  -> Hooks (Stateful orchestration & AI context)
  -> Services (Firebase queries/mutations via Data Converters)
  -> Firebase App Client (Singleton instance)
  -> Cloud Firestore (NoSQL Document Database)
```

## Runtime Stack

- **Frontend**: React 19, TypeScript 5, Vite 6 + Vite PWA Plugin
- **Routing**: React Router 7
- **State Management**: Zustand (+ devtools, immer)
- **Data Fetching/Cache**: TanStack React Query (with offline persistence)
- **Forms & Validation**: React Hook Form + Zod
- **Backend & AI**: Firebase (Authentication, Firestore, Cloud Functions)
- **Styling**: Tailwind CSS v4 (Grid-optimized) + CSS custom properties
- **Motion & 3D**: Framer Motion (Transitions), React Three Fiber / Three.js (WebGL)
- **Organic Aesthetics**: Rough.js (Doodle illustrations & SVGs)
- **PDF Export**: html2canvas + jsPDF
- **Testing**: Vitest + Testing Library + jsdom

## Provider Composition (App Entry)

```tsx
<HelmetProvider>
  <QueryClientProvider client={queryClient}>
    <ThemeInitializer>
      <AuthInitializer>
        <AppRouter />
      </AuthInitializer>
    </ThemeInitializer>
  </QueryClientProvider>
</HelmetProvider>
```

This composition ensures SEO metadata support, robust query caching, persisted theme preferences, and secure auth session hydration are fully initialized before any route renders.

> **Note:** `PwaSyncProvider` is planned for a future iteration when full PWA + service worker sync management is implemented.

## Product Modes

### Public Mode

- Landing route (`/`) and dynamic profile route (`/:username`).
- Visitors experience a highly polished, interactive Bento Grid layout.
- AI-driven context adjustments and 3D models engage visitors dynamically.

### Admin Mode

- Owner-only routes strictly protected by Firebase Auth and `AdminGuard` logic.
- Intuitive CRUD workflows, real-time analytics dashboards, and theme configuration tools for all portfolio assets.

## Current Scope

Implemented and active core features:

- Secure authentication with strict owner gating.
- Portfolio data fetch/update services leveraging Firestore.
- Live builder workspace with autosave status and real-time previews.
- Dynamic theme engine (colors, fonts, light/dark mode, and creative modes).
- Initial Bento Grid layout structure for About, Skills, and Projects sections.
- Resume export engine and manager page shell.

Planned expansions, including deep AI integrations and IoT/Hardware bridges, are tracked in the project roadmap (`FutureScope.md`).
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
5. Service calls Cloud Function endpoint via `aiService.ts` **[PLANNED â€” not yet implemented]**.
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

## 10. Migration Plan â€” âœ… COMPLETED

> The Firebase migration from Supabase has been fully completed across all service modules. The phases below are preserved for historical reference.

Phase 1 â€” âœ… Done: Added Firebase client and service modules in parallel, preserved store and UI contracts.

Phase 2 â€” âœ… Done: Switched auth module, profile and admin services. Test suite kept green after each switch.

Phase 3 â€” âœ… Done: Removed Supabase dependency. App Check enforcement and security rules finalized. Production smoke checks passed.

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

To deliver the blistering performance expected of a 2025â€“2026 web app, Firestore's offline persistence is enabled upon initialization:

```ts
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore';

// Modern Firebase v10+ offline persistence â€” replaces enableIndexedDbPersistence
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

// Offline-first Firestore â€” persistentLocalCache replaces the removed
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


# Deployment & DevOps

## Current Deployment Readiness

MekeshBuilds is engineered for zero-downtime deployments and edge-network delivery. Built as a Vite-powered Progressive Web App (PWA), the platform relies on static frontend hosting seamlessly integrated with a serverless Firebase backend.

The configuration ensures blistering performance through aggressive chunk splitting, service-worker caching, and global content delivery networks (CDNs).

**Configured NPM Scripts:**

```json
{
  "dev": "vite",
  "build": "tsc && vite build",
  "preview": "vite preview",
  "test": "vitest run",
  "test:ci": "vitest run",
  "lint": "eslint src --ext .ts,.tsx"
}
```

## Environments

### Local Development

- `npm install`
- Configure `.env.local` with Firebase credentials.
- `npm run dev`

### Production Build

- `npm run build`
- Generates the heavily optimized `dist/` directory, injecting the PWA `manifest.webmanifest` and generating the service worker.
- Requires standard production environment variables injected at the hosting level.

## Required Runtime Variables

To ensure secure and reliable connections to the serverless backend, the following variables must be configured in your hosting provider's dashboard:

```env
# Firebase Core Configuration
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# Application Identity
VITE_APP_URL=[https://your-custom-domain.com](https://your-custom-domain.com)
VITE_OWNER_EMAIL=your-email@example.com
```

## Hosting & Delivery Platform

The architecture is explicitly designed for edge platforms. Recommended targets include:

- **Firebase Hosting** (Ideal for native integration with Cloud Functions and Firestore)
- **Vercel** or **Netlify** (Excellent for global edge caching and GitHub CI/CD integration)

**Crucial Routing Requirement:**
Because this is a Single Page Application (SPA) handling dynamic routes (e.g., `/:username`), the host must be configured to rewrite all unknown paths to `index.html`.

_Example for Firebase Hosting (`firebase.json`):_

```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

## Build Output and Performance Optimization

To guarantee a near-instant First Contentful Paint (FCP) and smooth 3D/AR rendering, Vite is configured with advanced manual chunk splitting.

The build pipeline intelligently isolates:

- `vendor`: Core React ecosystem (React, Router, Zustand).
- `firebase`: Firebase Auth and Firestore SDKs.
- `webgl`: Three.js and React Three Fiber assets to prevent blocking the main thread.
- `motion`: Framer Motion libraries.

This modularity maximizes browser cache hit rates across iterative deployments.

## CI/CD Pipeline

The repository utilizes GitHub Actions to enforce code quality and automate production releases.

**Core Pipeline Objectives:**

1. Install dependencies via cached environments.
2. Enforce static analysis (`npm run lint`).
3. Execute unit and component test suites (`npm run test:ci`).
4. Validate the production build step.
5. Deploy directly to Firebase Hosting on pushes to `main` (implemented in `.github/workflows/ci.yml`).

**Implemented workflow (`.github/workflows/ci.yml`):**

```yaml
name: Production CI/CD
on:
  push:
    branches: [main]
  pull_request:

jobs:
  validate-and-build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm

      - name: Install Dependencies
        run: npm ci

      - name: Lint Codebase
        run: npm run lint

      - name: Run Test Suite
        run: npm run test:ci
        # test:ci runs 'vitest run'. Use npm run test:coverage for v8 lcov reports.

      - name: Build PWA Artifacts
        run: npm run build
        env:
          VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}
          # Include other required secrets here...
```

## Pre-Flight Deployment Checklist

1. Verify all `VITE_FIREBASE_*` variables are securely injected into the hosting provider.
2. Ensure the production domain is whitelisted in **Firebase Authentication > Settings > Authorized Domains**.
3. Confirm Google OAuth credentials in Google Cloud Console allow the new production callback URL.
4. Verify the SPA rewrite rule (`index.html` fallback) is actively intercepting traffic.
5. Run smoke tests on core routes:
   - `/` (Check 3D asset loading and Bento Grid responsiveness)
   - `/admin-access` (Check lockout mechanisms)
   - `/:username` (Check AI personalization context and PWA offline caching)
   - `/dashboard` (Verify protected owner-only access)

## Post-Deployment Observability

To maintain a recruiter-ready experience, the following monitoring practices are recommended:

- **Firebase Crashlytics / Performance Monitoring**: Track JavaScript exceptions and PWA load times in real-world scenarios.
- **Web Vitals Tracking**: Ensure LCP, CLS, and INP metrics remain in the "Good" threshold.
- **Database Telemetry**: Monitor Firestore read/write quotas in the Firebase Console to ensure AI caching strategies are effectively minimizing database loads.
# Features Architecture

## Feature Matrix

| Module                  | What it does                                                        | Core Tech / Files                                                                    |
| ----------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| **Routing & Access**    | Defines public, callback, admin access, owner-protected route tree  | `src/routes/AppRouter.tsx`, `src/components/guards/*`                                |
| **Authentication**      | Firebase Auth (Email/OAuth) + strict owner-role validation          | `src/services/authService.ts`, `src/store/authStore.ts`                              |
| **Public Portfolio**    | Renders dynamic Bento Grid layouts, 3D elements, and AI context     | `src/pages/PublicProfilePage.tsx`, `src/components/Canvas/*`, `src/components/3D/*`  |
| **AI Personalization**  | Adapts bio and highlighted skills based on visitor/recruiter intent | `src/hooks/useAiContext.ts`, Firebase Cloud Functions, `aiService.ts` **[PLANNED]**     |
| **Interactive Builder** | Live WYSIWYG editor with real-time Firestore autosync               | `src/pages/BuilderPage.tsx`, `src/store/builderStore.ts`, `src/hooks/useAutoSave.ts` |
| **Theme & UX Studio**   | Manages vibrant gradients, glassmorphism, and organic SVGs          | `src/pages/ThemeStudioPage.tsx`, `src/hooks/useThemeEngine.ts`                       |
| **Dashboard**           | Analytics summary, PWA sync status, and quick asset management      | `src/pages/DashboardPage.tsx`                                                        |
| **Analytics Engine**    | Tracks date-ranged engagement metrics to feed AI recommendations    | `src/pages/AnalyticsPage.tsx`, `src/services/adminService.ts`                        |
| **Projects Manager**    | Tabular project listing with 3D asset link controls                 | `src/pages/ProjectsManagerPage.tsx`                                                  |
| **Resume Handling**     | PDF export engine and AI-summarized variation generation            | `src/pages/ResumeManagerPage.tsx`, `src/hooks/useExportPDF.ts`                       |

## Public Experience Features

- **Bento Grid Architecture:** Clean, minimalist, and highly responsive CSS Grid layouts for optimal content digestion.
- **Immersive 3D/AR Elements:** Subtle WebGL models (React Three Fiber) to represent tech stacks and interactive project storytelling.
- **AI-Driven Personalization:** Tailors the order of projects and highlights specific skills if a recruiter visits via a generated, intent-specific URL.
- **Offline Reliability (PWA):** Caches 3D assets, fonts, and Firestore data via service workers, ensuring instant load times and offline resume viewing.
- **Organic Aesthetics:** Hand-drawn SVG illustrations and glowing micro-interactions (Framer Motion) that add personality and warmth to the technical presentation.

Example conditional rendering pattern (Bento Block):

```tsx
{
  skills?.length > 0 && (
    <motion.div layoutId="skills-bento-block" className="col-span-1 md:col-span-2">
      <SkillsSection skills={skills} themeColor={themeColor} />
    </motion.div>
  );
}
```

## Admin Experience Features

- **Zero-Trust Access:** Strict owner-only route protection powered by Firebase Custom Claims and Firestore Rules.
- **Central Command Dashboard:** Real-time engagement statistics, active AI context logs, and one-click URL sharing.
- **Live Builder Workspace:** Accordion-based editing workflow with split-screen, real-time visual feedback on the Bento canvas.
- **Granular Theme Controls:** Immediate manipulation of CSS variables for system themes, custom gradients, and 3D lighting settings.

## Data and State Features

### Global State (Zustand)

- `authStore`: Manages Firebase session hydration, user object state, and strict owner gating.
- `builderStore`: Tracks local draft state, manages dirty flags, and orchestrates UI feedback for Firestore autosaves.
- `uiStore` **[PLANNED]**: Will control PWA install prompts, offline toast notifications, and 3D camera transitions.

### Async Orchestration (React Query)

- Seamless integration with Firestore's IndexedDB persistence layer.
- Mutation-backed autosaves with optimistic UI updates.

Example Firestore Autosave Mutation:

```ts
const mutation = useMutation({
  mutationFn: () => profileService.updateProfile(store.profile!.id, store.profile!),
  onMutate: () => store.setSaveStatus('saving'),
  onSuccess: () => {
    store.setSaveStatus('saved');
    store.setLastSavedAt(new Date());
  },
  onError: () => store.setSaveStatus('unsaved'),
});
```

## Security Features

- **Firestore Security Rules:** Enforces strict client-side validation, ensuring only the authenticated owner UID can perform write operations to protected collections.
- **Brute Force Mitigation:** Client-side local storage lockout on `AdminAccessPage` to deter credential stuffing.
- **Resilient Error Boundaries:** Catches missing data or failed WebGL contexts, rendering graceful fallbacks instead of crashing the PWA.

## Performance & UX Features

- **Aggressive Chunk Splitting:** Vite configuration isolates heavy 3D libraries (Three.js) from the main bundle, achieving near-instant First Contentful Paint.
- **Functional Motion Design:** Framer Motion handles route transitions, layout reshuffling, and interactive hover states to guide the recruiter's eye natively.
- **Lazy Loading with Suspense:** Admin modules and heavy Canvas components render with skeleton fallbacks.

## Operational Features

- **End-to-End Type Safety:** Strict TypeScript interfaces mapped directly to Firestore Data Converters.
- **CI/CD Integration:** Automated linting, Vitest execution, and zero-downtime deployment pipelines via GitHub Actions.
- **PWA Manifest Generation:** Fully configured `vite-plugin-pwa` for seamless installation on desktop and mobile devices.


# Future Scope & Roadmap

## Overview

This document tracks the planned expansions for MekeshBuilds beyond the current implemented core. Items are organized by phase and estimated complexity. All items here are **not yet implemented** unless explicitly marked âœ….

---

## Phase 1 â€” Immediate Next Iteration

### 1.1 PWA Service Worker & Offline Caching

**Status:** [PLANNED]

Install and configure `vite-plugin-pwa` for proper offline access:

```bash
npm install -D vite-plugin-pwa workbox-window
```

Configure in `vite.config.ts` to cache:
- Fonts and critical CSS
- 3D model assets (`.glb`, `.gltf`)
- Firestore IndexedDB snapshots (handled by Firebase SDK)
- App shell for instant re-loads

---

### 1.2 Organic Aesthetics â€” Rough.js Integration

**Status:** [PLANNED]

```bash
npm install roughjs
```

Apply hand-drawn SVG borders to select Bento blocks to add warmth and break rigid grid lines. Integrate with the `useThemeEngine` so it responds to theme changes.

---

### 1.3 CI/CD GitHub Actions Pipeline

**Status:** [IMPLEMENTED â€” Workflow file created at `.github/workflows/ci.yml`]

Add repository secrets to GitHub:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_APP_URL`
- `VITE_OWNER_EMAIL`
- `FIREBASE_SERVICE_ACCOUNT` (from Firebase Console â†’ Project Settings â†’ Service Accounts)

---

### 1.4 Phase 1 Test Suite

**Status:** [PLANNED]

Write the 7 priority test files identified in `Testing.md`. These establish the minimum reliability baseline required for a CI quality gate.

---

### 1.5 AI Context Service (`aiService.ts`)

**Status:** [PLANNED]

Create `src/services/aiService.ts` as the frontend bridge to Firebase Cloud Functions hosting Genkit AI flows:

```ts
// src/services/aiService.ts
export async function generateRecruiterSummary(params: AiSummaryParams): Promise<string> {
  // Calls a Cloud Function that runs a Genkit prompt
}

export async function classifyRecruiterIntent(urlParams: URLSearchParams): Promise<RecruiterIntent> {
  // Parses intent signals (job title, company, search terms)
}
```

---

## Phase 2 â€” AI & Personalization Layer

### 2.1 Firebase Genkit Integration

**Status:** [PLANNED]

Deploy Genkit-powered Cloud Functions for:
- **Recruiter Intent Classification**: Analyze URL parameters (`?role=frontend&company=google`) to classify the visitor's intent and dynamically reorder Bento blocks.
- **Dynamic Bio Summarization**: Generate a tailored one-line pitch based on classified intent.
- **AI-Enhanced Resume Variants**: Generate role-specific resume PDFs on demand.

**Security requirement:** AI model API keys live exclusively in Cloud Functions environment â€” never exposed to the client.

---

### 2.2 Firebase Remote Config

**Status:** [PLANNED]

Use Remote Config for feature flags without redeployment:
- `enable_ai_personalization` (toggle)
- `enable_heavy_motion` (for low-powered devices)
- `bento_section_order` (A/B test ordering strategy)

---

### 2.3 A/B Testing Variants

**Status:** [PLANNED]

Test conversion rates between:
- Hero copy variants (engineer-focused vs. builder-focused)
- CTA button text ("See My Work" vs. "Explore Portfolio")
- Bento grid ordering presets
- Theme color palettes

---

### 2.4 Firebase Cloud Messaging (Owner Notifications)

**Status:** [PLANNED]

Push notifications to the owner when:
- Resume download count spikes above threshold
- A new contact CTA click is received
- Firestore quota approaches limit

---

## Phase 3 â€” WebXR & Immersive Experiences

### 3.1 WebXR Project Gallery

**Status:** [PLANNED â€” Long-term]

Allow recruiters to view 3D project architecture diagrams in **Augmented Reality** directly from the browser using the WebXR Device API. Triggered from the `/:username/projects/:id` deep route.

---

### 3.2 Deep-Dive Technical Blog (Headless CMS)

**Status:** [PLANNED]

Extend the `ContentEditorPage` Markdown editor into a full publishing pipeline:
- Write in Markdown within the admin builder
- Store in Firestore `blog_posts` collection
- Render at `/:username/blog/:slug` with syntax highlighting (Prism/Shiki)

---

### 3.3 Draco 3D Asset Compression

**Status:** [PLANNED]

Compress all `.glb` / `.gltf` 3D models using Draco compression to reduce download size by 60â€“80% for mobile PWA users. Requires enabling the Draco decoder in `@react-three/drei`.

---

## Phase 4 â€” IoT & Hardware Bridges

### 4.1 Live Hardware Project Telemetry

**Status:** [Exploratory]

For embedded systems projects (V2X, Smart IoT), embed live telemetry widgets in the public portfolio that pull real-time sensor data from Firebase Realtime Database connected to physical ESP32 nodes. Would demonstrate end-to-end hardware-to-cloud-to-UI engineering.

---

### 4.2 ROV & Camera Stream Embedding

**Status:** [Exploratory]

Embed live or recorded MJPEG/WebRTC camera streams from ESP32-CAM-based hardware projects directly into the portfolio's Projects Bento block.

---

## Technical Debt Backlog

| Item | Priority | Notes |
|------|----------|-------|
| E2E tests with Playwright | MEDIUM | Create `src/e2e/` directory for full user journey coverage |
| `uiStore.ts` | MEDIUM | Implement the planned PWA prompt, offline toast, and 3D camera state store |
| `vite-plugin-pwa` | HIGH | Core PWA capability currently not wired |
| `roughjs` | MEDIUM | Organic aesthetic layer referenced but not installed |
| Firestore composite indexes | HIGH | Deploy `firestore.indexes.json` to production |
| App Check enforcement | MEDIUM | Currently in monitor mode â€” enforce after QA pass |

---

*Last updated: 2026-04-02*
# MEKESH KUMAR

**Final Year Undergraduate â€” Electrical & Electronics Engineering (Kongu Engineering College)**

ðŸ“ž +91 8220810170 | ðŸ“§ mekesh.engineer@gmail.com | ðŸ”— linkedin.com/in/mekeshkumar | ðŸ’» github.com/Mekesh-Engineer | ðŸŒ freelancer.in/u/mekesh12

## CAREER OBJECTIVE

Final-year Electrical and Electronics Engineering undergraduate seeking a **Graduate Engineering Trainee (GET)** position to apply strong fundamentals in embedded systems, industrial automation, and IoT-integrated hardware-software development. Equipped with hands-on project experience across real-time control systems, sensor interfacing, and intelligent monitoring platforms â€” backed by in-plant training in manufacturing environments. Eager to contribute to engineering excellence, learn from industry-led mentorship, and grow into a core technical role within a dynamic organisation.

---

## EDUCATION

| Qualification                               | Institution                                              | Year                          | Result                           |
| ------------------------------------------- | -------------------------------------------------------- | ----------------------------- | -------------------------------- |
| B.E. â€“ Electrical & Electronics Engineering | Kongu Engineering College, Perundurai, Tamil Nadu        | 2023 â€“ Present _(Final Year)_ | **CGPA: 7.71** _(up to 5th Sem)_ |
| Higher Secondary Education (HSE)            | Govt. Boys Higher Secondary School, Palacode, Tamil Nadu | 2021 â€“ 2023                   | **84%**                          |
| SSLC                                        | DDCSM Matriculation School, Palacode, Tamil Nadu         | 2020 â€“ 2021                   | **84%**                          |

---

## CORE ENGINEERING COMPETENCIES

### Electrical & Electronics Fundamentals

- Circuit Design & Analysis, Electrical Machines, Power Systems, Power Electronics, EV & Motor Drivers, Analog Electronics, Digital Electronics, Signals & Systems, FPGA Design & Simulation, Microprocessors & Microcontrollers, Engineering Drawing, Control Systems, Power System Protection & Switchgear
- PCB Design Fundamentals, Schematic Capture, Electrical Wiring Diagrams
- Sensor Interfacing & Transducer Calibration, Closed-Loop Control System Design

### Engineering Design & Simulation Tools

- **Simulation:** MATLAB, Simulink, Proteus, OrCAD PSpice, Mi Power
- **FPGA & Digital Design:** Xilinx Vivado, Intel Quartus Prime
- **CAD:** AutoCAD Electrical, Autodesk Fusion 360

### Embedded Systems & Industrial Automation

- Microcontroller Firmware: ESP32, Arduino Uno, ARM-based Processors
- Embedded C/C++ Programming, Real-Time Control Logic, Peripheral Interfacing (I2C, SPI, UART, ADC)
- Servo Actuation, Multi-Sensor Fusion, FreeRTOS Concepts _(fundamentals)_
- IoT Platform Integration: Blynk IoT, Wi-Fi-based Edge Systems, OTA Updates

### Programming & Software Skills

- **Languages:** Python, C, Embedded C, C++, Java, JavaScript
- **Frontend:** React 19, TypeScript, Next.js, React Native, HTML5, CSS3, Tailwind CSS, Bootstrap
- **Build Tools:** Vite
- **Backend:** Express.js , Flask, WebSockets, REST APIs
- **Databases & Cloud:** Firebase (NoSQL), Supabase (PostgreSQL), MongoDB
- **Version Control:** Git, GitHub

### AI & Machine Learning Skills

#### Core Technical Skills

- **Programming:** Python
- **Frameworks & Libraries:** TensorFlow, PyTorch, Keras, Scikit-learn
- **Mathematics:** Linear Algebra, Calculus, Probability & Statistics _(for model optimisation)_
- **Data Science:** Pandas, NumPy, Matplotlib, Seaborn _(data manipulation, EDA, visualisation)_

#### Data & Annotation

- **Dataset Platforms:** Roboflow, CVAT.ai, Label Studio, LabelMe, Doccano
- **Data Skills:** Dataset curation, preprocessing, augmentation, SQL-based data management

#### Machine Learning

- Supervised & Unsupervised Learning, Neural Networks, Decision Trees, Ensemble Methods
- Computer Vision: Object Detection (YOLOv8), Image Segmentation, OpenCV-based inspection pipelines
- Natural Language Processing (NLP) _(fundamentals)_
- Generative AI & Large Language Models (LLMs) _(applied, via Firebase Genkit & Google AI APIs)_

#### Deployment & MLOps

- Model export: ONNX _(edge deployment on embedded hardware)_
- Cloud Platforms: Google Cloud (GCP), Firebase Cloud Functions _(AI inference pipelines)_
- MLOps concepts: Experiment tracking, model versioning, CI-integrated evaluation

---

## TECHNICAL PROJECTS

### âš™ï¸ Automated Rod and Pipe Inspection System

**Tech Stack:** Python Â· OpenCV Â· YOLOv8 Â· Flask Â· ESP32-CAM Â· C++
[github.com/Mekesh-Engineer](https://github.com/Mekesh-Engineer) _(Industrial Automation | Machine Vision)_

An end-to-end automated quality inspection system replacing manual measurement with machine vision for manufacturing-line use.

- Programmed **ESP32-CAM firmware** in C++ to stream real-time JPEG frames over Wi-Fi via HTTP endpoints for low-latency video ingestion.
- Integrated **computer vision algorithms** (YOLOv8 + OpenCV) to detect surface defects and compute dimensional measurements with high accuracy.
- Built a **multi-threaded Flask backend** to handle concurrent video streams and serve inference results efficiently.
- Designed a **live operator dashboard** displaying FPS, inference latency, detection logs, and real-time video â€” replicating SCADA-like monitoring interfaces.
- Demonstrates direct applicability to **industrial quality control** and automated inspection workflows in manufacturing environments.

---

### ðŸš— V2X Communication and Fleet Monitoring System

**Tech Stack:** Python Â· Flask Â· WebSockets Â· SSE Â· UDP Â· ESP32 Â· C++
[github.com/Mekesh-Engineer](https://github.com/Mekesh-Engineer) _(Fleet Automation | Real-Time Telemetry)_

A real-time vehicle-to-everything (V2X) telemetry and control platform for multi-device fleet coordination â€” analogous to industrial SCADA and remote monitoring systems.

- Architected a **full-stack telemetry API** ingesting high-frequency sensor data (distance, temperature, humidity, battery, IR obstacles) from distributed ESP32 edge nodes.
- Engineered a **UDP auto-discovery service** for zero-configuration dynamic IP resolution across local networks â€” applicable to industrial plant-floor device management.
- Built a **thread-safe global state manager** with mutex-protected command queuing to ensure reliable, non-blocking control instruction delivery.
- Implemented a **low-latency MJPEG video proxy server** to relay live ESP32-CAM feeds to a central dashboard, eliminating cross-origin network restrictions.
- Presented at **5 inter-collegiate technical events** including Robofiesta 2K25 (SREC) and Ideathon 2K24 (KEC).

---

### ðŸŸï¸ Smart IoT-Based Event and Venue Management Platform

**Tech Stack:** React 19 Â· TypeScript Â· Firebase Â· YOLOv8 Â· ESP32-CAM Â· Python
[github.com/Mekesh-Engineer](https://github.com/Mekesh-Engineer) _(IoT Systems | Full-Stack Engineering)_

> ðŸ† **1st Prize â€“ Tamizhanskills Ideathon 2026**, New Prince Shri Bhavani College of Engineering, Chennai

A full-stack IoT platform integrating hardware, cloud, and AI for real-time venue monitoring, automated access control, and crowd management.

- Deployed **edge-based crowd density analysis** (YOLOv8) to trigger autonomous safety alerts and gimbal control when occupancy thresholds were exceeded.
- Engineered a **high-speed QR ticket validation system** using ESP32-CAM with cryptographic security and automated gate actuation.
- Built a **scalable serverless Firebase backend** (Firestore + Cloud Functions) with multi-tier Role-Based Access Control (RBAC) and atomic ticket inventory synchronisation.
- Developed a **real-time React 19 monitoring dashboard** for live crowd flow, hardware health, and ticket sales using Zustand and React Query.

---

### ðŸ—‘ï¸ IoT Automated Waste Segregation System

**Tech Stack:** C++ Â· ESP32 Â· Blynk IoT Â· Inductive / Capacitive / IR Sensors Â· Servo Motors
[github.com/Mekesh-Engineer](https://github.com/Mekesh-Engineer) _(Embedded Systems | Smart Automation)_

An autonomous smart waste classification system demonstrating applied embedded control logic, multi-sensor fusion, and cloud-connected monitoring.

- Implemented **multi-sensor fusion** (inductive, capacitive, IR) for autonomous classification of metal, plastic, and organic waste.
- Programmed **real-time embedded control logic** to translate sensor readings into servo-driven sorting actuation â€” a direct analogy to PLC-controlled industrial sorting systems.
- Integrated **Blynk IoT dashboard** for remote monitoring of bin capacity, waste distribution, and system health via Wi-Fi.

---

### ðŸŒ Full-Stack Portfolio and Resume Builder Web App

**Tech Stack:** React 19 Â· TypeScript Â· Vite Â· Firebase (Auth + Firestore) Â· Framer Motion Â· Zod Â· Zustand Â· Vitest
[github.com/Mekesh-Engineer](https://github.com/Mekesh-Engineer) _(Full-Stack Web Engineering | Product Systems)_

A production-style full-stack web application for building, managing, and publishing technical portfolio and resume content with secure authentication, real-time data workflows, and modular UI architecture.

- Engineered a **role-aware dashboard platform** with protected routing, authentication callbacks, and centralised state management for profile, projects, resume, and settings modules.
- Built **schema-validated content pipelines** (Zod-based) for personal info, projects, experience, skills, themes, and contact forms to improve data integrity and reduce invalid submissions.
- Implemented **real-time and productivity features** including autosave hooks, clipboard/export utilities, analytics views, search/filter tooling, and responsive UI sections optimised for desktop and mobile.
- Structured the app into reusable component layers and feature modules, with **test coverage using Vitest** to support maintainability and iterative deployment.

---

### âš¡ Smart Hybrid Energy Management System using Fuzzy Logic

**Tech Stack:** Arduino Mega Â· Fuzzy Logic (eFLL) Â· Proteus Â· Embedded C Â· ACS712 Current Sensors Â· Power Electronics
[github.com/Mekesh-Engineer](https://github.com/Mekesh-Engineer) _(Energy Systems | Smart Grid Automation)_

An intelligent energy optimisation system that dynamically manages load distribution between grid and renewable sources using fuzzy logic-based decision making.

- Designed a **Fuzzy Logic Controller (FLC)** using multi-parameter inputs (time, load, grid availability, battery status) to optimise energy usage decisions.
- Implemented **real-time load monitoring** using ACS712 current sensors and voltage divider circuits for battery state estimation.
- Built a **relay-based switching architecture** to dynamically route power between grid and battery for efficient energy utilisation.
- Simulated the complete system in **Proteus Design Suite**, including inverter, solar input, and load switching mechanisms.
- Demonstrates strong application in smart homes, energy optimisation, and demand-side management systems.

---

### ðŸš“ GPS-Based Smart Vehicle Horn & Speed Regulation System

**Tech Stack:** ESP32 Â· GPS (NEO-6M) Â· L298N Motor Driver Â· Embedded C++ Â· Wi-Fi Â· Web Server
[github.com/Mekesh-Engineer](https://github.com/Mekesh-Engineer) _(Embedded Systems | Intelligent Transportation)_

A geofence-aware smart vehicle system that automatically regulates speed and restricts horn usage in sensitive zones such as hospitals and campuses.

- Implemented **GPS-based geofencing logic** using the Haversine distance formula to detect zone entry in real time.
- Designed an **adaptive motor control system** using PWM to dynamically reduce vehicle speed inside restricted zones.
- Built a **real-time web dashboard and control interface** for telemetry monitoring and manual control (mobile and desktop).
- Integrated **state-driven buzzer control logic** to disable horn functionality and trigger alert feedback in restricted zones.

---

### ðŸŽ® Cosmic Strikes â€” 3D Arcade Space Shooter

**Tech Stack:** React Â· TypeScript Â· Three.js Â· React Three Fiber Â· Node.js Â· Express Â· MongoDB / SQLite
[github.com/Mekesh-Engineer](https://github.com/Mekesh-Engineer) _(Full-Stack Systems | Interactive 3D Applications)_

A high-performance full-stack 3D arcade shooter combining real-time rendering, game logic, and backend-driven leaderboards.

- Engineered a **WebGL-based 3D rendering pipeline** using React Three Fiber for smooth 60 FPS gameplay.
- Designed a **scalable game architecture** with Redux state management and modular component structure.
- Built a **Node.js backend API** with JWT authentication and leaderboard system supporting MongoDB and SQLite.
- Implemented **dynamic gameplay systems** including wave progression, difficulty scaling, and combo-based scoring logic.

---

## ACHIEVEMENTS

| Year | Award                | Project / Activity                          | Event & Institution                                                                    |
| ---- | -------------------- | ------------------------------------------- | -------------------------------------------------------------------------------------- |
| 2026 | ðŸ¥‡ 1st Prize         | Smart IoT Event & Venue Management Platform | Tamizhanskills Ideathon 2026 â€” New Prince Shri Bhavani College of Engineering, Chennai |
| 2025 | ðŸ¥‰ 3rd Prize         | ROV-Based Underwater Crack Detection System | Project Prism â€“ Oracle 2025 â€” Government College of Technology, Coimbatore             |
| 2026 | ðŸ¥‰ 3rd Prize         | Smart IoT Event & Venue Management Platform | Elixir 2026 Technical Event â€” Government College of Engineering, Erode                 |
| 2023 | ðŸ… School First Rank | Higher Secondary Examination                | Govt. Boys Higher Secondary School, Palacode                                           |

---

## INDUSTRIAL TRAINING & EXPOSURE

### In-Plant Training

**Hatsun Agro Products Ltd., Vellichandai** | 15â€“19 July 2024
Gained hands-on exposure to industrial manufacturing operations, production line workflows, equipment maintenance practices, and plant automation systems.

**Pavithran Aseptic Fruit Products** | 1â€“5 January 2025
Studied aseptic processing techniques, quality control protocols, instrumentation used in food-grade production, and compliance with industrial standards.

### Industrial Visits

- **Radio Astronomy Centre (RAC), Ooty** â€“ November 2024 _(large-scale signal processing and RF systems)_
- **Kodaikanal Solar Observatory (KoSO)** â€“ March 2025 _(precision instrumentation and data acquisition systems)_

---

## CERTIFICATIONS

**Professional & Technical**

- Embedded Application Development using ARM Processors â€” Maven Silicon (2025)
- AutoCAD Electrical Design â€” Cadcentre Cochin (2023)

**Additional**

- Introduction to Generative AI â€” Google Cloud (2024)
- Java for Beginners â€” Infosys Springboard (2024)
- Energy Literacy Training â€” Energy Swaraj Foundation (2023)

---

## TECHNICAL PRESENTATIONS & COMPETITIONS

**V2X Communication and Fleet Monitoring System** â€” Presented at 5 events:
Ideathon 2K24 (KEC) Â· Robofiesta 2K25 (SREC) Â· Autonix 2024 (KEC) Â· Project Expo 2K25 (KEC) Â· Proof of Concept 2K25 (KEC)

**Smart IoT Event & Venue Management Platform** â€” Presented at 5 events:
Tech Aura 2026 â€“ IEEE (KPR Institute) Â· Elixir 2026 (GCE Erode) Â· Exodia 2026 â€“ ISTE Hackathon (KEC) Â· Tech Fest 2K25 (KEC) Â· Proof of Concept 2K25 (KEC)

**ROV-Based Underwater Crack Detection System:**
Oracle 2K25 â€” Government College of Technology, Coimbatore

---

## MEMBERSHIPS & LEADERSHIP

**ISTE â€“ Indian Society for Technical Education** | Executive Member (2024 â€“ Present)
Actively contributed to organising technical events, workshops, and inter-departmental competitions at Kongu Engineering College.

**NSS â€“ National Service Scheme** | Executive Member (2024 â€“ Present)
Led and participated in community outreach, rural development, and social responsibility programmes.

---

## LANGUAGES

Tamil: Native | English: Professional | Hindi: Working

---

## AREAS OF INTEREST

Embedded Systems & Firmware Development | Industrial Automation & Control | IoT & Smart Systems | Power Electronics | Computer Vision & AI-Integrated Engineering | Full-Stack Industrial Software

---

_I hereby declare that all information provided in this rÃ©sumÃ© is true and accurate to the best of my knowledge._

**Mekesh Kumar**
Place: Perundurai | Date: **\*\***\_\_\_\_**\*\***
# Page Architecture & Routing

## Route Topology

```text
/                    -> HomePage
/auth/callback       -> AuthCallbackPage
/admin-access        -> AdminAccessPage
/:username           -> PublicLayout -> PublicProfilePage (Bento Grid & 3D Canvas)
/dashboard           -> AdminLayout (AuthGuard + AdminGuard) -> DashboardPage
/builder             -> AdminLayout (AuthGuard + AdminGuard) -> BuilderPage
/analytics           -> AdminLayout (AuthGuard + AdminGuard) -> AnalyticsPage
/resume              -> AdminLayout (AuthGuard + AdminGuard) -> ResumeManagerPage
/projects            -> AdminLayout (AuthGuard + AdminGuard) -> ProjectsManagerPage
/content             -> AdminLayout (AuthGuard + AdminGuard) -> ContentEditorPage
/settings            -> AdminLayout (AuthGuard + AdminGuard) -> SettingsPage
/themes              -> AdminLayout (AuthGuard + AdminGuard) -> ThemeStudioPage
* -> NotFoundPage (PWA Offline Fallback)
```

_Note: The `/:username` index acts as the primary dynamic entry point for public portfolio consumption. Additional public sub-routes (e.g., `/:username/projects/:id`) are staged for future WebXR and deep-dive expansions._

## Page-by-Page Documentation

### HomePage (`/`)

**Purpose:** Marketing entry point designed to convert visitors and demonstrate blistering PWA performance.

**Composition:** `Navbar`, `HeroSection` (with subtle 3D interactions), `ServiceSection`, `BentoShowcase`, `Footer`.

**Behavior:**

- Statically optimized for near-instant First Contentful Paint (FCP).
- Injects critical SEO metadata via `react-helmet-async`.
- Pre-caches core 3D models and fonts using service workers.

### PublicProfilePage (`/:username`)

**Purpose:** The core public portfolio, rendered as an immersive, highly responsive Bento Grid.

**Data Flow:**

1. `useParams()` extracts the target `username`.
2. `useAiContext()` optionally parses URL parameters to dynamically highlight specific skills or tailor the bio for specific recruiter intent.
3. `usePortfolioData(username)` resolves the profile and related assets securely from Firestore.
4. The Bento Grid and React Three Fiber canvas sections render the fetched content with Framer Motion transitions.

**Fallbacks:**

- Skeleton loaders during initial hydration.
- Graceful "Portfolio not found" state mapped to Firebase error boundaries.

### AdminAccessPage (`/admin-access`)

**Purpose:** A highly secure, zero-trust login portal for the application owner.

**Behavior:**

- Validates credentials using `loginSchema` (Zod) + React Hook Form.
- Authenticates via Firebase `signInWithEmailAndPassword`.
- Defends against brute-force attacks via a strict client-side lockout mechanism.

**Lockout Constants:**

```ts
const LOCKOUT_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
```

### AuthCallbackPage (`/auth/callback`)

**Purpose:** Handles the seamless handoff from Google OAuth providers.

**Flow:**

1. Intercepts the Firebase Auth redirect result.
2. Validates the user's UID and Custom Claims against the owner specification.
3. Routes authorized users to `/dashboard` or evicts unauthorized sessions immediately.

### DashboardPage (`/dashboard`)

**Purpose:** The central command center for the portfolio owner.

**Highlights:**

- Top-level engagement metrics (views, AI-context matches).
- System health indicators (PWA sync status, Firestore offline cache size).
- Quick actions: Launch Builder, copy AI-tailored share links, or trigger a resume export.

### BuilderPage (`/builder`)

**Purpose:** The flagship editing workspace featuring real-time Firestore synchronization.

**Layout:**

- **Left Panel:** Accordion-style modular editors (Personal, Experience, Skills, Projects, AI Settings).
- **Right Panel:** `#live-canvas` offering an interactive, split-screen preview of the Bento Grid and 3D UI across breakpoints.

**Core Orchestration:**

- `useBuilderStore`: Manages local drafts and dirty states.
- `useAutoSave`: Debounces input and pushes mutations to Firestore smoothly.

### AnalyticsPage (`/analytics`)

**Purpose:** Data-driven insights into portfolio performance and recruiter engagement.

**Capabilities:**

- Tracks project clicks, resume downloads, and session durations.
- Displays visual charts (Chart.js / D3) mapping traffic trends.
- Highlights which AI-tailored pitches are generating the most engagement.

### ResumeManagerPage (`/resume`)

**Purpose:** Manages traditional PDF assets and dynamic resume generation.

**Current State:**

- Drag-and-drop zone for static PDF uploads to Firebase Storage.
- Leverages `useExportPDF` to seamlessly generate formatted, ATS-friendly documents directly from the live DOM context.

### ProjectsManagerPage (`/projects`)

**Purpose:** A granular, tabular interface for managing complex project data.

**Current State:**

- Interfaces with Firestore to handle CRUD operations for project metadata, repository links, and 3D asset references.

### ContentEditorPage (`/content`)

**Purpose:** The CMS workspace for deeper technical writing and storytelling.

**Tabs:**

- Blog (Markdown editor staging)
- Gallery (Asset management)
- Testimonials

### ThemeStudioPage (`/themes`)

**Purpose:** A dedicated visual engineering studio for adjusting the portfolio's aesthetics.

**Capabilities:**

- Manages global CSS variables (Gradients, Glassmorphism opacities).
- Configures 3D scene lighting and camera angles for the WebGL canvas.
- Toggles between professional, creative, and organic (hand-drawn SVG) modes.

### NotFoundPage (`*`)

**Purpose:** Standardized 404 handler optimized for offline PWA routing.

**Additional Behavior:**

- Logs failed routing attempts to `error_logs` in Firestore to identify broken external links.
- Offers a seamless path back to the application root.

## Navigation Flow

```text
Visitor -> / -> /:username (AI-tailored & Cached)
Owner   -> /admin-access -> /dashboard -> Admin Modules
OAuth   -> Firebase Provider -> /auth/callback -> /dashboard
Unknown -> NotFoundPage (Offline-capable)
```
# Project Structure & Architecture

## Root Directory Layout

The repository is structured to prioritize rapid onboarding, strict module isolation, and robust CI/CD integration.

```text
mekeshbuilds/
|- coverage/             # Test coverage reports (Vitest)
|- Docs/                 # Project documentation
|- firebase/             # Firebase security rules
|- public/               # Static public assets
|  |- robots.txt
|- scripts/              # Custom workspace scripts
|- src/
|  |- App.tsx
|  |- main.tsx           # Application entry point & provider composition
|  |- vite-env.d.ts      # Vite type declarations
|  |- assets/            # Static media, icons, and images
|  |- components/        # Granular UI modules (Builder, Canvas, Shared, etc.)
|  |- data/              # Static TypeScript data files (project-list, blog-posts)
|  |- features/          # Domain-driven feature modules
|  |  |- admin/          # Admin dashboard feature logic
|  |  |- auth/           # Auth hooks and services
|  |  |- public/         # Public portfolio feature logic
|  |- forms/             # Zod validation schemas
|  |- hooks/             # Stateful orchestration (UI, Data, Sync)
|  |- lib/               # 3rd-party client singletons (Firebase) & external utils
|  |- pages/             # Route-level view components
|  |  |- admin/          # Admin page components
|  |  |- auth/           # Auth page components
|  |  |- public/         # Public-facing page components
|  |  |- test/           # Local test pages / sandboxes
|  |- routes/            # Route topology (AppRouter)
|  |- services/          # Firebase API abstraction layer
|  |- store/             # Zustand global state slices
|  |- styles/            # Tailwind CSS v4 variables & custom tokens
|  |- test/              # Vitest global mocks & setup
|  |- types/             # TypeScript interfaces & Firestore converters
|  |- utils/             # Pure helper functions
|- firebase.json         # Firebase project configuration
|- index.html
|- package.json
|- tsconfig.json
|- tsconfig.node.json
|- vite.config.ts        # Vite + PWA + manual chunking config
|- vitest.config.ts      # Test environment config (jsdom)
```

````

## Directory Responsibilities

### `src/features`

Domain-driven feature modules â€” each subdirectory encapsulates the hooks, services, and logic for a specific product domain:

- `admin/`: Admin dashboard orchestration logic.
- `auth/`: Authentication hooks (`useAuth`) and auth-specific business logic.
- `public/`: Public portfolio feature logic and data access.

### `src/data`

Static TypeScript data files used as fallback or seed content:

- `project-list.ts`: Static list of portfolio projects for initial rendering.
- `blog-posts.ts`: Static blog post metadata.

### `src/components`

The visual building blocks of the application, strictly separated by domain:

- `auth/`: Authentication UI and elements.
- `Builder/`: Components orchestrating the live portfolio builder interface.
- `Canvas/`: High-level portfolio sections consumed by both the public profile and the live builder.
- `forms/`: Form UI components encapsulating logic and presentation.
- `guards/`: Route protection wrappers (`AuthGuard`, `AdminGuard`).
- `layout/`: Shared navigational shells (`AdminLayout`, `PublicLayout`).
- `Pages/`: Distinct section components specifically mapped to full pages.
- `Shared/`: Agnostic, highly reusable primitives (`Button`, `Card`, `Skeleton`, `Modal`).

### `src/hooks`

Stateful logic, side effects, and hardware/API abstractions:

- `usePortfolioData`: Fetches and syncs portfolio profile configurations.
- `useRealtimeSync`: Real-time data listener implementation.
- `useAutoSave`: Debounced persistence hook for dashboard form state.
- `useThemeEngine`: Mutates DOM CSS variables for real-time visual updates.
- `useMotionPreference`: Respects user's reduced-motion device settings via Framer Motion.

### `src/lib`

External client instantiations and heavy SDK setups:

- `firebaseClient.ts`: Entry point for initializing the Firebase App, Auth, and Firestore instances, ensuring singleton performance.
- `utils/`: Associated external library configurations or utilities.

### `src/services`

The data abstraction layer. UI components **never** interact with the database directly.

- `adminService.ts`: Admin operations (fetching configurations, user stats).
- `profileService.ts`: Reads/writes core user profile data.
- `ctaMailService.ts`: Handles automated contact form email dispatches.
- `serviceError.ts`: Universal API error wrapping and reporting.

### `src/types`

Strictly enforces end-to-end type safety:

- TypeScript interfaces defining the application's domain model.
- Firestore `withConverter` objects ensuring runtime schema validation when reading/writing NoSQL documents.

## Dependency Boundaries (The Architecture Rule)

The codebase strictly adheres to a unidirectional dependency flow, preventing circular dependencies and tightly coupled logic.

```text
Pages / Components (Presentation)
       â†“
Hooks / Store (State & Orchestration)
       â†“
Services (API / Database Abstraction)
       â†“
Lib / Types (External SDKs & Schemas)
```

**Architectural Invariants:**

1. **No Raw Queries in UI:** UI files must never execute Firebase SDK database calls directly.
2. **Framework Agnostic Services:** `src/services` functions return pure Promises and must _never_ import React hooks or UI components.
3. **Singleton Control:** External libraries (like Firebase) must be initialized exactly once in `src/lib`.

## Build and Tooling Configuration

- **`vite.config.ts`**: Configured with `@vitejs/plugin-react` and `@tailwindcss/vite`. Manual chunk splitting separates Three.js, Firebase, and React into distinct bundles for optimal caching. `vite-plugin-pwa` **[PLANNED â€” not yet installed]** will be added for full service-worker and offline capabilities.
- **`vitest.config.ts`**: Configures the `jsdom` testing environment, sets up the file bootstrap, and enforces high test coverage thresholds.
- **`package.json`**: Implements Git hooks (Husky/lint-staged) to prevent poorly formatted or failing code from being committed.

## Modular Strengths & Enterprise Alignment

1. **Frictionless Onboarding:** A highly predictable, domain-driven folder structure allowing new engineers to navigate the codebase instantly.
2. **Scalable Routing:** The separation of `pages` from `routes` makes it trivial to inject new complex sub-modules (like an interactive WebXR gallery) without refactoring the router tree.
3. **Robust Separation of Concerns:** Decoupling rendering (Components) from data access (Services) simplifies unit testing and future backend migrations.

## Future Structural Opportunities

1. Implement a `src/e2e/` directory using Playwright or Cypress for complete end-to-end user journey testing.
2. Migrate generic, non-domain-specific UI components into a localized Monorepo workspace or package for theoretical reusability across future SaaS tools.


````
# Firestore Security Rules

## Overview

MekeshBuilds enforces all data authorization at the **Firestore Security Rules layer** â€” eliminating the need for a separate backend security server. Rules operate on the principle of **least privilege**: everything is denied by default, and access is explicitly granted per collection.

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

### `profiles` â€” Public Read, Owner Write

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

### `experience`, `skills`, `projects`, `certificates` â€” Public Read, Owner Write

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

### `blog_posts`, `gallery_items`, `testimonials` â€” Public Read, Owner Write

```
match /blog_posts/{postId} {
  allow read: if resource.data.isPublished == true;
  allow read: if isAuthenticated() && resource.data.ownerId == request.auth.uid;
  allow write: if isOwner(resource);
}
```

---

### `analytics_events` â€” Owner Write, Owner/Admin Read

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

### `ai_preferences` â€” Owner Only

```
match /ai_preferences/{prefId} {
  allow read, write: if isAuthenticated()
    && request.auth.uid == resource.data.ownerId;
}
```

---

### `error_logs` â€” Write-only from Client, Admin Read

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
# State Management Architecture

## Overview

MekeshBuilds uses a two-tier state management strategy:

1. **Zustand** â€” Global, synchronous client state (auth session, builder drafts).
2. **TanStack React Query** â€” Async server state (Firestore data fetching, mutations, and caching).

These two layers are kept strictly separate. Zustand manages **who you are** and **what you're editing**. React Query manages **what data comes from the server**.

---

## Zustand Stores

Stores are located in `src/store/`. Each store follows the pattern: state slice â†’ actions â†’ optional devtools/immer middleware.

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

**Usage Rule:** Route guards (`AuthGuard`, `AdminGuard`) must **only** consume store selectors â€” never call Firebase SDK directly.

```ts
// Correct usage in a guard component
const { isAuthenticated, isLoading } = useAuthStore(
  (s) => ({ isAuthenticated: s.isAuthenticated, isLoading: s.isLoading })
);
```

---

### `builderStore.ts`

Manages the live builder workspace â€” local draft state for the WYSIWYG editor.

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

### `uiStore.ts` â€” [PLANNED]

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

React Query handles all async data lifecycle â€” fetching, caching, background refresh, and mutations.

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
  â”‚
  â–¼
builderStore.patchProfile() â†’ isDirty = true
  â”‚
  â–¼ (800ms debounce)
useAutoSave hook â†’ React Query mutation
  â”‚
  â”œâ”€â–º onMutate  â†’ setSaveStatus('saving')
  â”œâ”€â–º onSuccess â†’ setSaveStatus('saved') + invalidateQueries
  â””â”€â–º onError   â†’ setSaveStatus('unsaved')
```

---

## Architecture Rules

1. **Zustand for synchronous UI state.** Never use Zustand to cache server data â€” that is React Query's job.
2. **React Query for all Firebase reads/writes.** Service functions return Promises; React Query manages the lifecycle.
3. **No direct Firebase SDK calls in components.** All data access flows through hooks â†’ services â†’ Firebase.
4. **Selector stability:** Always use shallow selectors in Zustand to avoid unnecessary re-renders:
   ```ts
   // âœ… Correct â€” only re-renders when isOwner changes
   const isOwner = useAuthStore((s) => s.isOwner);

   // âŒ Incorrect â€” creates a new object every render
   const { isOwner } = useAuthStore();
   ```

---

## Devtools

In development, both tools expose debugging capabilities:

- **Zustand Devtools**: Enabled via `devtools()` middleware wrapper. Open Redux DevTools extension in the browser to inspect store state and action history.
- **React Query Devtools**: Install `@tanstack/react-query-devtools` and add `<ReactQueryDevtools />` inside `QueryClientProvider` for development builds only.
# Styling & UI Architecture

## Overview

The visual architecture of MekeshBuilds is designed to deliver a striking, recruiter-optimized experience that embodies 2025â€“2026 web design trends. It balances clinical engineering precision with organic, creative flair, utilizing Bento Grid layouts, immersive 3D elements, and functional motion design.

## The Visual Tech Stack

- **Utility Framework**: Tailwind CSS v4 via `@tailwindcss/vite` (Optimized for complex CSS Grid architectures).
- **Global Token System**: CSS custom properties managed in `src/styles/base/*` for dynamic theming.
- **Functional Motion**: Framer Motion for layout transitions, micro-interactions, and scroll-driven storytelling.
- **Organic Aesthetics**: Rough.js for generating dynamic, hand-drawn SVG borders and doodle illustrations. **[PLANNED â€” not yet in package.json; run `npm install roughjs` to enable]**
- **Immersive 3D/WebGL**: React Three Fiber / Drei for rendering tech-stack models and interactive canvases.

## Token Architecture & Theming

The project implements a dual-token design system, cleanly separating the secure administrative shell from the highly customizable public portfolio canvas.

1. **System Tokens (`--sys-*`)**: Strictly controls the `/dashboard` and `/builder` workspaces (dark-first, high-contrast, professional).
2. **Canvas Tokens (`--color-*`)**: Drives the public `/:username` portfolio, supporting vibrant gradients, glassmorphism, and AI-recommended palettes.

Example variables in `variables.css`:

```css
:root {
  /* System Shell */
  --sys-bg-primary: #0f0f14;
  --sys-text-primary: #f3f4f6;
  --sys-border: rgba(255, 255, 255, 0.1);

  /* Public Canvas (AI/User Mutable) */
  --color-primary: #ff6b2c;
  --color-secondary: #ff8a57;
  --color-glow: rgba(255, 107, 44, 0.4);
  --color-glass: rgba(15, 15, 20, 0.6);
}
```

## Dynamic Theme Engine Mechanics

To ensure maximum performance and zero-latency visual feedback in the Live Builder, the `useThemeEngine` hook bypasses React's render cycle for color updates. Instead, it mutates CSS variables directly on the `#live-canvas` DOM node.

```ts
// src/hooks/useThemeEngine.ts
canvas.style.setProperty('--color-primary', primary);
canvas.style.setProperty('--color-secondary', secondary);
canvas.style.setProperty('--color-glow', generateGlow(primary));
```

**Benefits:**

- Sub-millisecond visual updates during WYSIWYG editing.
- Complete isolation between the administrative UI and the rendered portfolio skin.
- Enables the AI to instantly inject recruiter-specific color psychology without triggering expensive DOM repaints.

## Bento Grid Layouts

The core of the public portfolio relies on a "Bento Box" architecture. This approach reduces cognitive load for recruiters by compartmentalizing information into clean, digestible visual hierarchy.

**Tailwind Usage Pattern:**
We leverage CSS Grid heavily via Tailwind utilities (`grid`, `col-span-x`, `row-span-x`) alongside responsive modifiers (`md:`, `lg:`) to ensure the Bento Grid gracefully degrades into a linear feed on mobile PWAs.

## Functional Motion Design

Animation is never purely decorative; it is utilized strictly as _Functional Motion Design_ to guide the recruiter's eye and provide spatial awareness.

- **Framer Motion (`<motion.div>`)**: Used for fluid layout shifts when filtering projects, exit/enter animations for Bento blocks, and satisfying hover states (e.g., scale and elevation shifts).
- **CSS Keyframes**: Reserved for infinitely looping, low-overhead utility animations (e.g., `marquee` for skill tickers, `pulse-glow` for call-to-action buttons) stored in `animations.css`.

## Organic & 3D Integration

- **Glassmorphism & Glows**: Bento blocks utilize `backdrop-blur-md` and custom drop-shadow tokens (`shadow-[var(--color-glow)]`) to create depth.
- **Hand-Drawn Accents**: Rough.js overlays are applied dynamically to specific Bento boxes to inject "warmth" and break up the rigid grid lines, creating a memorable, human-centric aesthetic.
- **WebGL Overlays**: `z-index` stacking contexts are carefully managed so 3D canvases seamlessly float behind or interleave with the CSS Grid content.

## Styling Best Practices for this Codebase

1. **Tokenize Everything**: Never use raw hex codes in JSX; always map to `--sys-*` or `--color-*` variables to ensure theme portability.
2. **Component-Level Utility**: Keep layout and spacing utilities inside the component markup, but extract complex animations to reusable Framer variants.
3. **Isolate Canvas Logic**: Theme mutations must remain strictly within `useThemeEngine`.
4. **Contrast & Accessibility**: Ensure glassmorphic overlays maintain a minimum 4.5:1 contrast ratio for text readability.

## Example Component: Bento Block with Glow & Glassmorphism

```tsx
import { motion } from 'framer-motion';

export const BentoBlock = ({ title, children }) => {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      className="col-span-1 md:col-span-2 relative overflow-hidden rounded-2xl border border-sys-border bg-[var(--color-glass)] backdrop-blur-xl p-6 shadow-lg transition-shadow hover:shadow-[0_0_20px_var(--color-glow)]"
    >
      <h3 className="text-xl font-bold text-sys-text-primary mb-2">{title}</h3>
      <div className="text-sys-text-secondary">{children}</div>
      {/* Optional Rough.js decorative SVG border injected here */}
    </motion.div>
  );
};
```


# TechStack

## Overview

MekeshBuilds is a cutting-edge, TypeScript-first web application built as a modern Progressive Web App (PWA) with a serverless Backend-as-a-Service model. It is designed to reflect 2025â€“2026 web design trends, prioritizing recruiter engagement through interactive storytelling, blistering performance, and intelligent personalization.

Core architecture:

- **Frontend**: React + Vite + Tailwind CSS (Bento Grid Architecture)
- **Backend & AI**: Firebase services (Authentication, Firestore NoSQL, Cloud Functions for AI)
- **Interactive Layers**: Framer Motion (Micro-interactions) + React Three Fiber (3D/AR)
- **State & Data orchestration**: Zustand + React Query + Offline Service Workers

## Frontend

### Framework and Runtime

- React 19 (`react`, `react-dom`)
- TypeScript 5 (`typescript`)
- React Router 7 (`react-router-dom`)
- Vite 6 build/dev server (`vite`, `@vitejs/plugin-react`)
- Vite PWA Plugin (`vite-plugin-pwa`) for offline access and service worker management.

### UI, 3D, and Interaction Libraries

- **Styling**: Tailwind CSS v4 (`tailwindcss`, `@tailwindcss/vite`) optimized for complex CSS Grid "Bento Box" layouts.
- **Motion Design**: Framer Motion (`framer-motion`) for hover animations, layout transitions, and scroll-driven storytelling.
- **Immersive 3D/AR**: Three.js (`three`) and React Three Fiber (`@react-three/fiber`, `@react-three/drei`) for subtle 3D visuals, floating tech-stack models, and interactive project showcases.
- **Organic Aesthetics**: Rough.js (`roughjs`) for generating hand-drawn doodle illustrations and organic SVG borders. **[PLANNED â€” not yet in package.json; `npm install roughjs`]**
- **Drag & Drop**: `@dnd-kit/core` + `@dnd-kit/sortable` for sortable builder panels.
- **Alert / Modal UI**: `sweetalert2` for rich confirmation dialogs and toast prompts.
- **Icons**: `react-icons` providing comprehensive icon sets (Simple Icons, Font Awesome, etc.).
- **Charts**: `chart.js` + `react-chartjs-2` for the Analytics dashboard visualizations.
- **Forms & Validation**: React Hook Form (`react-hook-form`) + Zod (`zod`).

### AI and Personalization Integrations

- **Cloud AI SDKs**: Integration with AI APIs (e.g., OpenAI or Google Gemini via Firebase Cloud Functions or Firebase Genkit) to adapt layouts and summarize resume content in real-time based on the visitor's context (e.g., highlighting specific skills if a recruiter searches for "Frontend").
- **Fuzzy Search**: Fuse.js (`fuse.js`) for rapid, typo-tolerant project and skill filtering.

### State and Data Layer

- Zustand (`zustand`) for app/global state (e.g., managing 3D camera angles or AI-driven theme toggles).
- Immer (`immer`) used as a Zustand middleware (`zustand/middleware/immer`) for ergonomic immutable state updates â€” **not** used as a standalone library.
- TanStack Query (`@tanstack/react-query`) for async cache/mutation workflows, seamlessly integrating with Firestore's offline persistence for cached portfolio data.
- Fuse.js (`fuse.js`) for rapid, typo-tolerant project and skill filtering.

### Styling Approach

- **Bento Grid Architecture**: Heavy utilization of CSS Grid via Tailwind utilities to create modular, responsive, and minimalist content blocks.
- **Vibrant & Glowing Aesthetics**: Custom CSS tokens in `src/styles/base/variables.css` defining vibrant gradients, glassmorphism overlays, and glowing border effects.
- **Runtime Theming**: Dynamic theme mutation using `useThemeEngine`, capable of switching between professional, creative, and AI-recommended color palettes.

## Backend

### Server Framework and API Model

- Serverless architecture leveraging Firebase platform services.
- **AI Compute Layer**: Firebase Cloud Functions utilized as a secure bridge to execute AI prompts (content recommendation, real-time bio adjustments) without exposing private API keys to the client.

### Authentication Methods

- **Firebase Authentication**:
  - Email + password sign-in
  - Google OAuth sign-in
- **Owner-only Access**: Route guards (`AuthGuard`, `AdminGuard`) and Firestore Security Rules strictly protect the admin dashboard, builder, and analytics workspaces.

### Database

- **Database Type**: NoSQL Document Database via Firebase Cloud Firestore.
- **Typed Access**: Strictly typed data access using TypeScript interfaces and Firestore Data Converters (`withConverter`) defined in `src/types/database.types.ts` to ensure frontend type safety.
- **Core Collections**:
  - `profiles`, `experience`, `skills`, `projects`
  - `analytics` (tracking user engagement metrics to feed the AI personalization engine)
  - `ai_preferences` (storing personalized views or customized pitches generated for specific recruiter links).

## Hosting and Deployment

### Performance-Driven PWA Build

- **Dev**: `npm run dev`
- **Production Build**: `npm run build` (Includes PWA manifest and service worker injection for offline caching of fonts, 3D models, and JSON data).
- **Optimization**: Aggressive manual chunk splitting for vendor libraries, WebGL context, and React Query modules to ensure near-instant First Contentful Paint (FCP).

### Hosting Platforms

- Deployed on **Firebase Hosting** (or **Vercel** / **Netlify**) to utilize edge caching and optimized global asset delivery.
- SPA rewrite rules configured to support dynamic routing (`/:username`) and fallback offline pages.
- **`vite-plugin-pwa`** for service worker and offline caching **[PLANNED â€” not yet installed; `npm install -D vite-plugin-pwa`]**.

### CI/CD Integration

- GitHub Actions (`.github/workflows/ci.yml`) implemented for automated linting, Vitest execution, and zero-downtime production deployments upon merging to the `main` branch.

## Future-Ready Scalability

The architecture is explicitly designed for modularity.

### Short-Term (Next Iteration)

1. Expand the Bento UI to support dynamically injected AI content blocks.
2. Optimize 3D asset loading using Draco compression for faster mobile experiences.

### Mid-Term

1. Integrate a Headless CMS approach for publishing deep-dive technical blog posts.
2. Expand WebXR features to allow recruiters to view 3D project architecture diagrams in Augmented Reality.

## Summary Table

| Layer       | Technology Chosen                              | Purpose & Trend Alignment                                          |
| ----------- | ---------------------------------------------- | ------------------------------------------------------------------ |
| Frontend    | React 19, Vite, Tailwind v4                    | Bento-grid UI, blistering performance, modular components.         |
| Interactive | Framer Motion, React Three Fiber, Rough.js [P] | 3D/AR storytelling, functional motion, hand-drawn aesthetics.      |
| UI Extras   | @dnd-kit, sweetalert2, react-icons, chart.js   | Drag-drop builder, alerts, icon sets, analytics charts.            |
| PWA & State | vite-plugin-pwa [P], Zustand, TanStack Query   | Offline reliability, smooth state management, edge-caching.        |
| Backend/AI  | Firebase (Auth, Firestore, Cloud Functions)    | Serverless scaling, real-time NoSQL data, secure AI API execution. |
| Deployment  | Firebase Hosting / Vercel + CI/CD              | Automated testing, global edge delivery, modern DevOps practices.  |

_[P] = Planned â€” not yet implemented/installed_
# Quality Assurance & Testing Architecture

## Overview

MekeshBuilds employs a rigorous, automated testing strategy designed to ensure enterprise-grade reliability, seamless offline PWA functionality, and flawless UI rendering across all Bento Grid and 3D Canvas modules.

The testing infrastructure is built on **Vitest** for blistering execution speeds, combined with **React Testing Library (RTL)** to enforce behavior-driven, accessible component testing.

## Current Infrastructure

### Configuration Highlights

The project utilizes the `v8` coverage provider for highly accurate, fast instrumentation.

```ts
// vitest.config.ts snippet
test: {
  environment: 'jsdom',
  globals: true,
  setupFiles: ['./src/test/setup.ts'],
  coverage: {
    provider: 'v8',
    reporter: ['text', 'html', 'lcov'],
    thresholds: {
      lines: 80,
      functions: 80,
      branches: 75,
      statements: 80,
    },
  },
}
```

### Global Test Mocks

Because the application heavily leverages modern browser APIs (WebGL, PWA Service Workers, responsive layouts), `src/test/setup.ts` isolates the jsdom environment with robust global mocks:

- `window.matchMedia` (For theme/responsive testing)
- `IntersectionObserver` & `ResizeObserver` (For scroll-driven Framer Motion animations)
- `HTMLCanvasElement.prototype.getContext` (Graceful fallback for Three.js/WebGL contexts)
- `navigator.serviceWorker` (Mocked to test PWA offline caching logic)

## Current Status & Gap Analysis

**Status:** The CI-ready testing infrastructure, global mocks, and coverage thresholds are fully configured.
**Gap:** Automated behavior verification coverage (the actual `*.test.tsx` files) is staged for the immediate next development cycle to achieve the 80% coverage mandate.

## Recommended Testing Strategy

To maximize recruiter confidence and codebase stability, the test suite is partitioned into three distinct layers:

### 1. Unit Testing (Business Logic & Hooks)

Targeting the pure functions, state orchestration, and Firebase abstraction layer.

**Target Files & Examples:**

- `src/services/authService.ts`: Verify Firebase custom claims evaluation and owner-role resolution.
- `src/services/aiService.ts`: Mock AI prompt responses to ensure consistent UI formatting.
- `src/hooks/useAutoSave.ts`: Assert strict state transitions (idle -> saving -> saved -> unsaved) across the Firestore mutation lifecycle.
- `src/hooks/useThemeEngine.ts`: Validate that dynamic CSS custom properties (Bento glows, glassmorphism) apply correctly to the DOM.

### 2. Component Testing (UI & Accessibility)

Targeting the React rendering tree utilizing RTL's accessibility-first selectors.

**Target Files & Examples:**

- `src/pages/AdminAccessPage.tsx`: Assert the client-side brute-force lockout message triggers strictly after 5 failed login attempts.
- `src/components/Bento/*`: Verify conditional rendering of bento blocks based on empty vs. populated Firestore data.
- `src/components/3D/CanvasFallback.tsx`: Ensure the WebGL error boundary successfully mounts a 2D skeleton loader if Three.js fails to initialize.

### 3. Integration Testing (Critical User Journeys)

Focusing on the intersections between the UI, global Zustand stores, and the database layer.

**Core Flows:**

1. **The Admin Journey:** Owner Login -> Zustand Hydration -> Route Guard Clearance -> Dashboard Render.
2. **The Offline PWA Journey:** Disconnect Network -> Load `/:username` -> Assert IndexedDB Cache Hits & UI rendering.
3. **The Live Builder Flow:** Edit Bento Block -> Debounce Trigger -> Firestore Mock Mutation -> UI Success Toast.

## Suggested Test Helpers

To maintain deterministic tests without pinging live production servers, the following utilities are strictly utilized:

- **Firebase Local Emulator Suite**: For simulating real Firestore security rules and authentication states during integration tests.
- **Mock Service Worker (MSW)**: For intercepting outbound REST requests (e.g., third-party API calls or simulated Edge Function AI queries).
- **Custom Render Wrapper**: A utility injecting `QueryClientProvider`, `PwaSyncProvider`, and Zustand mocks into isolated component tests.

## CLI Execution Commands

Optimized scripts mapped in `package.json`:

- `npm run test` (Standard single-run for CI pipelines)
- `npm run test:watch` (Hot-reloading for local TDD)
- `npm run test:coverage` (Generates the v8 coverage matrix)
- `npm run test:ui` (Launches the interactive Vitest UI dashboard for debugging)

## QA Best Practices Enforced

1. **Test User Behavior, Not Implementation:** Rely on `getByRole` and `getByText` over brittle `data-testid` selectors to ensure the app remains accessible.
2. **Deterministic Isolation:** Clear all mocks and reset Zustand stores in `afterEach` blocks to prevent state leakage.
3. **Graceful Degradation:** Explicitly test error states (e.g., failed AI generations, missing Firebase keys) to guarantee resilient UI fallbacks.

## Initial High-Value Test Candidates

To establish a baseline of reliability, the following test cases are prioritized:

1. `AuthGuard` correctly intercepts unauthenticated traffic and appends the `?redirectBack` parameter.
2. `AdminGuard` instantly evicts authenticated users who lack the strict Owner role.
3. `usePortfolioData` seamlessly resolves a dynamic username into a full Bento Grid context.
4. `useExportPDF` gracefully intercepts a missing DOM node and alerts the user rather than crashing the thread.
5. The `usePwaSync` hook accurately detects offline mode and surfaces the appropriate UI indicator.

## Phase 1 Test Priority (Immediate â€” Next Dev Cycle)

The infrastructure is ready. These 7 test files should be created first to establish a reliable baseline:

| Priority | Test File | What to Verify |
|----------|-----------|----------------|
| 1 | `src/routes/guards/AuthGuard.test.tsx` | Unauthenticated redirect + `?redirectBack` param appended |
| 2 | `src/routes/guards/AdminGuard.test.tsx` | Non-owner authenticated user is evicted to `/` |
| 3 | `src/services/authService.test.ts` | Owner validation chain: claims â†’ role â†’ email fallback |
| 4 | `src/hooks/useAutoSave.test.ts` | State machine: idle â†’ saving â†’ saved â†’ error transitions |
| 5 | `src/hooks/useThemeEngine.test.ts` | CSS custom property direct DOM mutation |
| 6 | `src/pages/auth/AdminAccessPage.test.tsx` | Lockout triggers after exactly 5 failed attempts |
| 7 | `src/hooks/usePortfolioData.test.ts` | Username â†’ Firestore mock â†’ full Bento data resolution |


# UI & Interaction Architecture

## UI System Overview

MekeshBuilds implements a highly modular, component-driven UI architecture designed to balance immersive 2025â€“2026 aesthetics (Bento Grids, 3D elements, glassmorphism) with strict engineering best practices.

The architecture is divided into three distinct operational layers:

1. **The Shared Primitive Library:** A localized design system ensuring absolute consistency across the PWA.
2. **The Bento Grid & 3D Canvas:** The highly dynamic, AI-mutable public interface.
3. **The Administrative Shell:** The secure, high-density control center for the live builder and analytics.

## Reusable Shared Primitives

Located in `src/components/Shared`, these components form the atomic layer of the application. They strictly consume Tailwind CSS variables (`--sys-*` and `--color-*`) to ensure seamless theme portability.

- **Interactive:** `Button`, `Input`, `Toggle`, `Tabs`
- **Data Display:** `Avatar`, `Badge`, `Tooltip`, `Card`
- **Feedback & Motion:** `Modal`, `Spinner`, `Skeleton`, `Toast`

**Design Pattern:** Primitives are completely stateless and logic-agnostic, relying entirely on props for configuration and Framer Motion for inherent micro-interactions (e.g., tap scaling).

## Layout Architecture

Located in `src/components/layout`, these structural components manage the macro-level composition and responsive behavior.

- **`AdminLayout`:** Wraps protected routes with a persistent sidebar, breadcrumb navigation, and an offline-sync status indicator.
- **`PublicLayout`:** Provides the minimalist navbar and footer surrounding the dynamic Bento Grid.

**Example Layout Composition:**

```tsx
<div className="min-h-screen bg-sys-bg-primary text-sys-text-primary selection:bg-color-glow">
  <Navbar />
  <main className="pt-20 pb-12 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <Outlet />
  </main>
</div>
```

## The Bento Grid UI Pattern

Traditional linear portfolios are replaced by the `Bento` architecture (located in `src/components/Bento/`). This UI pattern drastically reduces cognitive load by compartmentalizing information into an asymmetric, highly responsive CSS Grid.

- **Modularity:** Sections like `ExperienceBento`, `SkillsBento`, and `ProjectBento` are isolated components.
- **AI Adaptability:** The grid order dynamically shifts based on AI-assessed recruiter intent (e.g., bringing the `SkillsBento` to the top-left if the visitor is a Frontend Hiring Manager).

## 3D & WebGL Canvas Pattern

Immersive storytelling is handled in `src/components/3D/`.

- **`TechStackGlobe` / `HeroScene`:** Built with React Three Fiber, these components run on a separate WebGL canvas to prevent main-thread blocking.
- **Resilience:** Every 3D component is wrapped in a specialized Error Boundary (`CanvasFallback.tsx`) that seamlessly degrades to a 2D Framer Motion animation if WebGL is unsupported or crashes.

## Live Builder UI Pattern

The `/builder` route utilizes a powerful split-screen workflow optimized for desktop administrative tasks:

- **Left Panel (The Controller):** Accordion-based React Hook Form modules with Zod validation. Inputs immediately update the global Zustand draft state.
- **Right Panel (The Canvas):** `#live-canvas` renders the exact `PublicProfilePage` components, utilizing the `useThemeEngine` to reflect CSS variable mutations and content changes with zero latency.

## Visual Language & Aesthetics

- **Glassmorphism & Depth:** Bento cards utilize `backdrop-blur` and semi-transparent backgrounds to create a layered, modern aesthetic.
- **Organic Accents:** Sharp structural lines are intentionally broken by hand-drawn SVG borders (via Rough.js) to add human warmth.
- **Functional Illumination:** Glowing drop-shadows and vibrant accent colors are used exclusively to draw attention to primary calls-to-action or interactive 3D elements.
- **Dark-First:** The administrative shell operates strictly in dark mode to reduce eye strain during heavy content editing.

## Accessibility (a11y) & UX Standards

MekeshBuilds adheres to a "shift-left" accessibility model.

**Current Implementations:**

- **Semantic HTML:** Strict adherence to proper `<nav>`, `<main>`, `<section>`, and heading hierarchies.
- **Motion Preferences:** Framer Motion hooks automatically respect the user's OS-level `prefers-reduced-motion` settings, disabling 3D spinning and layout animations gracefully.
- **Keyboard Navigation:** Explicit `:focus-visible` styling with high-contrast outlines across all shared primitives.

**Roadmap for WCAG 2.1 AA Compliance:**

1. Implement comprehensive ARIA attributes for complex custom components (e.g., the Builder accordion and 3D canvas controls).
2. Add a persistent high-contrast toggle for recruiters with visual impairments.
3. Integrate automated a11y auditing (e.g., `eslint-plugin-jsx-a11y` and Axe) into the GitHub Actions CI pipeline.

## Component Extension Guidelines

To maintain the integrity of the UI system as the application scales:

1. **Never Duplicate Primitives:** If a core component requires a variant, extend the base `Shared` component via props rather than duplicating the code.
2. **Strict Separation of Concerns:** Keep complex Firebase/AI business logic in custom hooks; UI components should only handle rendering and motion.
3. **Design for the Edge Case:** Always design the "Empty State" and "Error State" before the "Happy Path" (e.g., what does the Projects Bento look like if no projects exist?).


# Home Page (Landing Page) â€” Revised Technical Specification

> **Version:** 2.0 | **Last Updated:** 2026-04-02 | **Status:** Active Revision
>
> This document supersedes the original `home.md`. Every section has been revised to reflect:
>
> - **Full Firebase dynamic data** â€” no section relies on static local constants in production.
> - **Bento Grid architecture** â€” the linear section-stack is replaced with a modular, asymmetric CSS Grid composition.
> - **3D & immersive visuals** â€” each section has a defined Three.js / React Three Fiber (R3F) integration or Framer Motion enhancement.
> - **Builder mode bi-directional sync** â€” all editable fields originate from Firestore and are writable through `/builder`, propagating instantly to public pages.
> - **Three new sections** introduced: `TechArsenal3DSection`, `AchievementsTimelineSection`, and `ImpactMetricsSection`.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Dynamic Data Strategy](#2-dynamic-data-strategy)
3. [Builder Mode Sync Model](#3-builder-mode-sync-model)
4. [Bento Grid Layout Specification](#4-bento-grid-layout-specification)
5. [Section-by-Section Specification](#5-section-by-section-specification)
   - 5.1 Navbar
   - 5.2 HeroSection _(Revised â€” Full 3D + Firebase)_
   - 5.3 MySkillSection _(Revised â€” Firebase-driven)_
   - 5.4 HireMe _(Revised â€” Firebase stats)_
   - 5.5 TechArsenal3DSection ðŸ†•
   - 5.6 ProjectSection _(Revised â€” Firebase-driven)_
   - 5.7 AchievementsTimelineSection ðŸ†•
   - 5.8 BlogSection _(Revised â€” Firebase-driven)_
   - 5.9 ImpactMetricsSection ðŸ†•
   - 5.10 MapSection _(Revised â€” Firebase location)_
   - 5.11 TestimonialsSection _(Revised â€” Firebase-driven)_
   - 5.12 CTASection _(Revised)_
   - 5.13 Footer _(Revised)_
6. [Backend & External Integration Matrix](#6-backend--external-integration-matrix)
7. [Builder Mode Field Map](#7-builder-mode-field-map)
8. [Performance & PWA Considerations](#8-performance--pwa-considerations)
9. [Accessibility Standards](#9-accessibility-standards)
10. [Gaps & Technical Debt](#10-gaps--technical-debt)

---

## 1. Architecture Overview

### 1.1 Page Composition

`HomePage.tsx` acts as the top-level orchestrator. It does not fetch data itself â€” it composes section components that each own their Firebase query via a custom `usePortfolioData` sub-hook or a dedicated section-level React Query hook. This maintains clean separation of concerns and enables per-section loading skeletons.

```text
HomePage.tsx
  -> SEO metadata (react-helmet-async)
  -> <Navbar />                         [Firebase: profiles]
  -> <HeroSection />                    [Firebase: profiles]
  -> <MySkillSection />                 [Firebase: skills]
  -> <HireMe />                         [Firebase: profiles.stats]
  -> <TechArsenal3DSection />           [Firebase: skills] ðŸ†•
  -> <ProjectSection />                 [Firebase: projects]
  -> <AchievementsTimelineSection />    [Firebase: certificates, experience] ðŸ†•
  -> <BlogSection />                    [Firebase: blog_posts]
  -> <ImpactMetricsSection />           [Firebase: analytics_events, profiles] ðŸ†•
  -> <MapSection />                     [Firebase: profiles.location]
  -> <TestimonialsSection />            [Firebase: testimonials]
  -> <CTASection />                     [External: ctaMailService â†’ FormSubmit]
  -> <Footer />                         [Firebase: profiles, newsletter_subscribers]
```

### 1.2 Data Ownership Principle

The single source of truth for all public-facing content is Firestore. The `/builder` admin workspace writes to Firestore. The landing page reads from Firestore. There are no local static data constants used for production content â€” `src/data/project-list.ts` and `src/data/blog-posts.ts` are relegated to development seed/fallback data only.

### 1.3 Rendering Strategy

- **Hero, Navbar, and Profile blocks**: Fetched via `usePortfolioData(ownerUsername)` which resolves the singleton owner profile from Firestore `profiles`.
- **Portfolio assets (skills, projects, blog)**: Fetched by dedicated query hooks, each independently loading, skeleton-rendering, and error-bounding.
- **Analytics / metrics**: Fetched client-side via `useAnalyticsData()` for the `ImpactMetricsSection`. Aggregated counts are stored as denormalized fields on `profiles` to reduce cold-load Firestore reads.
- **3D assets**: Lazily loaded via `React.lazy` + `<Suspense>` with 2D skeleton fallbacks. Deferred behind a `requestIdleCallback` gate to prevent blocking FCP.

---

## 2. Dynamic Data Strategy

### 2.1 Eliminating Static Local Data

| Current (Static)                  | Replacement (Dynamic â€” Firebase)                         |
| --------------------------------- | -------------------------------------------------------- |
| `src/data/project-list.ts`        | `projectService.fetchPublishedProjects(ownerId)`         |
| `src/data/blog-posts.ts`          | `contentService.fetchPublishedBlogPosts(ownerId)`        |
| In-component testimonials array   | `contentService.fetchTestimonials(ownerId)`              |
| In-component skills carousel data | `skillService.fetchPublishedSkills(ownerId)`             |
| In-component stat counters        | `profiles.stats` document field (denormalized aggregate) |
| In-component tech badge pills     | `skillService.fetchFeaturedTechBadges(ownerId)`          |
| Hero floating side card data      | `profiles.heroCards` sub-field                           |

### 2.2 Firestore Query Hooks (New/Revised)

Each section gets a single, purpose-built hook:

```ts
// Section-level hooks overview
useHeroData(ownerUsername); // profiles â€” full hero block
usePublishedSkills(ownerId); // skills where isPublished == true, orderBy sortOrder
useFeaturedProjects(ownerId); // projects where isFeatured == true, limit 6
usePublishedBlogPosts(ownerId); // blog_posts where isPublished == true, limit 3
useTestimonials(ownerId); // testimonials where isPublished == true
useCertificatesAndExperience(ownerId); // certificates + experience merged timeline
useOwnerStats(ownerId); // profiles.stats denormalized field
useTechBadges(ownerId); // skills where showIn3DBadge == true
```

### 2.3 Stale-Time Configuration

```ts
// React Query config per section type
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 min for most content
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Profile data (hero, bio) â€” longer stale window, changes infrequently
{
  staleTime: 15 * 60 * 1000;
}

// Analytics metrics â€” shorter stale window
{
  staleTime: 2 * 60 * 1000;
}
```

---

## 3. Builder Mode Sync Model

### 3.1 Principle

Every piece of content visible on the landing page has a corresponding editable field in the `/builder` workspace. The owner edits in builder, data writes to Firestore, and the public landing page reflects changes on next data fetch (or immediately via React Query cache invalidation).

### 3.2 Builder-Editable Fields for the Landing Page

```
/builder â†’ Personal Info Accordion
  â”œâ”€â”€ fullName                  â†’ HeroSection: animated name reveal
  â”œâ”€â”€ tagline                   â†’ HeroSection: role chips / headline
  â”œâ”€â”€ bio                       â†’ HeroSection: intro copy
  â”œâ”€â”€ avatarUrl                 â†’ Navbar avatar, HeroSection portrait, Footer chip
  â”œâ”€â”€ heroPortraitUrl           â†’ HeroSection: parallax portrait (can differ from avatar)
  â”œâ”€â”€ heroCards[]               â†’ HeroSection: floating stat/experience side cards
  â”œâ”€â”€ techBadgePills[]          â†’ HeroSection: floating tech badge pills (replaces Supabase label)
  â”œâ”€â”€ location.city             â†’ MapSection: base map coordinate and display label
  â”œâ”€â”€ location.lat / .lng       â†’ MapSection: embedded map center
  â”œâ”€â”€ stats.yearsExperience     â†’ HireMe: stat block
  â”œâ”€â”€ stats.projectsCompleted   â†’ HireMe / ImpactMetricsSection: stat block
  â”œâ”€â”€ stats.awardsWon           â†’ HireMe / ImpactMetricsSection: stat block
  â”œâ”€â”€ stats.competitionsEntered â†’ ImpactMetricsSection: stat block
  â””â”€â”€ availability              â†’ HireMe / CTASection: availability badge text

/builder â†’ Skills Accordion
  â”œâ”€â”€ Per-skill: name, category, proficiencyLevel, iconUrl, sortOrder, isPublished
  â”œâ”€â”€ showIn3DBadge (bool)      â†’ TechArsenal3DSection: floating 3D globe
  â””â”€â”€ featuredOnLanding (bool)  â†’ MySkillSection: carousel

/builder â†’ Projects Accordion
  â”œâ”€â”€ Per-project: title, description, techStack[], thumbnailUrl, repoUrl, liveUrl
  â”œâ”€â”€ isFeatured (bool)         â†’ ProjectSection: featured carousel
  â””â”€â”€ sortOrder                 â†’ ProjectSection: display order

/builder â†’ Content Accordion
  â”œâ”€â”€ Blog posts: title, excerpt, slug, coverImageUrl, tags[], isPublished
  â”œâ”€â”€ Testimonials: name, role, company, avatarUrl, text, rating, isPublished
  â””â”€â”€ Gallery items

/builder â†’ Experience & Certificates Accordion
  â”œâ”€â”€ Experience: role, company, startDate, endDate, description, type
  â””â”€â”€ Certificates: name, issuer, date, credentialUrl, badgeUrl
      â†’ AchievementsTimelineSection: rendered timeline entries
```

### 3.3 Real-Time Preview in Builder

The `/builder` right-panel (`#live-canvas`) renders the `PublicProfilePage` (which shares section components with `HomePage`). When the admin edits any field:

1. `builderStore.patchProfile(partial)` fires â†’ `isDirty = true`
2. `useThemeEngine` applies CSS variable changes instantly (zero-latency for color/typography mutations)
3. `useAutoSave` debounces (800ms) â†’ React Query mutation â†’ Firestore write
4. `queryClient.invalidateQueries(['portfolio', username])` â†’ sections re-fetch and re-render in the live canvas

This means the admin sees an exact preview of what recruiters will see, updated in near-real-time.

### 3.4 Removing the Supabase Tech Badge

The hero floating tech pill that still shows the Supabase logo must be replaced. `techBadgePills[]` on the `profiles` document becomes the source. The builder exposes a chip editor where the owner can add/remove/reorder badge pills from their `skills` collection. This eliminates all hardcoded visual references to Supabase.

---

## 4. Bento Grid Layout Specification

### 4.1 Philosophy

The landing page abandons the traditional full-width sequential section stack in favor of a **nested Bento Grid system**. Top-level sections remain full-width (for breathing room and visual anchoring), but the _content within_ each section is composed as an asymmetric CSS Grid of Bento blocks. This creates a magazine-quality reading experience recruiters can scan non-linearly.

### 4.2 Grid Token System

```css
/* src/styles/base/bento.css */
:root {
  --bento-gap: 1rem; /* Inner gap between Bento blocks */
  --bento-radius: 1.25rem; /* Default rounded-xl block radius */
  --bento-radius-lg: 1.75rem; /* Larger blocks */
  --bento-bg: var(--color-glass);
  --bento-border: rgba(255, 255, 255, 0.08);
  --bento-shadow: 0 4px 32px rgba(0, 0, 0, 0.18);
  --bento-glow-shadow: 0 0 20px var(--color-glow);
}
```

### 4.3 Responsive Bento Grid Pattern (Standard)

```tsx
// Standard 3-column Bento Grid used across sections
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[var(--bento-gap)]">
  {/* Wide feature block */}
  <motion.div className="col-span-1 md:col-span-2 row-span-2 ..."> ... </motion.div>
  {/* Tall stack block */}
  <motion.div className="col-span-1 row-span-2 ..."> ... </motion.div>
  {/* Standard block */}
  <motion.div className="col-span-1 ..."> ... </motion.div>
  {/* Standard block */}
  <motion.div className="col-span-1 ..."> ... </motion.div>
</div>
```

### 4.4 Shared Bento Block Component

All section content blocks extend the base `<BentoBlock>` primitive from `src/components/Bento/`:

```tsx
<BentoBlock
  variant="glass" | "solid" | "gradient" | "3d-canvas"
  size="1x1" | "2x1" | "1x2" | "2x2"
  glow={true}
  editable={isBuilderMode}        // Shows inline edit overlay in builder
  onEdit={() => openBuilderTab('skills')}
>
  { children }
</BentoBlock>
```

The `editable` prop (only truthy in builder mode) renders a subtle pencil-icon overlay on hover, letting the admin click directly on a Bento block to jump to its builder accordion tab â€” a zero-friction editing UX.

---

## 5. Section-by-Section Specification

---

### 5.1 Navbar

**Purpose:** Global navigation, auth access, live profile chip.

**Changes from original:**

- Profile avatar, name, and role are sourced from Firestore `profiles` (not Firebase Auth fallback). Auth user is the fallback only if the Firestore doc is missing.
- The "Sign in" button route is corrected to `/admin-access` (aligned with the actual router definition, resolving the route mismatch noted in the original audit).
- Notification flyout for the owner shows real-time resume download events from Firestore `analytics_events` (using `onSnapshot` subscription, limited to last 10 events).

**Firebase Integration:**

```ts
// Navbar data fetch
const { data: profile } = useQuery({
  queryKey: ['ownerProfile'],
  queryFn: () => profileService.fetchOwnerProfile(),
  staleTime: 15 * 60 * 1000,
});
```

**3D / Motion Enhancement:**

- Brand logo on scroll animates with a subtle `glow-pulse` keyframe powered by the `--color-glow` CSS variable.
- The scroll progress indicator bar color inherits from `--color-primary` (builder-customizable).

**Builder Sync Fields:** `fullName`, `avatarUrl`, `tagline`

---

### 5.2 HeroSection (Revised â€” Full 3D + Firebase)

**Purpose:** Primary personal brand statement, immersive 3D visual centerpiece.

**Critical Fix â€” Supabase Badge:**
The floating tech badge pill array is replaced entirely. `profiles.techBadgePills[]` (array of `{ label, iconUrl, color }`) is rendered in place of the hardcoded badge list. The admin adds/removes pills from the builder's Personal Info accordion. On initial load, these are seeded from the owner's `skills` collection where `showIn3DBadge == true`.

**Firebase Integration:**

```ts
const { data: hero, isLoading } = useHeroData(ownerUsername);
// Resolves: fullName, tagline, bio, heroPortraitUrl, techBadgePills[], heroCards[]
// Source: Firestore 'profiles' document
```

**Bento Grid Layout (within section):**

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  Name + Role + Bio           â”‚  3D Canvas       â”‚
â”‚  (col-span-2, large text)    â”‚  (col-span-1,    â”‚
â”‚                              â”‚   row-span-2)    â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤                  â”‚
â”‚  Stat Card  â”‚  CTA Buttons   â”‚                  â”‚
â”‚  (dynamic)  â”‚                â”‚                  â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**3D Canvas â€” `HeroCanvasR3F` (Revised):**

The hero canvas is upgraded from a static ambient scene to a **fully reactive, data-driven 3D environment**:

- **Morphing Portrait Mesh**: The owner's `heroPortraitUrl` is loaded as a texture onto a displacement-mapped plane geometry. The mesh subtly warps using a Simplex noise shader â€” responding to mouse pointer movement via a `useFrame` listener. This replaces the static parallax portrait.
- **Dynamic Tech Orbit Ring**: The `techBadgePills[]` array from Firestore drives a set of 3D floating badge sprites orbiting around the portrait mesh. Each badge is a `<sprite>` node rendered with the icon's `iconUrl` as a transparent texture. Badge count, icons, and colors update instantly when the admin edits the builder.
- **Energy Particle Field**: A buffer geometry particle system (`THREE.Points`) generating 800 particles in accent color `--color-primary`, driven by Simplex noise for organic drift. Density and color are configurable via the Theme Studio.
- **Ambient Glow Volumes**: Three `THREE.PointLight` instances positioned behind the portrait mesh, with intensities animated by Framer Motion spring values responding to cursor proximity.
- **WebGL Fallback**: `CanvasFallback.tsx` renders a 2D Framer Motion animated portrait with CSS radial glow if WebGL is unsupported or throws.
- **Reduced Motion**: `prefers-reduced-motion` disables all Three.js animation loops and falls back to a static image.

**Floating Hero Side Cards (Dynamic):**

The floating stat/experience cards previously hardcoded are now rendered from `profiles.heroCards[]`:

```ts
interface HeroCard {
  type: 'stat' | 'badge' | 'experience';
  label: string;
  value: string;
  iconUrl?: string;
  accentColor?: string; // Inherits from --color-primary if unset
}
```

The admin configures up to 4 hero cards in the builder. Cards animate in with staggered Framer Motion `spring` transitions.

**Builder Sync Fields:** `fullName`, `tagline`, `bio`, `heroPortraitUrl`, `techBadgePills[]`, `heroCards[]`, `availability`

---

### 5.3 MySkillSection (Revised â€” Firebase-Driven)

**Purpose:** Showcase core capabilities in an interactive rotating card slider.

**Changes from original:** Skill cards are fetched from Firestore `skills` collection instead of in-component constants. The admin marks skills as `featuredOnLanding: true` in the builder to control which appear in the carousel.

**Firebase Integration:**

```ts
const { data: skills, isLoading } = usePublishedSkills(ownerId, {
  filter: { featuredOnLanding: true },
  orderBy: 'sortOrder',
});
// Source: Firestore 'skills' collection
```

**Bento Grid Layout (within section):**

Skills are rendered in a 3-column Bento grid on desktop (carousel on mobile), replacing the previous single-carousel approach for desktop viewports:

- Column 1: Featured skill (large `2x2` Bento block with a Lottie/3D icon and proficiency ring)
- Columns 2â€“3: Grid of smaller `1x1` skill Bento blocks
- A "View All Skills" overflow chip appears when more than 9 skills are published

**3D / Motion Enhancement:**

- Each skill card Bento block uses `Rough.js` to render a hand-drawn SVG border on hover â€” organic contrast against the rigid grid lines.
- The large featured skill block includes a mini R3F canvas rendering the skill's icon as a 3D floating icon model (`.glb`) if a `modelUrl` is set on the skill document; otherwise a 2D icon is shown.
- The proficiency level (0â€“100) drives an animated SVG arc ring.

**Builder Sync Fields:** All `skills` collection fields: `name`, `category`, `proficiencyLevel`, `iconUrl`, `modelUrl`, `sortOrder`, `isPublished`, `featuredOnLanding`

---

### 5.4 HireMe (Revised â€” Firebase Stats)

**Purpose:** Conversion section explaining hiring value and dynamic achievements.

**Changes from original:** The four glassmorphism stat blocks were hardcoded. They now consume `profiles.stats`:

```ts
interface ProfileStats {
  yearsExperience: number;
  projectsCompleted: number;
  awardsWon: number;
  competitionsEntered: number;
  customStatLabel?: string; // Optional custom 5th stat (e.g., "GitHub Stars")
  customStatValue?: string;
}
```

The animated number counters (`react-countup`) increment from 0 to the live Firestore value on scroll-enter.

**Firebase Integration:**

```ts
const { data: profile } = useHeroData(ownerUsername);
// profiles.stats sub-field drives all stat blocks
```

**Bento Grid Layout (within section):**

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  Portrait + Ripple 3D   â”‚  Stat Block  â”‚  Stat Block  â”‚
â”‚  (col-span-1, row-2)    â”‚              â”‚              â”‚
â”‚                         â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                         â”‚  Availability CTA Banner    â”‚
â”‚                         â”‚  (driven by profiles.avail) â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**3D / Motion Enhancement:**

- The 7-ring ripple system behind the portrait becomes a fully 3D concentric torus mesh stack rendered via R3F. Each ring is an independently rotating `THREE.TorusGeometry` with a wireframe material in the accent color. Ring speed and opacity are configurable in Theme Studio.
- The "hover energy aura" uses a `THREE.ShaderMaterial` custom radial bloom that responds to pointer proximity, using `useSpring` from Framer Motion to interpolate bloom intensity.

**Builder Sync Fields:** `stats.*`, `availability`, `heroPortraitUrl`

---

### 5.5 TechArsenal3DSection ðŸ†•

**Purpose:** An immersive, recruiter-unforgettable interactive 3D showcase of the full technology stack â€” far beyond a typical "skills list". Positions the owner as a practitioner of a broad, modern toolkit, with depth visible on interaction.

**Design Concept:**

A full-width dark Bento block containing a `<canvas>` rendered by React Three Fiber. Technologies are represented as 3D floating icon spheres arranged in a **force-directed 3D graph**. Spheres are grouped by category (Frontend, Embedded, Backend, AI/ML, Tools) with glowing category orbit lanes. On hover, a sphere zooms forward, rotates to face the camera, and expands a glassmorphism tooltip card beneath the canvas showing `{ name, proficiencyLevel, yearsUsed, projectsUsedIn }`.

**Firebase Integration:**

```ts
const { data: techStack, isLoading } = useQuery({
  queryKey: ['techBadges3D', ownerId],
  queryFn: () => skillService.fetchTechArsenal(ownerId),
  // Returns all skills where showIn3DBadge == true, with category grouping
  staleTime: 10 * 60 * 1000,
});
// Source: Firestore 'skills' collection
```

**Feature Breakdown:**

1. **Force-Directed 3D Graph Layout**
   - Uses `d3-force-3d` to compute initial sphere positions in 3D space, avoiding overlaps while maintaining category clustering.
   - Category groups are color-coded via CSS variables: Frontend (`--color-primary`), Embedded (`--color-warning`), Backend (`--color-success`), AI/ML (`--color-info`), Tools (`--color-secondary`).
   - Each sphere node is a `THREE.Mesh` with a `THREE.MeshStandardMaterial` using the tech icon as a texture decal.

2. **Interactive Sphere Controls**
   - `OrbitControls` (Drei) allow recruiter to freely rotate the entire constellation.
   - Click a sphere: camera lerps toward it using `useCameraLerp` hook, centering that tech in frame and expanding the detail tooltip.
   - Touch/drag support for mobile PWA.

3. **Category Orbit Lanes**
   - Semi-transparent `THREE.TorusGeometry` rings for each category group â€” serving as visual separators and depth cues.
   - Ring opacity pulses on the active hovered category.

4. **Live Proficiency Aura**
   - Sphere scale and emissive glow intensity are proportional to `proficiencyLevel`. Expert-level techs (90+) cast a visible point-light bloom into the scene.

5. **Animated Entry Sequence**
   - On first mount, all spheres start at the scene origin and `spring`-expand outward to their computed positions over 1.2 seconds with staggered delays per category group.

6. **Glassmorphism Tooltip Card (HTML Overlay)**
   - Rendered as a DOM overlay (not WebGL) using `drei`'s `<Html>` component for crisp text rendering.
   - Shows: icon, name, category badge, proficiency ring, years of experience, and "Used in N projects" count.

7. **Fallback**
   - On WebGL failure or reduced-motion preference: a standard Bento Grid of skill category columns renders, using the same Firestore data.

**Bento Grid Layout (section shell):**

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  Section Header: "Tech Arsenal" + subtitle            â”‚
â”‚  (full-width text block, col-span-3)                  â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚  3D Canvas Block (col-span-2, row-span-2, large)      â”‚  Tooltip Card (col-span-1)
â”‚  [R3F Scene â€” force-directed sphere graph]            â”‚  [Active sphere detail]
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚  Category Filter Chips              â”‚  Legend Block   â”‚
â”‚  (Frontend | Embedded | Backend...) â”‚  color coding   â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Builder Sync Fields (per skill):** `name`, `category`, `proficiencyLevel`, `iconUrl`, `yearsUsed`, `showIn3DBadge`, `sortOrder`, `isPublished`

**Builder UI:** In the Skills accordion, a toggle `"Show in 3D Arsenal"` (maps to `showIn3DBadge`) controls inclusion. Category color assignment is set per-category in Theme Studio.

**Performance Notes:**

- R3F canvas is lazily mounted via `React.lazy` + `Suspense` behind a skeleton.
- Sphere geometries are shared via `instancedMesh` if skill count exceeds 30 to minimize draw calls.
- Icon textures are loaded via `useTexture` (Drei), which de-duplicates and caches them.

---

### 5.6 ProjectSection (Revised â€” Firebase-Driven)

**Purpose:** Showcase project portfolio with rich interactions and a detail modal.

**Changes from original:** All project data migrates from `src/data/project-list.ts` to Firestore `projects`. The `isFeatured` flag controls the carousel. `isPublished` controls visibility.

**Firebase Integration:**

```ts
const { data: projects, isLoading } = useFeaturedProjects(ownerId, {
  filter: { isFeatured: true, status: 'published' },
  orderBy: 'sortOrder',
  limit: 6,
});
// Source: Firestore 'projects' collection
```

**Bento Grid Layout (within section):**

- Featured carousel becomes the center `2x2` Bento hero block.
- Secondary projects render as a `1x1` Bento grid row beneath.
- Project modal now includes deep-link URL (`/:username/projects/:id`) for PWA sharability.

**3D / Motion Enhancement:**

- The pointer-driven 3D tilt/parallax (previously in-component) is extracted to a shared `useTilt3D` hook and applied uniformly to all project Bento blocks.
- Featured project screenshot in the carousel supports a `glTF` scene preview if a `modelUrl` is set on the project document â€” allowing 3D architecture diagrams to replace static screenshots.

**Builder Sync Fields:** All `projects` collection fields: `title`, `description`, `techStack[]`, `thumbnailUrl`, `liveUrl`, `repoUrl`, `isFeatured`, `status`, `sortOrder`, `modelUrl`

---

### 5.7 AchievementsTimelineSection ðŸ†•

**Purpose:** A visually rich, chronological narrative of the owner's certifications, awards, competitions, and industrial training â€” presented as an interactive 3D timeline that makes the resume's achievements tangible and memorable to recruiters.

**Design Concept:**

A horizontal scrolling timeline on desktop (vertical on mobile). Each milestone is a floating glassmorphism card anchored to a 3D spine â€” a glowing `THREE.CatmullRomCurve3` bezier path rendered in R3F. Milestone cards are positioned along the curve using `THREE.Vector3` positions computed from the timeline's date distribution. The scene has a parallax scroll effect: as the user scrolls the page, the 3D camera tracks laterally along the timeline curve.

**Firebase Integration:**

```ts
const { data: timeline, isLoading } = useCertificatesAndExperience(ownerId);
// Merges and sorts: Firestore 'certificates' + 'experience' collections
// Adds: achievements[] from profiles.stats.achievements[]
// Source: Firestore 'certificates' and 'experience' collections
```

**Merged Timeline Interface:**

```ts
interface TimelineEntry {
  id: string;
  type: 'certificate' | 'award' | 'experience' | 'training' | 'education';
  title: string;
  organization: string;
  date: Timestamp;
  description?: string;
  credentialUrl?: string;
  badgeUrl?: string; // For certificates â€” rendered as texture on 3D badge
  accentColor?: string; // Per-entry color; defaults to --color-primary
  isFeatured: boolean; // Featured entries get larger cards and more glow
}
```

**Feature Breakdown:**

1. **3D Bezier Spine**
   - A `THREE.TubeGeometry` built from a `CatmullRomCurve3` interpolating through milestone positions.
   - The tube glows with an animated `emissiveIntensity` shader, pulsing like a fiber optic cable.
   - Milestone nodes are `THREE.SphereGeometry` markers â€” size proportional to `isFeatured`.

2. **Floating Certificate Badges (3D)**
   - Certificates with a `badgeUrl` get a 3D badge model: a `THREE.CylinderGeometry` disc with the badge image as a decal texture on the top face.
   - On hover, the badge tilts 15Â° toward the camera and emits a `PointLight`.
   - Clicking opens the `credentialUrl` in a new tab.

3. **Parallax Scroll Camera Track**
   - A `useScroll` (Drei) listener drives `camera.position` along the Bezier curve as the section scrolls into and through the viewport.
   - This creates the effect that the recruiter is "flying through time" along the career path.
   - On mobile / reduced-motion: static vertical list replaces the parallax camera.

4. **Milestone Card HTML Overlays**
   - Each milestone uses Drei's `<Html>` for the card content (crisp text, no WebGL font rendering).
   - Cards use glassmorphism styling with `backdrop-blur-md` and a left accent border in `accentColor`.
   - Featured entries get `row-span-2` Bento height equivalents within the card layout.

5. **Entry Type Icons**
   - Each `type` has a unique Rough.js hand-drawn SVG icon (certificate scroll, award ribbon, briefcase, factory building, graduation cap) rendered in the `--color-primary` accent.
   - These reinforce the "organic warmth" visual language.

6. **Category Filter Row**
   - Pill filter chips above the timeline: `All | Certificates | Awards | Experience | Training`
   - Active filter smoothly hides non-matching nodes via `AnimatePresence` + `layout` props.
   - Filter state is local React state (not Firestore) â€” client-side only.

7. **Fallback (No WebGL)**
   - Renders a clean Framer Motion staggered vertical list of `TimelineEntry` cards with Rough.js decorative borders.

**Bento Grid Layout (section shell):**

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  Section Header + Category Filter Chips (col-span-3) â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚  3D Timeline Canvas                                  â”‚
â”‚  (full-width, col-span-3, row-span-3)               â”‚
â”‚  [R3F scene â€” Bezier spine + floating cards]         â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚  "Download Resume PDF" CTA Block (col-span-3)        â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Builder Sync Fields:**

- `certificates` collection: `name`, `issuer`, `date`, `credentialUrl`, `badgeUrl`, `isFeatured`
- `experience` collection: `role`, `company`, `startDate`, `endDate`, `description`, `type`, `isFeatured`
- `profiles.stats.achievements[]`: ad hoc award entries that don't fit the above collections

---

### 5.8 BlogSection (Revised â€” Firebase-Driven)

**Purpose:** Promote technical writing and thought content.

**Changes from original:** Blog post data migrates from `src/data/blog-posts.ts` to Firestore `blog_posts`. Posts shown on the landing page are controlled by `isPublished: true` and `featuredOnLanding: true` flags set in the builder's Content accordion.

**Firebase Integration:**

```ts
const { data: posts, isLoading } = usePublishedBlogPosts(ownerId, {
  filter: { isPublished: true, featuredOnLanding: true },
  limit: 3,
  orderBy: ['publishedAt', 'desc'],
});
// Source: Firestore 'blog_posts' collection
```

**Bento Grid Layout (within section):**

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  Featured Post            â”‚  Post 2    â”‚  Post 3    â”‚
â”‚  (col-span-1, row-span-2) â”‚ (standard) â”‚ (standard) â”‚
â”‚  Large cover + excerpt    â”‚            â”‚            â”‚
â”‚                           â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                           â”‚  "View All Articles" â†’  â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**3D / Motion Enhancement:**

- Each blog card Bento block animates with the shared `useTilt3D` hook.
- The featured post card uses a `THREE.PlaneGeometry` cover image mesh in a mini R3F canvas, with a subtle wave displacement shader on hover â€” making the cover image feel 3D and tactile.

**Builder Sync Fields (per blog post):** `title`, `excerpt`, `slug`, `coverImageUrl`, `tags[]`, `publishedAt`, `isPublished`, `featuredOnLanding`, `readTimeMinutes`

---

### 5.9 ImpactMetricsSection ðŸ†•

**Purpose:** Deliver a data-driven, quantified argument for hiring the owner. Combines animated live stats with subtle data visualization, creating a "mission control dashboard" feel that differentiates the portfolio from all text-and-image alternatives.

**Design Concept:**

A full-width dark-glass section rendered as a multi-column Bento dashboard. Numbers animate as counters on scroll-enter. A subtle 3D data visualization (live bar/scatter WebGL chart) floats in one of the large Bento blocks. The entire section pulses gently with ambient particle activity, communicating active engineering output.

**Firebase Integration:**

```ts
// Primary: denormalized stats from profiles document (fast, 1 read)
const { data: stats } = useOwnerStats(ownerId);
// profiles.stats field: { projectsCompleted, awardsWon, competitionsEntered,
//                         githubCommitsThisYear, skillsPublished,
//                         resumeDownloads, portfolioViews }

// Secondary: recent analytics events for live chart data
const { data: analyticsChart } = useAnalyticsChartData(ownerId, {
  range: 'last30days',
  metric: 'portfolio_views',
});
// Source: Firestore 'analytics_events' â€” aggregated by day, last 30 days
```

**Denormalized Stats Strategy:**
To avoid expensive aggregation queries on page load, metric counts are maintained as denormalized fields on the `profiles` document. A Firebase Cloud Function (trigger: `onCreate` on relevant collections) increments these counters atomically. This means the section always loads in a single Firestore document read.

**Feature Breakdown:**

1. **Animated Counter Bento Blocks**
   - 6 animated counter blocks, each showing one metric with an icon, value, and context label.
   - Counters use `react-countup` (triggered by `IntersectionObserver` on section entry).
   - Each block has a colored left-border accent per metric category.

   | Block                 | Metric                        | Icon | Firebase Source  |
   | --------------------- | ----------------------------- | ---- | ---------------- |
   | Projects Shipped      | `stats.projectsCompleted`     | ðŸš€   | `profiles.stats` |
   | Awards Won            | `stats.awardsWon`             | ðŸ†   | `profiles.stats` |
   | Competitions Entered  | `stats.competitionsEntered`   | âš¡   | `profiles.stats` |
   | GitHub Commits (Year) | `stats.githubCommitsThisYear` | ðŸ’»   | `profiles.stats` |
   | Skills Published      | `stats.skillsPublished`       | ðŸ› ï¸   | `profiles.stats` |
   | Portfolio Views       | `stats.portfolioViews`        | ðŸ‘ï¸   | `profiles.stats` |

2. **Live Portfolio Engagement Chart (3D Bar Chart)**
   - A large `2x2` Bento block containing an R3F scene rendering a **3D bar chart** of portfolio views over the last 30 days.
   - Each day's bar is a `THREE.BoxGeometry` extruded from a ground plane, colored by relative intensity (`--color-primary` gradient from dim to full saturation).
   - Bars animate upward on mount using `useSpring` from `@react-spring/three`.
   - Hovering a bar shows a `<Html>` tooltip with date and exact view count.
   - Fallback: renders a standard `chart.js` 2D line chart if WebGL unavailable.

3. **GitHub Contribution Heatmap Strip**
   - A horizontal strip Bento block rendering a miniaturized GitHub-style contribution heatmap using `d3` and SVG (not fetched from GitHub API â€” sourced from `profiles.stats.weeklyContributions[]` array maintained by the owner or a Cloud Function).
   - Heatmap cells glow in `--color-primary` accent.

4. **Activity Feed Ticker**
   - A narrow vertical Bento block showing a live-scrolling ticker of recent analytics events (project clicks, resume downloads) from Firestore `analytics_events` using a `onSnapshot` real-time subscription.
   - Events appear with a slide-in animation from the bottom.
   - Shows event type icon, label, and relative time (e.g., "Resume downloaded Â· 3 min ago").
   - This shows recruiters that the portfolio is actively visited â€” social proof through live activity.

5. **"Open to Work" Availability Banner**
   - A bottom-anchored Bento chip: `profiles.availability` string (e.g., "Open to GET roles â€” Graduating June 2026") with a glowing animated dot.
   - Color: green for open, amber for selective, grey for unavailable â€” driven by `profiles.availabilityStatus` enum.

**Bento Grid Layout (within section):**

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  Counter Block â”‚  Counter Block â”‚  Counter Block â”‚
â”‚  Projects      â”‚  Awards        â”‚  Competitions  â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚  Counter Block â”‚  Counter Block â”‚  Counter Block â”‚
â”‚  GitHub        â”‚  Skills        â”‚  Views         â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤                â”‚
â”‚  3D Portfolio Views Chart       â”‚  Activity Feed â”‚
â”‚  (col-span-2, row-span-2)       â”‚  Ticker        â”‚
â”‚                                 â”‚  (col-span-1,  â”‚
â”‚                                 â”‚   row-span-2)  â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚  GitHub Contribution Heatmap + Availability Band â”‚
â”‚  (col-span-3, compact strip)                     â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Builder Sync Fields:**

- `profiles.stats.*`: All counter values are editable in the builder's Personal Info â†’ Stats tab.
- `profiles.availability`: Free-text field in builder.
- `profiles.availabilityStatus`: Enum dropdown in builder (`open` | `selective` | `unavailable`).
- `profiles.stats.weeklyContributions[]`: 52-entry array for heatmap, editable or auto-updated via Cloud Function.

---

### 5.10 MapSection (Revised â€” Firebase Location)

**Purpose:** Show collaboration geography and location-based credibility.

**Changes from original:** `profiles.location` (Firestore) replaces the hardcoded default coordinates. The admin sets their city, lat/lng, and timezone from the builder.

**Firebase Integration:**

```ts
const { data: profile } = useHeroData(ownerUsername);
// profile.location: { city, lat, lng, timezone, remoteAvailable }
```

**Builder Sync Fields:** `profiles.location.city`, `profiles.location.lat`, `profiles.location.lng`, `profiles.location.remoteAvailable`

**3D / Motion Enhancement:** No change to the embedded Google Maps approach. The animated panel overlays use Framer Motion entrance transitions consistent with other sections.

---

### 5.11 TestimonialsSection (Revised â€” Firebase-Driven)

**Purpose:** Social proof and trust reinforcement.

**Changes from original:** All testimonial data migrates from the in-component local array to Firestore `testimonials`. The admin adds/removes/edits testimonials via the builder's Content accordion.

**Firebase Integration:**

```ts
const { data: testimonials, isLoading } = useTestimonials(ownerId, {
  filter: { isPublished: true },
  orderBy: 'sortOrder',
});
// Source: Firestore 'testimonials' collection
```

**Bento Grid Layout:** Testimonials are arranged in a masonry-style Bento grid (alternating `1x1` and `1x2` height blocks) rather than a pure horizontal scroll, creating a more editorial feel.

**3D / Motion Enhancement:** Reviewer avatar images are rendered on `THREE.CircleGeometry` meshes in a mini R3F canvas per card, with a subtle ring-rotation shader. This differentiates the avatars from standard `<img>` circles without heavy computational cost.

**Builder Sync Fields (per testimonial):** `name`, `role`, `company`, `avatarUrl`, `text`, `rating`, `isPublished`, `sortOrder`

---

### 5.12 CTASection (Revised)

**Purpose:** Primary lead capture and contact conversion.

**Changes from original:** The availability copy within the CTA is driven from `profiles.availability` (same field as ImpactMetricsSection). No structural integration change â€” FormSubmit remains the external delivery mechanism.

**3D / Motion Enhancement:** The 3D tilt effect on the CTA frame is upgraded to use `useTilt3D` (the shared hook) for consistency. A subtle R3F background of slow-drifting particles fills the section canvas.

---

### 5.13 Footer (Revised)

**Route Mismatch Fix:**
Footer CTA and access links that previously pointed to `/admin-access` are confirmed correct (this IS the right route per the actual router). Documentation inconsistency resolved.

**Firestore newsletter write remains** (no change):

```ts
// Firestore write: newsletter_subscribers/{email}
{ email: string, subscribed_at: Timestamp }
```

**Dynamic Profile Chip:** Footer profile chip sources from `profiles` via the shared `useHeroData` hook (already in cache from Hero). No additional Firestore read.

---

## 6. Backend & External Integration Matrix

| Section                 | Integration Type   | Source / Target                       | Behavior                                    |
| ----------------------- | ------------------ | ------------------------------------- | ------------------------------------------- |
| Navbar                  | Firebase read      | `profiles`                            | Profile avatar, name, role for nav chip     |
| Navbar notifications    | Firebase realtime  | `analytics_events` (onSnapshot)       | Live owner notification feed                |
| Hero                    | Firebase read      | `profiles`                            | Full hero block data + tech badge pills     |
| MySkillSection          | Firebase read      | `skills` (featuredOnLanding)          | Carousel skill cards                        |
| TechArsenal3D ðŸ†•        | Firebase read      | `skills` (showIn3DBadge)              | 3D force-directed sphere graph              |
| HireMe                  | Firebase read      | `profiles.stats`                      | Stat block counter values                   |
| ProjectSection          | Firebase read      | `projects` (isFeatured)               | Featured carousel + grid                    |
| AchievementsTimeline ðŸ†• | Firebase read      | `certificates` + `experience`         | 3D Bezier timeline entries                  |
| BlogSection             | Firebase read      | `blog_posts` (featuredOnLanding)      | Blog card grid                              |
| ImpactMetrics ðŸ†•        | Firebase read      | `profiles.stats` + `analytics_events` | Counter blocks + 3D chart + activity ticker |
| MapSection              | Firebase read      | `profiles.location`                   | Map center coordinates                      |
| TestimonialsSection     | Firebase read      | `testimonials`                        | Masonry testimonial grid                    |
| CTASection              | External API write | FormSubmit endpoint                   | Lead capture email delivery                 |
| Footer                  | Firebase read      | `profiles`                            | Profile chip (from cache)                   |
| Footer newsletter       | Firebase write     | `newsletter_subscribers`              | Subscriber email upsert                     |

---

## 7. Builder Mode Field Map

This table serves as the implementation contract between the landing page and the `/builder` admin workspace.

| Builder Accordion Tab  | Editable Field         | Landing Page Target       | Section                       |
| ---------------------- | ---------------------- | ------------------------- | ----------------------------- |
| Personal Info          | `fullName`             | Name reveal heading       | Hero                          |
| Personal Info          | `tagline`              | Role chips / headline     | Hero                          |
| Personal Info          | `bio`                  | Intro paragraph           | Hero                          |
| Personal Info          | `heroPortraitUrl`      | Parallax portrait mesh    | Hero                          |
| Personal Info          | `techBadgePills[]`     | Floating 3D badge orbit   | Hero                          |
| Personal Info          | `heroCards[]`          | Floating stat side cards  | Hero                          |
| Personal Info          | `availability`         | Availability badge        | HireMe, ImpactMetrics, CTA    |
| Personal Info          | `availabilityStatus`   | Color of availability dot | ImpactMetrics                 |
| Personal Info          | `stats.*`              | All counter blocks        | HireMe, ImpactMetrics         |
| Personal Info          | `location.*`           | Map embed center          | MapSection                    |
| Skills                 | `featuredOnLanding`    | Skill carousel            | MySkillSection                |
| Skills                 | `showIn3DBadge`        | 3D Arsenal globe          | TechArsenal3D                 |
| Skills                 | All skill fields       | Both skill sections       | MySkillSection, TechArsenal3D |
| Projects               | `isFeatured`           | Featured carousel         | ProjectSection                |
| Projects               | All project fields     | Full project display      | ProjectSection                |
| Content â†’ Blog         | `featuredOnLanding`    | Blog card grid            | BlogSection                   |
| Content â†’ Blog         | All blog fields        | Blog cards                | BlogSection                   |
| Content â†’ Testimonials | All fields             | Masonry grid              | TestimonialsSection           |
| Experience             | All experience fields  | Timeline entries          | AchievementsTimeline          |
| Certificates           | All certificate fields | Timeline entries          | AchievementsTimeline          |

---

## 8. Performance & PWA Considerations

### 8.1 R3F Canvas Budget

The page now contains up to 4 R3F canvas instances simultaneously (Hero, TechArsenal3D, BlogSection featured, ImpactMetrics chart). To prevent GPU overload:

- All R3F canvases share a single WebGL renderer via `@react-three/fiber`'s `frameloop="demand"` mode â€” frames render only on state change, not on every animation frame.
- The `TechArsenal3DSection` and `AchievementsTimelineSection` canvases are deferred: they only mount when the section enters the viewport (`IntersectionObserver` gate) and unmount when fully scrolled out.
- Device performance tier detection (via `navigator.hardwareConcurrency` and a GPU benchmark heuristic) reduces sphere count in TechArsenal3D on low-end devices.

### 8.2 Firestore Read Budget (Landing Page Cold Load)

Estimated Firestore reads on a cold page load:

| Query                      | Reads  | Notes                                                             |
| -------------------------- | ------ | ----------------------------------------------------------------- |
| `profiles` (owner)         | 1      | Shared across Hero, HireMe, Navbar, Footer, Map                   |
| `skills` (published)       | ~1     | All skills in one query, filtered client-side for carousel vs. 3D |
| `projects` (featured)      | ~1     | Limit 6                                                           |
| `blog_posts` (featured)    | ~1     | Limit 3                                                           |
| `testimonials` (published) | ~1     | Limit 10                                                          |
| `certificates`             | ~1     |                                                                   |
| `experience`               | ~1     |                                                                   |
| `analytics_events` (chart) | ~1     | Aggregated query, last 30 days by day                             |
| **Total**                  | **~8** | Served from IndexedDB cache on repeat visits                      |

On repeat visits with IndexedDB cache active (PWA), all 8 reads are served from cache with zero network latency â€” landing page renders instantly.

### 8.3 Lazy Loading Strategy

```ts
// All heavy R3F components are lazily loaded
const HeroCanvasR3F = lazy(() => import('../components/3D/HeroCanvasR3F'));
const TechArsenalCanvas = lazy(() => import('../components/3D/TechArsenalCanvas'));
const TimelineCanvas = lazy(() => import('../components/3D/TimelineCanvas'));
const ImpactChartCanvas = lazy(() => import('../components/3D/ImpactChartCanvas'));

// Wrapped in Suspense with skeleton fallbacks in each section
<Suspense fallback={<CanvasSkeleton height={400} />}>
  <TechArsenalCanvas data={techStack} />
</Suspense>
```

### 8.4 Image Optimization

- `heroPortraitUrl` and `thumbnailUrl` fields should point to Firebase Storage URLs with `?width=800&format=webp` transformation parameters (via Firebase Extensions: Resize Images).
- Skill `iconUrl` assets are served from Firebase Storage in SVG format where possible to maintain crisp quality at any DPI.

---

## 9. Accessibility Standards

| Standard                 | Implementation                                                                                                 |
| ------------------------ | -------------------------------------------------------------------------------------------------------------- |
| WCAG 2.1 AA              | All Bento block text maintains minimum 4.5:1 contrast ratio                                                    |
| `prefers-reduced-motion` | All R3F animation loops halt; Framer Motion spring transitions disabled                                        |
| Keyboard navigation      | Full `:focus-visible` ring on all interactive controls, including 3D tooltip cards                             |
| Screen readers           | All `<canvas>` elements have `aria-label` descriptions; R3F provides ARIA roles via `<group aria-label="...">` |
| Semantic HTML            | Section, nav, main, article hierarchy maintained across all Bento layouts                                      |
| `alt` text               | All `<img>` elements have descriptive `alt` â€” including tech badge icons                                       |
| Touch support            | `OrbitControls` in TechArsenal3D has touch events; minimum 44px tap targets on all mobile controls             |

---

## 10. Gaps & Technical Debt

| Item                                                   | Priority | Notes                                                                                                                            |
| ------------------------------------------------------ | -------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `vite-plugin-pwa` not yet installed                    | HIGH     | Required for offline caching of 3D assets and IndexedDB data â€” install: `npm install -D vite-plugin-pwa workbox-window`          |
| `roughjs` not yet installed                            | MEDIUM   | Required for hand-drawn Bento borders in MySkillSection and AchievementsTimeline â€” install: `npm install roughjs`                |
| `d3-force-3d` not in package.json                      | HIGH     | Required for TechArsenal3DSection sphere layout â€” install: `npm install d3-force-3d`                                             |
| `react-countup` not in package.json                    | MEDIUM   | Required for ImpactMetricsSection animated counters â€” install: `npm install react-countup`                                       |
| Cloud Function for stats counters                      | HIGH     | `profiles.stats.projectsCompleted`, `awardsWon`, etc. need an `onCreate` trigger on `projects`, `certificates` to auto-increment |
| `profiles.techBadgePills[]` field not yet in schema    | HIGH     | Add to `database.types.ts` + Firestore converter                                                                                 |
| `profiles.heroCards[]` field not yet in schema         | HIGH     | Add to `database.types.ts` + Firestore converter                                                                                 |
| `profiles.availabilityStatus` enum not in schema       | MEDIUM   | Add enum type + builder dropdown                                                                                                 |
| `blog_posts.featuredOnLanding` flag not in schema      | MEDIUM   | Add boolean field to `BlogPost` type                                                                                             |
| `skills.showIn3DBadge` flag not in schema              | HIGH     | Required for TechArsenal3DSection â€” add to `Skill` type                                                                          |
| `skills.yearsUsed` field not in schema                 | LOW      | Enhances Arsenal tooltip; add as optional number field                                                                           |
| Firebase Resize Images extension                       | MEDIUM   | Required for WebP/responsive image optimization                                                                                  |
| Supabase `@supabase/supabase-js` still in package.json | CRITICAL | `npm uninstall @supabase/supabase-js` â€” confirmed in `temp.md` audit                                                             |
| Hero tech badge pills still show Supabase icon in code | CRITICAL | Replace hardcoded badge array with `profiles.techBadgePills[]` as specified                                                      |
| Route mismatch: footer links â†’ `/admin-access`         | RESOLVED | Footer correctly targets `/admin-access` per actual router â€” no action needed                                                    |
| E2E tests for new sections                             | MEDIUM   | Add Playwright tests for TechArsenal3D WebGL fallback + ImpactMetrics counter entry                                              |

---

_Specification authored: 2026-04-02 | Aligned with: `TechStack.md`, `Database.md`, `Features.md`, `StateManagement.md`, `FutureScope.md`, `temp.md` audit trail._
# Page: Resume Manager

**Route:** `/resume`
**Type:** Admin (Protected)
**Guard Chain:** `AuthGuard` â†’ `AdminGuard` â†’ `AdminLayout` â†’ `ResumeManagerPage`

---

## 1. Page Overview

The Resume Manager is the owner's workspace for handling all aspects of resume output â€” static PDF uploads, dynamic DOM-based PDF generation from live portfolio data, and (planned) AI-generated role-specific resume variants. It bridges the gap between the Firestore-stored portfolio content and the traditional PDF resume format recruiters expect.

**Primary Roles:**

- Upload and manage static PDF resume files to Firebase Storage
- Generate ATS-friendly PDF exports directly from live Firestore portfolio data
- Preview generated PDFs before sharing
- Manage multiple resume variants (general, role-specific, AI-tailored)
- Provide shareable download links for each resume variant

---

## 2. UI Description

### 2.1 Layout

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  AdminLayout Navbar                                      â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚  Sidebar   â”‚  Resume Manager Header                      â”‚
â”‚            â”‚  "Resume Manager" + "Generate New" button   â”‚
â”‚            â”‚  â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€  â”‚
â”‚            â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”â”‚
â”‚            â”‚  â”‚  Resume Library     â”‚  PDF Preview Pane  â”‚â”‚
â”‚            â”‚  â”‚  (left, 380px)      â”‚  (right, flex-1)  â”‚â”‚
â”‚            â”‚  â”‚                     â”‚                   â”‚â”‚
â”‚            â”‚  â”‚  Static PDFs        â”‚  Embedded PDF     â”‚â”‚
â”‚            â”‚  â”‚  â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€  â”‚  viewer or        â”‚â”‚
â”‚            â”‚  â”‚  [Card] General.pdf â”‚  generated        â”‚â”‚
â”‚            â”‚  â”‚  [Card] Frontend.pdfâ”‚  preview          â”‚â”‚
â”‚            â”‚  â”‚                     â”‚                   â”‚â”‚
â”‚            â”‚  â”‚  Generated Variants â”‚                   â”‚â”‚
â”‚            â”‚  â”‚  â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€  â”‚                   â”‚â”‚
â”‚            â”‚  â”‚  [Card] Auto-gen    â”‚                   â”‚â”‚
â”‚            â”‚  â”‚  [Card] AI variant  â”‚                   â”‚â”‚
â”‚            â”‚  â”‚                     â”‚                   â”‚â”‚
â”‚            â”‚  â”‚  + Upload PDF       â”‚                   â”‚â”‚
â”‚            â”‚  â”‚  + Generate New     â”‚                   â”‚â”‚
â”‚            â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### 2.2 Resume Library (Left Panel)

**Static PDF Cards:**
Each uploaded PDF file is displayed as a card containing:

- File name (editable inline)
- Upload date
- File size
- Label badge (e.g., "General", "Frontend", "Internship")
- Preview icon â†’ loads PDF in the right pane
- Copy link icon â†’ copies Firebase Storage download URL
- Delete icon â†’ `sweetalert2` confirmation â†’ `deleteObject(storageRef)`

**Generated/Dynamic Resume Cards:**
Cards for PDF exports generated from live Firestore data:

- "Generated from portfolio data" label
- Generation timestamp
- Preview + Download buttons
- Re-generate button (re-runs `useExportPDF` hook)

**AI Variant Cards [PLANNED]:**

- "AI-generated for [Role]" label
- Generated timestamp
- Status badge (generating / ready / failed)
- Placeholder state until `aiService.ts` is implemented

### 2.3 Upload Zone

- Full-width drag-and-drop zone with dashed border
- "Drag & drop PDF here or click to select"
- File type validation: `.pdf` only
- File size limit: 10MB
- On upload: Firebase Storage â†’ success â†’ adds to library list via query invalidation

### 2.4 PDF Preview Pane (Right Panel)

- Static PDFs: rendered using browser's native `<object type="application/pdf">` or an `<iframe>` pointing to the Firebase Storage URL
- Generated PDFs: HTML-to-canvas preview rendered inline
- Full-screen expand button
- Download button at the top of the preview pane
- "Share Link" button copies the public download URL

### 2.5 Generate New Resume Modal

A `sweetalert2` modal or slide-in drawer with options:

- Template selector: "Minimal ATS" | "Modern Two-Column" | "Technical Compact"
- Sections to include: checkboxes for Personal Info, Skills, Experience, Projects, Certificates, Education
- Custom header override: optional custom name/tagline for the generated PDF
- "Generate PDF" button â†’ triggers `useExportPDF` hook

---

## 3. Features & Functionality

### 3.1 Static PDF Upload

```ts
// src/services/storageService.ts
async function uploadResumePdf(file: File, label: string): Promise<string> {
  const path = `owner/resumes/${Date.now()}_${file.name}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  // Save metadata to Firestore
  await setDoc(doc(db, 'resume_files', generateId()), {
    ownerId: currentUser.uid,
    fileName: file.name,
    label,
    url,
    storagePath: path,
    uploadedAt: serverTimestamp(),
    type: 'static',
  });
  return url;
}
```

### 3.2 Dynamic PDF Generation (useExportPDF)

```ts
// src/hooks/useExportPDF.ts
export function useExportPDF() {
  const exportPDF = async (targetElementId: string, filename: string) => {
    const element = document.getElementById(targetElementId);
    if (!element) {
      toast.error('Resume preview element not found');
      return;
    }
    const canvas = await html2canvas(element, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(filename);
  };
  return { exportPDF };
}
```

The resume template component (`ResumeTemplate`) is a hidden DOM element rendered off-screen, populated with live Firestore data, and targeted by `useExportPDF`.

### 3.3 Copy Share Link

```ts
async function copyDownloadLink(url: string) {
  await navigator.clipboard.writeText(url);
  toast.success('Download link copied!');
}
```

### 3.4 Delete Resume File

```ts
async function deleteResume(storagePath: string, docId: string) {
  await deleteObject(ref(storage, storagePath));
  await deleteDoc(doc(db, 'resume_files', docId));
  queryClient.invalidateQueries({ queryKey: ['resumeFiles', ownerId] });
}
```

### 3.5 Resume Templates

Three built-in HTML/CSS resume templates are defined in `src/components/ResumeTemplates/`:

- `MinimalATS.tsx` â€” clean single-column, maximum ATS parseability
- `ModernTwoColumn.tsx` â€” branded left sidebar + content column
- `TechnicalCompact.tsx` â€” dense layout optimized for technical roles

All templates consume the same `ResumeData` type, populated from Firestore portfolio data.

---

## 4. Styling

### 4.1 Resume Cards

- Same `BentoBlock` base as other admin pages
- Active/selected card: left border in `--color-primary`, background slightly lighter
- Card label badge: pill shape, colored by category (general = blue, role-specific = orange, AI = purple)

### 4.2 Upload Zone

```css
.upload-zone {
  border: 2px dashed var(--sys-border);
  border-radius: var(--bento-radius);
  padding: 2rem;
  text-align: center;
  transition: border-color 0.2s;
}
.upload-zone:hover,
.upload-zone.drag-over {
  border-color: var(--color-primary);
  background: rgba(var(--color-primary-rgb), 0.05);
}
```

### 4.3 PDF Preview Pane

- Background: `#ffffff` (white, mimics paper)
- Shadow: `0 4px 32px rgba(0,0,0,0.4)` (elevated document feel)
- Rounded corners: `8px`
- Toolbar above preview: dark glass bar with action buttons

### 4.4 Responsiveness

- On `< 768px`: left/right panels stack vertically
- Library panel collapses to a horizontal scroll of card chips
- Preview pane is full-width below the library chips

---

## 5. Connections

### 5.1 React Query

```ts
const { data: resumeFiles } = useQuery({
  queryKey: ['resumeFiles', ownerId],
  queryFn: () => storageService.fetchResumeFiles(ownerId),
});
const { data: portfolioData } = usePortfolioData(ownerUsername);
```

### 5.2 Services Called

- `storageService.uploadResumePdf(file, label)`
- `storageService.fetchResumeFiles(ownerId)` â€” reads `resume_files` Firestore collection
- `storageService.deleteResume(storagePath, docId)`
- `useExportPDF()` hook for generation

---

## 6. Firebase Setup & Integration

### 6.1 Firebase Storage

- **Bucket path:** `owner/resumes/` (write-protected to owner)
- **Public read:** Firebase Storage rules allow public `get` on `owner/resumes/**` so download URLs work for recruiters
- **CORS:** Configure CORS on the Storage bucket to allow `html2canvas` to load image assets during PDF generation

```json
// cors.json for Firebase Storage
[
  {
    "origin": ["https://your-domain.com"],
    "method": ["GET"],
    "maxAgeSeconds": 3600
  }
]
```

### 6.2 Firestore â€” `resume_files` Collection

```ts
interface ResumeFile {
  id: string;
  ownerId: string;
  fileName: string;
  label: string; // "General" | "Frontend" | custom
  url: string; // Firebase Storage download URL
  storagePath: string; // For deletion
  uploadedAt: Timestamp;
  type: 'static' | 'generated' | 'ai-variant';
  templateUsed?: string; // For generated type
}
```

### 6.3 Security Rules

```
match /resume_files/{fileId} {
  allow read, write: if request.auth != null
    && request.auth.uid == resource.data.ownerId;
  allow create: if request.auth != null
    && request.resource.data.ownerId == request.auth.uid;
}
// Firebase Storage
match /owner/resumes/{filename} {
  allow read: if true;   // Public download URLs
  allow write: if request.auth != null
    && request.auth.token.email == "owner@example.com";
}
```

---

## 7. Additional Notes

- **`html2canvas` + `jsPDF`** are in `package.json`. CORS configuration on the Storage bucket is required for `html2canvas` to capture images from Firebase Storage URLs.
- **ATS Optimization:** The `MinimalATS` template intentionally avoids complex CSS (no flexbox/grid, no background colors) to ensure the PDF parses correctly through Applicant Tracking Systems.
- **AI Variant Generation** is the planned Phase 2 feature where a Cloud Function runs a Genkit prompt to generate a role-tailored resume variant based on a provided job description.
- **Resume File Limit:** Consider capping at 10 resume files per owner to manage storage costs (Firebase Storage free tier is 5GB).
# Page: Analytics

**Route:** `/analytics`
**Type:** Admin (Protected)
**Guard Chain:** `AuthGuard` â†’ `AdminGuard` â†’ `AdminLayout` â†’ `AnalyticsPage`

---

## 1. Page Overview

The Analytics page gives the portfolio owner deep visibility into how recruiters and visitors are engaging with the public-facing portfolio. It aggregates event data from Firestore's `analytics_events` collection into interactive charts, tables, and summary metrics. The page enables data-driven portfolio decisions â€” knowing which projects get the most clicks, which AI-tailored share links perform best, and when traffic spikes occur.

**Primary Roles:**

- Visualize portfolio traffic over configurable date ranges
- Break down engagement by event type (views, project clicks, resume downloads, contact CTAs)
- Surface which AI-personalized share links are generating the highest engagement
- Expose visitor behavior patterns (time of day, day of week, session depth)
- Export raw analytics data as CSV for offline analysis

---

## 2. UI Description

### 2.1 Layout

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  AdminLayout Navbar                                          â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚  Sidebar   â”‚  Analytics Header                               â”‚
â”‚            â”‚  "Portfolio Analytics" + Date Range Picker      â”‚
â”‚            â”‚  â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€  â”‚
â”‚            â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
â”‚            â”‚  â”‚ Total    â”‚ Unique   â”‚ Resume   â”‚ Project  â”‚  â”‚
â”‚            â”‚  â”‚ Views    â”‚ Sessions â”‚ Downloadsâ”‚ Clicks   â”‚  â”‚
â”‚            â”‚  â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤  â”‚
â”‚            â”‚  â”‚  Traffic Over Time (Area Chart, col-4)     â”‚  â”‚
â”‚            â”‚  â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤  â”‚
â”‚            â”‚  â”‚  Event Breakdown     â”‚  Top Projects       â”‚  â”‚
â”‚            â”‚  â”‚  (Doughnut chart)    â”‚  (Ranked list)      â”‚  â”‚
â”‚            â”‚  â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤  â”‚
â”‚            â”‚  â”‚  AI Link Performance â”‚  Activity Heatmap   â”‚  â”‚
â”‚            â”‚  â”‚  (Table)             â”‚  (Day Ã— Hour grid)  â”‚  â”‚
â”‚            â”‚  â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤  â”‚
â”‚            â”‚  â”‚  Raw Events Table (paginated, exportable)   â”‚  â”‚
â”‚            â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### 2.2 Date Range Picker

- Preset chips: `Today | 7D | 30D | 90D | All Time`
- Custom range: calendar popover with start/end date selection
- Selected range is stored in local component state and passed to all query hooks as a dependency

### 2.3 Summary Stat Cards (4 Ã— 1x1 Bento)

Each card contains:

- Large animated counter value
- Label + contextual icon
- Trend badge (vs previous equivalent period)
- Mini 7-bar sparkline

Cards: Total Views, Unique Sessions (estimated via unique `sessionId`s), Resume Downloads, Project Clicks

### 2.4 Traffic Over Time (col-span-4)

- Multi-line area chart using `react-chartjs-2`
- Series: Portfolio Views, Project Clicks, Resume Downloads, Contact Clicks
- Toggle each series via legend
- X-axis: dates; Y-axis: event count
- Smooth curve interpolation (`tension: 0.4`)
- Gradient fill from `--color-primary` (0.3 alpha at top) to transparent

### 2.5 Event Breakdown (Doughnut Chart)

- `chart.js` doughnut with custom segment colors per event type
- Center label shows total events for the period
- Legend with percentages displayed below the chart

### 2.6 Top Projects (Ranked List)

- Projects ordered by click count for the selected period
- Each row: project thumbnail, title, click count, percentage of total project clicks
- Clicking a project navigates to its edit form in `/builder`

### 2.7 AI Link Performance Table [PLANNED]

- Lists all generated AI share links (stored in `ai_preferences`)
- Columns: link slug, target role, views, CTR (resume downloads / views), created date
- "Copy Link" action per row
- Placeholder state shown until `aiService.ts` is implemented

### 2.8 Activity Heatmap

- 7 Ã— 24 grid (days of week Ã— hours)
- Cell color intensity = event count for that day+hour slot
- Color scale: `--color-primary` at low opacity â†’ full saturation
- Tooltip: "Tuesday 3PM: 12 events"
- Built with `d3` SVG rendering

### 2.9 Raw Events Table (Paginated)

- Columns: timestamp, event type, page/resource, source (direct/ai-link/search)
- 20 rows per page; page navigation at bottom
- Column sorting by clicking header
- Search filter input (client-side, filters visible rows)
- "Export CSV" button triggers `Blob` download of current date range's events

---

## 3. Features & Functionality

### 3.1 Configurable Date Range

- Changing the date range re-fires all `useQuery` hooks with the new `startDate`/`endDate` parameters
- React Query caches each unique range independently (staleTime: 2 min)
- Loading skeleton replaces charts during re-fetch

### 3.2 Real-Time Refresh

- "Refresh Now" icon button in the header manually calls `queryClient.invalidateQueries(['analytics'])`
- Auto-refresh every 5 minutes while the tab is active (`refetchInterval: 5 * 60 * 1000`)

### 3.3 CSV Export

```ts
function exportToCsv(events: AnalyticsEvent[]) {
  const header = ['timestamp', 'type', 'resource', 'source'];
  const rows = events.map((e) => [
    e.timestamp.toDate().toISOString(),
    e.type,
    e.resource,
    e.source,
  ]);
  const csv = [header, ...rows].map((r) => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  // Trigger download
}
```

### 3.4 Top Projects Drill-Down

- Clicking a project row updates a secondary chart showing that project's click timeline
- "Edit Project" link opens `/builder` with the Projects accordion pre-expanded for that item

### 3.5 Trend Calculations

- Trend badge computes: `((current - previous) / previous) * 100`
- Previous period = same duration immediately before the selected range
- Requires two overlapping Firestore queries with `where('timestamp', '>=', ...)` constraints

---

## 4. Styling

### 4.1 Charts

- All charts use a shared `chartDefaults` config object:
  ```ts
  Chart.defaults.color = '#9ca3af'; // Axis labels
  Chart.defaults.borderColor = 'rgba(255,255,255,0.08)'; // Grid lines
  Chart.defaults.font.family = 'var(--font-body)';
  ```
- Primary series color: `--color-primary`
- Secondary series: `--color-secondary`
- Destructive/download: `#ef4444`
- Contact CTA: `#22c55e`

### 4.2 Heatmap

- Cell border-radius: `2px` (intentionally tighter than Bento blocks for data density)
- Empty cells: `rgba(255,255,255,0.04)`
- Active cells: gradient from `rgba(var(--color-primary-rgb), 0.1)` to full `--color-primary`

### 4.3 Table

- Alternating row background: `rgba(255,255,255,0.02)` on even rows
- Sticky header row with `backdrop-blur-sm`
- Hover row: `rgba(var(--color-primary-rgb), 0.05)` tint

### 4.4 Responsiveness

- On `< 1024px`: charts stack vertically; stat cards go to 2-column grid
- Heatmap collapses to a simplified "busiest days" horizontal bar chart on mobile
- Raw events table enables horizontal scroll on narrow viewports

---

## 5. Connections

### 5.1 React Query Hooks

```ts
const { data: summaryStats } = useAnalyticsSummary(ownerId, { start, end });
const { data: timeSeriesData } = useAnalyticsTimeSeries(ownerId, { start, end });
const { data: topProjects } = useTopProjects(ownerId, { start, end });
const { data: heatmapData } = useActivityHeatmap(ownerId, { start, end });
const { data: rawEvents } = useRawEvents(ownerId, { start, end, page, sort });
```

### 5.2 Services Called

- `adminService.fetchAnalyticsSummary(ownerId, range)`
- `adminService.fetchTimeSeries(ownerId, range)`
- `adminService.fetchTopProjects(ownerId, range)`
- `adminService.fetchHeatmap(ownerId, range)`
- `adminService.fetchRawEvents(ownerId, range, pagination)`

---

## 6. Firebase Setup & Integration

### 6.1 Firestore Queries

**Summary stats:**

```ts
const q = query(
  collection(db, 'analytics_events'),
  where('ownerId', '==', ownerId),
  where('timestamp', '>=', startDate),
  where('timestamp', '<=', endDate),
);
```

**Time series (requires client-side aggregation by date):**

- Reads all events in range, groups by `timestamp.toDate().toDateString()` client-side
- For large datasets (> 30 days), consider a Cloud Function aggregation endpoint

**Required Composite Indexes:**

```json
{
  "collectionGroup": "analytics_events",
  "fields": [
    { "fieldPath": "ownerId", "order": "ASCENDING" },
    { "fieldPath": "timestamp", "order": "DESCENDING" }
  ]
},
{
  "collectionGroup": "analytics_events",
  "fields": [
    { "fieldPath": "ownerId", "order": "ASCENDING" },
    { "fieldPath": "eventType", "order": "ASCENDING" },
    { "fieldPath": "timestamp", "order": "DESCENDING" }
  ]
}
```

### 6.2 Security Rules

```
match /analytics_events/{eventId} {
  allow read: if request.auth != null
    && request.auth.uid == resource.data.ownerId;
  allow create: if request.resource.data.ownerId is string
    && request.resource.data.timestamp is timestamp;
  allow update, delete: if false;
}
```

### 6.3 Performance Optimization

- For `All Time` range, a Cloud Function pre-aggregates monthly totals into a `analytics_aggregates` collection to avoid scanning thousands of raw events on each load
- Summary stats are also stored as denormalized fields on `profiles.stats` (incremented by Cloud Function triggers) for near-instant dashboard loads

---

## 7. Additional Notes

- **Privacy Note:** The analytics system does not collect IP addresses or personally identifiable visitor information â€” only event types, timestamps, and resource names. This is intentional for GDPR-friendliness.
- **AI Integration Readiness:** The AI Link Performance table is pre-structured to display data from `ai_preferences` collection, ready to populate once `aiService.ts` is implemented.
- **Scalability:** For high-traffic portfolios, the raw Firestore event reads should be replaced with a pre-aggregated time-series document written by Cloud Function triggers. The service layer interface remains unchanged.
- **Chart Library:** `chart.js` + `react-chartjs-2` are already in `package.json`. The `d3` dependency for the heatmap needs to be verified in package.json.
# Page: Builder

**Route:** `/builder`
**Type:** Admin (Protected)
**Guard Chain:** `AuthGuard` â†’ `AdminGuard` â†’ `AdminLayout` â†’ `BuilderPage`

---

## 1. Page Overview

The Builder is the flagship feature of MekeshBuilds â€” a live WYSIWYG (What You See Is What You Get) editing workspace where the owner authors and maintains every piece of content that appears on the public portfolio. It is a split-panel interface: the left panel contains accordion-organized form modules for editing data, and the right panel renders a real-time preview of the public-facing Bento Grid exactly as recruiters will see it.

The Builder eliminates the need for a separate CMS by combining content authorship, data validation, theme previewing, and Firestore autosave into a single cohesive workspace.

**Primary Roles:**

- Edit all portfolio content (profile, skills, projects, experience, blog, testimonials)
- Preview changes live in the right panel before they go public
- Autosave all changes to Firestore with debouncing (800ms)
- Control publish/unpublish state of any content item
- Reorder sections and Bento blocks via drag-and-drop

---

## 2. UI Description

### 2.1 Layout

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  AdminLayout Navbar (fixed, 80px) â€” shows autosave status     â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚  LEFT PANEL   â”‚  RIGHT PANEL (#live-canvas)                   â”‚
â”‚  (480px fixed)â”‚  (flex-1, scrollable)                         â”‚
â”‚               â”‚                                               â”‚
â”‚  Accordion    â”‚  PublicProfilePage preview                    â”‚
â”‚  â”€â”€â”€â”€â”€â”€â”€â”€â”€    â”‚  rendered at 80% scale inside                 â”‚
â”‚  â–¼ Personal   â”‚  an iframe-like container                     â”‚
â”‚  â–¼ Skills     â”‚                                               â”‚
â”‚  â–¼ Experience â”‚  Breakpoint toggle:                           â”‚
â”‚  â–¼ Projects   â”‚  [ ðŸ“± Mobile ] [ ðŸ’» Tablet ] [ ðŸ–¥ Desktop ]   â”‚
â”‚  â–¼ Blog/CMS   â”‚                                               â”‚
â”‚  â–¼ AI Settingsâ”‚  Hover any Bento block â†’                      â”‚
â”‚               â”‚  pencil icon overlay appears                  â”‚
â”‚  Save Status  â”‚  â†’ click â†’ scroll left panel to              â”‚
â”‚  Indicator    â”‚     matching accordion section                â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### 2.2 Left Panel â€” Accordion Sections

Each accordion section is collapsible and uses `React Hook Form` with `Zod` validation. All fields use the shared `Input`, `Textarea`, `Toggle`, `Select`, and `ImageUpload` primitives from `src/components/Shared`.

**â–¼ Personal Info**

- Full name (text input)
- Tagline / headline (text input, 80 char limit)
- Bio (textarea, 400 char limit with live char counter)
- Avatar URL (ImageUpload â€” uploads to Firebase Storage, returns URL)
- Hero portrait URL (separate ImageUpload)
- Availability text (text input)
- Availability status (Select: `open` | `selective` | `unavailable`)
- Location: city, lat, lng (text inputs with map pin preview)
- Tech badge pills editor (chip array: add/remove skill badges)
- Hero cards editor (up to 4 cards: label, value, icon, color)
- Stats editor: yearsExperience, projectsCompleted, awardsWon, competitionsEntered
- Custom stat: label + value

**â–¼ Skills**

- Per-skill form fields: name, category, proficiencyLevel (0â€“100 slider), iconUrl, sortOrder
- Toggle: `featuredOnLanding`, `showIn3DBadge`, `isPublished`
- Drag-and-drop reordering via `@dnd-kit/sortable`
- "Add Skill" button opens an inline form row
- "Delete Skill" with `sweetalert2` confirmation

**â–¼ Experience**

- Per-experience entry: role, company, startDate, endDate, description, type (full-time/internship/training)
- Toggle: `isFeatured`, `isPublished`
- Date pickers using native `<input type="month">`

**â–¼ Education & Certificates**

- Per-certificate: name, issuer, date, credentialUrl, badgeUrl
- Toggle: `isFeatured`, `isPublished`

**â–¼ Projects**

- Per-project: title, description (Markdown editor), techStack[] (chip input), thumbnailUrl (ImageUpload), liveUrl, repoUrl, modelUrl
- Toggle: `isFeatured`, `status` (draft/published), sortOrder
- Drag-and-drop reordering

**â–¼ Blog & CMS**
Sub-tabs within this section:

- Blog Posts: title, excerpt, coverImageUrl, tags[], Markdown body editor (using `react-markdown` preview), publishedAt, `isPublished`, `featuredOnLanding`
- Gallery: image grid with upload/delete
- Testimonials: name, role, company, avatarUrl, text, rating (star selector), `isPublished`, sortOrder

**â–¼ AI Settings [PLANNED]**

- Placeholder accordion with "Coming Soon" state
- Will expose: recruiter intent signals, AI summary prompt customization, variant generation controls

### 2.3 Right Panel â€” Live Canvas

- Renders the actual `PublicProfilePage` component tree inside a scaled container
- Scale is applied via CSS `transform: scale(0.8)` with `transform-origin: top center`
- Breakpoint toggle swaps CSS max-width constraint: mobile (390px) / tablet (768px) / desktop (1280px)
- A subtle "PREVIEW" watermark banner at the top of the canvas differentiates it from the real public page
- Bento blocks in the canvas respond to the `editable` prop: hovering shows a `âœï¸` overlay button
- Clicking a Bento block overlay programmatically scrolls the left panel and opens the matching accordion

### 2.4 Navbar Autosave Indicator (AdminLayout)

The top navbar displays a persistent autosave status chip:

- `ðŸ’¤ All saved` (green dot, `lastSavedAt` relative timestamp)
- `âœï¸ Unsaved changes` (amber dot, pulsing)
- `ðŸ’¾ Savingâ€¦` (spinning indicator)
- `âŒ Save failed â€” Retry` (red dot, click to retry)

---

## 3. Features & Functionality

### 3.1 Autosave (Core)

```ts
// src/hooks/useAutoSave.ts
useEffect(() => {
  if (!isDirty || !profile) return;
  const timer = setTimeout(() => {
    setSaveStatus('saving');
    mutateAsync(profile)
      .then(() => {
        setSaveStatus('saved');
        setLastSavedAt(new Date());
      })
      .catch(() => setSaveStatus('unsaved'));
  }, 800);
  return () => clearTimeout(timer);
}, [isDirty, profile]);
```

### 3.2 Form Validation (Zod + React Hook Form)

- Every accordion section has a Zod schema defined in `src/forms/`
- Inline validation errors appear below each field in real time
- Submission is blocked if the form has errors (save button greyed out)
- URL fields validate format; image upload fields validate file size (< 5MB) and type (image/\*)

### 3.3 Image Upload to Firebase Storage

```ts
// src/services/storageService.ts
async function uploadImage(file: File, path: string): Promise<string> {
  const storageRef = ref(storage, `owner/${path}/${Date.now()}_${file.name}`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}
```

- Drag-and-drop or click-to-select on `ImageUpload` component
- Upload progress bar displayed inline
- On success, the URL is written back into the form field and `patchProfile()` fires

### 3.4 Drag-and-Drop Reordering

- `@dnd-kit/sortable` wraps each skill, project, and testimonial list
- On drag-end, `sortOrder` fields are updated in batch using `writeBatch(db)` to minimize Firestore writes
- Visual drag handle icon appears on hover (`â ¿`)

### 3.5 Publish/Unpublish Toggle

- Every content item has an `isPublished` toggle
- Toggling immediately updates the Firestore document (no 800ms debounce â€” instant write)
- Unpublished items render in the live canvas with a `[Draft]` badge overlay

### 3.6 Markdown Editor (Blog Posts)

- Left column: raw Markdown textarea
- Right column: live `react-markdown` render with syntax highlighting (`react-syntax-highlighter`)
- Toolbar: Bold, Italic, Heading, Code Block, Link, Image buttons

### 3.7 Breakpoint Preview

- Mobile/Tablet/Desktop toggle changes the canvas container's max-width constraint
- Stored in local component state (not Firestore)
- Canvas uses actual CSS Grid breakpoints â€” no fake media query simulation

### 3.8 Undo / Redo

- `builderStore` maintains a change history stack (last 20 states)
- `Cmd+Z` / `Ctrl+Z` calls `store.undo()` â€” reverts `profile` to previous state
- `Cmd+Shift+Z` / `Ctrl+Y` calls `store.redo()`

---

## 4. Styling

### 4.1 Left Panel

- Background: `--sys-bg-secondary` (`#16161e`)
- Accordion headers: `--sys-bg-tertiary` (`#1e1e2a`) with `cursor-pointer`
- Active accordion: top border in `--color-primary` (2px)
- Form inputs: dark background (`--sys-bg-primary`) with `--sys-border` border; focus ring in `--color-primary`
- Drag handles: low-opacity on rest, full opacity on hover

### 4.2 Right Panel

- Background: `--sys-bg-tertiary` (slightly lighter to contrast the canvas)
- Canvas container: white background (mimics a real browser viewport)
- Breakpoint frame: styled like a device mockup with a thin border and rounded corners
- PREVIEW badge: `position: absolute; top: 0; width: 100%; text-align: center; background: --color-primary; opacity: 0.1; pointer-events: none`

### 4.3 Autosave Chip

```css
.autosave-chip {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.06);
}
```

### 4.4 Responsiveness

- On screens `< 1024px`, the split-panel collapses into a tabbed interface: `[ Edit ] [ Preview ]`
- The accordion panel is full-width in tab mode
- The preview canvas is full-width in tab mode

---

## 5. Connections

### 5.1 State Management

```ts
const {
  profile,
  isDirty,
  saveStatus,
  lastSavedAt,
  patchProfile,
  setSaveStatus,
  setLastSavedAt,
  resetDraft,
} = useBuilderStore();

// React Query mutation
const mutation = useMutation({
  mutationFn: (draft) => profileService.updateProfile(draft.id, draft),
  onMutate: () => setSaveStatus('saving'),
  onSuccess: () => {
    setSaveStatus('saved');
    setLastSavedAt(new Date());
    queryClient.invalidateQueries({ queryKey: ['portfolio'] });
  },
  onError: () => setSaveStatus('unsaved'),
});
```

### 5.2 Services Called

- `profileService.fetchProfile(ownerId)` â€” initial data load
- `profileService.updateProfile(id, draft)` â€” autosave mutation
- `skillService.upsertSkill(skill)` / `deleteSkill(id)` â€” skill CRUD
- `projectService.upsertProject(project)` / `deleteProject(id)`
- `contentService.upsertBlogPost(post)` / `deleteBlogPost(id)`
- `storageService.uploadImage(file, path)` â€” image uploads

### 5.3 Navigation

- On unmount: if `isDirty`, show `sweetalert2` "Unsaved changes â€” are you sure you want to leave?" dialog using `useBlocker` (React Router 7)
- Cancel navigates back; Confirm navigates away and calls `resetDraft()`

---

## 6. Firebase Setup & Integration

### 6.1 Authentication

- Both `AuthGuard` and `AdminGuard` must pass before `BuilderPage` renders
- Firebase `currentUser.uid` is used as `ownerId` for all queries

### 6.2 Firestore â€” Collections Written

| Collection     | Operation              | When                      |
| -------------- | ---------------------- | ------------------------- |
| `profiles`     | `setDoc` (merge)       | Autosave debounce (800ms) |
| `skills`       | `setDoc` / `deleteDoc` | Immediate on add/delete   |
| `projects`     | `setDoc` / `deleteDoc` | Immediate on add/delete   |
| `blog_posts`   | `setDoc` / `deleteDoc` | Immediate on add/delete   |
| `testimonials` | `setDoc` / `deleteDoc` | Immediate on add/delete   |
| `certificates` | `setDoc` / `deleteDoc` | Immediate on add/delete   |
| `experience`   | `setDoc` / `deleteDoc` | Immediate on add/delete   |

**Batch writes for reorder:**

```ts
const batch = writeBatch(db);
reorderedSkills.forEach((skill, index) => {
  batch.update(doc(db, 'skills', skill.id), { sortOrder: index });
});
await batch.commit();
```

### 6.3 Firebase Storage

- Bucket path pattern: `gs://[project-id].appspot.com/owner/[category]/[timestamp]_[filename]`
- Categories: `avatars`, `portraits`, `projects`, `certificates`, `blog-covers`, `gallery`
- Security rule: only authenticated owner can write to `owner/` path prefix

```
// Firebase Storage Rules
match /owner/{allPaths=**} {
  allow read: if true;   // Public read for portfolio images
  allow write: if request.auth != null
    && request.auth.token.email == "owner@example.com";
}
```

### 6.4 Firestore Security Rules (relevant)

```
// Generic portfolio asset pattern (skills, projects, etc.)
match /skills/{skillId} {
  allow create: if request.auth != null
    && request.resource.data.ownerId == request.auth.uid;
  allow update, delete: if request.auth != null
    && resource.data.ownerId == request.auth.uid;
}
```

### 6.5 Offline Behavior

- Autosave queues to Firestore's local pending writes if offline
- Firestore SDK automatically flushes the queue when connectivity is restored
- Autosave status shows "Queued (offline)" via `usePwaSync.isOnline` check

---

## 7. Additional Notes

- **The Builder is the architectural showcase piece** â€” it demonstrates React Hook Form + Zod validation, Zustand draft state management, Firebase Storage uploads, batch Firestore writes, and live WYSIWYG preview in a single cohesive UX.
- **Separation of Concerns:** The left panel knows nothing about the canvas rendering; it only patches the Zustand store. The canvas renders purely from store state.
- **The `editable` prop pattern** on `BentoBlock` is the key to making the builder feel native â€” the owner clicks directly on what they want to edit.
- **Scalability:** New content types (e.g., publications, speaking engagements) are added by creating a new accordion section + Zod schema + Firestore service function. No changes to the Builder layout are needed.
# Page: Dashboard

**Route:** `/dashboard`
**Type:** Admin (Protected)
**Guard Chain:** `AuthGuard` â†’ `AdminGuard` â†’ `AdminLayout` â†’ `DashboardPage`

---

## 1. Page Overview

The Dashboard is the command center of the MekeshBuilds admin workspace. It is the first screen the owner lands on after a successful login and serves as a real-time hub for portfolio health, engagement analytics, quick-action shortcuts, and system status indicators. The page presents an at-a-glance snapshot of everything happening across the portfolio without requiring the owner to navigate into deeper admin modules.

**Primary Roles:**

- Surface live engagement metrics (portfolio views, resume downloads, project clicks)
- Expose system health indicators (PWA sync status, Firestore offline cache, last autosave time)
- Provide one-click entry points into the most-used admin workflows (Builder, Analytics, Resume)
- Display recent activity from the public-facing portfolio in real time

---

## 2. UI Description

### 2.1 Layout

The Dashboard uses `AdminLayout` as its shell â€” a fixed top navbar (80px) and a collapsible left sidebar (240px expanded, 64px collapsed). The main content area is a responsive CSS Grid Bento layout that adapts from 1 column on mobile to 3 columns on desktop.

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  AdminLayout Navbar (fixed, 80px)                       â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚  Sidebar   â”‚  Dashboard Main Content Grid               â”‚
â”‚  (240px)   â”‚                                            â”‚
â”‚            â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”        â”‚
â”‚  Nav Links â”‚  â”‚ Views    â”‚ Downloadsâ”‚ Clicks   â”‚        â”‚
â”‚            â”‚  â”‚ Counter  â”‚ Counter  â”‚ Counter  â”‚        â”‚
â”‚            â”‚  â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤        â”‚
â”‚            â”‚  â”‚  Engagement Sparkline Chart     â”‚        â”‚
â”‚            â”‚  â”‚  (col-span-3, last 7 days)      â”‚        â”‚
â”‚            â”‚  â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤        â”‚
â”‚            â”‚  â”‚  Quick   â”‚  Recent Activity     â”‚        â”‚
â”‚            â”‚  â”‚  Actions â”‚  Feed (live)         â”‚        â”‚
â”‚            â”‚  â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤                      â”‚        â”‚
â”‚            â”‚  â”‚  System  â”‚                      â”‚        â”‚
â”‚            â”‚  â”‚  Health  â”‚                      â”‚        â”‚
â”‚            â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜        â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### 2.2 Bento Grid Blocks

**Stat Counter Blocks (3 Ã— 1x1)**
Each counter block contains:

- Icon (react-icons) in a circular accent-colored container
- Animated `react-countup` value
- Label (e.g., "Portfolio Views")
- Trend badge: `+12% vs last week` in green/red depending on direction
- Sparkline mini-chart (7-day trend line, using `chart.js`)

**Engagement Chart Block (col-span-3, 1x2)**

- Full-width line/area chart showing views, project clicks, and resume downloads over the selected date range
- Date range picker: `7D | 30D | 90D` toggle chips
- Built with `react-chartjs-2`, styled with `--color-primary` gradient fill
- Hover tooltip shows exact values per day

**Quick Actions Block (1x1)**
Glassmorphism card with 4 large CTA buttons:

- `âœï¸ Open Builder` â†’ `/builder`
- `ðŸ“Š View Analytics` â†’ `/analytics`
- `ðŸ“„ Manage Resume` â†’ `/resume`
- `ðŸ”— Copy Share Link` â†’ copies `/:username` URL to clipboard with toast confirmation
- `ðŸ‘ï¸ Preview Portfolio` â†’ opens `/:username` in new tab

**Recent Activity Feed (1x2)**
Live-updating list of the last 20 analytics events:

- Event icon (page view / project click / resume download / contact CTA)
- Event description ("Resume downloaded", "Project 'V2X System' clicked")
- Relative timestamp ("3 min ago", "1 hr ago")
- Powered by `onSnapshot` real-time Firestore subscription
- Each item slides in from the right via Framer Motion

**System Health Block (1x1)**
Status indicators with colored dot (green/amber/red):

- `PWA Sync Status` â€” online/offline detection via `usePwaSync`
- `Last Autosave` â€” timestamp from `builderStore.lastSavedAt`
- `Firestore Cache` â€” "Active (IndexedDB)" or "Disabled"
- `Auth Session` â€” "Owner session active"
- `Build Status` â€” last CI/CD run result (linked to GitHub Actions badge)

**AI Context Block (1x1) [PLANNED]**
Placeholder card showing:

- Last AI personalization request (recruiter intent classification)
- Number of custom AI resume variants generated
- "Configure AI" button â†’ `/settings#ai`

### 2.3 Top Navbar Content (AdminLayout)

- Left: App brand logo + "Dashboard" breadcrumb
- Center: Global search bar (searches projects, blog posts, skills by name â€” client-side fuzzy search via `fuse.js`)
- Right: Notification bell (unread count badge) + Owner avatar dropdown (View Profile / Settings / Sign Out)

### 2.4 Sidebar Navigation

Links with active state highlight:

- Dashboard (current)
- Builder
- Analytics
- Resume Manager
- Projects Manager
- Content Editor
- Theme Studio
- Settings

Collapse toggle at the bottom of the sidebar saves state to `localStorage`.

---

## 3. Features & Functionality

### 3.1 Real-Time Engagement Metrics

- Three top-level stat counters (Views, Downloads, Clicks) display live values from denormalized `profiles.stats` fields
- Counters animate on mount with `react-countup`
- Trend badges compare current period vs prior period (computed client-side from `analytics_events` query)

### 3.2 Interactive Engagement Chart

- Date range selection (`7D`, `30D`, `90D`) re-fetches aggregated analytics data
- Multi-metric overlay: toggle individual metrics on/off via legend click
- Chart data sourced from `analytics_events` collection, aggregated by day

### 3.3 Live Activity Feed

- Real-time `onSnapshot` listener on `analytics_events` collection, ordered by `timestamp DESC`, limited to 20
- Each new event slides into the feed without a full page refresh
- "Mark all read" button clears the unread badge on the Navbar notification bell

### 3.4 Quick Actions

- All navigation buttons use `useNavigate()` from React Router 7
- "Copy Share Link" uses `navigator.clipboard.writeText()` with a `sweetalert2` toast on success
- "Preview Portfolio" opens `/:username` in `window.open('_blank')`

### 3.5 System Health Monitor

- `usePwaSync` hook provides `isOnline` and `serviceWorkerStatus`
- `builderStore.lastSavedAt` surfaces the last successful Firestore write timestamp
- Firestore cache status detected via a test `getDoc` with `{ source: 'cache' }` on mount

### 3.6 Global Search (AdminLayout)

- Fuse.js indexes: project titles + blog post titles + skill names (loaded into memory from React Query cache)
- Results dropdown shows categorized results with type badges
- Clicking a result navigates to its respective manager page

---

## 4. Styling

### 4.1 Color Scheme

- Background: `--sys-bg-primary: #0f0f14` (deep near-black)
- Card surfaces: `--sys-bg-secondary: #16161e` with `backdrop-blur-xl`
- Borders: `rgba(255, 255, 255, 0.08)` subtle glass borders
- Accent: `--sys-accent: var(--color-primary)` (admin shell inherits owner's brand color)
- Text primary: `--sys-text-primary: #f3f4f6`
- Text secondary: `--sys-text-secondary: #9ca3af`
- Success green: `#22c55e` | Warning amber: `#f59e0b` | Error red: `#ef4444`

### 4.2 Typography

- Headings: `font-display` (configured via `--font-display` CSS variable â€” set in Theme Studio)
- Body: `font-body` (`--font-body`)
- Counter values: `tabular-nums` class, large weight (700), 2.5rem
- Stat labels: `text-sm font-medium tracking-wide uppercase`

### 4.3 Bento Blocks

```css
.bento-block {
  background: var(--bento-bg); /* rgba(15, 15, 20, 0.6) */
  border: 1px solid var(--bento-border); /* rgba(255,255,255,0.08) */
  border-radius: var(--bento-radius); /* 1.25rem */
  padding: 1.5rem;
  box-shadow: var(--bento-shadow);
}
.bento-block:hover {
  box-shadow: var(--bento-glow-shadow);
  border-color: rgba(var(--color-primary-rgb), 0.3);
}
```

### 4.4 Responsiveness

- `lg:grid-cols-3` â†’ `md:grid-cols-2` â†’ `grid-cols-1`
- Sidebar collapses to a bottom navigation bar on mobile (`< 768px`)
- Charts reflow to single-metric view on small screens

### 4.5 Motion

- Bento blocks enter with staggered `fadeInUp` Framer Motion variants (50ms delay per block)
- Stat counters run `react-countup` on mount (2s duration, ease-out)
- Activity feed items use `AnimatePresence` + `slideInRight` for new entries

---

## 5. Connections

### 5.1 State Management

```ts
// Zustand stores consumed
const { user, isOwner } = useAuthStore();
const { lastSavedAt } = useBuilderStore();

// React Query hooks
const { data: stats } = useOwnerStats(ownerId);
const { data: chartData } = useAnalyticsChartData(ownerId, range);
const { data: recentActivity } = useRecentActivity(ownerId, 20);
```

### 5.2 Navigation

- All `useNavigate()` calls use React Router 7's imperative API
- Guard redirects: unauthenticated â†’ `/admin-access?redirectBack=/dashboard`; non-owner â†’ `/`

### 5.3 Real-Time Subscription

```ts
// onSnapshot for live activity feed
useEffect(() => {
  const q = query(
    collection(db, 'analytics_events'),
    where('ownerId', '==', ownerId),
    orderBy('timestamp', 'desc'),
    limit(20),
  );
  const unsub = onSnapshot(q, (snap) => setActivity(snap.docs.map((d) => d.data())));
  return () => unsub();
}, [ownerId]);
```

---

## 6. Firebase Setup & Integration

### 6.1 Authentication

- `AdminGuard` reads `isOwner` from `authStore`; non-owners are redirected to `/` before any render
- Session is hydrated by `AuthInitializer` at app boot via `onAuthStateChanged`

### 6.2 Firestore Collections Read

| Collection         | Purpose                    | Query                             |
| ------------------ | -------------------------- | --------------------------------- |
| `profiles`         | `stats.*` for counters     | `doc(db, 'profiles', ownerId)`    |
| `analytics_events` | Chart data + activity feed | `where('ownerId', '==', ownerId)` |

### 6.3 Firestore Security Rules (relevant)

```
// analytics_events â€” owner read
match /analytics_events/{eventId} {
  allow read: if request.auth != null
    && request.auth.uid == resource.data.ownerId;
}
```

### 6.4 Firestore Indexes Required

```json
// firestore.indexes.json
{
  "indexes": [
    {
      "collectionGroup": "analytics_events",
      "fields": [
        { "fieldPath": "ownerId", "order": "ASCENDING" },
        { "fieldPath": "timestamp", "order": "DESCENDING" }
      ]
    }
  ]
}
```

### 6.5 Offline Behavior

- `profiles.stats` is served from IndexedDB cache if offline
- `onSnapshot` gracefully degrades to cached data when network is unavailable
- System Health block shows "Offline" status via `usePwaSync`

---

## 7. Additional Notes

- **Recruiter Signal:** The Dashboard demonstrates full-stack product thinking â€” it's not just a CRUD page but a live operational tool with real-time data, system diagnostics, and UX-optimized quick actions.
- **Modular Bento Blocks:** Each Bento block is an independently fetching, independently loading component. If the analytics chart fails to load, the rest of the dashboard renders normally.
- **Scalability:** Adding new metric blocks is a matter of adding a new `BentoBlock` with its own hook â€” no changes to surrounding layout code required.
- **AI Context Block** is intentionally reserved as a placeholder now so the space is allocated in the layout when `aiService.ts` is implemented.
# Page: Projects Manager

**Route:** `/projects` (admin)
**Type:** Admin (Protected)
**Guard Chain:** `AuthGuard` â†’ `AdminGuard` â†’ `AdminLayout` â†’ `ProjectsManagerPage`

---

## 1. Page Overview

The Projects Manager is a dedicated, tabular admin interface for managing the portfolio's project entries with full CRUD operations. While projects can also be edited inside the Builder's accordion, the Projects Manager provides a purpose-built, data-dense workspace optimized for managing many projects at once â€” including bulk operations, sorting, filtering by status, and managing 3D asset references.

**Primary Roles:**

- View all projects in a searchable, sortable, filterable table
- Create, edit, duplicate, and delete project entries
- Manage project status (draft / published / archived)
- Control feature flags (isFeatured, showIn3D, showOnHomepage)
- Link 3D model assets (.glb/.gltf) and manage media galleries per project
- Drag-to-reorder projects, writing `sortOrder` updates to Firestore in batch

---

## 2. UI Description

### 2.1 Layout

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  AdminLayout Navbar                                          â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚  Sidebar   â”‚  Header: "Projects Manager" + "Add Project" btn â”‚
â”‚            â”‚  â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€  â”‚
â”‚            â”‚  Filter/Search Bar                              â”‚
â”‚            â”‚  [ Search... ] [Statusâ–¼] [Sortâ–¼] [Bulk â–¼]       â”‚
â”‚            â”‚  â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€  â”‚
â”‚            â”‚  Projects Table                                 â”‚
â”‚            â”‚  â”Œâ”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
â”‚            â”‚  â”‚â˜ â”‚Thumbnail â”‚Title/Techâ”‚Status â”‚Actions  â”‚  â”‚
â”‚            â”‚  â”œâ”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤  â”‚
â”‚            â”‚  â”‚â˜ â”‚[img]     â”‚V2X Systemâ”‚ âœ…pub â”‚âœï¸ðŸ”—ðŸ—‘ï¸   â”‚  â”‚
â”‚            â”‚  â”‚â˜ â”‚[img]     â”‚Portfolio â”‚ ðŸ“drftâ”‚âœï¸ðŸ”—ðŸ—‘ï¸   â”‚  â”‚
â”‚            â”‚  â”‚â€¦  â”‚          â”‚          â”‚       â”‚         â”‚  â”‚
â”‚            â”‚  â””â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
â”‚            â”‚  Pagination: < 1 2 3 > | 20 per page            â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### 2.2 Filter and Search Bar

- Text search: real-time client-side filter on project titles and tech stack tags (Fuse.js)
- Status filter dropdown: `All | Published | Draft | Archived`
- Sort dropdown: `Sort Order | Title Aâ€“Z | Newest | Most Clicks`
- Bulk actions dropdown: `Publish Selected | Archive Selected | Delete Selected`

### 2.3 Projects Table

**Columns:**
| Col | Content |
|-----|---------|
| Checkbox | Select for bulk operations |
| Drag Handle | `â ¿` â€” drag row to reorder |
| Thumbnail | 48Ã—48 rounded image from `thumbnailUrl`; placeholder icon if none |
| Title & Tech | Project title (bold) + tech stack chips (first 3 visible, +N overflow badge) |
| Status | Pill badge: `âœ… Published` / `ðŸ“ Draft` / `ðŸ—„ï¸ Archived` |
| Featured | Star icon â€” filled if `isFeatured: true`; click to toggle |
| 3D Asset | Cube icon â€” filled if `modelUrl` is set; click to manage |
| Clicks | Count from `analytics_events` (cached, updated on page load) |
| Actions | `âœï¸ Edit` / `ðŸ”— Copy Link` / `ðŸ“‹ Duplicate` / `ðŸ—‘ï¸ Delete` |

### 2.4 Add / Edit Project Drawer

A right-side slide-in drawer (not a separate page) containing:

- Title (text input)
- Description (Markdown editor with preview toggle)
- Tech stack (chip array input â€” type and press Enter)
- Thumbnail upload (ImageUpload component â†’ Firebase Storage)
- Live URL + Repo URL (text inputs with URL validation)
- 3D Model URL (text input for Firebase Storage `.glb` path)
- Status select: Draft / Published / Archived
- Feature toggles: `isFeatured`, `showOnHomepage`, `showIn3D`
- Sort order (number input)
- Screenshots gallery (multi-image upload)

**Form validation:** Zod schema `projectSchema` in `src/forms/projectSchema.ts`

**Save behavior:** React Hook Form `onSubmit` â†’ `projectService.upsertProject()` â†’ React Query invalidation

### 2.5 3D Asset Manager Modal

Triggered by clicking the cube icon on a project row:

- Current model URL display with a mini R3F canvas preview of the `.glb` file
- Upload new model to Firebase Storage (`.glb` or `.gltf`, max 50MB)
- Or link an external model URL
- Draco compression note: "Compress your model using Draco for faster mobile loading [PLANNED]"

---

## 3. Features & Functionality

### 3.1 CRUD Operations

- **Create:** "Add Project" button opens drawer with empty form
- **Read:** Paginated Firestore query, 20 projects per page
- **Update:** Edit drawer pre-populated from Firestore; save writes back via `setDoc(merge: true)`
- **Delete:** `sweetalert2` confirmation â†’ `deleteDoc` â†’ remove from React Query cache via `invalidateQueries`

### 3.2 Drag-to-Reorder

```ts
// DndContext onDragEnd handler
async function handleDragEnd(event: DragEndEvent) {
  const { active, over } = event;
  if (!over || active.id === over.id) return;
  const reordered = arrayMove(projects, activeIndex, overIndex);
  // Optimistic update to local state
  setProjects(reordered);
  // Batch Firestore writes
  const batch = writeBatch(db);
  reordered.forEach((p, i) => batch.update(doc(db, 'projects', p.id), { sortOrder: i }));
  await batch.commit();
}
```

### 3.3 Bulk Operations

```ts
// Bulk publish
async function bulkPublish(selectedIds: string[]) {
  const batch = writeBatch(db);
  selectedIds.forEach((id) => batch.update(doc(db, 'projects', id), { status: 'published' }));
  await batch.commit();
  queryClient.invalidateQueries({ queryKey: ['projects', ownerId] });
}
```

### 3.4 Duplicate Project

```ts
async function duplicateProject(project: Project) {
  const { id, ...rest } = project;
  await setDoc(doc(db, 'projects', generateId()), {
    ...rest,
    title: `${rest.title} (Copy)`,
    status: 'draft',
    createdAt: serverTimestamp(),
  });
}
```

### 3.5 Feature Toggle (Star Icon)

- Click the star on a table row to toggle `isFeatured` instantly
- Uses optimistic update: UI updates immediately, Firestore write happens in background
- Error: reverts to previous state and shows toast

### 3.6 Analytics Click Count

- Click counts per project are pre-computed and stored in `project.clickCount` (denormalized, updated by Cloud Function trigger on new `analytics_events` documents)
- Avoids N+1 Firestore reads on the table

---

## 4. Styling

### 4.1 Table

- Header: `--sys-bg-tertiary` background, `text-xs font-semibold uppercase tracking-widest`
- Rows: alternating `rgba(255,255,255,0.01)` on even rows
- Row hover: `rgba(var(--color-primary-rgb), 0.04)` tint
- Drag-in-progress row: `opacity-50 scale-95 shadow-lg border border-[--color-primary]`

### 4.2 Status Badges

```css
.badge-published {
  color: #22c55e;
  background: rgba(34, 197, 94, 0.1);
}
.badge-draft {
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.1);
}
.badge-archived {
  color: #6b7280;
  background: rgba(107, 114, 128, 0.1);
}
```

### 4.3 Drawer

- `position: fixed; right: 0; top: 80px; bottom: 0;` â€” full height from navbar to bottom
- Width: `480px` on desktop, `100vw` on mobile
- Background: `--sys-bg-secondary` with left border in `--color-primary`
- Backdrop: semi-transparent overlay closes drawer on click

### 4.4 Responsiveness

- Table switches to card-stack layout on mobile (`< 768px`)
- Each card shows thumbnail, title, status badge, and action row
- Bulk select is hidden on mobile (accessed via individual card long-press)

---

## 5. Connections

### 5.1 React Query

```ts
const { data: projects, isLoading } = useQuery({
  queryKey: ['projects', ownerId, { status, sort, page }],
  queryFn: () => projectService.fetchProjects(ownerId, { status, sort, page }),
});
```

### 5.2 Services Called

- `projectService.fetchProjects(ownerId, filters)`
- `projectService.upsertProject(project)` â€” create + update
- `projectService.deleteProject(id)`
- `storageService.uploadProjectAsset(file, projectId, type)` â€” thumbnails + models

---

## 6. Firebase Setup & Integration

### 6.1 Firestore â€” `projects` Collection Schema

```ts
interface Project {
  id: string;
  ownerId: string;
  title: string;
  description: string; // Markdown
  techStack: string[];
  thumbnailUrl: string;
  screenshotUrls: string[];
  liveUrl?: string;
  repoUrl?: string;
  modelUrl?: string; // Firebase Storage .glb path
  status: 'draft' | 'published' | 'archived';
  isFeatured: boolean;
  showOnHomepage: boolean;
  showIn3D: boolean;
  sortOrder: number;
  clickCount: number; // Denormalized, updated by Cloud Function
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 6.2 Composite Indexes

```json
{
  "fields": [
    { "fieldPath": "ownerId", "order": "ASCENDING" },
    { "fieldPath": "status", "order": "ASCENDING" },
    { "fieldPath": "sortOrder", "order": "ASCENDING" }
  ]
}
```

### 6.3 Storage Paths

- Thumbnails: `owner/projects/{projectId}/thumbnail`
- Screenshots: `owner/projects/{projectId}/screenshots/{n}`
- 3D Models: `owner/projects/{projectId}/model.glb`

### 6.4 Security Rules

```
match /projects/{projectId} {
  allow read: if resource.data.status == 'published';
  allow read: if request.auth != null
    && request.auth.uid == resource.data.ownerId;
  allow create: if request.auth != null
    && request.resource.data.ownerId == request.auth.uid;
  allow update, delete: if request.auth != null
    && resource.data.ownerId == request.auth.uid;
}
```

---

## 7. Additional Notes

- **Denormalized `clickCount`** is critical for table performance â€” never run an aggregation query per project row during table render.
- **3D Model Size:** Enforce a 50MB upload limit on `.glb` files. Document that Draco compression (planned Phase 3) will reduce this to ~10MB for most models.
- **Duplicate Feature** seeds new projects as `draft` to prevent accidental publishing of unfinished clones.
- The Projects Manager and Builder both write to the same `projects` Firestore collection â€” both use the same `projectService` to ensure consistent data shapes.
# Page: Content Editor

**Route:** `/content`
**Type:** Admin (Protected)
**Guard Chain:** `AuthGuard` â†’ `AdminGuard` â†’ `AdminLayout` â†’ `ContentEditorPage`

---

## 1. Page Overview

The Content Editor is the CMS workspace for all non-project written content: blog posts, gallery items, and testimonials. It provides a three-tab interface where each tab manages a distinct content type, giving the owner a unified "content studio" without navigating to separate pages.

---

## 2. UI Description

### 2.1 Tabs

```
[ Blog Posts ] [ Gallery ] [ Testimonials ]
```

**Blog Posts Tab:**

- Left panel: list of all blog posts (card per post: title, status badge, published date, view count)
- Right panel: active post editor with:
  - Title (text input)
  - Excerpt (textarea, 200 chars)
  - Cover image (ImageUpload â†’ Firebase Storage)
  - Tags (chip array input)
  - Published date (date picker)
  - Toggle: `isPublished`, `featuredOnLanding`
  - Markdown body editor (left: raw MD textarea; right: `react-markdown` live preview)
  - Syntax highlighting in preview via `react-syntax-highlighter`
  - Toolbar: Bold, Italic, H1/H2/H3, Code Block, Link, Image, Table

**Gallery Tab:**

- Masonry grid of all gallery images
- Upload button: multi-file `ImageUpload` â†’ Firebase Storage `owner/gallery/`
- Each image card: hover â†’ delete button + alt-text edit inline
- Reorder: `@dnd-kit/sortable` drag-and-drop
- Alt text field per image (for accessibility)

**Testimonials Tab:**

- List of testimonial cards (reviewer name, company, truncated quote, rating)
- Add / Edit testimonial form (slide-in drawer):
  - Name, role, company (text inputs)
  - Avatar URL (ImageUpload)
  - Testimonial text (textarea, 500 chars)
  - Star rating selector (1â€“5, interactive star icons)
  - Toggle: `isPublished`, sortOrder
- Delete: `sweetalert2` confirmation

---

## 3. Features & Functionality

- **Blog autosave:** 800ms debounce on the Markdown editor, identical to builder autosave pattern
- **Slug generation:** auto-generates URL slug from title (`title.toLowerCase().replace(/ /g, '-')`)
- **Reading time:** auto-calculates `readTimeMinutes` from word count (average 200 WPM)
- **Image compression:** before upload, images are compressed client-side via `browser-image-compression` to `< 200KB` for gallery items
- **Draft preview:** "Preview Post" button opens `/blog/:slug?preview=true` in a new tab (preview mode bypasses `isPublished` check if the user is authenticated as owner)

---

## 4. Styling

- Same dark admin shell as all admin pages (`--sys-bg-*` tokens)
- Blog editor: left Markdown pane has `font-mono` font, slightly lighter background
- Preview pane: white background, `prose` typography class (Tailwind Typography plugin)
- Gallery grid: 3-column masonry on desktop, 2-column on tablet, 1-column on mobile
- Testimonial stars: `--color-primary` fill for filled stars, `--sys-border` for empty

---

## 5. Connections

```ts
const { data: blogPosts } = useQuery(['blogPosts', ownerId], () =>
  contentService.fetchBlogPosts(ownerId),
);
const { data: gallery } = useQuery(['gallery', ownerId], () =>
  contentService.fetchGallery(ownerId),
);
const { data: testimonials } = useQuery(['testimonials', ownerId], () =>
  contentService.fetchTestimonials(ownerId),
);
```

---

## 6. Firebase Setup & Integration

**Collections:** `blog_posts`, `gallery_items`, `testimonials`

**Storage paths:**

- Blog covers: `owner/blog-covers/`
- Gallery: `owner/gallery/`
- Testimonial avatars: `owner/testimonials/avatars/`

**Security rules:** Owner-only write; public read for `isPublished == true` documents

```
match /blog_posts/{postId} {
  allow read: if resource.data.isPublished == true;
  allow read, write: if request.auth.uid == resource.data.ownerId;
}
```

---

## 7. Additional Notes

- **Read Time & Slug** are computed client-side on save, stored alongside the post â€” never computed during public reads for performance.
- **Preview mode** requires the public `BlogPage` to check `?preview=true` and bypass the `isPublished` filter if `isOwner` is true from `authStore`.

---

---

# Page: Settings

**Route:** `/settings`
**Type:** Admin (Protected)
**Guard Chain:** `AuthGuard` â†’ `AdminGuard` â†’ `AdminLayout` â†’ `SettingsPage`

---

## 1. Page Overview

The Settings page is the operational configuration center for the MekeshBuilds platform â€” managing authentication credentials, environment configuration, notification preferences, PWA settings, and (planned) AI configuration. It is split into multiple tabs, each governing a distinct concern area.

---

## 2. UI Description

### 2.1 Tab Navigation

```
[ Account ] [ Security ] [ Notifications ] [ PWA ] [ Integrations ] [ Danger Zone ]
```

**Account Tab:**

- Display name, email (read-only â€” sourced from Firebase Auth)
- Profile photo URL (synced from `profiles.avatarUrl`)
- Owner email display (VITE_OWNER_EMAIL)
- "Sign Out of All Devices" button

**Security Tab:**

- Change password form: current password + new password + confirm (calls `updatePassword(user, newPassword)`)
- 2FA status indicator (reads from Firebase Auth `multiFactor.enrolledFactors`)
- Authorized domains list (informational only â€” manage in Firebase Console)
- Active sessions (count of `refreshToken` usages â€” informational)
- Brute-force lockout config: view/reset lockout state stored in `localStorage.__access_lockout`

**Notifications Tab [PLANNED]:**

- Toggle: email notifications for resume downloads / contact clicks
- Threshold: "Notify me when downloads exceed N in 24h"
- Connected to Firebase Cloud Messaging setup

**PWA Tab:**

- Service worker status (from `usePwaSync`)
- Offline cache size (estimated from Firestore IndexedDB usage)
- "Clear Cache" button â€” calls `caches.delete()` on all registered service worker caches
- Install prompt: "Add to Home Screen" trigger if `pwaInstallPrompt` event available
- Cache strategy display: which routes are cached (informational)

**Integrations Tab:**

- Firebase project details (project ID, region) â€” informational
- GitHub profile URL (stored in `profiles.socialLinks.github`)
- LinkedIn URL (stored in `profiles.socialLinks.linkedin`)
- FormSubmit endpoint URL configuration
- AI service status [PLANNED]: API key status, usage metrics

**Danger Zone Tab:**

- "Export All Data" â€” triggers Firestore export of all collections to JSON download
- "Reset Analytics" â€” deletes all `analytics_events` for the owner (with `sweetalert2` type-to-confirm)
- "Delete Account" â€” signs out, deletes all Firestore documents, removes Firebase Auth user

---

## 3. Features & Functionality

### 3.1 Change Password

```ts
import { updatePassword, reauthenticateWithCredential } from 'firebase/auth';

async function changePassword(currentPassword: string, newPassword: string) {
  const credential = EmailAuthProvider.credential(user.email!, currentPassword);
  await reauthenticateWithCredential(user, credential); // Required before sensitive operations
  await updatePassword(user, newPassword);
}
```

### 3.2 Export All Data

```ts
async function exportAllData(ownerId: string) {
  const collections = [
    'profiles',
    'skills',
    'projects',
    'blog_posts',
    'experience',
    'certificates',
    'testimonials',
  ];
  const data: Record<string, any[]> = {};
  for (const col of collections) {
    const snap = await getDocs(query(collection(db, col), where('ownerId', '==', ownerId)));
    data[col] = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  }
  downloadJson(data, `mekeshbuilds-export-${Date.now()}.json`);
}
```

### 3.3 Clear PWA Cache

```ts
async function clearCache() {
  const keys = await caches.keys();
  await Promise.all(keys.map((key) => caches.delete(key)));
  toast.success('Cache cleared. Reload the page to re-cache.');
}
```

---

## 4. Styling

- Tab navigation: horizontal pill tabs with active state in `--color-primary`
- Section headers within tabs: `text-sm font-semibold uppercase tracking-widest` + `--sys-border` bottom
- Danger zone: red tinted section header (`rgba(239,68,68,0.1)` background), all actions in red

---

## 5. Firebase Setup & Integration

**Auth operations:** `updatePassword`, `reauthenticateWithCredential`, `deleteUser`
**Firestore:** Batch reads for data export; batch deletes for account deletion
**Security:** Re-authentication required before password change and account deletion

---

---

# Page: Theme Studio

**Route:** `/themes`
**Type:** Admin (Protected)
**Guard Chain:** `AuthGuard` â†’ `AdminGuard` â†’ `AdminLayout` â†’ `ThemeStudioPage`

---

## 1. Page Overview

The Theme Studio is a dedicated visual engineering workspace where the owner configures the entire aesthetic of the public-facing portfolio. It exposes CSS custom property controls, font selection, lighting configuration for 3D scenes, and preset theme palettes. Changes are applied in real-time to an embedded portfolio preview without requiring any code changes or redeployment.

---

## 2. UI Description

### 2.1 Layout

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  AdminLayout Navbar â€” Theme Studio                         â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚  Sidebar   â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”â”‚
â”‚            â”‚  â”‚  Control Panel   â”‚  Live Preview Canvas   â”‚â”‚
â”‚            â”‚  â”‚  (360px)         â”‚  (flex-1)              â”‚â”‚
â”‚            â”‚  â”‚                  â”‚                        â”‚â”‚
â”‚            â”‚  â”‚  â–¼ Colors        â”‚  Portfolio preview at  â”‚â”‚
â”‚            â”‚  â”‚  â–¼ Typography    â”‚  50% scale             â”‚â”‚
â”‚            â”‚  â”‚  â–¼ Presets       â”‚                        â”‚â”‚
â”‚            â”‚  â”‚  â–¼ 3D Lighting   â”‚                        â”‚â”‚
â”‚            â”‚  â”‚  â–¼ Effects       â”‚                        â”‚â”‚
â”‚            â”‚  â”‚  â–¼ Modes         â”‚                        â”‚â”‚
â”‚            â”‚  â”‚                  â”‚                        â”‚â”‚
â”‚            â”‚  â”‚  [Save Theme]    â”‚                        â”‚â”‚
â”‚            â”‚  â”‚  [Reset]         â”‚                        â”‚â”‚
â”‚            â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### 2.2 Control Panel Sections

**â–¼ Colors:**

- Primary color: color picker + hex input (updates `--color-primary`)
- Secondary color (updates `--color-secondary`)
- Glow color (auto-derived from primary with reduced alpha, but overridable)
- Glass background: opacity slider (updates `--color-glass` alpha value)
- Background: base page background color

**â–¼ Typography:**

- Display font: searchable dropdown of Google Fonts (loads font on selection)
- Body font: same
- Code font: monospace font picker
- Base font size: slider (12â€“18px)
- Heading weight: dropdown (400â€“900)
- Letter spacing: slider (-2px to 4px)

**â–¼ Presets:**
Pre-built theme palettes (click to apply all color + font settings at once):

- "Electric Orange" (current default â€” `#ff6b2c`)
- "Cyber Teal" (`#0ccfaa`)
- "Royal Purple" (`#8b5cf6`)
- "Crimson Edge" (`#ef4444`)
- "Arctic Blue" (`#3b82f6`)
- "Monochrome" (white + grey)
  Custom: "Save current as preset" (stores in `profiles.themePresets[]`)

**â–¼ 3D Scene Lighting:**

- Ambient light intensity (slider 0â€“2)
- Point light 1 position (X/Y/Z sliders)
- Point light 1 color (color picker)
- Point light 2 color + intensity
- Environment map: dropdown (Studio / Sunset / Night / None)
- Shadows: on/off toggle

**â–¼ Effects:**

- Glassmorphism blur strength: slider (0â€“20px) â†’ `backdrop-blur-{n}`
- Border glow strength: slider â†’ `--bento-glow-shadow` intensity
- Particle density (0â€“200): controls particle count in 3D scenes
- Rough.js borders: on/off toggle + roughness slider (0â€“5)
- Motion intensity: `Reduced | Normal | Expressive` (scales all Framer Motion durations)

**â–¼ Creative Modes:**
Radio group selecting the portfolio's overall visual personality:

- `Professional` â€” minimal motion, clean borders, no Rough.js
- `Creative` â€” full motion, glows, organic borders
- `Organic` â€” heavy Rough.js, muted palette, hand-drawn aesthetic
- `Technical` â€” monospace fonts, terminal-inspired, low saturation

---

## 3. Features & Functionality

### 3.1 Real-Time Preview (useThemeEngine)

```ts
// useThemeEngine applies CSS variable mutations directly to #live-canvas DOM node
function applyTheme(canvas: HTMLElement, theme: ThemeConfig) {
  canvas.style.setProperty('--color-primary', theme.primaryColor);
  canvas.style.setProperty('--color-secondary', theme.secondaryColor);
  canvas.style.setProperty('--color-glow', generateGlow(theme.primaryColor));
  canvas.style.setProperty('--color-glass', `rgba(15, 15, 20, ${theme.glassOpacity})`);
  canvas.style.setProperty('--font-display', theme.displayFont);
  canvas.style.setProperty('--font-body', theme.bodyFont);
}
```

Changes appear sub-millisecond in the preview canvas â€” no React re-render required.

### 3.2 Save Theme

- Saves the complete `ThemeConfig` object to `profiles.theme` field in Firestore
- Triggers `queryClient.invalidateQueries(['portfolio'])` so the live canvas re-renders from fresh data
- The public portfolio reads `profiles.theme` on load and applies it via `useThemeEngine` in `PublicLayout`

### 3.3 Reset to Default

- Calls `applyTheme(canvas, defaultTheme)` and discards unsaved changes
- `sweetalert2` confirmation: "Reset to default theme? Unsaved changes will be lost."

### 3.4 Google Fonts Integration

```ts
// Dynamically load selected Google Font
function loadGoogleFont(fontFamily: string) {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/ /g, '+')}:wght@300;400;600;700&display=swap`;
  document.head.appendChild(link);
}
```

---

## 4. Styling

- Control panel: `--sys-bg-secondary`, sliders use custom CSS styling with `--color-primary` thumb color
- Color pickers: native `<input type="color">` with a custom styled wrapper
- Preview canvas: renders inside a device-mockup frame (desktop browser chrome aesthetic)
- Preset swatches: 40Ã—40px rounded squares showing the palette preview; hover shows "Apply" label

---

## 5. Firebase Setup & Integration

**Firestore field:** `profiles.theme` (sub-object of the profiles document)

```ts
interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  glassOpacity: number;
  displayFont: string;
  bodyFont: string;
  baseFontSize: number;
  particleDensity: number;
  roughBorders: boolean;
  roughness: number;
  motionIntensity: 'reduced' | 'normal' | 'expressive';
  creativeMode: 'professional' | 'creative' | 'organic' | 'technical';
  ambientLightIntensity: number;
  lightColor1: string;
  lightColor2: string;
  shadowsEnabled: boolean;
  savedPresets: ThemePreset[];
}
```

**Security:** Only the owner can write to `profiles/{ownerId}.theme`. Public reads are allowed (public portfolio needs it to render correctly).

---

## 7. Additional Notes

- **Zero-latency theming** via direct DOM mutation is the key architectural decision. If CSS variable updates went through React state â†’ re-render, the preview would stutter with every slider tick.
- **Google Fonts dynamically loaded** at runtime based on the selection â€” but the font name is committed to Firestore only on "Save Theme". The live preview loads it immediately for instant visual feedback.
- **3D lighting settings** are passed as props into every R3F canvas component from the `profiles.theme` object, so the Theme Studio controls the entire 3D visual environment.
# Page: Home (Landing Page)

**Route:** `/`
**Type:** Public
**Component:** `LandingPage`

---

## 1. Page Overview

The Home page is the primary marketing and conversion surface for MekeshBuilds. It serves double-duty as both a portfolio showcase and a platform landing page, designed to convert recruiters into portfolio viewers and ultimately into contacts. Every section is Firebase-driven (no static local data in production) and rendered as an immersive Bento Grid with 3D and motion elements. See `home.md` for the complete section-by-section specification.

---

## 2. UI Description

**Section Order:**

1. Navbar (sticky)
2. HeroSection â€” 3D portrait canvas, animated name, tech orbit badges, floating stat cards
3. MySkillSection â€” Firebase skills, Bento grid carousel, Rough.js borders
4. HireMe â€” Dynamic stat counters, 3D concentric torus rings, availability banner
5. TechArsenal3DSection ðŸ†• â€” Force-directed 3D sphere graph of full tech stack
6. ProjectSection â€” Firebase featured projects, Bento layout, 3D tilt
7. AchievementsTimelineSection ðŸ†• â€” 3D Bezier spine timeline of certs + experience
8. BlogSection â€” Firebase blog posts, masonry Bento grid
9. ImpactMetricsSection ðŸ†• â€” Live counters, 3D bar chart, activity ticker
10. MapSection â€” Firebase-driven map center, Google Maps embed
11. TestimonialsSection â€” Firebase testimonials, masonry grid, 3D avatars
12. CTASection â€” Lead capture form (FormSubmit external API)
13. Footer â€” Firebase profile chip, newsletter subscriber write

**Bento Grid Architecture:**

- Sections are full-width containers; internal content is asymmetric CSS Grid
- All blocks use the shared `BentoBlock` primitive with glassmorphism styling
- Motion: Framer Motion staggered entry, `useTilt3D` hook on project/blog cards

---

## 3. Features & Functionality

- Dynamic Firebase data across all sections (no static arrays in production)
- R3F 3D canvases: Hero portrait mesh, TechArsenal3D sphere graph, Timeline Bezier spine, ImpactMetrics bar chart
- `useAiContext` hook parses URL params (e.g., `?role=frontend`) for AI personalization [PLANNED when aiService.ts implemented]
- `usePortfolioData(ownerUsername)` resolves all profile data in a single query
- PWA offline: IndexedDB cache serves all sections on repeat visits
- Newsletter write to Firestore `newsletter_subscribers`
- Lead capture via `ctaMailService` â†’ FormSubmit endpoint
- Google Maps embed with `navigator.geolocation` for "use my location" feature

---

## 4. Styling

- Dark-first: `--sys-bg-primary: #0f0f14` page background
- Accent system: `--color-primary` (owner-configured in Theme Studio), `--color-glow`, `--color-glass`
- Glassmorphism cards: `backdrop-blur-xl`, `rgba(15,15,20,0.6)` backgrounds, `rgba(255,255,255,0.08)` borders
- Typography: `--font-display` for headings, `--font-body` for body text
- Section spacing: `py-24 md:py-32` between sections
- Rough.js organic borders on select Bento blocks (when installed)
- Full PWA manifest: installable on mobile home screen

---

## 5. Connections

```ts
// Primary data hooks
const { data: profile } = useHeroData(ownerUsername);
const { data: skills } = usePublishedSkills(ownerId, { featuredOnLanding: true });
const { data: projects } = useFeaturedProjects(ownerId);
const { data: blogPosts } = usePublishedBlogPosts(ownerId, { featuredOnLanding: true, limit: 3 });
const { data: testimonials } = useTestimonials(ownerId);
const { data: timeline } = useCertificatesAndExperience(ownerId);
const { data: stats } = useOwnerStats(ownerId);
```

- React Query staleTime: 15 min for profile, 5 min for assets, 2 min for analytics
- `queryClient.prefetchQuery` called in `LandingPage` for hero data to eliminate loading state for above-the-fold content

---

## 6. Firebase Setup & Integration

**Collections Read:** `profiles`, `skills`, `projects`, `blog_posts`, `testimonials`, `certificates`, `experience`, `analytics_events` (aggregated)
**Collections Written:** `newsletter_subscribers` (Footer), `analytics_events` (page view event on mount)
**Auth:** No authentication required. Public page.

**Page view event write:**

```ts
// Fired on LandingPage mount
async function trackPageView(ownerId: string) {
  await addDoc(collection(db, 'analytics_events'), {
    ownerId,
    type: 'page_view_landing',
    route: '/',
    timestamp: serverTimestamp(),
    sessionId: getOrCreateSessionId(),
  });
}
```

**Security rules:** All collections readable without auth for `isPublished == true` documents.

---

## 7. Additional Notes

- `vite-plugin-pwa` must be installed and configured for full offline caching support
- Hero section's `techBadgePills[]` must be populated from `profiles` (not hardcoded) to eliminate the Supabase badge visual
- `home.md` contains the full canonical specification for all sections including the 3 new sections

---

---

# Page: Public Projects

**Route:** `/projects` (note: same path as admin, disambiguated by guard â€” public route renders for unauthenticated users)
**Type:** Public
**Component:** `PublicProjectsPage`

---

## 1. Page Overview

The public Projects page provides an immersive, filterable gallery of all published portfolio projects. Unlike the admin Projects Manager (tabular), this page is designed for recruiter consumption â€” visual, interactive, and narrative-driven with project detail modals that tell the full story of each project.

---

## 2. UI Description

### 2.1 Layout

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  PublicLayout Navbar                                â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚  Page Hero: "Projects" heading + filter chips       â”‚
â”‚  [ All ] [ Embedded ] [ Full-Stack ] [ AI/ML ] ...  â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚  Projects Bento Grid                                â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”‚
â”‚  â”‚ Featured (2x2) â”‚ Card(1x1) â”‚ Card (1x1)    â”‚    â”‚
â”‚  â”‚                â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤    â”‚
â”‚  â”‚                â”‚   Wide card (1x2)          â”‚    â”‚
â”‚  â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤    â”‚
â”‚  â”‚  Regular grid of remaining projects         â”‚    â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â”‚
â”‚  Project Detail Modal (overlay when card clicked)   â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### 2.2 Project Card (Bento Block)

- Thumbnail with `useTilt3D` parallax effect on hover
- Title, tech stack chips (first 3 + overflow badge)
- Brief description excerpt (100 chars)
- Status indicators: Live URL icon, GitHub icon
- Featured flag: subtle glow border + star badge

### 2.3 Project Detail Modal

- Triggered by clicking any project card
- Full-screen overlay with:
  - Title + tech stack
  - Full description (Markdown rendered)
  - Screenshot carousel (Framer Motion slide transitions)
  - 3D model viewer (mini R3F canvas) if `modelUrl` is set
  - Achievements/awards from project (if set)
  - Live URL + GitHub URL CTAs
  - "â† Back" button or Escape key closes

### 2.4 Filter Chips

- Categories derived from `techStack` arrays (dynamically computed, e.g., "React", "ESP32", "Python")
- Active filter: smooth Framer Motion reflow via `layout` prop on grid items
- "All" chip always present; custom category chips from actual project data

---

## 3. Features & Functionality

- Filtering: `fuse.js` client-side fuzzy search by project title + tags
- Firestore query: `where('status', '==', 'published')`, `orderBy('sortOrder', 'asc')`
- Deep-link support: `/projects?id=abc123` opens the modal directly for that project (for AI share links)
- Analytics: `page_view_profile` + `click_project` events written to Firestore on interaction
- `usePageSeo` hook injects project-specific Open Graph meta tags when a project modal is open (for social sharing)
- Empty state: "No projects yet â€” check back soon!" with a subtle 3D animated placeholder

---

## 4. Styling

- Same dark Bento Grid aesthetic as the landing page
- Project cards: `hover:shadow-[0_0_20px_var(--color-glow)]` on hover
- Category chips: glassmorphism pills with active state in `--color-primary`
- Modal: `position:fixed; inset:0; z-index:50; backdrop-blur-md` overlay; card centered

---

## 5. Firebase Setup & Integration

```ts
const { data: projects } = useQuery({
  queryKey: ['publicProjects', ownerId],
  queryFn: () => projectService.fetchPublishedProjects(ownerId),
  staleTime: 5 * 60 * 1000,
});
```

**Analytics write on project click:**

```ts
await addDoc(collection(db, 'analytics_events'), {
  ownerId,
  type: 'click_project',
  resource: project.id,
  timestamp: serverTimestamp(),
  sessionId: getOrCreateSessionId(),
});
```

---

## 7. Additional Notes

- The route `/projects` appears in both admin and public contexts. The router must disambiguate: admin route is nested under the `AdminLayout` guard chain; public route is under `PublicLayout`. Verify `AppRouter.tsx` handles this correctly.
- Deep-link project modal enables AI-personalized share links like `/:username?highlight=project-v2x` to auto-open specific projects.

---

---

# Page: Public Skills

**Route:** `/skills`
**Type:** Public
**Component:** `PublicSkillsPage`

---

## 1. Page Overview

A dedicated public showcase of the owner's complete skill set, presented in more depth than the landing page skill section. Grouped by category, with proficiency rings, years of experience, and an interactive 3D visualization matching the `TechArsenal3DSection` from the landing page.

---

## 2. UI Description

- **Page Hero:** "Skills & Expertise" heading + subtitle from `profiles.tagline`
- **Category Tab Bar:** dynamically generated from distinct `skill.category` values in Firestore
- **Skill Grid (Bento):** 3-column Bento grid, each block shows icon, name, proficiency arc ring, `yearsUsed`, `projectsUsedIn` count
- **3D Arsenal Canvas:** Full-width R3F force-directed sphere graph (same component as `TechArsenal3DSection`)
- **Proficiency Arc Ring:** SVG arc drawn from 0Â° to `(proficiencyLevel / 100) * 360Â°` in `--color-primary`

---

## 3. Features & Functionality

- Category filter tabs reflow the Bento grid via `AnimatePresence` + `layout`
- Hover a skill card: expands to show description + projects using that skill
- "Search skills" input: Fuse.js filter on name + category
- 3D Canvas: same interactive sphere graph from landing page (shared R3F component)

---

## 4. Firebase Setup & Integration

```ts
const { data: skills } = useQuery({
  queryKey: ['publicSkills', ownerId],
  queryFn: () => skillService.fetchPublishedSkills(ownerId),
});
```

**Analytics:** `page_view_skills` event on mount.

---

---

# Page: Public Blog

**Route:** `/blog`
**Type:** Public
**Component:** `PublicBlogPage`

---

## 1. Page Overview

The Blog page lists all published blog posts as a recruiter-readable technical writing showcase. It demonstrates depth of knowledge through written communication â€” a differentiator that goes beyond project code.

---

## 2. UI Description

- **Page Hero:** "Technical Writing" heading + post count badge
- **Filter Row:** Category chips (from `tags[]`), "Featured only" toggle
- **Blog Grid (Bento):** Top post as `2x2` featured block (large cover, full excerpt); remaining posts as `1x1` cards
- **Post Card:** Cover image, title, tags, read time badge, published date, excerpt

**Individual Post Page:** `/blog/:slug`

- Full `react-markdown` render with syntax highlighting
- Table of contents sidebar (auto-generated from headings)
- Estimated read time + published date
- Tags
- "Back to Blog" navigation
- Open Graph meta via `react-helmet-async`

---

## 3. Features & Functionality

- Firestore query: `where('isPublished', '==', true)`, `orderBy('publishedAt', 'desc')`
- Category filter: client-side from loaded posts (no re-query needed)
- Search: Fuse.js on title + excerpt
- Preview mode: if `?preview=true` and owner is authenticated, shows draft posts

---

## 4. Firebase Setup & Integration

```ts
const { data: posts } = usePublishedBlogPosts(ownerId, { limit: 20 });
// Individual post:
const { data: post } = useQuery(['post', slug], () =>
  contentService.fetchPostBySlug(ownerId, slug),
);
```

**Analytics:** `page_view_blog` event on mount.

**Security rule:**

```
match /blog_posts/{postId} {
  allow read: if resource.data.isPublished == true;
}
```

# Page: About

**Route:** `/about`
**Type:** Public
**Component:** `PublicAboutPage`

---

## 1. Page Overview

The About page is a long-form personal narrative page that goes deeper than the hero section on the landing page. It is the "human story" of the portfolio â€” background, motivations, engineering philosophy, and non-work interests â€” designed to build connection with recruiters and hiring managers who want to understand the person behind the projects.

---

## 2. UI Description

### 2.1 Layout

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  PublicLayout Navbar                                    â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚  Hero Strip: Portrait + Name + Role                     â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚  Bento Grid Content                                     â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”â”‚
â”‚  â”‚  Long-form Bio        â”‚  Quick Facts Card           â”‚â”‚
â”‚  â”‚  (col-span-2)         â”‚  Location, Availability,    â”‚â”‚
â”‚  â”‚                       â”‚  Open to: [roles]           â”‚â”‚
â”‚  â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤                             â”‚â”‚
â”‚  â”‚  Engineering          â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤â”‚
â”‚  â”‚  Philosophy Block     â”‚  Education Block            â”‚â”‚
â”‚  â”‚                       â”‚  (timeline format)          â”‚â”‚
â”‚  â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤â”‚
â”‚  â”‚  Interests / Hobbies Block  (icon grid)              â”‚â”‚
â”‚  â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤â”‚
â”‚  â”‚  Industrial Training Block  (cards)                  â”‚â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜â”‚
â”‚  CTA Section: "Let's Work Together" â†’ contact/CTA       â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### 2.2 Bento Blocks

**Long-form Bio Block (col-span-2):**

- Multi-paragraph text sourced from `profiles.aboutBio` (extended bio field, separate from the short hero `bio`)
- Supports Markdown rendering via `react-markdown`
- Optional inline images

**Quick Facts Card:**

- Location chip (city from `profiles.location.city`)
- Availability badge (color-coded from `profiles.availabilityStatus`)
- "Open to" list: role types from `profiles.openToRoles[]` (e.g., ["GET", "Embedded Engineer", "Full-Stack"])
- Languages chip array

**Engineering Philosophy Block:**

- A featured quote or philosophy statement from `profiles.engineeringPhilosophy`
- Large blockquote styling with `--color-primary` left border
- Author attribution below

**Education Block:**

- Vertical timeline of education entries from `experience` collection where `type == 'education'`
- Each entry: institution name, degree, year range, CGPA badge
- Graduation cap icon per entry (Rough.js hand-drawn style)

**Interests Block:**

- Icon grid of personal interests/hobbies (from `profiles.interests[]`)
- Each interest: icon (from `react-icons`) + label
- On hover: slight scale-up and glow

**Industrial Training Block:**

- Cards for each training entry from `experience` where `type == 'training'`
- Company name, dates, brief description
- Location chip

---

## 3. Features & Functionality

- All content dynamically sourced from Firestore (`profiles` + `experience`)
- Builder editable: `profiles.aboutBio`, `profiles.engineeringPhilosophy`, `profiles.openToRoles[]`, `profiles.interests[]`
- "Download Resume" CTA button links to the owner's primary static resume PDF URL (from `resume_files` collection where `label == 'General'`)
- SEO: `react-helmet-async` injects `<title>About {fullName} | MekeshBuilds</title>` and description meta from `aboutBio` excerpt
- Analytics: `page_view_about` event fired on mount

---

## 4. Styling

- Same dark Bento Grid as all public pages
- Bio text: `prose max-w-none` Tailwind prose classes with custom dark-mode overrides
- Philosophy quote: `text-2xl font-display italic` with `--color-primary` border-left
- Education timeline: vertical dashed line in `--color-primary` with dot markers per entry
- Interests grid: `grid-cols-4 md:grid-cols-6` of uniform square blocks

---

## 5. Firebase Setup & Integration

```ts
const { data: profile } = useHeroData(ownerUsername); // includes aboutBio, interests, philosophy
const { data: education } = useQuery({
  queryKey: ['education', ownerId],
  queryFn: () => experienceService.fetchByType(ownerId, ['education', 'training']),
});
```

**New `profiles` fields needed:**

- `aboutBio`: string (extended Markdown bio)
- `engineeringPhilosophy`: string
- `openToRoles`: string[]
- `interests`: Array<{ label: string; icon: string }>

---

## 7. Additional Notes

- `aboutBio` is a separate Firestore field from `bio` (hero section short bio) â€” the About page bio can be 500â€“2000 words while the hero bio is 100â€“200 words.
- The About page functions as the secondary conversion surface after the landing page hero â€” it is the "let me tell you more" layer for recruiters who clicked through.

---

---

# Page: Public Profile / Resume

**Route:** `/:username`
**Type:** Public (Dynamic)
**Component:** `PublicProfilePage` wrapped in `PublicLayout`

---

## 1. Page Overview

The Public Profile is the core portfolio page â€” the primary URL shared with recruiters. It renders the full Bento Grid portfolio experience for the owner's username, with optional AI personalization based on URL parameters. This is the page the owner shares as `mekesh.dev/mekesh` (or equivalent), and the page that AI-generated recruiter-specific links point to.

---

## 2. UI Description

### 2.1 Composition

The page shares section components with `LandingPage` but is organized as a pure portfolio rather than a marketing page:

1. HeroSection (same component as landing page hero)
2. SkillsSection (full Bento Grid of all published skills)
3. ExperienceSection (timeline of work history)
4. ProjectsSection (all published projects in Bento Grid)
5. CertificatesSection (achievement cards)
6. TestimonialsSection (masonry grid)
7. ContactSection (CTA form)

### 2.2 AI Personalization Banner [PLANNED]

If URL params include `?role=frontend&company=google`, a subtle glassmorphism banner appears at the top:

> "This portfolio has been tailored for Frontend Engineering roles at Google â€” highlighting React, TypeScript, and Web Performance projects."

### 2.3 Bento Layout Configuration

Section order and Bento block sizes can be customized per profile via `profiles.bentoLayout` (a JSON config object) â€” allowing the admin to create recruiter-specific layouts.

---

## 3. Features & Functionality

- `useParams()` extracts `username`
- `usePortfolioData(username)` resolves all sections from Firestore
- `useAiContext()` parses URL params for recruiter intent [PLANNED]
- Skeleton loaders per section during Firestore hydration
- "Not found" state if username doesn't match any `profiles.username` document
- Analytics: `page_view_profile` event with `username` and `source` properties
- `react-helmet-async` injects per-profile Open Graph meta (portrait image, name, tagline)
- Offline: full page served from IndexedDB cache on repeat visits (PWA)
- PDF export: "Download Resume" button triggers `useExportPDF` with live portfolio data

---

## 4. Styling

- Inherits all theme settings from `profiles.theme` (colors, fonts, effects) â€” dynamically applied via `useThemeEngine` in `PublicLayout`
- Each portfolio section's Bento blocks use the `--color-*` canvas tokens (not admin `--sys-*` tokens)
- Recruiter-optimized typography: larger headings, generous line height, high contrast

---

## 5. Connections

```ts
const { username } = useParams();
const { data: portfolio, isLoading, error } = usePortfolioData(username);
// portfolio: { profile, skills, projects, experience, certificates, testimonials }
```

**Not found handling:**

```ts
if (error?.code === 'not-found') return <Navigate to="/404" />;
```

---

## 6. Firebase Setup & Integration

**Primary query:**

```ts
const q = query(
  collection(db, 'profiles').withConverter(profileConverter),
  where('username', '==', username),
  where('isPublished', '==', true),
  limit(1),
);
```

**Then parallel queries for portfolio assets using the resolved `ownerId`:**

```ts
const [skills, projects, experience, certs, testimonials] = await Promise.all([
  skillService.fetchPublishedSkills(ownerId),
  projectService.fetchPublishedProjects(ownerId),
  experienceService.fetchPublished(ownerId),
  certificateService.fetchPublished(ownerId),
  contentService.fetchTestimonials(ownerId),
]);
```

**Composite index required:**

```json
{
  "fields": [
    { "fieldPath": "username", "order": "ASCENDING" },
    { "fieldPath": "isPublished", "order": "ASCENDING" }
  ]
}
```

---

## 7. Additional Notes

- `/:username` is the most performance-critical route â€” it must achieve sub-1s LCP for recruiter first impressions
- PWA cache ensures sub-100ms loads on repeat visits
- AI personalization layer (Phase 2) will dynamically reorder sections and highlight specific skills based on intent classification

---

---

# Page: Login

**Route:** `/auth/login` (Note: The router also accepts `/admin-access` for backward compatibility)
**Type:** Public (Auth entry point)
**Component:** `AdminAccessPage` / `LoginPage`

---

## 1. Page Overview

The Login page is the secure entry point to the owner-only admin workspace. It is designed as a zero-trust portal â€” minimal surface area, hardened against brute force, and styled to feel like an exclusive, professional gate rather than a generic login form.

---

## 2. UI Description

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  Centered card (max-w-md) on dark full-screen bg     â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
â”‚  â”‚  MekeshBuilds logo + "Admin Access" heading   â”‚  â”‚
â”‚  â”‚  â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€    â”‚  â”‚
â”‚  â”‚  Email input                                  â”‚  â”‚
â”‚  â”‚  Password input (show/hide toggle)            â”‚  â”‚
â”‚  â”‚  "Forgot password?" link â†’ /auth/forgot-pass  â”‚  â”‚
â”‚  â”‚  [Sign In with Email] button                  â”‚  â”‚
â”‚  â”‚  â”€â”€â”€ or â”€â”€â”€                                   â”‚  â”‚
â”‚  â”‚  [Sign In with Google] button                 â”‚  â”‚
â”‚  â”‚                                               â”‚  â”‚
â”‚  â”‚  Lockout warning (appears after 3 attempts):  â”‚  â”‚
â”‚  â”‚  "âš ï¸ 2 attempts remaining before lockout"     â”‚  â”‚
â”‚  â”‚                                               â”‚  â”‚
â”‚  â”‚  Lockout state (countdown timer):             â”‚  â”‚
â”‚  â”‚  "ðŸ”’ Locked for 14:32 â€” too many attempts"   â”‚  â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Background:** Animated subtle particle field (R3F or CSS keyframe particles) to maintain immersive aesthetic even on the auth page.

---

## 3. Features & Functionality

### 3.1 Email/Password Sign In

```ts
const userCredential = await signInWithEmailAndPassword(auth, email, password);
const isOwner = await ensureOwnerSession(userCredential.user);
if (!isOwner) {
  await auth.signOut();
  throw new Error('Unauthorized: Owner access only.');
}
```

### 3.2 Google OAuth Sign In

```ts
const provider = new GoogleAuthProvider();
const result = await signInWithPopup(auth, provider);
// Falls back to signInWithRedirect on mobile PWAs
```

### 3.3 Brute Force Lockout

```ts
const LOCKOUT_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

function checkLockout(): { locked: boolean; remainingMs: number; attemptsLeft: number } {
  const data = JSON.parse(localStorage.getItem('__access_lockout') || '{}');
  if (data.lockedUntil && Date.now() < data.lockedUntil) {
    return { locked: true, remainingMs: data.lockedUntil - Date.now(), attemptsLeft: 0 };
  }
  return { locked: false, remainingMs: 0, attemptsLeft: LOCKOUT_ATTEMPTS - (data.attempts || 0) };
}
```

### 3.4 Post-Login Redirect

```ts
const redirectBack = new URLSearchParams(location.search).get('redirectBack') || '/dashboard';
navigate(redirectBack);
```

---

## 4. Styling

- Full-screen dark background: `--sys-bg-primary` with subtle radial glow at center
- Card: `--sys-bg-secondary`, `--bento-radius-lg` corners, `--bento-glow-shadow`
- Email/password inputs: dark background, `--sys-border` border, `--color-primary` focus ring
- Sign In button: filled `--color-primary` background
- Google button: outlined style with Google brand colors
- Warning state: amber background tint on lockout warning
- Locked state: red tint with countdown timer text

---

## 5. Firebase Setup & Integration

**Operations:** `signInWithEmailAndPassword`, `signInWithPopup` (GoogleAuthProvider)
**Authorized domains:** Must include production domain in Firebase Console â†’ Auth â†’ Settings â†’ Authorized Domains
**Environment variable:** `VITE_OWNER_EMAIL` used as fallback owner validation

---

---

# Page: Register

**Route:** `/auth/register`
**Type:** Public
**Component:** `RegisterPage`

---

## 1. Page Overview

The Register page enables the initial owner account creation for a new MekeshBuilds deployment. In production, this page is typically locked down after the owner account is created (via a Firebase Security Rule or environment flag), preventing unauthorized users from creating accounts.

---

## 2. UI Description

Same centered card layout as the Login page, containing:

- Full name input
- Email input
- Password input + confirm password
- "I am the owner of this portfolio" confirmation checkbox
- [Create Account] button
- Link back to `/auth/login`

---

## 3. Features & Functionality

```ts
const userCredential = await createUserWithEmailAndPassword(auth, email, password);
await updateProfile(userCredential.user, { displayName: fullName });
// Create owner profile document in Firestore
await setDoc(doc(db, 'profiles', userCredential.user.uid), {
  ownerId: userCredential.user.uid,
  fullName,
  email,
  username: generateUsername(fullName),
  role: 'owner',
  isPublished: false,
  createdAt: serverTimestamp(),
});
navigate('/builder'); // First-time setup flow
```

**Production lockdown:** After owner registration, a Firestore rule or environment variable (`VITE_REGISTRATION_ENABLED=false`) disables this route, showing "Registration is closed" to prevent unauthorized accounts.

---

## 4. Firebase Setup & Integration

**Operations:** `createUserWithEmailAndPassword`, `updateProfile`, `setDoc` (profiles)
**Post-registration:** Owner profile document created with `role: 'owner'` for `AdminGuard` validation

---

---

# Page: Forgot Password

**Route:** `/auth/forgot-password`
**Type:** Public
**Component:** `ForgotPasswordPage`

---

## 1. Page Overview

Single-purpose utility page for the owner to initiate a Firebase password reset email.

---

## 2. UI Description

Centered card (same aesthetic as Login):

- Email input
- [Send Reset Email] button
- Success state: "Check your inbox â€” password reset email sent!"
- Back to login link

---

## 3. Features & Functionality

```ts
await sendPasswordResetEmail(auth, email);
setSuccess(true); // Shows success message
```

- Zod validation: `z.string().email()`
- Error handling: `auth/user-not-found` â†’ shows generic "If an account exists, you'll receive an email" (security best practice â€” don't confirm email existence)

---

## 4. Firebase Setup & Integration

**Operation:** `sendPasswordResetEmail(auth, email)`
**Template:** Customize the password reset email template in Firebase Console â†’ Authentication â†’ Templates

---

---

# Page: Auth Callback

**Route:** `/auth/callback`
**Type:** Public (OAuth redirect handler)
**Component:** `AuthCallbackPage`

---

## 1. Page Overview

A transparent redirect-handler page that intercepts the Firebase OAuth provider response, validates owner status, and routes the user to the appropriate destination. Visible only briefly as a loading state during the OAuth handshake.

---

## 2. UI Description

- Full-screen centered loading spinner with "Verifying your identityâ€¦" text
- If validation fails: error message + "Return to login" link
- No permanent UI â€” transitions away within < 2 seconds

---

## 3. Features & Functionality

```ts
useEffect(() => {
  async function handleCallback() {
    try {
      const result = await getRedirectResult(auth);
      if (result) {
        const isOwner = await checkOwnerStatus(result.user);
        if (!isOwner) {
          await auth.signOut();
          navigate('/auth/login?error=unauthorized');
          return;
        }
      }
      const redirectBack = sessionStorage.getItem('redirectBack') || '/dashboard';
      navigate(redirectBack);
    } catch (err) {
      navigate('/auth/login?error=callback-failed');
    }
  }
  handleCallback();
}, []);
```

---

## 4. Firebase Setup & Integration

**Operation:** `getRedirectResult(auth)` â€” captures the OAuth redirect result
**Usage:** Only triggered when `signInWithRedirect` is used (mobile PWA fallback from `signInWithPopup`)

---

---

# Page: Not Found (Fallback)

**Route:** `*`
**Type:** Public
**Component:** `NotFoundPage`

---

## 1. Page Overview

The 404 Not Found page handles all unmatched routes. It is PWA-optimized (works offline), logs failed routing attempts to Firestore for broken link detection, and provides a clear path back into the application.

---

## 2. UI Description

- Full-screen dark background
- Large "404" in display font with a subtle glitch text animation (CSS keyframes)
- Short message: "This page doesn't exist or went offline."
- Two CTA buttons: [â† Back to Portfolio] â†’ `/` and [Open Builder] â†’ `/builder` (only shown if owner is authenticated)
- Subtle animated particle background (shared CSS animation, no R3F to keep weight minimal on error page)
- Offline indicator: if `usePwaSync.isOnline == false`, message changes to "You're offline â€” this page isn't in your cache yet."

---

## 3. Features & Functionality

**Error logging:**

```ts
useEffect(() => {
  addDoc(collection(db, 'error_logs'), {
    type: '404',
    path: location.pathname,
    referrer: document.referrer,
    timestamp: serverTimestamp(),
    userAgent: navigator.userAgent.slice(0, 200),
  });
}, []);
```

- `isOwner` from `authStore` controls whether "Open Builder" button is shown
- `usePwaSync` for online/offline state
- `react-helmet-async`: `<title>Page Not Found | MekeshBuilds</title>`, `<meta name="robots" content="noindex">`

---

## 4. Styling

- "404" heading: `text-[12rem] font-display font-black` with CSS glitch animation
  ```css
  @keyframes glitch {
    0%,
    100% {
      clip-path: inset(0 0 100% 0);
      transform: translate(-2px, 0);
    }
    20% {
      clip-path: inset(30% 0 50% 0);
      transform: translate(2px, 0);
    }
    40% {
      clip-path: inset(70% 0 10% 0);
      transform: translate(-1px, 0);
    }
  }
  ```
- Subtitle: `text-sys-text-secondary`
- Buttons: primary filled + secondary outlined

---

## 5. Firebase Setup & Integration

**Collection written:** `error_logs`

```ts
interface ErrorLog {
  type: '404' | 'webgl-crash' | 'auth-error';
  path: string;
  referrer: string;
  timestamp: Timestamp;
  userAgent: string;
}
```

**Security rule:**

```
match /error_logs/{logId} {
  allow create: if request.resource.data.timestamp is timestamp;
  allow read: if request.auth.token.admin == true;
  allow update, delete: if false;
}
```

---

## 7. Additional Notes

- The error logging to Firestore enables the admin to identify broken external links pointing to the portfolio (e.g., old LinkedIn profile links, outdated share links)
- Keep the 404 page weight minimal â€” no R3F canvas, no heavy libraries. It must work reliably even when the app is partially loaded.
- The PWA offline message is important: recruiters may have cached the portfolio and then navigated to a URL that doesn't exist in the cache â€” the message prevents confusion.
