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


