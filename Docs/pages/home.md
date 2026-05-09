# Home Page (Landing Page) — 2026 UI Design & Technical Specification

> **Version:** 3.0 | **Last Updated:** 2026-05-06 | **Status:** Active Revision
>
> This document supersedes previous revisions. Every section has been updated to reflect:
>
> - **Futuristic 2026 Web Design Trends** — High-end cinematic polish, glassmorphism, glowing accents, and premium visual hierarchy.
> - **Recruiter-Friendly UX** — Layout and flow optimized for instant impact, ensuring high conversion and easy scanning by hiring managers.
> - **Semantic Accessibility & Performance** — Fast-loading, highly-accessible, screen-reader optimized structures.
> - **Full Firebase dynamic data** — no section relies on static local constants in production.
> - **Bento Grid architecture** — the linear section-stack is replaced with a modular, asymmetric CSS Grid composition.
> - **3D & immersive visuals** — each section has a defined Three.js / React Three Fiber (R3F) integration or Framer Motion enhancement.
> - **Builder mode bi-directional sync** — all editable fields originate from Firestore and are writable through `/builder`.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Dynamic Data Strategy](#2-dynamic-data-strategy)
3. [Builder Mode Sync Model](#3-builder-mode-sync-model)
4. [Bento Grid Layout Specification](#4-bento-grid-layout-specification)
5. [Cinematic UI & 2026 Design Trends](#5-cinematic-ui--2026-design-trends)
6. [Section-by-Section Specification](#6-section-by-section-specification)
   - 6.1 Navbar
   - 6.2 HeroSection _(Revised — Full 3D + Firebase)_
   - 6.3 MySkillSection _(Revised — Firebase-driven)_
   - 6.4 HireMe _(Revised — Firebase stats)_
   - 6.5 TechArsenal 🆕
   - 6.6 ProjectSection _(Revised — Firebase-driven)_
   - 6.7 Achievements 🆕
   - 6.8 BlogSection _(Revised — Firebase-driven)_
   - 6.9 QuantifiableImpact 🆕
   - 6.10 MapSection _(Revised — Firebase location)_
   - 6.11 TestimonialsSection _(Revised — Firebase-driven)_
   - 6.12 CTASection _(Revised)_
   - 6.13 Footer _(Revised)_
7. [Backend & External Integration Matrix](#7-backend--external-integration-matrix)
8. [Builder Mode Field Map](#8-builder-mode-field-map)
9. [Performance & PWA Considerations](#9-performance--pwa-considerations)
10. [Accessibility Standards](#10-accessibility-standards)
11. [Gaps & Technical Debt](#11-gaps--technical-debt)

---

## 1. Architecture Overview

### 1.1 Page Composition

`HomePage.tsx` acts as the top-level orchestrator. It does not fetch data itself — it composes section components that each own their Firebase query via a custom `usePortfolioData` sub-hook or a dedicated section-level React Query hook. This maintains clean separation of concerns and enables per-section loading skeletons.

```text
HomePage.tsx
  -> SEO metadata (react-helmet-async)
  -> <Navbar />                         [Firebase: profiles]
  -> <main>
       -> <HeroSection />               [Firebase: profiles]
       -> <Suspense fallback={<SectionLoader />}>
            -> <div aria-label="Feature sections">
                 -> <MySkillSection />      [Firebase: skills]
                 -> <HireMe />              [Firebase: profiles.stats]
                 -> <TechArsenal />         [Firebase: skills] 🆕
                 -> <ProjectSection />      [Firebase: projects]
                 -> <Achievements />        [Firebase: certificates, experience] 🆕
                 -> <BlogSection />         [Firebase: blog_posts]
                 -> <QuantifiableImpact />  [Firebase: analytics_events, profiles] 🆕
                 -> <MapSection />          [Firebase: profiles.location]
               </div>
            -> <TestimonialsSection />  [Firebase: testimonials]
            -> <CTASection />           [External: ctaMailService → FormSubmit]
       </Suspense>
     </main>
  -> <Footer />                         [Firebase: profiles, newsletter_subscribers]
```

### 1.2 Data Ownership Principle

The single source of truth for all public-facing content is Firestore. The `/builder` admin workspace writes to Firestore. The landing page reads from Firestore. There are no local static data constants used for production content — `src/data/project-list.ts` and `src/data/blog-posts.ts` are relegated to development seed/fallback data only.

### 1.3 Rendering Strategy

- **Hero, Navbar, and Profile blocks**: Fetched via `usePortfolioData(ownerUsername)` which resolves the singleton owner profile from Firestore `profiles`.
- **Portfolio assets (skills, projects, blog)**: Fetched by dedicated query hooks, each independently loading, skeleton-rendering, and error-bounding.
- **Analytics / metrics**: Fetched client-side via `useAnalyticsData()` for the `QuantifiableImpact` section. Aggregated counts are stored as denormalized fields on `profiles` to reduce cold-load Firestore reads.
- **3D assets**: Lazily loaded via `React.lazy` + `<Suspense>` with 2D skeleton fallbacks. Deferred behind a `requestIdleCallback` gate to prevent blocking FCP.

---

## 2. Dynamic Data Strategy

### 2.1 Eliminating Static Local Data

| Current (Static)                  | Replacement (Dynamic — Firebase)                         |
| --------------------------------- | -------------------------------------------------------- |
| `src/data/project-list.ts`        | `projectService.fetchPublishedProjects(ownerId)`         |
| `src/data/blog-posts.ts`          | `contentService.fetchPublishedBlogPosts(ownerId)`        |
| In-component testimonials array   | `contentService.fetchTestimonials(ownerId)`              |
| In-component skills carousel data | `skillService.fetchPublishedSkills(ownerId)`             |
| In-component stat counters        | `profiles.stats` document field (denormalized aggregate) |
| In-component tech badge pills     | `skillService.fetchFeaturedTechBadges(ownerId)`          |
| Hero floating side card data      | `profiles.heroCards` sub-field                           |

### 2.2 Firestore Query Hooks (New/Revised)

Each section gets a single, purpose-built hook:

```ts
// Section-level hooks overview
useHeroData(ownerUsername); // profiles — full hero block
usePublishedSkills(ownerId); // skills where isPublished == true, orderBy sortOrder
useFeaturedProjects(ownerId); // projects where isFeatured == true, limit 6
usePublishedBlogPosts(ownerId); // blog_posts where isPublished == true, limit 3
useTestimonials(ownerId); // testimonials where isPublished == true
useCertificatesAndExperience(ownerId); // certificates + experience merged timeline
useOwnerStats(ownerId); // profiles.stats denormalized field
useTechBadges(ownerId); // skills where showIn3DBadge == true
```

### 2.3 Stale-Time Configuration

```ts
// React Query config per section type
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 min for most content
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Profile data (hero, bio) — longer stale window, changes infrequently
{
  staleTime: 15 * 60 * 1000;
}

// Analytics metrics — shorter stale window
{
  staleTime: 2 * 60 * 1000;
}
```

---

## 3. Builder Mode Sync Model

### 3.1 Principle

Every piece of content visible on the landing page has a corresponding editable field in the `/builder` workspace. The owner edits in builder, data writes to Firestore, and the public landing page reflects changes on next data fetch (or immediately via React Query cache invalidation).

### 3.2 Builder-Editable Fields for the Landing Page

```
/builder → Personal Info Accordion
  ├── fullName                  → HeroSection: animated name reveal
  ├── tagline                   → HeroSection: role chips / headline
  ├── bio                       → HeroSection: intro copy
  ├── avatarUrl                 → Navbar avatar, HeroSection portrait, Footer chip
  ├── heroPortraitUrl           → HeroSection: parallax portrait (can differ from avatar)
  ├── heroCards[]               → HeroSection: floating stat/experience side cards
  ├── techBadgePills[]          → HeroSection: floating tech badge pills (replaces Supabase label)
  ├── location.city             → MapSection: base map coordinate and display label
  ├── location.lat / .lng       → MapSection: embedded map center
  ├── stats.yearsExperience     → HireMe: stat block
  ├── stats.projectsCompleted   → HireMe / QuantifiableImpact: stat block
  ├── stats.awardsWon           → HireMe / QuantifiableImpact: stat block
  ├── stats.competitionsEntered → QuantifiableImpact: stat block
  └── availability              → HireMe / CTASection: availability badge text

/builder → Skills Accordion
  ├── Per-skill: name, category, proficiencyLevel, iconUrl, sortOrder, isPublished
  ├── showIn3DBadge (bool)      → TechArsenal: floating 3D globe
  └── featuredOnLanding (bool)  → MySkillSection: carousel

/builder → Projects Accordion
  ├── Per-project: title, description, techStack[], thumbnailUrl, repoUrl, liveUrl
  ├── isFeatured (bool)         → ProjectSection: featured carousel
  └── sortOrder                 → ProjectSection: display order

/builder → Content Accordion
  ├── Blog posts: title, excerpt, slug, coverImageUrl, tags[], isPublished
  ├── Testimonials: name, role, company, avatarUrl, text, rating, isPublished
  └── Gallery items

/builder → Experience & Certificates Accordion
  ├── Experience: role, company, startDate, endDate, description, type
  └── Certificates: name, issuer, date, credentialUrl, badgeUrl
      → Achievements: rendered timeline entries
```

### 3.3 Real-Time Preview in Builder

The `/builder` right-panel (`#live-canvas`) renders the `PublicProfilePage` (which shares section components with `HomePage`). When the admin edits any field:

1. `builderStore.patchProfile(partial)` fires → `isDirty = true`
2. `useThemeEngine` applies CSS variable changes instantly (zero-latency for color/typography mutations)
3. `useAutoSave` debounces (800ms) → React Query mutation → Firestore write
4. `queryClient.invalidateQueries(['portfolio', username])` → sections re-fetch and re-render in the live canvas

This means the admin sees an exact preview of what recruiters will see, updated in near-real-time.

### 3.4 Removing the Supabase Tech Badge

The hero floating tech pill that still shows the Supabase logo must be replaced. `techBadgePills[]` on the `profiles` document becomes the source. The builder exposes a chip editor where the owner can add/remove/reorder badge pills from their `skills` collection. This eliminates all hardcoded visual references to Supabase.

---

## 4. Bento Grid Layout Specification

### 4.1 Philosophy

The landing page abandons the traditional full-width sequential section stack in favor of a **nested Bento Grid system**. Top-level sections remain full-width (for breathing room and visual anchoring), but the _content within_ each section is composed as an asymmetric CSS Grid of Bento blocks. This creates a magazine-quality reading experience recruiters can scan non-linearly.

### 4.2 Grid Token System

```css
/* src/styles/base/bento.css */
:root {
  --bento-gap: 1rem; /* Inner gap between Bento blocks */
  --bento-radius: 1.25rem; /* Default rounded-xl block radius */
  --bento-radius-lg: 1.75rem; /* Larger blocks */
  --bento-bg: var(--color-glass);
  --bento-border: rgba(255, 255, 255, 0.08);
  --bento-shadow: 0 4px 32px rgba(0, 0, 0, 0.18);
  --bento-glow-shadow: 0 0 20px var(--color-glow);
}
```

### 4.3 Responsive Bento Grid Pattern (Standard)

```tsx
// Standard 3-column Bento Grid used across sections
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[var(--bento-gap)]">
  {/* Wide feature block */}
  <motion.div className="col-span-1 md:col-span-2 row-span-2 ..."> ... </motion.div>
  {/* Tall stack block */}
  <motion.div className="col-span-1 row-span-2 ..."> ... </motion.div>
  {/* Standard block */}
  <motion.div className="col-span-1 ..."> ... </motion.div>
  {/* Standard block */}
  <motion.div className="col-span-1 ..."> ... </motion.div>
</div>
```

### 4.4 Shared Bento Block Component

All section content blocks extend the base `<BentoBlock>` primitive from `src/components/Bento/`:

```tsx
<BentoBlock
  variant="glass" | "solid" | "gradient" | "3d-canvas"
  size="1x1" | "2x1" | "1x2" | "2x2"
  glow={true}
  editable={isBuilderMode}        // Shows inline edit overlay in builder
  onEdit={() => openBuilderTab('skills')}
>
  { children }
</BentoBlock>
```

The `editable` prop (only truthy in builder mode) renders a subtle pencil-icon overlay on hover, letting the admin click directly on a Bento block to jump to its builder accordion tab — a zero-friction editing UX.

---

## 5. Cinematic UI & 2026 Design Trends

The layout prioritizes premium cinematic polish optimized for recruiters and hiring managers. Inspired by 2026 trending aesthetics, it leverages **Bento Grids**, **Glassmorphism**, and **Functional Illumination** built on strong web accessibility and performance foundations.

### 5.1 Visual Hierarchy & Aesthetics
- **Dark-First Immersion:** A rich `#0B0C10` (or dynamic `--sys-bg-primary`) background sets the tone.
- **Glassmorphism & Depth:** Bento cards utilize `backdrop-blur-md` (blur 12px) and semi-transparent backgrounds (`rgba(255, 255, 255, 0.05)`) to layer content weightlessly.
- **Organic Accents:** Sharp structural grid lines are intentionally broken by hand-drawn SVG borders (via Rough.js) or floating particles on hover to add human warmth to technical structure.
- **Functional Illumination:** Glowing drop-shadows (`--bento-glow-shadow`) and vibrant accent colors (`--color-primary`) draw attention to primary calls-to-action, active builder states, or interactive 3D elements.
- **Interactive Micro-Motions:** Buttons and chips use Framer Motion springs (`type: "spring", stiffness: 300, damping: 20`) for bouncy, organic tactile feedback on click/hover.

### 5.2 Typography & Spacing
- **Typography:** Uses a strong, modern, geometric sans-serif typeface paired with a monospace font (like JetBrains Mono or Fira Code) for code-like highlights, role chips, and metrics.
- **Sizing Scale:**
  - `H1`: Bold tracking, tight line-height (e.g., `text-5xl md:text-7xl font-extrabold tracking-tight`).
  - `H2` / `H3`: High contrast, slightly muted colors for section headers (`text-(--sys-text-secondary)`).
  - `Body`: `text-base md:text-lg leading-relaxed` for maximum readability.
- **Spacing:** The layout implements a breathing **1rem (16px)** base Bento gap (`--bento-gap`) with padding scaling from `px-4` (mobile) to `px-8` (desktop) to ensure scanning speed.

### 5.3 High-Conversion "Recruiter-Friendly" UX
- **Above-The-Fold Real Estate:** The Hero section prioritizes the candidate's Value Proposition (`fullName`, `tagline`) immediately adjacent to a clear **"Hire Me" / "Download Resume"** CTA pair.
- **Scan-Optimized Feature Highlights:** Work history and projects are surfaced directly in the top-level grid using punchy `1x1` and `2x1` Bento cells so recruiters don't need to dig through nested pages.
- **Social Proof:** Testimonial cards are placed as a continuous horizontal marquee or structured Bento block just before the primary CTA modules to reinforce trust.

### 5.4 Accessibility (A11y) & Semantic HTML
- **ARIA Labeling:** Non-text interactions (Bento toggles, canvas controls) strictly use `aria-label` and `aria-expanded` attributes.
- **Semantic Tags:** Native `<header>`, `<main>`, `<section>`, `<article>`, and `<footer>` elements define the structure.
- **Reduced Motion Support:** Framer Motion respects the OS-level `prefers-reduced-motion` settings. WebGL fallback components swap out continuously spinning 3D canvas environments for accessible 2D static equivalents.
- **High Contrast Focus:** Explicit `:focus-visible` styling with 2px solid offsetting focus rings for keyboard users.

### 5.5 Web Performance Optimization
- **Lazy Hydration:** R3F/Three.js assets, below-the-fold Testimonials, CTA modules, and heavy map geometries are deferred using `React.lazy` and `<Suspense>` behind a `requestIdleCallback`.
- **Image Formats:** WebP/AVIF formats forced for portrait cards, project thumbnails, and blog covers, dynamically sized via Next/Vite optimized image loaders if applicable.
- **TTFI Over FCP:** Time to First Interactive is prioritized by splitting bundle sizes by route and loading Framer components asynchronously.

---

## 6. Section-by-Section Specification

---

### 6.1 Navbar

**Purpose:** Global navigation, auth access, live profile chip.

**Changes from original:**

- Profile avatar, name, and role are sourced from Firestore `profiles` (not Firebase Auth fallback). Auth user is the fallback only if the Firestore doc is missing.
- The "Sign in" button route is corrected to `/admin-access` (aligned with the actual router definition, resolving the route mismatch noted in the original audit).
- Notification flyout for the owner shows real-time resume download events from Firestore `analytics_events` (using `onSnapshot` subscription, limited to last 10 events).

**Firebase Integration:**

```ts
// Navbar data fetch
const { data: profile } = useQuery({
  queryKey: ['ownerProfile'],
  queryFn: () => profileService.fetchOwnerProfile(),
  staleTime: 15 * 60 * 1000,
});
```

**3D / Motion Enhancement:**

- Brand logo on scroll animates with a subtle `glow-pulse` keyframe powered by the `--color-glow` CSS variable.
- The scroll progress indicator bar color inherits from `--color-primary` (builder-customizable).

**Builder Sync Fields:** `fullName`, `avatarUrl`, `tagline`

---

### 6.2 HeroSection (Revised — Full 3D + Firebase)

**Purpose:** Primary personal brand statement, immersive 3D visual centerpiece.

**Critical Fix — Supabase Badge:**
The floating tech badge pill array is replaced entirely. `profiles.techBadgePills[]` (array of `{ label, iconUrl, color }`) is rendered in place of the hardcoded badge list. The admin adds/removes pills from the builder's Personal Info accordion. On initial load, these are seeded from the owner's `skills` collection where `showIn3DBadge == true`.

**Firebase Integration:**

```ts
const { data: hero, isLoading } = useHeroData(ownerUsername);
// Resolves: fullName, tagline, bio, heroPortraitUrl, techBadgePills[], heroCards[]
// Source: Firestore 'profiles' document
```

**Bento Grid Layout (within section):**

```
┌──────────────────────────────┬──────────────────┐
│  Name + Role + Bio           │  3D Canvas       │
│  (col-span-2, large text)    │  (col-span-1,    │
│                              │   row-span-2)    │
├─────────────┬────────────────┤                  │
│  Stat Card  │  CTA Buttons   │                  │
│  (dynamic)  │                │                  │
└─────────────┴────────────────┴──────────────────┘
```

**3D Canvas — `HeroCanvasR3F` (Revised):**

The hero canvas is upgraded from a static ambient scene to a **fully reactive, data-driven 3D environment**:

- **Morphing Portrait Mesh**: The owner's `heroPortraitUrl` is loaded as a texture onto a displacement-mapped plane geometry. The mesh subtly warps using a Simplex noise shader — responding to mouse pointer movement via a `useFrame` listener. This replaces the static parallax portrait.
- **Dynamic Tech Orbit Ring**: The `techBadgePills[]` array from Firestore drives a set of 3D floating badge sprites orbiting around the portrait mesh. Each badge is a `<sprite>` node rendered with the icon's `iconUrl` as a transparent texture. Badge count, icons, and colors update instantly when the admin edits the builder.
- **Energy Particle Field**: A buffer geometry particle system (`THREE.Points`) generating 800 particles in accent color `--color-primary`, driven by Simplex noise for organic drift. Density and color are configurable via the Theme Studio.
- **Ambient Glow Volumes**: Three `THREE.PointLight` instances positioned behind the portrait mesh, with intensities animated by Framer Motion spring values responding to cursor proximity.
- **WebGL Fallback**: `CanvasFallback.tsx` renders a 2D Framer Motion animated portrait with CSS radial glow if WebGL is unsupported or throws.
- **Reduced Motion**: `prefers-reduced-motion` disables all Three.js animation loops and falls back to a static image.

**Floating Hero Side Cards (Dynamic):**

The floating stat/experience cards previously hardcoded are now rendered from `profiles.heroCards[]`:

```ts
interface HeroCard {
  type: 'stat' | 'badge' | 'experience';
  label: string;
  value: string;
  iconUrl?: string;
  accentColor?: string; // Inherits from --color-primary if unset
}
```

The admin configures up to 4 hero cards in the builder. Cards animate in with staggered Framer Motion `spring` transitions.

**Builder Sync Fields:** `fullName`, `tagline`, `bio`, `heroPortraitUrl`, `techBadgePills[]`, `heroCards[]`, `availability`

---

### 6.3 MySkillSection (Revised — Firebase-Driven)

**Purpose:** Showcase core capabilities in an interactive rotating card slider.

**Changes from original:** Skill cards are fetched from Firestore `skills` collection instead of in-component constants. The admin marks skills as `featuredOnLanding: true` in the builder to control which appear in the carousel.

**Firebase Integration:**

```ts
const { data: skills, isLoading } = usePublishedSkills(ownerId, {
  filter: { featuredOnLanding: true },
  orderBy: 'sortOrder',
});
// Source: Firestore 'skills' collection
```

**Bento Grid Layout (within section):**

Skills are rendered in a 3-column Bento grid on desktop (carousel on mobile), replacing the previous single-carousel approach for desktop viewports:

- Column 1: Featured skill (large `2x2` Bento block with a Lottie/3D icon and proficiency ring)
- Columns 2–3: Grid of smaller `1x1` skill Bento blocks
- A "View All Skills" overflow chip appears when more than 9 skills are published

**3D / Motion Enhancement:**

- Each skill card Bento block uses `Rough.js` to render a hand-drawn SVG border on hover — organic contrast against the rigid grid lines.
- The large featured skill block includes a mini R3F canvas rendering the skill's icon as a 3D floating icon model (`.glb`) if a `modelUrl` is set on the skill document; otherwise a 2D icon is shown.
- The proficiency level (0–100) drives an animated SVG arc ring.

**Builder Sync Fields:** All `skills` collection fields: `name`, `category`, `proficiencyLevel`, `iconUrl`, `modelUrl`, `sortOrder`, `isPublished`, `featuredOnLanding`

---

### 6.4 HireMe (Revised — Firebase Stats)

**Purpose:** Conversion section explaining hiring value and dynamic achievements.

**Changes from original:** The four glassmorphism stat blocks were hardcoded. They now consume `profiles.stats`:

```ts
interface ProfileStats {
  yearsExperience: number;
  projectsCompleted: number;
  awardsWon: number;
  competitionsEntered: number;
  customStatLabel?: string; // Optional custom 5th stat (e.g., "GitHub Stars")
  customStatValue?: string;
}
```

The animated number counters (`react-countup`) increment from 0 to the live Firestore value on scroll-enter.

**Firebase Integration:**

```ts
const { data: profile } = useHeroData(ownerUsername);
// profiles.stats sub-field drives all stat blocks
```

**Bento Grid Layout (within section):**

```
┌─────────────────────────┬──────────────┬──────────────┐
│  Portrait + Ripple 3D   │  Stat Block  │  Stat Block  │
│  (col-span-1, row-2)    │              │              │
│                         ├──────────────┴──────────────┤
│                         │  Availability CTA Banner    │
│                         │  (driven by profiles.avail) │
└─────────────────────────┴─────────────────────────────┘
```

**3D / Motion Enhancement:**

- The 7-ring ripple system behind the portrait becomes a fully 3D concentric torus mesh stack rendered via R3F. Each ring is an independently rotating `THREE.TorusGeometry` with a wireframe material in the accent color. Ring speed and opacity are configurable in Theme Studio.
- The "hover energy aura" uses a `THREE.ShaderMaterial` custom radial bloom that responds to pointer proximity, using `useSpring` from Framer Motion to interpolate bloom intensity.

**Builder Sync Fields:** `stats.*`, `availability`, `heroPortraitUrl`

---

### 6.5 TechArsenal 🆕

**Purpose:** An immersive, recruiter-unforgettable interactive 3D showcase of the full technology stack — far beyond a typical "skills list". Positions the owner as a practitioner of a broad, modern toolkit, with depth visible on interaction.

**Design Concept:**

A full-width dark Bento block containing a `<canvas>` rendered by React Three Fiber. Technologies are represented as 3D floating icon spheres arranged in a **force-directed 3D graph**. Spheres are grouped by category (Frontend, Embedded, Backend, AI/ML, Tools) with glowing category orbit lanes. On hover, a sphere zooms forward, rotates to face the camera, and expands a glassmorphism tooltip card beneath the canvas showing `{ name, proficiencyLevel, yearsUsed, projectsUsedIn }`.

**Firebase Integration:**

```ts
const { data: techStack, isLoading } = useQuery({
  queryKey: ['techBadges3D', ownerId],
  queryFn: () => skillService.fetchTechArsenal(ownerId),
  // Returns all skills where showIn3DBadge == true, with category grouping
  staleTime: 10 * 60 * 1000,
});
// Source: Firestore 'skills' collection
```

**Feature Breakdown:**

1. **Force-Directed 3D Graph Layout**
   - Uses `d3-force-3d` to compute initial sphere positions in 3D space, avoiding overlaps while maintaining category clustering.
   - Category groups are color-coded via CSS variables: Frontend (`--color-primary`), Embedded (`--color-warning`), Backend (`--color-success`), AI/ML (`--color-info`), Tools (`--color-secondary`).
   - Each sphere node is a `THREE.Mesh` with a `THREE.MeshStandardMaterial` using the tech icon as a texture decal.

2. **Interactive Sphere Controls**
   - `OrbitControls` (Drei) allow recruiter to freely rotate the entire constellation.
   - Click a sphere: camera lerps toward it using `useCameraLerp` hook, centering that tech in frame and expanding the detail tooltip.
   - Touch/drag support for mobile PWA.

3. **Category Orbit Lanes**
   - Semi-transparent `THREE.TorusGeometry` rings for each category group — serving as visual separators and depth cues.
   - Ring opacity pulses on the active hovered category.

4. **Live Proficiency Aura**
   - Sphere scale and emissive glow intensity are proportional to `proficiencyLevel`. Expert-level techs (90+) cast a visible point-light bloom into the scene.

5. **Animated Entry Sequence**
   - On first mount, all spheres start at the scene origin and `spring`-expand outward to their computed positions over 1.2 seconds with staggered delays per category group.

6. **Glassmorphism Tooltip Card (HTML Overlay)**
   - Rendered as a DOM overlay (not WebGL) using `drei`'s `<Html>` component for crisp text rendering.
   - Shows: icon, name, category badge, proficiency ring, years of experience, and "Used in N projects" count.

7. **Fallback**
   - On WebGL failure or reduced-motion preference: a standard Bento Grid of skill category columns renders, using the same Firestore data.

**Bento Grid Layout (section shell):**

```
┌───────────────────────────────────────────────────────┐
│  Section Header: "Tech Arsenal" + subtitle            │
│  (full-width text block, col-span-3)                  │
├───────────────────────────────────────────────────────┤
│  3D Canvas Block (col-span-2, row-span-2, large)      │  Tooltip Card (col-span-1)
│  [R3F Scene — force-directed sphere graph]            │  [Active sphere detail]
├─────────────────────────────────────┬─────────────────┤
│  Category Filter Chips              │  Legend Block   │
│  (Frontend | Embedded | Backend...) │  color coding   │
└─────────────────────────────────────┴─────────────────┘
```

**Builder Sync Fields (per skill):** `name`, `category`, `proficiencyLevel`, `iconUrl`, `yearsUsed`, `showIn3DBadge`, `sortOrder`, `isPublished`

**Builder UI:** In the Skills accordion, a toggle `"Show in 3D Arsenal"` (maps to `showIn3DBadge`) controls inclusion. Category color assignment is set per-category in Theme Studio.

**Performance Notes:**

- R3F canvas is lazily mounted via `React.lazy` + `Suspense` behind a skeleton.
- Sphere geometries are shared via `instancedMesh` if skill count exceeds 30 to minimize draw calls.
- Icon textures are loaded via `useTexture` (Drei), which de-duplicates and caches them.

---

### 6.6 ProjectSection (Revised — Firebase-Driven)

**Purpose:** Showcase project portfolio with rich interactions and a detail modal.

**Changes from original:** All project data migrates from `src/data/project-list.ts` to Firestore `projects`. The `isFeatured` flag controls the carousel. `isPublished` controls visibility.

**Firebase Integration:**

```ts
const { data: projects, isLoading } = useFeaturedProjects(ownerId, {
  filter: { isFeatured: true, status: 'published' },
  orderBy: 'sortOrder',
  limit: 6,
});
// Source: Firestore 'projects' collection
```

**Bento Grid Layout (within section):**

- Featured carousel becomes the center `2x2` Bento hero block.
- Secondary projects render as a `1x1` Bento grid row beneath.
- Project modal now includes deep-link URL (`/:username/projects/:id`) for PWA sharability.
- Grid adjusts seamlessly from a single-column stack on mobile to a staggered asymmetric masonry grid on ultra-wide screens.

**3D / Motion Enhancement:**

- The pointer-driven 3D tilt/parallax (previously in-component) is extracted to a shared `useTilt3D` hook and applied uniformly to all project Bento blocks. This delivers premium tactile feedback.
- `react-spring` handles smooth origin-return when the pointer leaves the card.
- Featured project screenshot in the carousel supports a `glTF` scene preview if a `modelUrl` is set on the project document — allowing 3D architecture diagrams to replace static screenshots.
- **Scroll Reveal:** Uses Framer Motion `whileInView` with a threshold of 0.2 to stagger opacity and Y-axis transforms for each grid element as the recruiter scrolls down.

**Builder Sync Fields:** All `projects` collection fields: `title`, `description`, `techStack[]`, `thumbnailUrl`, `liveUrl`, `repoUrl`, `isFeatured`, `status`, `sortOrder`, `modelUrl`

---

### 6.7 Achievements 🆕

**Purpose:** A visually rich, chronological narrative of the owner's certifications, awards, competitions, and industrial training — presented as an interactive 3D timeline that makes the resume's achievements tangible and memorable to recruiters.

**Design Concept:**

A horizontal scrolling timeline on desktop (vertical on mobile). Each milestone is a floating glassmorphism card anchored to a 3D spine — a glowing `THREE.CatmullRomCurve3` bezier path rendered in R3F. Milestone cards are positioned along the curve using `THREE.Vector3` positions computed from the timeline's date distribution. The scene has a parallax scroll effect: as the user scrolls the page, the 3D camera tracks laterally along the timeline curve.

**Firebase Integration:**

```ts
const { data: timeline, isLoading } = useCertificatesAndExperience(ownerId);
// Merges and sorts: Firestore 'certificates' + 'experience' collections
// Adds: achievements[] from profiles.stats.achievements[]
// Source: Firestore 'certificates' and 'experience' collections
```

**Merged Timeline Interface:**

```ts
interface TimelineEntry {
  id: string;
  type: 'certificate' | 'award' | 'experience' | 'training' | 'education';
  title: string;
  organization: string;
  date: Timestamp;
  description?: string;
  credentialUrl?: string;
  badgeUrl?: string; // For certificates — rendered as texture on 3D badge
  accentColor?: string; // Per-entry color; defaults to --color-primary
  isFeatured: boolean; // Featured entries get larger cards and more glow
}
```

**Feature Breakdown:**

1. **3D Bezier Spine**
   - A `THREE.TubeGeometry` built from a `CatmullRomCurve3` interpolating through milestone positions.
   - The tube glows with an animated `emissiveIntensity` shader, pulsing like a fiber optic cable.
   - Milestone nodes are `THREE.SphereGeometry` markers — size proportional to `isFeatured`.

2. **Floating Certificate Badges (3D)**
   - Certificates with a `badgeUrl` get a 3D badge model: a `THREE.CylinderGeometry` disc with the badge image as a decal texture on the top face.
   - On hover, the badge tilts 15° toward the camera and emits a `PointLight`.
   - Clicking opens the `credentialUrl` in a new tab.

3. **Parallax Scroll Camera Track**
   - A `useScroll` (Drei) listener drives `camera.position` along the Bezier curve as the section scrolls into and through the viewport.
   - This creates the effect that the recruiter is "flying through time" along the career path.
   - On mobile / reduced-motion: static vertical list replaces the parallax camera.

4. **Milestone Card HTML Overlays**
   - Each milestone uses Drei's `<Html>` for the card content (crisp text, no WebGL font rendering).
   - Cards use glassmorphism styling with `backdrop-blur-md` and a left accent border in `accentColor`.
   - Featured entries get `row-span-2` Bento height equivalents within the card layout.
   - Screen reader attributes (`aria-label`) describe the milestone timeline visually represented in 3D.

5. **Entry Type Icons**
   - Each `type` has a unique Rough.js hand-drawn SVG icon (certificate scroll, award ribbon, briefcase, factory building, graduation cap) rendered in the `--color-primary` accent.
   - These reinforce the "organic warmth" visual language.

6. **Category Filter Row**
   - Pill filter chips above the timeline: `All | Certificates | Awards | Experience | Training`
   - Active filter smoothly hides non-matching nodes via `AnimatePresence` + `layout` props.
   - Filter state is local React state (not Firestore) — client-side only.

7. **Fallback (No WebGL)**
   - Renders a clean Framer Motion staggered vertical list of `TimelineEntry` cards with Rough.js decorative borders.

**Bento Grid Layout (section shell):**

```
┌──────────────────────────────────────────────────────┐
│  Section Header + Category Filter Chips (col-span-3) │
├──────────────────────────────────────────────────────┤
│  3D Timeline Canvas                                  │
│  (full-width, col-span-3, row-span-3)               │
│  [R3F scene — Bezier spine + floating cards]         │
├──────────────────────────────────────────────────────┤
│  "Download Resume PDF" CTA Block (col-span-3)        │
└──────────────────────────────────────────────────────┘
```

**Builder Sync Fields:**

- `certificates` collection: `name`, `issuer`, `date`, `credentialUrl`, `badgeUrl`, `isFeatured`
- `experience` collection: `role`, `company`, `startDate`, `endDate`, `description`, `type`, `isFeatured`
- `profiles.stats.achievements[]`: ad hoc award entries that don't fit the above collections

---

### 6.8 BlogSection (Revised — Firebase-Driven)

**Purpose:** Promote technical writing and thought content.

**Changes from original:** Blog post data migrates from `src/data/blog-posts.ts` to Firestore `blog_posts`. Posts shown on the landing page are controlled by `isPublished: true` and `featuredOnLanding: true` flags set in the builder's Content accordion.

**Firebase Integration:**

```ts
const { data: posts, isLoading } = usePublishedBlogPosts(ownerId, {
  filter: { isPublished: true, featuredOnLanding: true },
  limit: 3,
  orderBy: ['publishedAt', 'desc'],
});
// Source: Firestore 'blog_posts' collection
```

**Bento Grid Layout (within section):**

```
┌───────────────────────────┬────────────┬────────────┐
│  Featured Post            │  Post 2    │  Post 3    │
│  (col-span-1, row-span-2) │ (standard) │ (standard) │
│  Large cover + excerpt    │            │            │
│                           ├────────────┴────────────┤
│                           │  "View All Articles" →  │
└───────────────────────────┴─────────────────────────┘
```

**3D / Motion Enhancement:**

- Each blog card Bento block animates with the shared `useTilt3D` hook for depth perception.
- The featured post card uses a `THREE.PlaneGeometry` cover image mesh in a mini R3F canvas, with a subtle wave displacement shader on hover — making the cover image feel 3D and tactile.
- On hover, the `Read More` arrow micro-animates via a spring motion `translateX(4px)` to encourage click-through.
- Semantic HTML tags (`<article>`) are used for each post cell for screen readers.

**Builder Sync Fields (per blog post):** `title`, `excerpt`, `slug`, `coverImageUrl`, `tags[]`, `publishedAt`, `isPublished`, `featuredOnLanding`, `readTimeMinutes`

---

### 6.9 QuantifiableImpact 🆕

**Purpose:** Deliver a data-driven, quantified argument for hiring the owner. Combines animated live stats with subtle data visualization, creating a "mission control dashboard" feel that differentiates the portfolio from all text-and-image alternatives.

**Design Concept:**

A full-width dark-glass section rendered as a multi-column Bento dashboard. Numbers animate as counters on scroll-enter. A subtle 3D data visualization (live bar/scatter WebGL chart) floats in one of the large Bento blocks. The entire section pulses gently with ambient particle activity, communicating active engineering output.

**Firebase Integration:**

```ts
// Primary: denormalized stats from profiles document (fast, 1 read)
const { data: stats } = useOwnerStats(ownerId);
// profiles.stats field: { projectsCompleted, awardsWon, competitionsEntered,
//                         githubCommitsThisYear, skillsPublished,
//                         resumeDownloads, portfolioViews }

// Secondary: recent analytics events for live chart data
const { data: analyticsChart } = useAnalyticsChartData(ownerId, {
  range: 'last30days',
  metric: 'portfolio_views',
});
// Source: Firestore 'analytics_events' — aggregated by day, last 30 days
```

**Denormalized Stats Strategy:**
To avoid expensive aggregation queries on page load, metric counts are maintained as denormalized fields on the `profiles` document. A Firebase Cloud Function (trigger: `onCreate` on relevant collections) increments these counters atomically. This means the section always loads in a single Firestore document read.

**Feature Breakdown:**

1. **Animated Counter Bento Blocks**
   - 6 animated counter blocks, each showing one metric with an icon, value, and context label.
   - Ranks top metrics for scanability.
   - Counters use `react-countup` (triggered by `IntersectionObserver` on section entry).
   - Each block has a colored left-border accent per metric category.
   - Reduced-motion safe: If OS prefers reduced motion, values render immediately instead of counting up.

   | Block                 | Metric                        | Icon | Firebase Source  |
   | --------------------- | ----------------------------- | ---- | ---------------- |
   | Projects Shipped      | `stats.projectsCompleted`     | 🚀   | `profiles.stats` |
   | Awards Won            | `stats.awardsWon`             | 🏆   | `profiles.stats` |
   | Competitions Entered  | `stats.competitionsEntered`   | ⚡   | `profiles.stats` |
   | GitHub Commits (Year) | `stats.githubCommitsThisYear` | 💻   | `profiles.stats` |
   | Skills Published      | `stats.skillsPublished`       | 🛠️   | `profiles.stats` |
   | Portfolio Views       | `stats.portfolioViews`        | 👁️   | `profiles.stats` |

2. **Live Portfolio Engagement Chart (3D Bar Chart)**
   - A large `2x2` Bento block containing an R3F scene rendering a **3D bar chart** of portfolio views over the last 30 days.
   - Each day's bar is a `THREE.BoxGeometry` extruded from a ground plane, colored by relative intensity (`--color-primary` gradient from dim to full saturation).
   - Bars animate upward on mount using `useSpring` from `@react-spring/three`.
   - Hovering a bar shows a `<Html>` tooltip with date and exact view count.
   - Fallback: renders a standard `chart.js` 2D line chart if WebGL unavailable.

3. **GitHub Contribution Heatmap Strip**
   - A horizontal strip Bento block rendering a miniaturized GitHub-style contribution heatmap using `d3` and SVG (not fetched from GitHub API — sourced from `profiles.stats.weeklyContributions[]` array maintained by the owner or a Cloud Function).
   - Heatmap cells glow in `--color-primary` accent.

4. **Activity Feed Ticker**
   - A narrow vertical Bento block showing a live-scrolling ticker of recent analytics events (project clicks, resume downloads) from Firestore `analytics_events` using a `onSnapshot` real-time subscription.
   - Events appear with a slide-in animation from the bottom.
   - Shows event type icon, label, and relative time (e.g., "Resume downloaded · 3 min ago").
   - This shows recruiters that the portfolio is actively visited — social proof through live activity.

5. **"Open to Work" Availability Banner**
   - A bottom-anchored Bento chip: `profiles.availability` string (e.g., "Open to GET roles — Graduating June 2026") with a glowing animated dot.
   - Color: green for open, amber for selective, grey for unavailable — driven by `profiles.availabilityStatus` enum.

**Bento Grid Layout (within section):**

```
┌────────────────┬────────────────┬────────────────┐
│  Counter Block │  Counter Block │  Counter Block │
│  Projects      │  Awards        │  Competitions  │
├────────────────┼────────────────┼────────────────┤
│  Counter Block │  Counter Block │  Counter Block │
│  GitHub        │  Skills        │  Views         │
├────────────────┴────────────────┤                │
│  3D Portfolio Views Chart       │  Activity Feed │
│  (col-span-2, row-span-2)       │  Ticker        │
│                                 │  (col-span-1,  │
│                                 │   row-span-2)  │
├─────────────────────────────────┴────────────────┤
│  GitHub Contribution Heatmap + Availability Band │
│  (col-span-3, compact strip)                     │
└──────────────────────────────────────────────────┘
```

**Builder Sync Fields:**

- `profiles.stats.*`: All counter values are editable in the builder's Personal Info → Stats tab.
- `profiles.availability`: Free-text field in builder.
- `profiles.availabilityStatus`: Enum dropdown in builder (`open` | `selective` | `unavailable`).
- `profiles.stats.weeklyContributions[]`: 52-entry array for heatmap, editable or auto-updated via Cloud Function.

---

### 6.10 MapSection (Revised — Firebase Location)

**Purpose:** Show collaboration geography and location-based credibility.

**Changes from original:** `profiles.location` (Firestore) replaces the hardcoded default coordinates. The admin sets their city, lat/lng, and timezone from the builder.

**Firebase Integration:**

```ts
const { data: profile } = useHeroData(ownerUsername);
// profile.location: { city, lat, lng, timezone, remoteAvailable }
```

**Builder Sync Fields:** `profiles.location.city`, `profiles.location.lat`, `profiles.location.lng`, `profiles.location.remoteAvailable`

**3D / Motion Enhancement:** 
- Embedded maps are loaded lazily to maintain rapid page performance (LCP).
- A glowing pulse dot in CSS or a low-poly R3F pin is placed at the exact lat/long coordinate.
- Panel overlays detailing timezones use Framer Motion entrance transitions (`viewport.once`) consistent with other sections.

---

### 6.11 TestimonialsSection (Revised — Firebase-Driven)

**Purpose:** Social proof and trust reinforcement.

**Changes from original:** All testimonial data migrates from the in-component local array to Firestore `testimonials`. The admin adds/removes/edits testimonials via the builder's Content accordion.

**Firebase Integration:**

```ts
const { data: testimonials, isLoading } = useTestimonials(ownerId, {
  filter: { isPublished: true },
  orderBy: 'sortOrder',
});
// Source: Firestore 'testimonials' collection
```

**Bento Grid Layout:** 
Testimonials are arranged in a horizontal continuous CSS scrolling marquee or a masonry-style Bento grid (alternating `1x1` and `1x2` height blocks) to create an editorial, recruiter-friendly feel that promotes scanning.

**3D / Motion Enhancement:** 
- Scrolling speed slows on hover, utilizing CSS `animation-play-state: paused` for readability.
- Reviewer avatar images are rendered on `THREE.CircleGeometry` meshes in a mini R3F canvas per card, with a subtle ring-rotation shader. This differentiates the avatars from standard `<img>` circles without heavy computational cost.
- Glassmorphic card backgrounds with floating `--color-glow` drop shadows reinforce the premium hierarchy.

**Builder Sync Fields (per testimonial):** `name`, `role`, `company`, `avatarUrl`, `text`, `rating`, `isPublished`, `sortOrder`

---

### 6.12 CTASection (Revised)

**Purpose:** Primary lead capture and contact conversion, serving as the definitive end-of-funnel for recruiters and leads.

**Layout & Aesthetic:**
Centered layout maximizing negative space, drawing the eye directly to the input fields. Inputs utilize glassmorphism (translucency + background blur) over a dark, deeply saturated `--sys-bg-primary` base.

**Changes from original:** The availability copy within the CTA is driven from `profiles.availability` (same field as QuantifiableImpact). No structural integration change — FormSubmit remains the external delivery mechanism.

**3D / Motion Enhancement:** 
- The main contact card and layout frame use the shared `useTilt3D` hook for a rich, premium float effect on hover.
- A subtle R3F background of slow-drifting interactive particles fills the section canvas to maintain immersion without distracting from form completion.
- Form inputs transition focus states elegantly with a `--color-primary` glowing bottom border/ring, ensuring accessibility and clear keyboard navigation visibility.

---

### 6.13 Footer (Revised)

**Layout & Aesthetic:**
Minimalist footprint. Uses muted typography (`text-(--sys-text-secondary)`) for secondary links to establish ending hierarchy, preventing distraction from the main CTA.

**Route Mismatch Fix:**
Footer CTA and access links that previously pointed to `/admin-access` are confirmed correct (this IS the right route per the actual router). Documentation inconsistency resolved.

**Firestore newsletter write remains** (no change):

```ts
// Firestore write: newsletter_subscribers/{email}
{ email: string, subscribed_at: Timestamp }
```

**Dynamic Profile Chip:** Footer profile chip sources from `profiles` via the shared `useHeroData` hook (already in cache from Hero). No additional Firestore read.

---

## 6. Backend & External Integration Matrix

| Section                 | Integration Type   | Source / Target                       | Behavior                                    |
| ----------------------- | ------------------ | ------------------------------------- | ------------------------------------------- |
| Navbar                  | Firebase read      | `profiles`                            | Profile avatar, name, role for nav chip     |
| Navbar notifications    | Firebase realtime  | `analytics_events` (onSnapshot)       | Live owner notification feed                |
| Hero                    | Firebase read      | `profiles`                            | Full hero block data + tech badge pills     |
| MySkillSection          | Firebase read      | `skills` (featuredOnLanding)          | Carousel skill cards                        |
| TechArsenal3D 🆕        | Firebase read      | `skills` (showIn3DBadge)              | 3D force-directed sphere graph              |
| HireMe                  | Firebase read      | `profiles.stats`                      | Stat block counter values                   |
| ProjectSection          | Firebase read      | `projects` (isFeatured)               | Featured carousel + grid                    |
| AchievementsTimeline 🆕 | Firebase read      | `certificates` + `experience`         | 3D Bezier timeline entries                  |
| BlogSection             | Firebase read      | `blog_posts` (featuredOnLanding)      | Blog card grid                              |
| ImpactMetrics 🆕        | Firebase read      | `profiles.stats` + `analytics_events` | Counter blocks + 3D chart + activity ticker |
| MapSection              | Firebase read      | `profiles.location`                   | Map center coordinates                      |
| TestimonialsSection     | Firebase read      | `testimonials`                        | Masonry testimonial grid                    |
| CTASection              | External API write | FormSubmit endpoint                   | Lead capture email delivery                 |
| Footer                  | Firebase read      | `profiles`                            | Profile chip (from cache)                   |
| Footer newsletter       | Firebase write     | `newsletter_subscribers`              | Subscriber email upsert                     |

---

## 7. Builder Mode Field Map

This table serves as the implementation contract between the landing page and the `/builder` admin workspace.

| Builder Accordion Tab  | Editable Field         | Landing Page Target       | Section                       |
| ---------------------- | ---------------------- | ------------------------- | ----------------------------- |
| Personal Info          | `fullName`             | Name reveal heading       | Hero                          |
| Personal Info          | `tagline`              | Role chips / headline     | Hero                          |
| Personal Info          | `bio`                  | Intro paragraph           | Hero                          |
| Personal Info          | `heroPortraitUrl`      | Parallax portrait mesh    | Hero                          |
| Personal Info          | `techBadgePills[]`     | Floating 3D badge orbit   | Hero                          |
| Personal Info          | `heroCards[]`          | Floating stat side cards  | Hero                          |
| Personal Info          | `availability`         | Availability badge        | HireMe, ImpactMetrics, CTA    |
| Personal Info          | `availabilityStatus`   | Color of availability dot | ImpactMetrics                 |
| Personal Info          | `stats.*`              | All counter blocks        | HireMe, ImpactMetrics         |
| Personal Info          | `location.*`           | Map embed center          | MapSection                    |
| Skills                 | `featuredOnLanding`    | Skill carousel            | MySkillSection                |
| Skills                 | `showIn3DBadge`        | 3D Arsenal globe          | TechArsenal3D                 |
| Skills                 | All skill fields       | Both skill sections       | MySkillSection, TechArsenal3D |
| Projects               | `isFeatured`           | Featured carousel         | ProjectSection                |
| Projects               | All project fields     | Full project display      | ProjectSection                |
| Content → Blog         | `featuredOnLanding`    | Blog card grid            | BlogSection                   |
| Content → Blog         | All blog fields        | Blog cards                | BlogSection                   |
| Content → Testimonials | All fields             | Masonry grid              | TestimonialsSection           |
| Experience             | All experience fields  | Timeline entries          | AchievementsTimeline          |
| Certificates           | All certificate fields | Timeline entries          | AchievementsTimeline          |

---

## 8. Performance & PWA Considerations

### 8.1 R3F Canvas Budget

The page now contains up to 4 R3F canvas instances simultaneously (Hero, TechArsenal3D, BlogSection featured, ImpactMetrics chart). To prevent GPU overload:

- All R3F canvases share a single WebGL renderer via `@react-three/fiber`'s `frameloop="demand"` mode — frames render only on state change, not on every animation frame.
- The `TechArsenal3DSection` and `AchievementsTimelineSection` canvases are deferred: they only mount when the section enters the viewport (`IntersectionObserver` gate) and unmount when fully scrolled out.
- Device performance tier detection (via `navigator.hardwareConcurrency` and a GPU benchmark heuristic) reduces sphere count in TechArsenal3D on low-end devices.

### 8.2 Firestore Read Budget (Landing Page Cold Load)

Estimated Firestore reads on a cold page load:

| Query                      | Reads  | Notes                                                             |
| -------------------------- | ------ | ----------------------------------------------------------------- |
| `profiles` (owner)         | 1      | Shared across Hero, HireMe, Navbar, Footer, Map                   |
| `skills` (published)       | ~1     | All skills in one query, filtered client-side for carousel vs. 3D |
| `projects` (featured)      | ~1     | Limit 6                                                           |
| `blog_posts` (featured)    | ~1     | Limit 3                                                           |
| `testimonials` (published) | ~1     | Limit 10                                                          |
| `certificates`             | ~1     |                                                                   |
| `experience`               | ~1     |                                                                   |
| `analytics_events` (chart) | ~1     | Aggregated query, last 30 days by day                             |
| **Total**                  | **~8** | Served from IndexedDB cache on repeat visits                      |

On repeat visits with IndexedDB cache active (PWA), all 8 reads are served from cache with zero network latency — landing page renders instantly.

### 8.3 Lazy Loading Strategy

```ts
// All heavy R3F components are lazily loaded
const HeroCanvasR3F = lazy(() => import('../components/3D/HeroCanvasR3F'));
const TechArsenalCanvas = lazy(() => import('../components/3D/TechArsenalCanvas'));
const TimelineCanvas = lazy(() => import('../components/3D/TimelineCanvas'));
const ImpactChartCanvas = lazy(() => import('../components/3D/ImpactChartCanvas'));

// Wrapped in Suspense with skeleton fallbacks in each section
<Suspense fallback={<CanvasSkeleton height={400} />}>
  <TechArsenalCanvas data={techStack} />
</Suspense>
```

### 8.4 Image Optimization

- `heroPortraitUrl` and `thumbnailUrl` fields should point to Firebase Storage URLs with `?width=800&format=webp` transformation parameters (via Firebase Extensions: Resize Images).
- Skill `iconUrl` assets are served from Firebase Storage in SVG format where possible to maintain crisp quality at any DPI.

---

## 9. Accessibility Standards

| Standard                 | Implementation                                                                                                 |
| ------------------------ | -------------------------------------------------------------------------------------------------------------- |
| WCAG 2.1 AA              | All Bento block text maintains minimum 4.5:1 contrast ratio                                                    |
| `prefers-reduced-motion` | All R3F animation loops halt; Framer Motion spring transitions disabled                                        |
| Keyboard navigation      | Full `:focus-visible` ring on all interactive controls, including 3D tooltip cards                             |
| Screen readers           | All `<canvas>` elements have `aria-label` descriptions; R3F provides ARIA roles via `<group aria-label="...">` |
| Semantic HTML            | Section, nav, main, article hierarchy maintained across all Bento layouts                                      |
| `alt` text               | All `<img>` elements have descriptive `alt` — including tech badge icons                                       |
| Touch support            | `OrbitControls` in TechArsenal3D has touch events; minimum 44px tap targets on all mobile controls             |

---

## 10. Gaps & Technical Debt

| Item                                                   | Priority | Notes                                                                                                                            |
| ------------------------------------------------------ | -------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `vite-plugin-pwa` not yet installed                    | HIGH     | Required for offline caching of 3D assets and IndexedDB data — install: `npm install -D vite-plugin-pwa workbox-window`          |
| `roughjs` not yet installed                            | MEDIUM   | Required for hand-drawn Bento borders in MySkillSection and AchievementsTimeline — install: `npm install roughjs`                |
| `d3-force-3d` not in package.json                      | HIGH     | Required for TechArsenal3DSection sphere layout — install: `npm install d3-force-3d`                                             |
| `react-countup` not in package.json                    | MEDIUM   | Required for ImpactMetricsSection animated counters — install: `npm install react-countup`                                       |
| Cloud Function for stats counters                      | HIGH     | `profiles.stats.projectsCompleted`, `awardsWon`, etc. need an `onCreate` trigger on `projects`, `certificates` to auto-increment |
| `profiles.techBadgePills[]` field not yet in schema    | HIGH     | Add to `database.types.ts` + Firestore converter                                                                                 |
| `profiles.heroCards[]` field not yet in schema         | HIGH     | Add to `database.types.ts` + Firestore converter                                                                                 |
| `profiles.availabilityStatus` enum not in schema       | MEDIUM   | Add enum type + builder dropdown                                                                                                 |
| `blog_posts.featuredOnLanding` flag not in schema      | MEDIUM   | Add boolean field to `BlogPost` type                                                                                             |
| `skills.showIn3DBadge` flag not in schema              | HIGH     | Required for TechArsenal3DSection — add to `Skill` type                                                                          |
| `skills.yearsUsed` field not in schema                 | LOW      | Enhances Arsenal tooltip; add as optional number field                                                                           |
| Firebase Resize Images extension                       | MEDIUM   | Required for WebP/responsive image optimization                                                                                  |
| Supabase `@supabase/supabase-js` still in package.json | CRITICAL | `npm uninstall @supabase/supabase-js` — confirmed in `temp.md` audit                                                             |
| Hero tech badge pills still show Supabase icon in code | CRITICAL | Replace hardcoded badge array with `profiles.techBadgePills[]` as specified                                                      |
| Route mismatch: footer links → `/admin-access`         | RESOLVED | Footer correctly targets `/admin-access` per actual router — no action needed                                                    |
| E2E tests for new sections                             | MEDIUM   | Add Playwright tests for TechArsenal3D WebGL fallback + ImpactMetrics counter entry                                              |

---

_Specification authored: 2026-04-02 | Aligned with: `TechStack.md`, `Database.md`, `Features.md`, `StateManagement.md`, `FutureScope.md`, `temp.md` audit trail._
