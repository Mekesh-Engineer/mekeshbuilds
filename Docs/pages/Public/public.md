# Page: Home (Landing Page)

**Route:** `/`
**Type:** Public
**Component:** `LandingPage`

---

## 1. Page Overview

The Home page is the primary marketing and conversion surface for MekeshBuilds. It serves double-duty as both a portfolio showcase and a platform landing page, designed to convert recruiters into portfolio viewers and ultimately into contacts. Every section is Firebase-driven (no static local data in production) and rendered as an immersive Bento Grid with 3D and motion elements. See `home.md` for the complete section-by-section specification.

---

## 2. UI Description

**Section Order:**

1. Navbar (sticky)
2. HeroSection — 3D portrait canvas, animated name, tech orbit badges, floating stat cards
3. MySkillSection — Firebase skills, Bento grid carousel, Rough.js borders
4. HireMe — Dynamic stat counters, 3D concentric torus rings, availability banner
5. TechArsenal3DSection 🆕 — Force-directed 3D sphere graph of full tech stack
6. ProjectSection — Firebase featured projects, Bento layout, 3D tilt
7. AchievementsTimelineSection 🆕 — 3D Bezier spine timeline of certs + experience
8. BlogSection — Firebase blog posts, masonry Bento grid
9. ImpactMetricsSection 🆕 — Live counters, 3D bar chart, activity ticker
10. MapSection — Firebase-driven map center, Google Maps embed
11. TestimonialsSection — Firebase testimonials, masonry grid, 3D avatars
12. CTASection — Lead capture form (FormSubmit external API)
13. Footer — Firebase profile chip, newsletter subscriber write

**Bento Grid Architecture:**

- Sections are full-width containers; internal content is asymmetric CSS Grid
- All blocks use the shared `BentoBlock` primitive with glassmorphism styling
- Motion: Framer Motion staggered entry, `useTilt3D` hook on project/blog cards

---

## 3. Features & Functionality

- Dynamic Firebase data across all sections (no static arrays in production)
- R3F 3D canvases: Hero portrait mesh, TechArsenal3D sphere graph, Timeline Bezier spine, ImpactMetrics bar chart
- `useAiContext` hook parses URL params (e.g., `?role=frontend`) for AI personalization [PLANNED when aiService.ts implemented]
- `usePortfolioData(ownerUsername)` resolves all profile data in a single query
- PWA offline: IndexedDB cache serves all sections on repeat visits
- Newsletter write to Firestore `newsletter_subscribers`
- Lead capture via `ctaMailService` → FormSubmit endpoint
- Google Maps embed with `navigator.geolocation` for "use my location" feature

---

## 4. Styling

- Dark-first: `--sys-bg-primary: #0f0f14` page background
- Accent system: `--color-primary` (owner-configured in Theme Studio), `--color-glow`, `--color-glass`
- Glassmorphism cards: `backdrop-blur-xl`, `rgba(15,15,20,0.6)` backgrounds, `rgba(255,255,255,0.08)` borders
- Typography: `--font-display` for headings, `--font-body` for body text
- Section spacing: `py-24 md:py-32` between sections
- Rough.js organic borders on select Bento blocks (when installed)
- Full PWA manifest: installable on mobile home screen

---

## 5. Connections

```ts
// Primary data hooks
const { data: profile } = useHeroData(ownerUsername);
const { data: skills } = usePublishedSkills(ownerId, { featuredOnLanding: true });
const { data: projects } = useFeaturedProjects(ownerId);
const { data: blogPosts } = usePublishedBlogPosts(ownerId, { featuredOnLanding: true, limit: 3 });
const { data: testimonials } = useTestimonials(ownerId);
const { data: timeline } = useCertificatesAndExperience(ownerId);
const { data: stats } = useOwnerStats(ownerId);
```

- React Query staleTime: 15 min for profile, 5 min for assets, 2 min for analytics
- `queryClient.prefetchQuery` called in `LandingPage` for hero data to eliminate loading state for above-the-fold content

