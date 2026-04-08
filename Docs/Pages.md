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
