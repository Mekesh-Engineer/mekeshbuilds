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