---

## 6. Firebase Setup & Integration

**Collections Read:** `profiles`, `skills`, `projects`, `blog_posts`, `testimonials`, `certificates`, `experience`, `analytics_events` (aggregated)
**Collections Written:** `newsletter_subscribers` (Footer), `analytics_events` (page view event on mount)
**Auth:** No authentication required. Public page.

**Page view event write:**

```ts
// Fired on LandingPage mount
async function trackPageView(ownerId: string) {
  await addDoc(collection(db, 'analytics_events'), {
    ownerId,
    type: 'page_view_landing',
    route: '/',
    timestamp: serverTimestamp(),
    sessionId: getOrCreateSessionId(),
  });
}
```

**Security rules:** All collections readable without auth for `isPublished == true` documents.

---

## 7. Additional Notes

- `vite-plugin-pwa` must be installed and configured for full offline caching support
- Hero section's `techBadgePills[]` must be populated from `profiles` (not hardcoded) to eliminate the Supabase badge visual
- `home.md` contains the full canonical specification for all sections including the 3 new sections

---

---

# Page: Public Projects

**Route:** `/projects` (note: same path as admin, disambiguated by guard — public route renders for unauthenticated users)
**Type:** Public
**Component:** `PublicProjectsPage`

---

## 1. Page Overview

The public Projects page provides an immersive, filterable gallery of all published portfolio projects. Unlike the admin Projects Manager (tabular), this page is designed for recruiter consumption — visual, interactive, and narrative-driven with project detail modals that tell the full story of each project.

---

## 2. UI Description

### 2.1 Layout

```
┌─────────────────────────────────────────────────────┐
│  PublicLayout Navbar                                │
├─────────────────────────────────────────────────────┤
│  Page Hero: "Projects" heading + filter chips       │
│  [ All ] [ Embedded ] [ Full-Stack ] [ AI/ML ] ...  │
├─────────────────────────────────────────────────────┤
│  Projects Bento Grid                                │
│  ┌────────────────┬───────────┬────────────────┐    │
│  │ Featured (2x2) │ Card(1x1) │ Card (1x1)    │    │
│  │                ├───────────┴────────────────┤    │
│  │                │   Wide card (1x2)          │    │
│  ├────────────────┴────────────────────────────┤    │
│  │  Regular grid of remaining projects         │    │
│  └─────────────────────────────────────────────┘    │
│  Project Detail Modal (overlay when card clicked)   │
└─────────────────────────────────────────────────────┘
```

### 2.2 Project Card (Bento Block)

- Thumbnail with `useTilt3D` parallax effect on hover
- Title, tech stack chips (first 3 + overflow badge)
- Brief description excerpt (100 chars)
- Status indicators: Live URL icon, GitHub icon
- Featured flag: subtle glow border + star badge

### 2.3 Project Detail Modal

- Triggered by clicking any project card
- Full-screen overlay with:
  - Title + tech stack
  - Full description (Markdown rendered)
  - Screenshot carousel (Framer Motion slide transitions)
  - 3D model viewer (mini R3F canvas) if `modelUrl` is set
  - Achievements/awards from project (if set)
  - Live URL + GitHub URL CTAs
  - "← Back" button or Escape key closes

### 2.4 Filter Chips

- Categories derived from `techStack` arrays (dynamically computed, e.g., "React", "ESP32", "Python")
- Active filter: smooth Framer Motion reflow via `layout` prop on grid items
- "All" chip always present; custom category chips from actual project data

---

## 3. Features & Functionality

- Filtering: `fuse.js` client-side fuzzy search by project title + tags
- Firestore query: `where('status', '==', 'published')`, `orderBy('sortOrder', 'asc')`
- Deep-link support: `/projects?id=abc123` opens the modal directly for that project (for AI share links)
- Analytics: `page_view_profile` + `click_project` events written to Firestore on interaction
- `usePageSeo` hook injects project-specific Open Graph meta tags when a project modal is open (for social sharing)
- Empty state: "No projects yet — check back soon!" with a subtle 3D animated placeholder

