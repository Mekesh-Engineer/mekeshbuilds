# Page: Dashboard

**Route:** `/dashboard`
**Type:** Admin (Protected)
**Guard Chain:** `AuthGuard` → `AdminGuard` → `AdminLayout` → `DashboardPage`

---

## 1. Page Overview

The Dashboard is the command center of the MekeshBuilds admin workspace. It is the first screen the owner lands on after a successful login and serves as a real-time hub for portfolio health, engagement analytics, quick-action shortcuts, and system status indicators. The page presents an at-a-glance snapshot of everything happening across the portfolio without requiring the owner to navigate into deeper admin modules.

**Primary Roles:**

- Surface live engagement metrics (portfolio views, resume downloads, project clicks)
- Expose system health indicators (PWA sync status, Firestore offline cache, last autosave time)
- Provide one-click entry points into the most-used admin workflows (Builder, Analytics, Resume)
- Display recent activity from the public-facing portfolio in real time

---

## 2. UI Description

### 2.1 Layout

The Dashboard uses `AdminLayout` as its shell — a fixed top navbar (80px). The main content area is a responsive CSS Grid Bento layout that adapts from 1 column on mobile to 3 columns on desktop.

```
┌────────────────────────────────────────────────┐
│  AdminLayout Navbar (fixed, 80px)              │
├────────────────────────────────────────────────┤
│  Dashboard Main Content Grid                   │
│                                                │
│  ┌──────────┬──────────┬──────────┐            │
│  │ Views    │ Downloads│ Clicks   │            │
│  │ Counter  │ Counter  │ Counter  │            │
│  ├──────────┴──────────┴──────────┤            │
│  │  Engagement Sparkline Chart     │            │
│  │  (col-span-3, last 7 days)      │            │
│  ├──────────┬──────────────────────┤            │
│  │  Quick   │  Recent Activity     │            │
│  │  Actions │  Feed (live)         │            │
│  ├──────────┤                      │            │
│  │  System  │                      │            │
│  │  Health  │                      │            │
│  └──────────┴──────────────────────┘            │
└────────────────────────────────────────────────┘
```

### 2.2 Bento Grid Blocks

**Stat Counter Blocks (3 × 1x1)**
Each counter block contains:

- Icon (react-icons) in a circular accent-colored container
- Animated `react-countup` value
- Label (e.g., "Portfolio Views")
- Trend badge: `+12% vs last week` in green/red depending on direction
- Sparkline mini-chart (7-day trend line, using `chart.js`)

**Engagement Chart Block (col-span-3, 1x2)**

- Full-width line/area chart showing views, project clicks, and resume downloads over the selected date range
- Date range picker: `7D | 30D | 90D` toggle chips
- Built with `react-chartjs-2`, styled with `--color-primary` gradient fill
- Hover tooltip shows exact values per day

**Quick Actions Block (1x1)**
Glassmorphism card with 4 large CTA buttons:

- `✏️ Open Builder` → `/builder`
- `📊 View Analytics` → `/analytics`
- `📄 Manage Resume` → `/resume`
- `🔗 Copy Share Link` → copies `/:username` URL to clipboard with toast confirmation
- `👁️ Preview Portfolio` → opens `/:username` in new tab

**Recent Activity Feed (1x2)**
Live-updating list of the last 20 analytics events:

- Event icon (page view / project click / resume download / contact CTA)
- Event description ("Resume downloaded", "Project 'V2X System' clicked")
- Relative timestamp ("3 min ago", "1 hr ago")
- Powered by `onSnapshot` real-time Firestore subscription
- Each item slides in from the right via Framer Motion

**System Health Block (1x1)**
Status indicators with colored dot (green/amber/red):

- `PWA Sync Status` — online/offline detection via `usePwaSync`
- `Last Autosave` — timestamp from `builderStore.lastSavedAt`
- `Firestore Cache` — "Active (IndexedDB)" or "Disabled"
- `Auth Session` — "Owner session active"
- `Build Status` — last CI/CD run result (linked to GitHub Actions badge)

**AI Context Block (1x1) [PLANNED]**
Placeholder card showing:

- Last AI personalization request (recruiter intent classification)
- Number of custom AI resume variants generated
- "Configure AI" button → `/settings#ai`

### 2.3 Top Navbar Content (AdminLayout)

- Left: App brand logo + "Dashboard" breadcrumb
- Center: Global search bar (searches projects, blog posts, skills by name — client-side fuzzy search via `fuse.js`)
- Right: Notification bell (unread count badge) + Owner avatar dropdown (View Profile / Settings / Sign Out)

---

## 3. Features & Functionality

### 3.1 Real-Time Engagement Metrics

- Three top-level stat counters (Views, Downloads, Clicks) display live values from denormalized `profiles.stats` fields
- Counters animate on mount with `react-countup`
- Trend badges compare current period vs prior period (computed client-side from `analytics_events` query)

### 3.2 Interactive Engagement Chart

- Date range selection (`7D`, `30D`, `90D`) re-fetches aggregated analytics data
- Multi-metric overlay: toggle individual metrics on/off via legend click
- Chart data sourced from `analytics_events` collection, aggregated by day

### 3.3 Live Activity Feed

- Real-time `onSnapshot` listener on `analytics_events` collection, ordered by `timestamp DESC`, limited to 20
- Each new event slides into the feed without a full page refresh
- "Mark all read" button clears the unread badge on the Navbar notification bell

### 3.4 Quick Actions

- All navigation buttons use `useNavigate()` from React Router 7
- "Copy Share Link" uses `navigator.clipboard.writeText()` with a `sweetalert2` toast on success
- "Preview Portfolio" opens `/:username` in `window.open('_blank')`

