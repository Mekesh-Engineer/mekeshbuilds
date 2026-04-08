# Page: Builder

**Route:** `/builder`
**Type:** Admin (Protected)
**Guard Chain:** `AuthGuard` → `AdminGuard` → `AdminLayout` → `BuilderPage`

---

## 1. Page Overview

The Builder is the flagship feature of MekeshBuilds — a live WYSIWYG (What You See Is What You Get) editing workspace where the owner authors and maintains every piece of content that appears on the public portfolio. It is a split-panel interface: the left panel contains accordion-organized form modules for editing data, and the right panel renders a real-time preview of the public-facing Bento Grid exactly as recruiters will see it.

The Builder eliminates the need for a separate CMS by combining content authorship, data validation, theme previewing, and Firestore autosave into a single cohesive workspace.

**Primary Roles:**

- Edit all portfolio content (profile, skills, projects, experience, blog, testimonials)
- Preview changes live in the right panel before they go public
- Autosave all changes to Firestore with debouncing (800ms)
- Control publish/unpublish state of any content item
- Reorder sections and Bento blocks via drag-and-drop

---

## 2. UI Description

### 2.1 Layout

```
┌───────────────────────────────────────────────────────────────┐
│  AdminLayout Navbar (fixed, 80px) — shows autosave status     │
├───────────────┬───────────────────────────────────────────────┤
│  LEFT PANEL   │  RIGHT PANEL (#live-canvas)                   │
│  (480px fixed)│  (flex-1, scrollable)                         │
│               │                                               │
│  Accordion    │  PublicProfilePage preview                    │
│  ─────────    │  rendered at 80% scale inside                 │
│  ▼ Personal   │  an iframe-like container                     │
│  ▼ Skills     │                                               │
│  ▼ Experience │  Breakpoint toggle:                           │
│  ▼ Projects   │  [ 📱 Mobile ] [ 💻 Tablet ] [ 🖥 Desktop ]   │
│  ▼ Blog/CMS   │                                               │
│  ▼ AI Settings│  Hover any Bento block →                      │
│               │  pencil icon overlay appears                  │
│  Save Status  │  → click → scroll left panel to              │
│  Indicator    │     matching accordion section                │
└───────────────┴───────────────────────────────────────────────┘
```

### 2.2 Left Panel — Accordion Sections

Each accordion section is collapsible and uses `React Hook Form` with `Zod` validation. All fields use the shared `Input`, `Textarea`, `Toggle`, `Select`, and `ImageUpload` primitives from `src/components/Shared`.

**▼ Personal Info**

- Full name (text input)
- Tagline / headline (text input, 80 char limit)
- Bio (textarea, 400 char limit with live char counter)
- Avatar URL (ImageUpload — uploads to Firebase Storage, returns URL)
- Hero portrait URL (separate ImageUpload)
- Availability text (text input)
- Availability status (Select: `open` | `selective` | `unavailable`)
- Location: city, lat, lng (text inputs with map pin preview)
- Tech badge pills editor (chip array: add/remove skill badges)
- Hero cards editor (up to 4 cards: label, value, icon, color)
- Stats editor: yearsExperience, projectsCompleted, awardsWon, competitionsEntered
- Custom stat: label + value

**▼ Skills**

- Per-skill form fields: name, category, proficiencyLevel (0–100 slider), iconUrl, sortOrder
- Toggle: `featuredOnLanding`, `showIn3DBadge`, `isPublished`
- Drag-and-drop reordering via `@dnd-kit/sortable`
- "Add Skill" button opens an inline form row
- "Delete Skill" with `sweetalert2` confirmation

**▼ Experience**

- Per-experience entry: role, company, startDate, endDate, description, type (full-time/internship/training)
- Toggle: `isFeatured`, `isPublished`
- Date pickers using native `<input type="month">`

**▼ Education & Certificates**

- Per-certificate: name, issuer, date, credentialUrl, badgeUrl
- Toggle: `isFeatured`, `isPublished`

**▼ Projects**

- Per-project: title, description (Markdown editor), techStack[] (chip input), thumbnailUrl (ImageUpload), liveUrl, repoUrl, modelUrl
- Toggle: `isFeatured`, `status` (draft/published), sortOrder
- Drag-and-drop reordering

**▼ Blog & CMS**
Sub-tabs within this section:

- Blog Posts: title, excerpt, coverImageUrl, tags[], Markdown body editor (using `react-markdown` preview), publishedAt, `isPublished`, `featuredOnLanding`
- Gallery: image grid with upload/delete
- Testimonials: name, role, company, avatarUrl, text, rating (star selector), `isPublished`, sortOrder

**▼ AI Settings [PLANNED]**