---

## 4. Styling

- Same dark Bento Grid aesthetic as the landing page
- Project cards: `hover:shadow-[0_0_20px_var(--color-glow)]` on hover
- Category chips: glassmorphism pills with active state in `--color-primary`
- Modal: `position:fixed; inset:0; z-index:50; backdrop-blur-md` overlay; card centered

---

## 5. Firebase Setup & Integration

```ts
const { data: projects } = useQuery({
  queryKey: ['publicProjects', ownerId],
  queryFn: () => projectService.fetchPublishedProjects(ownerId),
  staleTime: 5 * 60 * 1000,
});
```

**Analytics write on project click:**

```ts
await addDoc(collection(db, 'analytics_events'), {
  ownerId,
  type: 'click_project',
  resource: project.id,
  timestamp: serverTimestamp(),
  sessionId: getOrCreateSessionId(),
});
```

---

## 7. Additional Notes

- The route `/projects` appears in both admin and public contexts. The router must disambiguate: admin route is nested under the `AdminLayout` guard chain; public route is under `PublicLayout`. Verify `AppRouter.tsx` handles this correctly.
- Deep-link project modal enables AI-personalized share links like `/:username?highlight=project-v2x` to auto-open specific projects.

---

---

# Page: Public Skills

**Route:** `/skills`
**Type:** Public
**Component:** `PublicSkillsPage`

---

## 1. Page Overview

A dedicated public showcase of the owner's complete skill set, presented in more depth than the landing page skill section. Grouped by category, with proficiency rings, years of experience, and an interactive 3D visualization matching the `TechArsenal3DSection` from the landing page.

---

## 2. UI Description

- **Page Hero:** "Skills & Expertise" heading + subtitle from `profiles.tagline`
- **Category Tab Bar:** dynamically generated from distinct `skill.category` values in Firestore
- **Skill Grid (Bento):** 3-column Bento grid, each block shows icon, name, proficiency arc ring, `yearsUsed`, `projectsUsedIn` count
- **3D Arsenal Canvas:** Full-width R3F force-directed sphere graph (same component as `TechArsenal3DSection`)
- **Proficiency Arc Ring:** SVG arc drawn from 0° to `(proficiencyLevel / 100) * 360°` in `--color-primary`

---

## 3. Features & Functionality

- Category filter tabs reflow the Bento grid via `AnimatePresence` + `layout`
- Hover a skill card: expands to show description + projects using that skill
- "Search skills" input: Fuse.js filter on name + category
- 3D Canvas: same interactive sphere graph from landing page (shared R3F component)

---

## 4. Firebase Setup & Integration

```ts
const { data: skills } = useQuery({
  queryKey: ['publicSkills', ownerId],
  queryFn: () => skillService.fetchPublishedSkills(ownerId),
});
```

**Analytics:** `page_view_skills` event on mount.

---

---

# Page: Public Blog

**Route:** `/blog`
**Type:** Public
**Component:** `PublicBlogPage`

---

## 1. Page Overview

The Blog page lists all published blog posts as a recruiter-readable technical writing showcase. It demonstrates depth of knowledge through written communication — a differentiator that goes beyond project code.

---

## 2. UI Description

- **Page Hero:** "Technical Writing" heading + post count badge
- **Filter Row:** Category chips (from `tags[]`), "Featured only" toggle
- **Blog Grid (Bento):** Top post as `2x2` featured block (large cover, full excerpt); remaining posts as `1x1` cards
- **Post Card:** Cover image, title, tags, read time badge, published date, excerpt

**Individual Post Page:** `/blog/:slug`

- Full `react-markdown` render with syntax highlighting
- Table of contents sidebar (auto-generated from headings)
- Estimated read time + published date
- Tags
- "Back to Blog" navigation
- Open Graph meta via `react-helmet-async`

---

## 3. Features & Functionality

