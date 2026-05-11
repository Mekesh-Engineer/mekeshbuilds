# --- Styling.md ---

# Styling & UI Architecture

## Overview

The visual architecture of MekeshBuilds is designed to deliver a striking, recruiter-optimized experience that embodies 2025–2026 web design trends. It balances clinical engineering precision with organic, creative flair, utilizing Bento Grid layouts, immersive 3D elements, and functional motion design.

## The Visual Tech Stack

- **Utility Framework**: Tailwind CSS v4 via `@tailwindcss/vite` (Optimized for complex CSS Grid architectures).
- **Global Token System**: CSS custom properties managed in `src/styles/base/*` for dynamic theming.
- **Functional Motion**: Framer Motion for layout transitions, micro-interactions, and scroll-driven storytelling.
- **Organic Aesthetics**: Rough.js for generating dynamic, hand-drawn SVG borders and doodle illustrations. **[PLANNED — not yet in package.json; run `npm install roughjs` to enable]**
- **Immersive 3D/WebGL**: React Three Fiber / Drei for rendering tech-stack models and interactive canvases.

## Token Architecture & Theming

The project implements a dual-token design system, cleanly separating the secure administrative shell from the highly customizable public portfolio canvas.

1. **System Tokens (`--sys-*`)**: Strictly controls the `/dashboard` and `/builder` workspaces (dark-first, high-contrast, professional).
2. **Canvas Tokens (`--color-*`)**: Drives the public `/:username` portfolio, supporting vibrant gradients, glassmorphism, and AI-recommended palettes.

Example variables in `variables.css`:

```css
:root {
  /* System Shell */
  --sys-bg-primary: #0f0f14;
  --sys-text-primary: #f3f4f6;
  --sys-border: rgba(255, 255, 255, 0.1);

  /* Public Canvas (AI/User Mutable) */
  --color-primary: #ff6b2c;
  --color-secondary: #ff8a57;
  --color-glow: rgba(255, 107, 44, 0.4);
  --color-glass: rgba(15, 15, 20, 0.6);
}
```

## Dynamic Theme Engine Mechanics

To ensure maximum performance and zero-latency visual feedback in the Live Builder, the `useThemeEngine` hook bypasses React's render cycle for color updates. Instead, it mutates CSS variables directly on the `#live-canvas` DOM node.

```ts
// src/hooks/useThemeEngine.ts
canvas.style.setProperty('--color-primary', primary);
canvas.style.setProperty('--color-secondary', secondary);
canvas.style.setProperty('--color-glow', generateGlow(primary));
```

**Benefits:**

- Sub-millisecond visual updates during WYSIWYG editing.
- Complete isolation between the administrative UI and the rendered portfolio skin.
- Enables the AI to instantly inject recruiter-specific color psychology without triggering expensive DOM repaints.

## Bento Grid Layouts

The core of the public portfolio relies on a "Bento Box" architecture. This approach reduces cognitive load for recruiters by compartmentalizing information into clean, digestible visual hierarchy.

**Tailwind Usage Pattern:**
We leverage CSS Grid heavily via Tailwind utilities (`grid`, `col-span-x`, `row-span-x`) alongside responsive modifiers (`md:`, `lg:`) to ensure the Bento Grid gracefully degrades into a linear feed on mobile PWAs.

## Functional Motion Design

Animation is never purely decorative; it is utilized strictly as _Functional Motion Design_ to guide the recruiter's eye and provide spatial awareness.

- **Framer Motion (`<motion.div>`)**: Used for fluid layout shifts when filtering projects, exit/enter animations for Bento blocks, and satisfying hover states (e.g., scale and elevation shifts).
- **CSS Keyframes**: Reserved for infinitely looping, low-overhead utility animations (e.g., `marquee` for skill tickers, `pulse-glow` for call-to-action buttons) stored in `animations.css`.

## Organic & 3D Integration

- **Glassmorphism & Glows**: Bento blocks utilize `backdrop-blur-md` and custom drop-shadow tokens (`shadow-[var(--color-glow)]`) to create depth.
- **Hand-Drawn Accents**: Rough.js overlays are applied dynamically to specific Bento boxes to inject "warmth" and break up the rigid grid lines, creating a memorable, human-centric aesthetic.
- **WebGL Overlays**: `z-index` stacking contexts are carefully managed so 3D canvases seamlessly float behind or interleave with the CSS Grid content.

## Styling Best Practices for this Codebase

1. **Tokenize Everything**: Never use raw hex codes in JSX; always map to `--sys-*` or `--color-*` variables to ensure theme portability.
2. **Component-Level Utility**: Keep layout and spacing utilities inside the component markup, but extract complex animations to reusable Framer variants.
3. **Isolate Canvas Logic**: Theme mutations must remain strictly within `useThemeEngine`.
4. **Contrast & Accessibility**: Ensure glassmorphic overlays maintain a minimum 4.5:1 contrast ratio for text readability.

