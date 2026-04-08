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