- Firestore query: `where('isPublished', '==', true)`, `orderBy('publishedAt', 'desc')`
- Category filter: client-side from loaded posts (no re-query needed)
- Search: Fuse.js on title + excerpt
- Preview mode: if `?preview=true` and owner is authenticated, shows draft posts

---

## 4. Firebase Setup & Integration

```ts
const { data: posts } = usePublishedBlogPosts(ownerId, { limit: 20 });
// Individual post:
const { data: post } = useQuery(['post', slug], () =>
  contentService.fetchPostBySlug(ownerId, slug),
);
```

**Analytics:** `page_view_blog` event on mount.

**Security rule:**

```
match /blog_posts/{postId} {
  allow read: if resource.data.isPublished == true;
}
```

# Page: About

**Route:** `/about`
**Type:** Public
**Component:** `PublicAboutPage`

---

## 1. Page Overview

The About page is a long-form personal narrative page that goes deeper than the hero section on the landing page. It is the "human story" of the portfolio — background, motivations, engineering philosophy, and non-work interests — designed to build connection with recruiters and hiring managers who want to understand the person behind the projects.

---

## 2. UI Description

### 2.1 Layout

```
┌─────────────────────────────────────────────────────────┐
│  PublicLayout Navbar                                    │
├─────────────────────────────────────────────────────────┤
│  Hero Strip: Portrait + Name + Role                     │
├─────────────────────────────────────────────────────────┤
│  Bento Grid Content                                     │
│  ┌──────────────────────┬──────────────────────────────┐│
│  │  Long-form Bio        │  Quick Facts Card           ││
│  │  (col-span-2)         │  Location, Availability,    ││
│  │                       │  Open to: [roles]           ││
│  ├───────────────────────┤                             ││
│  │  Engineering          ├──────────────────────────────┤│
│  │  Philosophy Block     │  Education Block            ││
│  │                       │  (timeline format)          ││
│  ├───────────────────────┴──────────────────────────────┤│
│  │  Interests / Hobbies Block  (icon grid)              ││
│  ├──────────────────────────────────────────────────────┤│
│  │  Industrial Training Block  (cards)                  ││
│  └──────────────────────────────────────────────────────┘│
│  CTA Section: "Let's Work Together" → contact/CTA       │
└─────────────────────────────────────────────────────────┘
```

### 2.2 Bento Blocks

**Long-form Bio Block (col-span-2):**

- Multi-paragraph text sourced from `profiles.aboutBio` (extended bio field, separate from the short hero `bio`)
- Supports Markdown rendering via `react-markdown`
- Optional inline images

**Quick Facts Card:**

- Location chip (city from `profiles.location.city`)
- Availability badge (color-coded from `profiles.availabilityStatus`)
- "Open to" list: role types from `profiles.openToRoles[]` (e.g., ["GET", "Embedded Engineer", "Full-Stack"])
- Languages chip array

**Engineering Philosophy Block:**

- A featured quote or philosophy statement from `profiles.engineeringPhilosophy`
- Large blockquote styling with `--color-primary` left border
- Author attribution below

**Education Block:**

- Vertical timeline of education entries from `experience` collection where `type == 'education'`
- Each entry: institution name, degree, year range, CGPA badge
- Graduation cap icon per entry (Rough.js hand-drawn style)

**Interests Block:**

- Icon grid of personal interests/hobbies (from `profiles.interests[]`)
- Each interest: icon (from `react-icons`) + label
- On hover: slight scale-up and glow

**Industrial Training Block:**

- Cards for each training entry from `experience` where `type == 'training'`
- Company name, dates, brief description
- Location chip

---

## 3. Features & Functionality

- All content dynamically sourced from Firestore (`profiles` + `experience`)
- Builder editable: `profiles.aboutBio`, `profiles.engineeringPhilosophy`, `profiles.openToRoles[]`, `profiles.interests[]`
- "Download Resume" CTA button links to the owner's primary static resume PDF URL (from `resume_files` collection where `label == 'General'`)
- SEO: `react-helmet-async` injects `<title>About {fullName} | MekeshBuilds</title>` and description meta from `aboutBio` excerpt
- Analytics: `page_view_about` event fired on mount

