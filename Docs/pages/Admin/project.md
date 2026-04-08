# Page: Projects Manager

**Route:** `/projects` (admin)
**Type:** Admin (Protected)
**Guard Chain:** `AuthGuard` → `AdminGuard` → `AdminLayout` → `ProjectsManagerPage`

---

## 1. Page Overview

The Projects Manager is a dedicated, tabular admin interface for managing the portfolio's project entries with full CRUD operations. While projects can also be edited inside the Builder's accordion, the Projects Manager provides a purpose-built, data-dense workspace optimized for managing many projects at once — including bulk operations, sorting, filtering by status, and managing 3D asset references.

**Primary Roles:**

- View all projects in a searchable, sortable, filterable table
- Create, edit, duplicate, and delete project entries
- Manage project status (draft / published / archived)
- Control feature flags (isFeatured, showIn3D, showOnHomepage)
- Link 3D model assets (.glb/.gltf) and manage media galleries per project
- Drag-to-reorder projects, writing `sortOrder` updates to Firestore in batch

---

## 2. UI Description

### 2.1 Layout

```
┌──────────────────────────────────────────────────────────────┐
│  AdminLayout Navbar                                          │
├────────────┬─────────────────────────────────────────────────┤
│  Sidebar   │  Header: "Projects Manager" + "Add Project" btn │
│            │  ─────────────────────────────────────────────  │
│            │  Filter/Search Bar                              │
│            │  [ Search... ] [Status▼] [Sort▼] [Bulk ▼]       │
│            │  ─────────────────────────────────────────────  │
│            │  Projects Table                                 │
│            │  ┌──┬──────────┬──────────┬───────┬──────────┐  │
│            │  │☐ │Thumbnail │Title/Tech│Status │Actions  │  │
│            │  ├──┼──────────┼──────────┼───────┼──────────┤  │
│            │  │☐ │[img]     │V2X System│ ✅pub │✏️🔗🗑️   │  │
│            │  │☐ │[img]     │Portfolio │ 📝drft│✏️🔗🗑️   │  │
│            │  │…  │          │          │       │         │  │
│            │  └──┴──────────┴──────────┴───────┴──────────┘  │
│            │  Pagination: < 1 2 3 > | 20 per page            │
└────────────┴─────────────────────────────────────────────────┘
```

### 2.2 Filter and Search Bar

- Text search: real-time client-side filter on project titles and tech stack tags (Fuse.js)
- Status filter dropdown: `All | Published | Draft | Archived`
- Sort dropdown: `Sort Order | Title A–Z | Newest | Most Clicks`
- Bulk actions dropdown: `Publish Selected | Archive Selected | Delete Selected`

### 2.3 Projects Table

**Columns:**
| Col | Content |
|-----|---------|
| Checkbox | Select for bulk operations |
| Drag Handle | `⠿` — drag row to reorder |
| Thumbnail | 48×48 rounded image from `thumbnailUrl`; placeholder icon if none |
| Title & Tech | Project title (bold) + tech stack chips (first 3 visible, +N overflow badge) |
| Status | Pill badge: `✅ Published` / `📝 Draft` / `🗄️ Archived` |
| Featured | Star icon — filled if `isFeatured: true`; click to toggle |
| 3D Asset | Cube icon — filled if `modelUrl` is set; click to manage |
| Clicks | Count from `analytics_events` (cached, updated on page load) |
| Actions | `✏️ Edit` / `🔗 Copy Link` / `📋 Duplicate` / `🗑️ Delete` |

### 2.4 Add / Edit Project Drawer

A right-side slide-in drawer (not a separate page) containing:

- Title (text input)
- Description (Markdown editor with preview toggle)
- Tech stack (chip array input — type and press Enter)
- Thumbnail upload (ImageUpload component → Firebase Storage)
- Live URL + Repo URL (text inputs with URL validation)
- 3D Model URL (text input for Firebase Storage `.glb` path)
- Status select: Draft / Published / Archived
- Feature toggles: `isFeatured`, `showOnHomepage`, `showIn3D`
- Sort order (number input)
- Screenshots gallery (multi-image upload)

**Form validation:** Zod schema `projectSchema` in `src/forms/projectSchema.ts`

**Save behavior:** React Hook Form `onSubmit` → `projectService.upsertProject()` → React Query invalidation

### 2.5 3D Asset Manager Modal

Triggered by clicking the cube icon on a project row:

- Current model URL display with a mini R3F canvas preview of the `.glb` file
- Upload new model to Firebase Storage (`.glb` or `.gltf`, max 50MB)
- Or link an external model URL
- Draco compression note: "Compress your model using Draco for faster mobile loading [PLANNED]"

---

## 3. Features & Functionality

### 3.1 CRUD Operations

- **Create:** "Add Project" button opens drawer with empty form
- **Read:** Paginated Firestore query, 20 projects per page
- **Update:** Edit drawer pre-populated from Firestore; save writes back via `setDoc(merge: true)`
- **Delete:** `sweetalert2` confirmation → `deleteDoc` → remove from React Query cache via `invalidateQueries`

### 3.2 Drag-to-Reorder

