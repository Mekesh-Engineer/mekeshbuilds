# Page: Content Editor

**Route:** `/content`
**Type:** Admin (Protected)
**Guard Chain:** `AuthGuard` → `AdminGuard` → `AdminLayout` → `ContentEditorPage`

---

## 1. Page Overview

The Content Editor is the CMS workspace for all non-project written content: blog posts, gallery items, and testimonials. It provides a three-tab interface where each tab manages a distinct content type, giving the owner a unified "content studio" without navigating to separate pages.

---

## 2. UI Description

### 2.1 Tabs

```
[ Blog Posts ] [ Gallery ] [ Testimonials ]
```

**Blog Posts Tab:**

- Left panel: list of all blog posts (card per post: title, status badge, published date, view count)
- Right panel: active post editor with:
  - Title (text input)
  - Excerpt (textarea, 200 chars)
  - Cover image (ImageUpload → Firebase Storage)
  - Tags (chip array input)
  - Published date (date picker)
  - Toggle: `isPublished`, `featuredOnLanding`
  - Markdown body editor (left: raw MD textarea; right: `react-markdown` live preview)
  - Syntax highlighting in preview via `react-syntax-highlighter`
  - Toolbar: Bold, Italic, H1/H2/H3, Code Block, Link, Image, Table

**Gallery Tab:**

- Masonry grid of all gallery images
- Upload button: multi-file `ImageUpload` → Firebase Storage `owner/gallery/`
- Each image card: hover → delete button + alt-text edit inline
- Reorder: `@dnd-kit/sortable` drag-and-drop
- Alt text field per image (for accessibility)

**Testimonials Tab:**

- List of testimonial cards (reviewer name, company, truncated quote, rating)
- Add / Edit testimonial form (slide-in drawer):
  - Name, role, company (text inputs)
  - Avatar URL (ImageUpload)
  - Testimonial text (textarea, 500 chars)
  - Star rating selector (1–5, interactive star icons)
  - Toggle: `isPublished`, sortOrder
- Delete: `sweetalert2` confirmation

---

## 3. Features & Functionality

- **Blog autosave:** 800ms debounce on the Markdown editor, identical to builder autosave pattern
- **Slug generation:** auto-generates URL slug from title (`title.toLowerCase().replace(/ /g, '-')`)
- **Reading time:** auto-calculates `readTimeMinutes` from word count (average 200 WPM)
- **Image compression:** before upload, images are compressed client-side via `browser-image-compression` to `< 200KB` for gallery items
- **Draft preview:** "Preview Post" button opens `/blog/:slug?preview=true` in a new tab (preview mode bypasses `isPublished` check if the user is authenticated as owner)

---

## 4. Styling

- Same dark admin shell as all admin pages (`--sys-bg-*` tokens)
- Blog editor: left Markdown pane has `font-mono` font, slightly lighter background
- Preview pane: white background, `prose` typography class (Tailwind Typography plugin)
- Gallery grid: 3-column masonry on desktop, 2-column on tablet, 1-column on mobile
- Testimonial stars: `--color-primary` fill for filled stars, `--sys-border` for empty

---

## 5. Connections

```ts
const { data: blogPosts } = useQuery(['blogPosts', ownerId], () =>
  contentService.fetchBlogPosts(ownerId),
);
const { data: gallery } = useQuery(['gallery', ownerId], () =>
  contentService.fetchGallery(ownerId),
);
const { data: testimonials } = useQuery(['testimonials', ownerId], () =>
  contentService.fetchTestimonials(ownerId),
);
```

---

## 6. Firebase Setup & Integration

**Collections:** `blog_posts`, `gallery_items`, `testimonials`

**Storage paths:**

- Blog covers: `owner/blog-covers/`
- Gallery: `owner/gallery/`
- Testimonial avatars: `owner/testimonials/avatars/`

**Security rules:** Owner-only write; public read for `isPublished == true` documents

