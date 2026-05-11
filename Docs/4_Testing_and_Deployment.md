# --- Testing.md ---

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

## Phase 1 Test Priority (Immediate — Next Dev Cycle)

The infrastructure is ready. These 7 test files should be created first to establish a reliable baseline:

| Priority | Test File | What to Verify |
|----------|-----------|----------------|
| 1 | `src/routes/guards/AuthGuard.test.tsx` | Unauthenticated redirect + `?redirectBack` param appended |
| 2 | `src/routes/guards/AdminGuard.test.tsx` | Non-owner authenticated user is evicted to `/` |
| 3 | `src/services/authService.test.ts` | Owner validation chain: claims → role → email fallback |
| 4 | `src/hooks/useAutoSave.test.ts` | State machine: idle → saving → saved → error transitions |
| 5 | `src/hooks/useThemeEngine.test.ts` | CSS custom property direct DOM mutation |
| 6 | `src/pages/auth/AdminAccessPage.test.tsx` | Lockout triggers after exactly 5 failed attempts |
| 7 | `src/hooks/usePortfolioData.test.ts` | Username → Firestore mock → full Bento data resolution |




# --- Deployment.md ---

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