- Placeholder accordion with "Coming Soon" state
- Will expose: recruiter intent signals, AI summary prompt customization, variant generation controls

### 2.3 Right Panel — Live Canvas

- Renders the actual `PublicProfilePage` component tree inside a scaled container
- Scale is applied via CSS `transform: scale(0.8)` with `transform-origin: top center`
- Breakpoint toggle swaps CSS max-width constraint: mobile (390px) / tablet (768px) / desktop (1280px)
- A subtle "PREVIEW" watermark banner at the top of the canvas differentiates it from the real public page
- Bento blocks in the canvas respond to the `editable` prop: hovering shows a `✏️` overlay button
- Clicking a Bento block overlay programmatically scrolls the left panel and opens the matching accordion

### 2.4 Navbar Autosave Indicator (AdminLayout)

The top navbar displays a persistent autosave status chip:

- `💤 All saved` (green dot, `lastSavedAt` relative timestamp)
- `✏️ Unsaved changes` (amber dot, pulsing)
- `💾 Saving…` (spinning indicator)
- `❌ Save failed — Retry` (red dot, click to retry)

---

## 3. Features & Functionality

### 3.1 Autosave (Core)

```ts
// src/hooks/useAutoSave.ts
useEffect(() => {
  if (!isDirty || !profile) return;
  const timer = setTimeout(() => {
    setSaveStatus('saving');
    mutateAsync(profile)
      .then(() => {
        setSaveStatus('saved');
        setLastSavedAt(new Date());
      })
      .catch(() => setSaveStatus('unsaved'));
  }, 800);
  return () => clearTimeout(timer);
}, [isDirty, profile]);
```

### 3.2 Form Validation (Zod + React Hook Form)

- Every accordion section has a Zod schema defined in `src/forms/`
- Inline validation errors appear below each field in real time
- Submission is blocked if the form has errors (save button greyed out)
- URL fields validate format; image upload fields validate file size (< 5MB) and type (image/\*)

### 3.3 Image Upload to Firebase Storage

```ts
// src/services/storageService.ts
async function uploadImage(file: File, path: string): Promise<string> {
  const storageRef = ref(storage, `owner/${path}/${Date.now()}_${file.name}`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}
```

- Drag-and-drop or click-to-select on `ImageUpload` component
- Upload progress bar displayed inline
- On success, the URL is written back into the form field and `patchProfile()` fires

### 3.4 Drag-and-Drop Reordering

- `@dnd-kit/sortable` wraps each skill, project, and testimonial list
- On drag-end, `sortOrder` fields are updated in batch using `writeBatch(db)` to minimize Firestore writes
- Visual drag handle icon appears on hover (`⠿`)

### 3.5 Publish/Unpublish Toggle

- Every content item has an `isPublished` toggle
- Toggling immediately updates the Firestore document (no 800ms debounce — instant write)
- Unpublished items render in the live canvas with a `[Draft]` badge overlay

### 3.6 Markdown Editor (Blog Posts)

- Left column: raw Markdown textarea
- Right column: live `react-markdown` render with syntax highlighting (`react-syntax-highlighter`)
- Toolbar: Bold, Italic, Heading, Code Block, Link, Image buttons

### 3.7 Breakpoint Preview

- Mobile/Tablet/Desktop toggle changes the canvas container's max-width constraint
- Stored in local component state (not Firestore)
- Canvas uses actual CSS Grid breakpoints — no fake media query simulation

### 3.8 Undo / Redo

- `builderStore` maintains a change history stack (last 20 states)
- `Cmd+Z` / `Ctrl+Z` calls `store.undo()` — reverts `profile` to previous state
- `Cmd+Shift+Z` / `Ctrl+Y` calls `store.redo()`

---

## 4. Styling

### 4.1 Left Panel

- Background: `--sys-bg-secondary` (`#16161e`)
- Accordion headers: `--sys-bg-tertiary` (`#1e1e2a`) with `cursor-pointer`
- Active accordion: top border in `--color-primary` (2px)
- Form inputs: dark background (`--sys-bg-primary`) with `--sys-border` border; focus ring in `--color-primary`
- Drag handles: low-opacity on rest, full opacity on hover

### 4.2 Right Panel

- Background: `--sys-bg-tertiary` (slightly lighter to contrast the canvas)
- Canvas container: white background (mimics a real browser viewport)
- Breakpoint frame: styled like a device mockup with a thin border and rounded corners
- PREVIEW badge: `position: absolute; top: 0; width: 100%; text-align: center; background: --color-primary; opacity: 0.1; pointer-events: none`

### 4.3 Autosave Chip

```css
.autosave-chip {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.06);
}
```