```
match /blog_posts/{postId} {
  allow read: if resource.data.isPublished == true;
  allow read, write: if request.auth.uid == resource.data.ownerId;
}
```

---

## 7. Additional Notes

- **Read Time & Slug** are computed client-side on save, stored alongside the post — never computed during public reads for performance.
- **Preview mode** requires the public `BlogPage` to check `?preview=true` and bypass the `isPublished` filter if `isOwner` is true from `authStore`.

---

---

# Page: Settings

**Route:** `/settings`
**Type:** Admin (Protected)
**Guard Chain:** `AuthGuard` → `AdminGuard` → `AdminLayout` → `SettingsPage`

---

## 1. Page Overview

The Settings page is the operational configuration center for the MekeshBuilds platform — managing authentication credentials, environment configuration, notification preferences, PWA settings, and (planned) AI configuration. It is split into multiple tabs, each governing a distinct concern area.

---

## 2. UI Description

### 2.1 Tab Navigation

```
[ Account ] [ Security ] [ Notifications ] [ PWA ] [ Integrations ] [ Danger Zone ]
```

**Account Tab:**

- Display name, email (read-only — sourced from Firebase Auth)
- Profile photo URL (synced from `profiles.avatarUrl`)
- Owner email display (VITE_OWNER_EMAIL)
- "Sign Out of All Devices" button

**Security Tab:**

- Change password form: current password + new password + confirm (calls `updatePassword(user, newPassword)`)
- 2FA status indicator (reads from Firebase Auth `multiFactor.enrolledFactors`)
- Authorized domains list (informational only — manage in Firebase Console)
- Active sessions (count of `refreshToken` usages — informational)
- Brute-force lockout config: view/reset lockout state stored in `localStorage.__access_lockout`

**Notifications Tab [PLANNED]:**

- Toggle: email notifications for resume downloads / contact clicks
- Threshold: "Notify me when downloads exceed N in 24h"
- Connected to Firebase Cloud Messaging setup

**PWA Tab:**

- Service worker status (from `usePwaSync`)
- Offline cache size (estimated from Firestore IndexedDB usage)
- "Clear Cache" button — calls `caches.delete()` on all registered service worker caches
- Install prompt: "Add to Home Screen" trigger if `pwaInstallPrompt` event available
- Cache strategy display: which routes are cached (informational)

**Integrations Tab:**

- Firebase project details (project ID, region) — informational
- GitHub profile URL (stored in `profiles.socialLinks.github`)
- LinkedIn URL (stored in `profiles.socialLinks.linkedin`)
- FormSubmit endpoint URL configuration
- AI service status [PLANNED]: API key status, usage metrics

**Danger Zone Tab:**

- "Export All Data" — triggers Firestore export of all collections to JSON download
- "Reset Analytics" — deletes all `analytics_events` for the owner (with `sweetalert2` type-to-confirm)
- "Delete Account" — signs out, deletes all Firestore documents, removes Firebase Auth user

---

## 3. Features & Functionality

### 3.1 Change Password

```ts
import { updatePassword, reauthenticateWithCredential } from 'firebase/auth';

async function changePassword(currentPassword: string, newPassword: string) {
  const credential = EmailAuthProvider.credential(user.email!, currentPassword);
  await reauthenticateWithCredential(user, credential); // Required before sensitive operations
  await updatePassword(user, newPassword);
}
```

### 3.2 Export All Data

```ts
async function exportAllData(ownerId: string) {
  const collections = [
    'profiles',
    'skills',
    'projects',
    'blog_posts',
    'experience',
    'certificates',
    'testimonials',
  ];
  const data: Record<string, any[]> = {};
  for (const col of collections) {
    const snap = await getDocs(query(collection(db, col), where('ownerId', '==', ownerId)));
    data[col] = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  }
  downloadJson(data, `mekeshbuilds-export-${Date.now()}.json`);
}
```

### 3.3 Clear PWA Cache