## Example Component: Bento Block with Glow & Glassmorphism

```tsx
import { motion } from 'framer-motion';

export const BentoBlock = ({ title, children }) => {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      className="col-span-1 md:col-span-2 relative overflow-hidden rounded-2xl border border-sys-border bg-[var(--color-glass)] backdrop-blur-xl p-6 shadow-lg transition-shadow hover:shadow-[0_0_20px_var(--color-glow)]"
    >
      <h3 className="text-xl font-bold text-sys-text-primary mb-2">{title}</h3>
      <div className="text-sys-text-secondary">{children}</div>
      {/* Optional Rough.js decorative SVG border injected here */}
    </motion.div>
  );
};
```




# --- UI.md ---

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




# --- UI_Optimization_Plan.md ---

# Enterprise UI Optimization & Responsive Design Plan

This document outlines the systematic approach to upgrading the web application's UI/UX to meet enterprise-grade, recruiter-friendly standards. It guarantees responsive scaling, pixel-perfect alignment, and global design consistency across all devices.

---

## 1. Responsive Design Architecture

**Goal:** Adapt layouts dynamically from mobile devices (320px+ / 6.2–6.9" ratio) to wide desktop screens (1440px+ / 14–15").

### Implementation Rules:

- **Mobile-First Paradigm:** Write base styles for mobile displays, enhancing upward using Tailwind execution breakpoints (`sm:`, `md:`, `lg:`, `xl:`, `2xl:`).
- **Fluid Container Bounds:**
  - Standardize wrapper containers using layout utilities: `w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`.
  - Never use fixed `width` (e.g., `w-[500px]`); prefer percentages or max-bounds (`w-full max-w-md`).
- **Fluid Typography (CSS Locks):**
  - Implement `clamp()` for dynamic scaling without media queries.
  - _Example:_ `font-size: clamp(1rem, 2vw + 1rem, 1.5rem);` ensures text grows linearly between breakpoints without clipping or wrapping aggressively.
- **Grid & Flexbox:** Exclusively use CSS Grid for 2D layouts (e.g., card arrays) and Flexbox for 1D alignments (e.g., navbars). Use `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` to handle column scaling.

---

## 2. Component & Element Alignment

**Goal:** Eliminate oversizing, overflow, and misalignment by enforcing rigid spatial constraints.

### Implementation Rules:

- **Spatial Consistency:** Strictly adhere to the 4px baseline grid (e.g., `gap-4` = 16px, `p-6` = 24px) to ensure mathematical alignment.
- **Elastic Boundaries:**
  - Avoid fixed heights (`h-64`). Use `min-h-[X]` and `h-auto` to allow content to breathe and prevent clipping on text-zoom.
  - Manage image/media aspect ratios with `aspect-video`, `aspect-square`, and `object-cover`.
- **Absolute Centering:** Standardize flex centering routines: `flex items-center justify-center`.
- **Overflow Control:** Apply `overflow-hidden` or `overflow-x-auto` to parent containers wrapping tables or wide charts to prevent horizontal scrolling on the `<body>`.

---

## 3. Professional UI & Interaction Standards

**Goal:** Ensure a highly polished, accessible, and recruiter-friendly aesthetic.

### Implementation Rules:

- **A11y (Accessibility) First:**
  - Ensure all text passes **WCAG 2.1 AA** contrast ratios (minimum 4.5:1).
  - Include ARIA labels for icon-only buttons.
- **Interaction States:** Every interactive element (`button`, `a`, `input`) must have explicitly defined visual feedback.
  - _Hover:_ `hover:bg-[var(--sys-bg-hover)]` or `hover:-translate-y-1`.
  - _Focus:_ Always provide a focus ring for keyboard navigation: `focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sys-accent)]`.
  - _Active:_ `active:scale-95` to simulate physical clicks.
  - _Disabled:_ Provide distinct visual cues (`opacity-50 cursor-not-allowed`).
- **Visual Hierarchy:** Use font weights (`font-medium`, `font-bold`) and text colors (Primary: high contrast, Secondary: muted) to guide the user's eye naturally down the page.

---

## 4. Global Consistency & Theming

**Goal:** Centralize the design system to eliminate disjointed updates and technical debt.

### Implementation Rules:

- **CSS Variable Centralization:**
  - Store all structural tokens in `src/styles/base/`. Ensure components reference CSS variables (e.g., `var(--sys-bg-primary)`, `var(--sys-accent)`) instead of hardcoded hex codes.