### 4.4 Responsiveness

- On screens `< 1024px`, the split-panel collapses into a tabbed interface: `[ Edit ] [ Preview ]`
- The accordion panel is full-width in tab mode
- The preview canvas is full-width in tab mode

---

## 5. Connections

### 5.1 State Management

```ts
const {
  profile,
  isDirty,
  saveStatus,
  lastSavedAt,
  patchProfile,
  setSaveStatus,
  setLastSavedAt,
  resetDraft,
} = useBuilderStore();

// React Query mutation
const mutation = useMutation({
  mutationFn: (draft) => profileService.updateProfile(draft.id, draft),
  onMutate: () => setSaveStatus('saving'),
  onSuccess: () => {
    setSaveStatus('saved');
    setLastSavedAt(new Date());
    queryClient.invalidateQueries({ queryKey: ['portfolio'] });
  },
  onError: () => setSaveStatus('unsaved'),
});
```

### 5.2 Services Called

- `profileService.fetchProfile(ownerId)` — initial data load
- `profileService.updateProfile(id, draft)` — autosave mutation
- `skillService.upsertSkill(skill)` / `deleteSkill(id)` — skill CRUD
- `projectService.upsertProject(project)` / `deleteProject(id)`
- `contentService.upsertBlogPost(post)` / `deleteBlogPost(id)`
- `storageService.uploadImage(file, path)` — image uploads

### 5.3 Navigation

- On unmount: if `isDirty`, show `sweetalert2` "Unsaved changes — are you sure you want to leave?" dialog using `useBlocker` (React Router 7)
- Cancel navigates back; Confirm navigates away and calls `resetDraft()`

---

## 6. Firebase Setup & Integration

### 6.1 Authentication

- Both `AuthGuard` and `AdminGuard` must pass before `BuilderPage` renders
- Firebase `currentUser.uid` is used as `ownerId` for all queries

### 6.2 Firestore — Collections Written

| Collection     | Operation              | When                      |
| -------------- | ---------------------- | ------------------------- |
| `profiles`     | `setDoc` (merge)       | Autosave debounce (800ms) |
| `skills`       | `setDoc` / `deleteDoc` | Immediate on add/delete   |
| `projects`     | `setDoc` / `deleteDoc` | Immediate on add/delete   |
| `blog_posts`   | `setDoc` / `deleteDoc` | Immediate on add/delete   |
| `testimonials` | `setDoc` / `deleteDoc` | Immediate on add/delete   |
| `certificates` | `setDoc` / `deleteDoc` | Immediate on add/delete   |
| `experience`   | `setDoc` / `deleteDoc` | Immediate on add/delete   |

**Batch writes for reorder:**

```ts
const batch = writeBatch(db);
reorderedSkills.forEach((skill, index) => {
  batch.update(doc(db, 'skills', skill.id), { sortOrder: index });
});
await batch.commit();
```

### 6.3 Firebase Storage

- Bucket path pattern: `gs://[project-id].appspot.com/owner/[category]/[timestamp]_[filename]`
- Categories: `avatars`, `portraits`, `projects`, `certificates`, `blog-covers`, `gallery`
- Security rule: only authenticated owner can write to `owner/` path prefix

```
// Firebase Storage Rules
match /owner/{allPaths=**} {
  allow read: if true;   // Public read for portfolio images
  allow write: if request.auth != null
    && request.auth.token.email == "owner@example.com";
}
```

### 6.4 Firestore Security Rules (relevant)

```
// Generic portfolio asset pattern (skills, projects, etc.)
match /skills/{skillId} {
  allow create: if request.auth != null
    && request.resource.data.ownerId == request.auth.uid;
  allow update, delete: if request.auth != null
    && resource.data.ownerId == request.auth.uid;
}
```

### 6.5 Offline Behavior

- Autosave queues to Firestore's local pending writes if offline
- Firestore SDK automatically flushes the queue when connectivity is restored
- Autosave status shows "Queued (offline)" via `usePwaSync.isOnline` check

---

## 7. Additional Notes

- **The Builder is the architectural showcase piece** — it demonstrates React Hook Form + Zod validation, Zustand draft state management, Firebase Storage uploads, batch Firestore writes, and live WYSIWYG preview in a single cohesive UX.
- **Separation of Concerns:** The left panel knows nothing about the canvas rendering; it only patches the Zustand store. The canvas renders purely from store state.
- **The `editable` prop pattern** on `BentoBlock` is the key to making the builder feel native — the owner clicks directly on what they want to edit.
- **Scalability:** New content types (e.g., publications, speaking engagements) are added by creating a new accordion section + Zod schema + Firestore service function. No changes to the Builder layout are needed.