```ts
async function clearCache() {
  const keys = await caches.keys();
  await Promise.all(keys.map((key) => caches.delete(key)));
  toast.success('Cache cleared. Reload the page to re-cache.');
}
```

---

## 4. Styling

- Tab navigation: horizontal pill tabs with active state in `--color-primary`
- Section headers within tabs: `text-sm font-semibold uppercase tracking-widest` + `--sys-border` bottom
- Danger zone: red tinted section header (`rgba(239,68,68,0.1)` background), all actions in red

---

## 5. Firebase Setup & Integration

**Auth operations:** `updatePassword`, `reauthenticateWithCredential`, `deleteUser`
**Firestore:** Batch reads for data export; batch deletes for account deletion
**Security:** Re-authentication required before password change and account deletion

---

---

# Page: Theme Studio

**Route:** `/themes`
**Type:** Admin (Protected)
**Guard Chain:** `AuthGuard` → `AdminGuard` → `AdminLayout` → `ThemeStudioPage`

---

## 1. Page Overview

The Theme Studio is a dedicated visual engineering workspace where the owner configures the entire aesthetic of the public-facing portfolio. It exposes CSS custom property controls, font selection, lighting configuration for 3D scenes, and preset theme palettes. Changes are applied in real-time to an embedded portfolio preview without requiring any code changes or redeployment.

---

## 2. UI Description

### 2.1 Layout

```
┌────────────────────────────────────────────────────────────┐
│  AdminLayout Navbar — Theme Studio                         │
├────────────┬───────────────────────────────────────────────┤
│  Sidebar   │  ┌──────────────────┬────────────────────────┐│
│            │  │  Control Panel   │  Live Preview Canvas   ││
│            │  │  (360px)         │  (flex-1)              ││
│            │  │                  │                        ││
│            │  │  ▼ Colors        │  Portfolio preview at  ││
│            │  │  ▼ Typography    │  50% scale             ││
│            │  │  ▼ Presets       │                        ││
│            │  │  ▼ 3D Lighting   │                        ││
│            │  │  ▼ Effects       │                        ││
│            │  │  ▼ Modes         │                        ││
│            │  │                  │                        ││
│            │  │  [Save Theme]    │                        ││
│            │  │  [Reset]         │                        ││
│            │  └──────────────────┴────────────────────────┘│
└────────────┴───────────────────────────────────────────────┘
```

### 2.2 Control Panel Sections

**▼ Colors:**

- Primary color: color picker + hex input (updates `--color-primary`)
- Secondary color (updates `--color-secondary`)
- Glow color (auto-derived from primary with reduced alpha, but overridable)
- Glass background: opacity slider (updates `--color-glass` alpha value)
- Background: base page background color

**▼ Typography:**

- Display font: searchable dropdown of Google Fonts (loads font on selection)
- Body font: same
- Code font: monospace font picker
- Base font size: slider (12–18px)
- Heading weight: dropdown (400–900)
- Letter spacing: slider (-2px to 4px)

**▼ Presets:**
Pre-built theme palettes (click to apply all color + font settings at once):

- "Electric Orange" (current default — `#ff6b2c`)
- "Cyber Teal" (`#0ccfaa`)
- "Royal Purple" (`#8b5cf6`)
- "Crimson Edge" (`#ef4444`)
- "Arctic Blue" (`#3b82f6`)
- "Monochrome" (white + grey)
  Custom: "Save current as preset" (stores in `profiles.themePresets[]`)

**▼ 3D Scene Lighting:**

- Ambient light intensity (slider 0–2)
- Point light 1 position (X/Y/Z sliders)
- Point light 1 color (color picker)
- Point light 2 color + intensity
- Environment map: dropdown (Studio / Sunset / Night / None)
- Shadows: on/off toggle

**▼ Effects:**

