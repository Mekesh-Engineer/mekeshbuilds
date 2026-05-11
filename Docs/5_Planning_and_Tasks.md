# --- FutureScope.md ---

# Future Scope & Roadmap

## Overview

This document tracks the planned expansions for MekeshBuilds beyond the current implemented core. Items are organized by phase and estimated complexity. All items here are **not yet implemented** unless explicitly marked ✅.

---

## Phase 1 — Immediate Next Iteration

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

### 1.2 Organic Aesthetics — Rough.js Integration

**Status:** [PLANNED]

```bash
npm install roughjs
```

Apply hand-drawn SVG borders to select Bento blocks to add warmth and break rigid grid lines. Integrate with the `useThemeEngine` so it responds to theme changes.

---

### 1.3 CI/CD GitHub Actions Pipeline

**Status:** [IMPLEMENTED — Workflow file created at `.github/workflows/ci.yml`]

Add repository secrets to GitHub:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_APP_URL`
- `VITE_OWNER_EMAIL`
- `FIREBASE_SERVICE_ACCOUNT` (from Firebase Console → Project Settings → Service Accounts)

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

## Phase 2 — AI & Personalization Layer

### 2.1 Firebase Genkit Integration

**Status:** [PLANNED]

Deploy Genkit-powered Cloud Functions for:
- **Recruiter Intent Classification**: Analyze URL parameters (`?role=frontend&company=google`) to classify the visitor's intent and dynamically reorder Bento blocks.
- **Dynamic Bio Summarization**: Generate a tailored one-line pitch based on classified intent.
- **AI-Enhanced Resume Variants**: Generate role-specific resume PDFs on demand.

**Security requirement:** AI model API keys live exclusively in Cloud Functions environment — never exposed to the client.

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

## Phase 3 — WebXR & Immersive Experiences

### 3.1 WebXR Project Gallery

**Status:** [PLANNED — Long-term]

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

Compress all `.glb` / `.gltf` 3D models using Draco compression to reduce download size by 60–80% for mobile PWA users. Requires enabling the Draco decoder in `@react-three/drei`.

---

## Phase 4 — IoT & Hardware Bridges

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
| App Check enforcement | MEDIUM | Currently in monitor mode — enforce after QA pass |

---

*Last updated: 2026-04-02*


# --- task.md ---

# Dual System Architecture Implementation Task List

- [ ] Inspect existing project setup (check dependencies like React Query, Firebase).
- [ ] Create `src/data/fallbacks.ts` containing the static fallback data for the home page sections (Hero, Skills, Projects, Blog, Testimonials, etc.).
- [ ] Implement robust specific React hooks using Firebase `onSnapshot` / React Query (e.g., `useProfileData`, `useProjectsData`, etc.) with offline support.
- [ ] Refactor `src/components/Pages/Home/HeroSection.tsx` to handle dynamic data or fallback.
- [ ] Refactor `src/components/Pages/Home/MySkillSection.tsx` to handle dynamic data or fallback.
- [ ] Refactor `src/components/Pages/Home/ProjectSection.tsx` to handle dynamic data or fallback.
- [ ] Refactor `src/components/Pages/Home/BlogSection.tsx` to handle dynamic data or fallback.
- [ ] Refactor `src/components/Pages/Home/TestimonialSection.tsx` to handle dynamic data or fallback.
- [ ] Ensure any remaining Home page sections (e.g. `Achievements.tsx`, `MapSection.tsx`, `Ctasection.tsx`) are also using the updated architecture if applicable.
- [ ] Verify debounced autosave functionality in the Builder Page (`src/store/builderStore.ts` & `src/pages/admin/BuilderPage.tsx`).
- [ ] Perform a system-wide check to verify behavior in typical and fallback scenarios.


# --- temp.md ---

# Dynamic Home Page Integration Plan: Dual System Architecture

This plan outlines the architecture and execution steps to synchronize the Builder Page with the Home Page in real-time, leveraging Firebase Firestore and React Query. The objective is to make all Home Page content completely dynamic, directly driven by the data authored in the Builder, while maintaining a robust static fallback system.

## User Review Required

> [!IMPORTANT]
> The plan now incorporates the **Dual System Architecture**. 
> Please review the execution steps below. Let me know if you approve so we can define the `task.md` and begin execution!

## Architecture Pattern

### 1. PRIMARY SYSTEM: Dynamic Content (Live from Firestore)
- All major Home page sections (Hero, Skills, Projects, Blog, Testimonials, etc.) will be driven directly by real-time Firestore data via `onSnapshot` listeners hooked up with **React Query**.
- Content is authored and updated in real-time through the Builder page (`/builder`).
- Changes made in the Builder are debounced and automatically synced to Firestore.
- Supports published/unpublished states, drag-and-drop ordering, and conditional rendering.

### 2. FALLBACK SYSTEM: Static / Graceful Degradation
- If Firestore fails to load (network issues, permission errors, empty data, or initial hydration), the application gracefully falls back to safe default values or static fallback content.
- Fallback data is defined in local constants (e.g., `fallbackProfile`, `fallbackProjects`) located in `src/data/fallbacks.ts`.
- Loading skeletons and error boundaries are prominently used during transition states.

## Data Flow & Rendering

**Implementation Pattern:**
```tsx
const { data: profile, isLoading, error } = useProfileData();

if (isLoading) return <GlassmorphicSkeleton />;
if (error || !profile) return <HomePageFallbackContent />;

// Primary dynamic render
return <HeroSection profile={profile} />;
```

- **Write Path (Builder Page → Firestore):** 
  Debounced generic write/update functions will push changes from the Builder context into Firebase.
- **Global Consistency:** Use robust typed interfaces (`src/types/`) to ensure schema compatibility between Firestore and the UI.
- **UI/UX:** The "Live Preview" watermarks will be hidden on the public Home Page. Global theming (Dark/Light mode) will remain synced via the database user preference.

## Proposed Changes

### `src/types/` & `src/data/`
#### [NEW] `e:\Projects\Full Stack Project\2026\mekeshbuilds\src\data\fallbacks.ts`
Centralize all static fallback templates for initial rendering or when Firebase is unreachable.

### `src/services/` & Hooks
#### [NEW] `e:\Projects\Full Stack Project\2026\mekeshbuilds\src\hooks\useFirebaseQuery.ts` (or similar hooks like `useProfileData`, `useProjectsData`)
Leverage React Query paired with Firestore `onSnapshot` to offer `isLoading`, `error`, and `data` states.

### `src/components/Pages/Home/`
#### [MODIFY] `e:\Projects\Full Stack Project\2026\mekeshbuilds\src\components\Pages\Home\*.tsx` (All Home Page Sections)
Refactor components to accept dynamic props gracefully utilizing the dual-system fallback strategy if `data` is empty or errors occur.

## Verification Plan

### Manual Verification
- Render the `BuilderPage` side-by-side with the `Home Page`.
- Verify Real-time Sync: Toggle visibility states, perform content edits, and witness sub-second latency propagations.
- Verify Fallback System: Throttle network to 'Offline' and forcefully fail queries to ensure `fallbacks.ts` data mounts correctly.