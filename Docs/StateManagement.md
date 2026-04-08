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