- Glassmorphism blur strength: slider (0–20px) → `backdrop-blur-{n}`
- Border glow strength: slider → `--bento-glow-shadow` intensity
- Particle density (0–200): controls particle count in 3D scenes
- Rough.js borders: on/off toggle + roughness slider (0–5)
- Motion intensity: `Reduced | Normal | Expressive` (scales all Framer Motion durations)

**▼ Creative Modes:**
Radio group selecting the portfolio's overall visual personality:

- `Professional` — minimal motion, clean borders, no Rough.js
- `Creative` — full motion, glows, organic borders
- `Organic` — heavy Rough.js, muted palette, hand-drawn aesthetic
- `Technical` — monospace fonts, terminal-inspired, low saturation

---

## 3. Features & Functionality

### 3.1 Real-Time Preview (useThemeEngine)

```ts
// useThemeEngine applies CSS variable mutations directly to #live-canvas DOM node
function applyTheme(canvas: HTMLElement, theme: ThemeConfig) {
  canvas.style.setProperty('--color-primary', theme.primaryColor);
  canvas.style.setProperty('--color-secondary', theme.secondaryColor);
  canvas.style.setProperty('--color-glow', generateGlow(theme.primaryColor));
  canvas.style.setProperty('--color-glass', `rgba(15, 15, 20, ${theme.glassOpacity})`);
  canvas.style.setProperty('--font-display', theme.displayFont);
  canvas.style.setProperty('--font-body', theme.bodyFont);
}
```

Changes appear sub-millisecond in the preview canvas — no React re-render required.

### 3.2 Save Theme

- Saves the complete `ThemeConfig` object to `profiles.theme` field in Firestore
- Triggers `queryClient.invalidateQueries(['portfolio'])` so the live canvas re-renders from fresh data
- The public portfolio reads `profiles.theme` on load and applies it via `useThemeEngine` in `PublicLayout`

### 3.3 Reset to Default

- Calls `applyTheme(canvas, defaultTheme)` and discards unsaved changes
- `sweetalert2` confirmation: "Reset to default theme? Unsaved changes will be lost."

### 3.4 Google Fonts Integration

```ts
// Dynamically load selected Google Font
function loadGoogleFont(fontFamily: string) {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/ /g, '+')}:wght@300;400;600;700&display=swap`;
  document.head.appendChild(link);
}
```

---

## 4. Styling

- Control panel: `--sys-bg-secondary`, sliders use custom CSS styling with `--color-primary` thumb color
- Color pickers: native `<input type="color">` with a custom styled wrapper
- Preview canvas: renders inside a device-mockup frame (desktop browser chrome aesthetic)
- Preset swatches: 40×40px rounded squares showing the palette preview; hover shows "Apply" label

---

## 5. Firebase Setup & Integration

**Firestore field:** `profiles.theme` (sub-object of the profiles document)

```ts
interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  glassOpacity: number;
  displayFont: string;
  bodyFont: string;
  baseFontSize: number;
  particleDensity: number;
  roughBorders: boolean;
  roughness: number;
  motionIntensity: 'reduced' | 'normal' | 'expressive';
  creativeMode: 'professional' | 'creative' | 'organic' | 'technical';
  ambientLightIntensity: number;
  lightColor1: string;
  lightColor2: string;
  shadowsEnabled: boolean;
  savedPresets: ThemePreset[];
}
```

**Security:** Only the owner can write to `profiles/{ownerId}.theme`. Public reads are allowed (public portfolio needs it to render correctly).

---

## 7. Additional Notes

- **Zero-latency theming** via direct DOM mutation is the key architectural decision. If CSS variable updates went through React state → re-render, the preview would stutter with every slider tick.
- **Google Fonts dynamically loaded** at runtime based on the selection — but the font name is committed to Firestore only on "Save Theme". The live preview loads it immediately for instant visual feedback.
- **3D lighting settings** are passed as props into every R3F canvas component from the `profiles.theme` object, so the Theme Studio controls the entire 3D visual environment.
