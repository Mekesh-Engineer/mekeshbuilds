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