---

## 4. Styling

- Same dark Bento Grid as all public pages
- Bio text: `prose max-w-none` Tailwind prose classes with custom dark-mode overrides
- Philosophy quote: `text-2xl font-display italic` with `--color-primary` border-left
- Education timeline: vertical dashed line in `--color-primary` with dot markers per entry
- Interests grid: `grid-cols-4 md:grid-cols-6` of uniform square blocks

---

## 5. Firebase Setup & Integration

```ts
const { data: profile } = useHeroData(ownerUsername); // includes aboutBio, interests, philosophy
const { data: education } = useQuery({
  queryKey: ['education', ownerId],
  queryFn: () => experienceService.fetchByType(ownerId, ['education', 'training']),
});
```

**New `profiles` fields needed:**

- `aboutBio`: string (extended Markdown bio)
- `engineeringPhilosophy`: string
- `openToRoles`: string[]
- `interests`: Array<{ label: string; icon: string }>

---

## 7. Additional Notes

- `aboutBio` is a separate Firestore field from `bio` (hero section short bio) — the About page bio can be 500–2000 words while the hero bio is 100–200 words.
- The About page functions as the secondary conversion surface after the landing page hero — it is the "let me tell you more" layer for recruiters who clicked through.

---

---

# Page: Public Profile / Resume

**Route:** `/:username`
**Type:** Public (Dynamic)
**Component:** `PublicProfilePage` wrapped in `PublicLayout`

---

## 1. Page Overview

The Public Profile is the core portfolio page — the primary URL shared with recruiters. It renders the full Bento Grid portfolio experience for the owner's username, with optional AI personalization based on URL parameters. This is the page the owner shares as `mekesh.dev/mekesh` (or equivalent), and the page that AI-generated recruiter-specific links point to.

---

## 2. UI Description

### 2.1 Composition

The page shares section components with `LandingPage` but is organized as a pure portfolio rather than a marketing page:

1. HeroSection (same component as landing page hero)
2. SkillsSection (full Bento Grid of all published skills)
3. ExperienceSection (timeline of work history)
4. ProjectsSection (all published projects in Bento Grid)
5. CertificatesSection (achievement cards)
6. TestimonialsSection (masonry grid)
7. ContactSection (CTA form)

### 2.2 AI Personalization Banner [PLANNED]

If URL params include `?role=frontend&company=google`, a subtle glassmorphism banner appears at the top:

> "This portfolio has been tailored for Frontend Engineering roles at Google — highlighting React, TypeScript, and Web Performance projects."

### 2.3 Bento Layout Configuration

Section order and Bento block sizes can be customized per profile via `profiles.bentoLayout` (a JSON config object) — allowing the admin to create recruiter-specific layouts.

---

## 3. Features & Functionality

- `useParams()` extracts `username`
- `usePortfolioData(username)` resolves all sections from Firestore
- `useAiContext()` parses URL params for recruiter intent [PLANNED]
- Skeleton loaders per section during Firestore hydration
- "Not found" state if username doesn't match any `profiles.username` document
- Analytics: `page_view_profile` event with `username` and `source` properties
- `react-helmet-async` injects per-profile Open Graph meta (portrait image, name, tagline)
- Offline: full page served from IndexedDB cache on repeat visits (PWA)
- PDF export: "Download Resume" button triggers `useExportPDF` with live portfolio data

---

## 4. Styling

- Inherits all theme settings from `profiles.theme` (colors, fonts, effects) — dynamically applied via `useThemeEngine` in `PublicLayout`
- Each portfolio section's Bento blocks use the `--color-*` canvas tokens (not admin `--sys-*` tokens)
- Recruiter-optimized typography: larger headings, generous line height, high contrast

---

## 5. Connections