- **Strict Component Reusability:**
  - Do not build one-off buttons or cards. Import primitives from `src/components/common/` (e.g., `<Button>`, `<FormInput>`, `<TiltHoverCard>`).
- **Dark/Light Mode Synchronization:**
  - Rely on the centralized `useThemeEngine` to toggle system attributes. Ensure background and text variables smoothly transition across theme switches using `transition-colors duration-300`.

---

## 5. Quality Assurance & Validation Protocol

**Goal:** Systematically prevent UI regressions, Layout Shifts, and clipping.

### Validation Steps:

- **Viewport Testing Matrices:** Check all pages at exactly:
  - 320px (Small Mobile, iPhone SE)
  - 768px (Tablet Portrait, iPad)
  - 1024px (Laptop/Tablet Landscape)
  - 1440px+ (Standard Desktop)
- **Core Web Vitals:** Audit via Lighthouse to ensure **Cumulative Layout Shift (CLS)** remains `0.00`. Reserve space for loading images or fetching lazy modules with skeletons/spinners.
- **Simulated Stress Testing:**
  - Inject extremely long strings into names, dynamic titles, and bios to ensure robust text-truncation (`truncate`, `line-clamp-2`, or `break-words`).
  - Zoom browsers to 200% to evaluate typography containment flows.


# --- UI_Responsiveness_QA_Checklist.md ---

# UI Responsiveness QA Checklist

Use this checklist after any layout, styling, or component update.

## 1. Pre-Check Commands

Run these commands before manual QA:

```bash
npm run test -- src/components/forms/FormInput.test.tsx src/components/common/Input.test.tsx src/components/common/Button.test.tsx
npm run build
```

Expected result:

- All tests pass.
- Build succeeds with no TypeScript errors.

## 2. Viewport Matrix

Validate each page at these viewport sizes:

- 320x568 (small mobile)
- 390x844 (large mobile)
- 768x1024 (tablet portrait)
- 1024x768 (tablet landscape / small laptop)
- 1366x768 (14-inch laptop baseline)
- 1440x900 (15-inch laptop baseline)

## 3. Global Layout Checks

For each viewport, confirm:

- No horizontal page scroll is introduced.
- Navbar content stays aligned and does not overlap controls.
- Footer columns stack and align cleanly.
- Main content remains centered using shared shell spacing.
- Cards and forms keep consistent inner padding and radius.

## 4. Typography Checks

Confirm text behavior:

- Headings do not clip at section edges.
- Paragraphs wrap naturally without overflow.
- Button and input labels remain legible at all breakpoints.
- Browser zoom at 200% still preserves readability and flow.

## 5. Interaction & Accessibility Checks

Keyboard and state checks:

- Tab navigation shows visible focus ring on links, buttons, and inputs.
- Mobile drawer opens/closes with button and `Escape` key.
- Disabled buttons look disabled and block interaction.
- Error inputs expose `aria-invalid=true` and visible messages.
- Icon-only controls have accessible labels.

## 6. Page Coverage

At minimum verify:

- Home page (`/`)
- About page (`/about`)
- Public profile page (`/:username`)
- Login page (`/auth/login`)
- Register page (`/auth/register`)
- Admin shell pages (`/dashboard`, `/builder`, `/settings`)

## 7. Regression Notes

When an issue is found, log:

- Route and viewport size
- Reproduction steps
- Expected vs actual behavior
- Screenshot or short screen recording
- Fix PR/commit reference


# --- Pages.md ---

# Page Architecture & Routing

## Route Topology

```text
/                    -> HomePage
/auth/callback       -> AuthCallbackPage
/admin-access        -> AdminAccessPage
/:username           -> PublicLayout -> PublicProfilePage (Bento Grid & 3D Canvas)
/dashboard           -> AdminLayout (AuthGuard + AdminGuard) -> DashboardPage
/builder             -> AdminLayout (AuthGuard + AdminGuard) -> BuilderPage
/analytics           -> AdminLayout (AuthGuard + AdminGuard) -> AnalyticsPage
/resume              -> AdminLayout (AuthGuard + AdminGuard) -> ResumeManagerPage
/projects            -> AdminLayout (AuthGuard + AdminGuard) -> ProjectsManagerPage
/content             -> AdminLayout (AuthGuard + AdminGuard) -> ContentEditorPage
/settings            -> AdminLayout (AuthGuard + AdminGuard) -> SettingsPage
/themes              -> AdminLayout (AuthGuard + AdminGuard) -> ThemeStudioPage
* -> NotFoundPage (PWA Offline Fallback)
```

_Note: The `/:username` index acts as the primary dynamic entry point for public portfolio consumption. Additional public sub-routes (e.g., `/:username/projects/:id`) are staged for future WebXR and deep-dive expansions._

## Page-by-Page Documentation

### HomePage (`/`)