```ts
// DndContext onDragEnd handler
async function handleDragEnd(event: DragEndEvent) {
  const { active, over } = event;
  if (!over || active.id === over.id) return;
  const reordered = arrayMove(projects, activeIndex, overIndex);
  // Optimistic update to local state
  setProjects(reordered);
  // Batch Firestore writes
  const batch = writeBatch(db);
  reordered.forEach((p, i) => batch.update(doc(db, 'projects', p.id), { sortOrder: i }));
  await batch.commit();
}
```

### 3.3 Bulk Operations

```ts
// Bulk publish
async function bulkPublish(selectedIds: string[]) {
  const batch = writeBatch(db);
  selectedIds.forEach((id) => batch.update(doc(db, 'projects', id), { status: 'published' }));
  await batch.commit();
  queryClient.invalidateQueries({ queryKey: ['projects', ownerId] });
}
```

### 3.4 Duplicate Project

```ts
async function duplicateProject(project: Project) {
  const { id, ...rest } = project;
  await setDoc(doc(db, 'projects', generateId()), {
    ...rest,
    title: `${rest.title} (Copy)`,
    status: 'draft',
    createdAt: serverTimestamp(),
  });
}
```

### 3.5 Feature Toggle (Star Icon)

- Click the star on a table row to toggle `isFeatured` instantly
- Uses optimistic update: UI updates immediately, Firestore write happens in background
- Error: reverts to previous state and shows toast

### 3.6 Analytics Click Count

- Click counts per project are pre-computed and stored in `project.clickCount` (denormalized, updated by Cloud Function trigger on new `analytics_events` documents)
- Avoids N+1 Firestore reads on the table

---

## 4. Styling

### 4.1 Table

- Header: `--sys-bg-tertiary` background, `text-xs font-semibold uppercase tracking-widest`
- Rows: alternating `rgba(255,255,255,0.01)` on even rows
- Row hover: `rgba(var(--color-primary-rgb), 0.04)` tint
- Drag-in-progress row: `opacity-50 scale-95 shadow-lg border border-[--color-primary]`

### 4.2 Status Badges

```css
.badge-published {
  color: #22c55e;
  background: rgba(34, 197, 94, 0.1);
}
.badge-draft {
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.1);
}
.badge-archived {
  color: #6b7280;
  background: rgba(107, 114, 128, 0.1);
}
```

### 4.3 Drawer

- `position: fixed; right: 0; top: 80px; bottom: 0;` — full height from navbar to bottom
- Width: `480px` on desktop, `100vw` on mobile
- Background: `--sys-bg-secondary` with left border in `--color-primary`
- Backdrop: semi-transparent overlay closes drawer on click

### 4.4 Responsiveness

- Table switches to card-stack layout on mobile (`< 768px`)
- Each card shows thumbnail, title, status badge, and action row
- Bulk select is hidden on mobile (accessed via individual card long-press)

---

## 5. Connections

### 5.1 React Query

```ts
const { data: projects, isLoading } = useQuery({
  queryKey: ['projects', ownerId, { status, sort, page }],
  queryFn: () => projectService.fetchProjects(ownerId, { status, sort, page }),
});
```

### 5.2 Services Called

- `projectService.fetchProjects(ownerId, filters)`
- `projectService.upsertProject(project)` — create + update
- `projectService.deleteProject(id)`
- `storageService.uploadProjectAsset(file, projectId, type)` — thumbnails + models

---

## 6. Firebase Setup & Integration

### 6.1 Firestore — `projects` Collection Schema

```ts
interface Project {
  id: string;
  ownerId: string;
  title: string;
  description: string; // Markdown
  techStack: string[];
  thumbnailUrl: string;
  screenshotUrls: string[];
  liveUrl?: string;
  repoUrl?: string;
  modelUrl?: string; // Firebase Storage .glb path
  status: 'draft' | 'published' | 'archived';
  isFeatured: boolean;
  showOnHomepage: boolean;
  showIn3D: boolean;
  sortOrder: number;
  clickCount: number; // Denormalized, updated by Cloud Function
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 6.2 Composite Indexes

```json
{
  "fields": [
    { "fieldPath": "ownerId", "order": "ASCENDING" },
    { "fieldPath": "status", "order": "ASCENDING" },
    { "fieldPath": "sortOrder", "order": "ASCENDING" }
  ]
}
```

### 6.3 Storage Paths

- Thumbnails: `owner/projects/{projectId}/thumbnail`
- Screenshots: `owner/projects/{projectId}/screenshots/{n}`
- 3D Models: `owner/projects/{projectId}/model.glb`

### 6.4 Security Rules

```
match /projects/{projectId} {
  allow read: if resource.data.status == 'published';
  allow read: if request.auth != null
    && request.auth.uid == resource.data.ownerId;
  allow create: if request.auth != null
    && request.resource.data.ownerId == request.auth.uid;
  allow update, delete: if request.auth != null
    && resource.data.ownerId == request.auth.uid;
}
```

---

## 7. Additional Notes

- **Denormalized `clickCount`** is critical for table performance — never run an aggregation query per project row during table render.
- **3D Model Size:** Enforce a 50MB upload limit on `.glb` files. Document that Draco compression (planned Phase 3) will reduce this to ~10MB for most models.
- **Duplicate Feature** seeds new projects as `draft` to prevent accidental publishing of unfinished clones.
- The Projects Manager and Builder both write to the same `projects` Firestore collection — both use the same `projectService` to ensure consistent data shapes.