```ts
const { username } = useParams();
const { data: portfolio, isLoading, error } = usePortfolioData(username);
// portfolio: { profile, skills, projects, experience, certificates, testimonials }
```

**Not found handling:**

```ts
if (error?.code === 'not-found') return <Navigate to="/404" />;
```

---

## 6. Firebase Setup & Integration

**Primary query:**

```ts
const q = query(
  collection(db, 'profiles').withConverter(profileConverter),
  where('username', '==', username),
  where('isPublished', '==', true),
  limit(1),
);
```

**Then parallel queries for portfolio assets using the resolved `ownerId`:**

```ts
const [skills, projects, experience, certs, testimonials] = await Promise.all([
  skillService.fetchPublishedSkills(ownerId),
  projectService.fetchPublishedProjects(ownerId),
  experienceService.fetchPublished(ownerId),
  certificateService.fetchPublished(ownerId),
  contentService.fetchTestimonials(ownerId),
]);
```

**Composite index required:**

```json
{
  "fields": [
    { "fieldPath": "username", "order": "ASCENDING" },
    { "fieldPath": "isPublished", "order": "ASCENDING" }
  ]
}
```

---

## 7. Additional Notes

- `/:username` is the most performance-critical route — it must achieve sub-1s LCP for recruiter first impressions
- PWA cache ensures sub-100ms loads on repeat visits
- AI personalization layer (Phase 2) will dynamically reorder sections and highlight specific skills based on intent classification

---

---

# Page: Login

**Route:** `/auth/login` (Note: The router also accepts `/admin-access` for backward compatibility)
**Type:** Public (Auth entry point)
**Component:** `AdminAccessPage` / `LoginPage`

---

## 1. Page Overview

The Login page is the secure entry point to the owner-only admin workspace. It is designed as a zero-trust portal — minimal surface area, hardened against brute force, and styled to feel like an exclusive, professional gate rather than a generic login form.

---

## 2. UI Description

```
┌─────────────────────────────────────────────────────┐
│  Centered card (max-w-md) on dark full-screen bg     │
│  ┌───────────────────────────────────────────────┐  │
│  │  MekeshBuilds logo + "Admin Access" heading   │  │
│  │  ─────────────────────────────────────────    │  │
│  │  Email input                                  │  │
│  │  Password input (show/hide toggle)            │  │
│  │  "Forgot password?" link → /auth/forgot-pass  │  │
│  │  [Sign In with Email] button                  │  │
│  │  ─── or ───                                   │  │
│  │  [Sign In with Google] button                 │  │
│  │                                               │  │
│  │  Lockout warning (appears after 3 attempts):  │  │
│  │  "⚠️ 2 attempts remaining before lockout"     │  │
│  │                                               │  │
│  │  Lockout state (countdown timer):             │  │
│  │  "🔒 Locked for 14:32 — too many attempts"   │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

**Background:** Animated subtle particle field (R3F or CSS keyframe particles) to maintain immersive aesthetic even on the auth page.

---

## 3. Features & Functionality

### 3.1 Email/Password Sign In

```ts
const userCredential = await signInWithEmailAndPassword(auth, email, password);
const isOwner = await ensureOwnerSession(userCredential.user);
if (!isOwner) {
  await auth.signOut();
  throw new Error('Unauthorized: Owner access only.');
}
```

### 3.2 Google OAuth Sign In

```ts
const provider = new GoogleAuthProvider();
const result = await signInWithPopup(auth, provider);
// Falls back to signInWithRedirect on mobile PWAs
```

### 3.3 Brute Force Lockout

```ts
const LOCKOUT_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