**Purpose:** Marketing entry point designed to convert visitors and demonstrate blistering PWA performance.

**Composition:** `Navbar`, `HeroSection` (with subtle 3D interactions), `ServiceSection`, `BentoShowcase`, `Footer`.

**Behavior:**

- Statically optimized for near-instant First Contentful Paint (FCP).
- Injects critical SEO metadata via `react-helmet-async`.
- Pre-caches core 3D models and fonts using service workers.

### PublicProfilePage (`/:username`)

**Purpose:** The core public portfolio, rendered as an immersive, highly responsive Bento Grid.

**Data Flow:**

1. `useParams()` extracts the target `username`.
2. `useAiContext()` optionally parses URL parameters to dynamically highlight specific skills or tailor the bio for specific recruiter intent.
3. `usePortfolioData(username)` resolves the profile and related assets securely from Firestore.
4. The Bento Grid and React Three Fiber canvas sections render the fetched content with Framer Motion transitions.

**Fallbacks:**

- Skeleton loaders during initial hydration.
- Graceful "Portfolio not found" state mapped to Firebase error boundaries.

### AdminAccessPage (`/admin-access`)

**Purpose:** A highly secure, zero-trust login portal for the application owner.

**Behavior:**

- Validates credentials using `loginSchema` (Zod) + React Hook Form.
- Authenticates via Firebase `signInWithEmailAndPassword`.
- Defends against brute-force attacks via a strict client-side lockout mechanism.

**Lockout Constants:**

```ts
const LOCKOUT_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
```

### AuthCallbackPage (`/auth/callback`)

**Purpose:** Handles the seamless handoff from Google OAuth providers.

**Flow:**

1. Intercepts the Firebase Auth redirect result.
2. Validates the user's UID and Custom Claims against the owner specification.
3. Routes authorized users to `/dashboard` or evicts unauthorized sessions immediately.

### DashboardPage (`/dashboard`)

**Purpose:** The central command center for the portfolio owner.

**Highlights:**

- Top-level engagement metrics (views, AI-context matches).
- System health indicators (PWA sync status, Firestore offline cache size).
- Quick actions: Launch Builder, copy AI-tailored share links, or trigger a resume export.

### BuilderPage (`/builder`)

**Purpose:** The flagship editing workspace featuring real-time Firestore synchronization.

**Layout:**

- **Left Panel:** Accordion-style modular editors (Personal, Experience, Skills, Projects, AI Settings).
- **Right Panel:** `#live-canvas` offering an interactive, split-screen preview of the Bento Grid and 3D UI across breakpoints.

**Core Orchestration:**

- `useBuilderStore`: Manages local drafts and dirty states.
- `useAutoSave`: Debounces input and pushes mutations to Firestore smoothly.

### AnalyticsPage (`/analytics`)

**Purpose:** Data-driven insights into portfolio performance and recruiter engagement.

**Capabilities:**

- Tracks project clicks, resume downloads, and session durations.
- Displays visual charts (Chart.js / D3) mapping traffic trends.
- Highlights which AI-tailored pitches are generating the most engagement.

### ResumeManagerPage (`/resume`)

**Purpose:** Manages traditional PDF assets and dynamic resume generation.

**Current State:**

- Drag-and-drop zone for static PDF uploads to Firebase Storage.
- Leverages `useExportPDF` to seamlessly generate formatted, ATS-friendly documents directly from the live DOM context.

### ProjectsManagerPage (`/projects`)

**Purpose:** A granular, tabular interface for managing complex project data.

**Current State:**

- Interfaces with Firestore to handle CRUD operations for project metadata, repository links, and 3D asset references.

### ContentEditorPage (`/content`)

**Purpose:** The CMS workspace for deeper technical writing and storytelling.

**Tabs:**

- Blog (Markdown editor staging)
- Gallery (Asset management)
- Testimonials

### ThemeStudioPage (`/themes`)

**Purpose:** A dedicated visual engineering studio for adjusting the portfolio's aesthetics.

**Capabilities:**

- Manages global CSS variables (Gradients, Glassmorphism opacities).
- Configures 3D scene lighting and camera angles for the WebGL canvas.
- Toggles between professional, creative, and organic (hand-drawn SVG) modes.

### NotFoundPage (`*`)

**Purpose:** Standardized 404 handler optimized for offline PWA routing.

**Additional Behavior:**

- Logs failed routing attempts to `error_logs` in Firestore to identify broken external links.
- Offers a seamless path back to the application root.

## Navigation Flow

```text
Visitor -> / -> /:username (AI-tailored & Cached)
Owner   -> /admin-access -> /dashboard -> Admin Modules
OAuth   -> Firebase Provider -> /auth/callback -> /dashboard
Unknown -> NotFoundPage (Offline-capable)
```