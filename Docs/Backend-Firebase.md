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