function checkLockout(): { locked: boolean; remainingMs: number; attemptsLeft: number } {
  const data = JSON.parse(localStorage.getItem('__access_lockout') || '{}');
  if (data.lockedUntil && Date.now() < data.lockedUntil) {
    return { locked: true, remainingMs: data.lockedUntil - Date.now(), attemptsLeft: 0 };
  }
  return { locked: false, remainingMs: 0, attemptsLeft: LOCKOUT_ATTEMPTS - (data.attempts || 0) };
}
```

### 3.4 Post-Login Redirect

```ts
const redirectBack = new URLSearchParams(location.search).get('redirectBack') || '/dashboard';
navigate(redirectBack);
```

---

## 4. Styling

- Full-screen dark background: `--sys-bg-primary` with subtle radial glow at center
- Card: `--sys-bg-secondary`, `--bento-radius-lg` corners, `--bento-glow-shadow`
- Email/password inputs: dark background, `--sys-border` border, `--color-primary` focus ring
- Sign In button: filled `--color-primary` background
- Google button: outlined style with Google brand colors
- Warning state: amber background tint on lockout warning
- Locked state: red tint with countdown timer text

---

## 5. Firebase Setup & Integration

**Operations:** `signInWithEmailAndPassword`, `signInWithPopup` (GoogleAuthProvider)
**Authorized domains:** Must include production domain in Firebase Console → Auth → Settings → Authorized Domains
**Environment variable:** `VITE_OWNER_EMAIL` used as fallback owner validation

---

---

# Page: Register

**Route:** `/auth/register`
**Type:** Public
**Component:** `RegisterPage`

---

## 1. Page Overview

The Register page enables the initial owner account creation for a new MekeshBuilds deployment. In production, this page is typically locked down after the owner account is created (via a Firebase Security Rule or environment flag), preventing unauthorized users from creating accounts.

---

## 2. UI Description

Same centered card layout as the Login page, containing:

- Full name input
- Email input
- Password input + confirm password
- "I am the owner of this portfolio" confirmation checkbox
- [Create Account] button
- Link back to `/auth/login`

---

## 3. Features & Functionality

```ts
const userCredential = await createUserWithEmailAndPassword(auth, email, password);
await updateProfile(userCredential.user, { displayName: fullName });
// Create owner profile document in Firestore
await setDoc(doc(db, 'profiles', userCredential.user.uid), {
  ownerId: userCredential.user.uid,
  fullName,
  email,
  username: generateUsername(fullName),
  role: 'owner',
  isPublished: false,
  createdAt: serverTimestamp(),
});
navigate('/builder'); // First-time setup flow
```

**Production lockdown:** After owner registration, a Firestore rule or environment variable (`VITE_REGISTRATION_ENABLED=false`) disables this route, showing "Registration is closed" to prevent unauthorized accounts.

---

## 4. Firebase Setup & Integration

**Operations:** `createUserWithEmailAndPassword`, `updateProfile`, `setDoc` (profiles)
**Post-registration:** Owner profile document created with `role: 'owner'` for `AdminGuard` validation

---

---

# Page: Forgot Password

**Route:** `/auth/forgot-password`
**Type:** Public
**Component:** `ForgotPasswordPage`

---

## 1. Page Overview

Single-purpose utility page for the owner to initiate a Firebase password reset email.

---

## 2. UI Description

Centered card (same aesthetic as Login):

- Email input
- [Send Reset Email] button
- Success state: "Check your inbox — password reset email sent!"
- Back to login link

---

## 3. Features & Functionality

```ts
await sendPasswordResetEmail(auth, email);
setSuccess(true); // Shows success message
```

- Zod validation: `z.string().email()`
- Error handling: `auth/user-not-found` → shows generic "If an account exists, you'll receive an email" (security best practice — don't confirm email existence)

---

## 4. Firebase Setup & Integration

**Operation:** `sendPasswordResetEmail(auth, email)`
**Template:** Customize the password reset email template in Firebase Console → Authentication → Templates

---

---

# Page: Auth Callback

**Route:** `/auth/callback`
**Type:** Public (OAuth redirect handler)
**Component:** `AuthCallbackPage`

---

## 1. Page Overview

A transparent redirect-handler page that intercepts the Firebase OAuth provider response, validates owner status, and routes the user to the appropriate destination. Visible only briefly as a loading state during the OAuth handshake.

---

## 2. UI Description

- Full-screen centered loading spinner with "Verifying your identity…" text
- If validation fails: error message + "Return to login" link
- No permanent UI — transitions away within < 2 seconds

---

## 3. Features & Functionality

```ts
useEffect(() => {
  async function handleCallback() {
    try {
      const result = await getRedirectResult(auth);
      if (result) {
        const isOwner = await checkOwnerStatus(result.user);
        if (!isOwner) {
          await auth.signOut();
          navigate('/auth/login?error=unauthorized');
          return;
        }
      }
      const redirectBack = sessionStorage.getItem('redirectBack') || '/dashboard';
      navigate(redirectBack);
    } catch (err) {
      navigate('/auth/login?error=callback-failed');
    }
  }
  handleCallback();
}, []);
```

---

## 4. Firebase Setup & Integration

**Operation:** `getRedirectResult(auth)` — captures the OAuth redirect result
**Usage:** Only triggered when `signInWithRedirect` is used (mobile PWA fallback from `signInWithPopup`)

---

---

# Page: Not Found (Fallback)

**Route:** `*`
**Type:** Public
**Component:** `NotFoundPage`

---

## 1. Page Overview

The 404 Not Found page handles all unmatched routes. It is PWA-optimized (works offline), logs failed routing attempts to Firestore for broken link detection, and provides a clear path back into the application.

---

## 2. UI Description

- Full-screen dark background
- Large "404" in display font with a subtle glitch text animation (CSS keyframes)
- Short message: "This page doesn't exist or went offline."
- Two CTA buttons: [← Back to Portfolio] → `/` and [Open Builder] → `/builder` (only shown if owner is authenticated)
- Subtle animated particle background (shared CSS animation, no R3F to keep weight minimal on error page)
- Offline indicator: if `usePwaSync.isOnline == false`, message changes to "You're offline — this page isn't in your cache yet."

---

## 3. Features & Functionality

**Error logging:**

```ts
useEffect(() => {
  addDoc(collection(db, 'error_logs'), {
    type: '404',
    path: location.pathname,
    referrer: document.referrer,
    timestamp: serverTimestamp(),
    userAgent: navigator.userAgent.slice(0, 200),
  });
}, []);
```

- `isOwner` from `authStore` controls whether "Open Builder" button is shown
- `usePwaSync` for online/offline state
- `react-helmet-async`: `<title>Page Not Found | MekeshBuilds</title>`, `<meta name="robots" content="noindex">`

---

## 4. Styling

- "404" heading: `text-[12rem] font-display font-black` with CSS glitch animation
  ```css
  @keyframes glitch {
    0%,
    100% {
      clip-path: inset(0 0 100% 0);
      transform: translate(-2px, 0);
    }
    20% {
      clip-path: inset(30% 0 50% 0);
      transform: translate(2px, 0);
    }
    40% {
      clip-path: inset(70% 0 10% 0);
      transform: translate(-1px, 0);
    }
  }
  ```
- Subtitle: `text-sys-text-secondary`
- Buttons: primary filled + secondary outlined

---

## 5. Firebase Setup & Integration

**Collection written:** `error_logs`

```ts
interface ErrorLog {
  type: '404' | 'webgl-crash' | 'auth-error';
  path: string;
  referrer: string;
  timestamp: Timestamp;
  userAgent: string;
}
```

**Security rule:**

```
match /error_logs/{logId} {
  allow create: if request.resource.data.timestamp is timestamp;
  allow read: if request.auth.token.admin == true;
  allow update, delete: if false;
}
```

---

## 7. Additional Notes

- The error logging to Firestore enables the admin to identify broken external links pointing to the portfolio (e.g., old LinkedIn profile links, outdated share links)
- Keep the 404 page weight minimal — no R3F canvas, no heavy libraries. It must work reliably even when the app is partially loaded.
- The PWA offline message is important: recruiters may have cached the portfolio and then navigated to a URL that doesn't exist in the cache — the message prevents confusion.