### 3.5 System Health Monitor

- `usePwaSync` hook provides `isOnline` and `serviceWorkerStatus`
- `builderStore.lastSavedAt` surfaces the last successful Firestore write timestamp
- Firestore cache status detected via a test `getDoc` with `{ source: 'cache' }` on mount

### 3.6 Global Search (AdminLayout)

- Fuse.js indexes: project titles + blog post titles + skill names (loaded into memory from React Query cache)
- Results dropdown shows categorized results with type badges
- Clicking a result navigates to its respective manager page

---

## 4. Styling

### 4.1 Color Scheme

- Background: `--sys-bg-primary: #0f0f14` (deep near-black)
- Card surfaces: `--sys-bg-secondary: #16161e` with `backdrop-blur-xl`
- Borders: `rgba(255, 255, 255, 0.08)` subtle glass borders
- Accent: `--sys-accent: var(--color-primary)` (admin shell inherits owner's brand color)
- Text primary: `--sys-text-primary: #f3f4f6`
- Text secondary: `--sys-text-secondary: #9ca3af`
- Success green: `#22c55e` | Warning amber: `#f59e0b` | Error red: `#ef4444`

### 4.2 Typography

- Headings: `font-display` (configured via `--font-display` CSS variable — set in Theme Studio)
- Body: `font-body` (`--font-body`)
- Counter values: `tabular-nums` class, large weight (700), 2.5rem
- Stat labels: `text-sm font-medium tracking-wide uppercase`

### 4.3 Bento Blocks

```css
.bento-block {
  background: var(--bento-bg); /* rgba(15, 15, 20, 0.6) */
  border: 1px solid var(--bento-border); /* rgba(255,255,255,0.08) */
  border-radius: var(--bento-radius); /* 1.25rem */
  padding: 1.5rem;
  box-shadow: var(--bento-shadow);
}
.bento-block:hover {
  box-shadow: var(--bento-glow-shadow);
  border-color: rgba(var(--color-primary-rgb), 0.3);
}
```

### 4.4 Responsiveness

- `lg:grid-cols-3` → `md:grid-cols-2` → `grid-cols-1`
- Charts reflow to single-metric view on small screens

### 4.5 Motion

- Bento blocks enter with staggered `fadeInUp` Framer Motion variants (50ms delay per block)
- Stat counters run `react-countup` on mount (2s duration, ease-out)
- Activity feed items use `AnimatePresence` + `slideInRight` for new entries

---

## 5. Connections

### 5.1 State Management

```ts
// Zustand stores consumed
const { user, isOwner } = useAuthStore();
const { lastSavedAt } = useBuilderStore();

// React Query hooks
const { data: stats } = useOwnerStats(ownerId);
const { data: chartData } = useAnalyticsChartData(ownerId, range);
const { data: recentActivity } = useRecentActivity(ownerId, 20);
```

### 5.2 Navigation

- All `useNavigate()` calls use React Router 7's imperative API
- Guard redirects: unauthenticated → `/admin-access?redirectBack=/dashboard`; non-owner → `/`

### 5.3 Real-Time Subscription

```ts
// onSnapshot for live activity feed
useEffect(() => {
  const q = query(
    collection(db, 'analytics_events'),
    where('ownerId', '==', ownerId),
    orderBy('timestamp', 'desc'),
    limit(20),
  );
  const unsub = onSnapshot(q, (snap) => setActivity(snap.docs.map((d) => d.data())));
  return () => unsub();
}, [ownerId]);
```

---

## 6. Firebase Setup & Integration

### 6.1 Authentication

- `AdminGuard` reads `isOwner` from `authStore`; non-owners are redirected to `/` before any render
- Session is hydrated by `AuthInitializer` at app boot via `onAuthStateChanged`

### 6.2 Firestore Collections Read

| Collection         | Purpose                    | Query                             |
| ------------------ | -------------------------- | --------------------------------- |
| `profiles`         | `stats.*` for counters     | `doc(db, 'profiles', ownerId)`    |
| `analytics_events` | Chart data + activity feed | `where('ownerId', '==', ownerId)` |

### 6.3 Firestore Security Rules (relevant)

```
// analytics_events — owner read
match /analytics_events/{eventId} {
  allow read: if request.auth != null
    && request.auth.uid == resource.data.ownerId;
}
```

### 6.4 Firestore Indexes Required

```json
// firestore.indexes.json
{
  "indexes": [
    {
      "collectionGroup": "analytics_events",
      "fields": [
        { "fieldPath": "ownerId", "order": "ASCENDING" },
        { "fieldPath": "timestamp", "order": "DESCENDING" }
      ]
    }
  ]
}
```

### 6.5 Offline Behavior

- `profiles.stats` is served from IndexedDB cache if offline
- `onSnapshot` gracefully degrades to cached data when network is unavailable
- System Health block shows "Offline" status via `usePwaSync`

---

## 7. Additional Notes

- **Recruiter Signal:** The Dashboard demonstrates full-stack product thinking — it's not just a CRUD page but a live operational tool with real-time data, system diagnostics, and UX-optimized quick actions.
- **Modular Bento Blocks:** Each Bento block is an independently fetching, independently loading component. If the analytics chart fails to load, the rest of the dashboard renders normally.
- **Scalability:** Adding new metric blocks is a matter of adding a new `BentoBlock` with its own hook — no changes to surrounding layout code required.
- **AI Context Block** is intentionally reserved as a placeholder now so the space is allocated in the layout when `aiService.ts` is implemented.
