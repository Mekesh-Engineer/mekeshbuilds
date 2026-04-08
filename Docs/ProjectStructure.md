# Project Structure & Architecture

## Root Directory Layout

The repository is structured to prioritize rapid onboarding, strict module isolation, and robust CI/CD integration.

```text
mekeshbuilds/
|- .github/
|  |- workflows/         # CI/CD deployment pipelines (GitHub Actions)
|- public/
|  |- robots.txt
|  |- manifest.webmanifest # PWA configuration and offline assets
|- src/
|  |- App.tsx
|  |- main.tsx           # Application entry point & provider composition
|  |- assets/            # Static media, 3D models (.glb/.gltf), and fonts
|  |- components/        # Granular UI modules (Bento, 3D, Shared)
|  |- data/              # Static TypeScript data files (project-list, blog-posts)
|  |- features/          # Domain-driven feature modules
|  |  |- admin/          # Admin dashboard feature logic
|  |  |- auth/           # Auth hooks and services (useAuth, etc.)
|  |  |- public/         # Public portfolio feature logic
|  |- forms/             # Zod validation schemas
|  |- hooks/             # Stateful orchestration (AI, PWA, Data)
|  |- lib/               # 3rd-party client singletons (Firebase)
|  |- pages/             # Route-level view components
|  |  |- admin/          # Admin page components
|  |  |- auth/           # Auth page components
|  |  |- public/         # Public-facing page components
|  |- routes/            # Route topology and Guard wrappers
|  |- services/          # Firebase API abstraction layer
|  |- store/             # Zustand global state slices
|  |- styles/            # Tailwind CSS v4 variables & custom tokens
|  |- test/              # Vitest global mocks & setup
|  |- types/             # TypeScript interfaces & Firestore converters
|  |- utils/             # Pure helper functions
|- index.html
|- package.json
|- tsconfig.json
|- vite.config.ts        # Vite + PWA + manual chunking config
|- vitest.config.ts      # Test environment config (jsdom)
|- .env.example
|- README.md
```

````

## Directory Responsibilities

### `src/features`

Domain-driven feature modules — each subdirectory encapsulates the hooks, services, and logic for a specific product domain:

- `admin/`: Admin dashboard orchestration logic.
- `auth/`: Authentication hooks (`useAuth`) and auth-specific business logic.
- `public/`: Public portfolio feature logic and data access.

### `src/data`

Static TypeScript data files used as fallback or seed content:

- `project-list.ts`: Static list of portfolio projects for initial rendering.
- `blog-posts.ts`: Static blog post metadata.

### `src/components`

The visual building blocks of the application, strictly separated by domain:

- `3D/`: WebGL components utilizing React Three Fiber and Drei for interactive storytelling.
- `Bento/`: Reusable CSS Grid blocks constructing the core Bento Box layouts.
- `Canvas/`: High-level portfolio sections (Hero, About, Projects) consumed by both the public profile and the live builder.
- `auth/`: Login modal and Firebase authentication UI.
- `guards/`: Route protection wrappers (`AuthGuard`, `AdminGuard`).
- `layout/`: Shared navigational shells (`AdminLayout`, `PublicLayout`).
- `Shared/`: Agnostic, highly reusable primitives (`Button`, `Card`, `Skeleton`, `Modal`).

### `src/hooks`

Stateful logic, side effects, and hardware/API abstractions:

- `useAuth`: Firebase session bootstrap and role hydration.
- `useAiContext`: Evaluates visitor intent to trigger layout/bio personalization.
- `usePwaSync`: Manages offline status and service worker update prompts.
- `useThemeEngine`: Mutates DOM CSS variables for real-time visual updates.

### `src/lib`

External client instantiations and heavy SDK setups:

- `firebaseClient.ts`: The _sole_ entry point for initializing the Firebase App, Auth, and Firestore instances, ensuring singleton performance.

### `src/services`

The data abstraction layer. UI components **never** interact with the database directly.

- `authService.ts`
- `profileService.ts`
- `adminService.ts`
- `ctaMailService.ts`
- `serviceError.ts`
- `aiService.ts` **[PLANNED — Bridge to Firebase Cloud Functions for AI inference]**

### `src/types`

Strictly enforces end-to-end type safety:

- TypeScript interfaces defining the application's domain model.
- Firestore `withConverter` objects ensuring runtime schema validation when reading/writing NoSQL documents.

## Dependency Boundaries (The Architecture Rule)

The codebase strictly adheres to a unidirectional dependency flow, preventing circular dependencies and tightly coupled logic.

```text
Pages / Components (Presentation)
       ↓
Hooks / Store (State & Orchestration)
       ↓
Services (API / Database Abstraction)
       ↓
Lib / Types (External SDKs & Schemas)
```

**Architectural Invariants:**

1. **No Raw Queries in UI:** UI files must never execute Firebase SDK database calls directly.
2. **Framework Agnostic Services:** `src/services` functions return pure Promises and must _never_ import React hooks or UI components.
3. **Singleton Control:** External libraries (like Firebase) must be initialized exactly once in `src/lib`.

## Build and Tooling Configuration

- **`vite.config.ts`**: Configured with `@vitejs/plugin-react` and `@tailwindcss/vite`. Manual chunk splitting separates Three.js, Firebase, and React into distinct bundles for optimal caching. `vite-plugin-pwa` **[PLANNED — not yet installed]** will be added for full service-worker and offline capabilities.
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
