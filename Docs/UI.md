# UI & Interaction Architecture

## UI System Overview

MekeshBuilds implements a highly modular, component-driven UI architecture designed to balance immersive 2025–2026 aesthetics (Bento Grids, 3D elements, glassmorphism) with strict engineering best practices.

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


