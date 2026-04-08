# Page: Analytics

**Route:** `/analytics`
**Type:** Admin (Protected)
**Guard Chain:** `AuthGuard` → `AdminGuard` → `AdminLayout` → `AnalyticsPage`

---

## 1. Page Overview

The Analytics page gives the portfolio owner deep visibility into how recruiters and visitors are engaging with the public-facing portfolio. It aggregates event data from Firestore's `analytics_events` collection into interactive charts, tables, and summary metrics. The page enables data-driven portfolio decisions — knowing which projects get the most clicks, which AI-tailored share links perform best, and when traffic spikes occur.

**Primary Roles:**

- Visualize portfolio traffic over configurable date ranges
- Break down engagement by event type (views, project clicks, resume downloads, contact CTAs)
- Surface which AI-personalized share links are generating the highest engagement
- Expose visitor behavior patterns (time of day, day of week, session depth)
- Export raw analytics data as CSV for offline analysis

---

## 2. UI Description

### 2.1 Layout

```
┌──────────────────────────────────────────────────────────────┐
│  AdminLayout Navbar                                          │
├────────────┬─────────────────────────────────────────────────┤
│  Sidebar   │  Analytics Header                               │
│            │  "Portfolio Analytics" + Date Range Picker      │
│            │  ─────────────────────────────────────────────  │
│            │  ┌──────────┬──────────┬──────────┬──────────┐  │
│            │  │ Total    │ Unique   │ Resume   │ Project  │  │
│            │  │ Views    │ Sessions │ Downloads│ Clicks   │  │
│            │  ├──────────┴──────────┴──────────┴──────────┤  │
│            │  │  Traffic Over Time (Area Chart, col-4)     │  │
│            │  ├──────────────────────┬─────────────────────┤  │
│            │  │  Event Breakdown     │  Top Projects       │  │
│            │  │  (Doughnut chart)    │  (Ranked list)      │  │
│            │  ├──────────────────────┼─────────────────────┤  │
│            │  │  AI Link Performance │  Activity Heatmap   │  │
│            │  │  (Table)             │  (Day × Hour grid)  │  │
│            │  ├──────────────────────┴─────────────────────┤  │
│            │  │  Raw Events Table (paginated, exportable)   │  │
│            │  └─────────────────────────────────────────────┘  │
└────────────┴─────────────────────────────────────────────────┘
```

### 2.2 Date Range Picker

- Preset chips: `Today | 7D | 30D | 90D | All Time`
- Custom range: calendar popover with start/end date selection
- Selected range is stored in local component state and passed to all query hooks as a dependency

### 2.3 Summary Stat Cards (4 × 1x1 Bento)

Each card contains:

- Large animated counter value
- Label + contextual icon
- Trend badge (vs previous equivalent period)
- Mini 7-bar sparkline

Cards: Total Views, Unique Sessions (estimated via unique `sessionId`s), Resume Downloads, Project Clicks

### 2.4 Traffic Over Time (col-span-4)

- Multi-line area chart using `react-chartjs-2`
- Series: Portfolio Views, Project Clicks, Resume Downloads, Contact Clicks
- Toggle each series via legend
- X-axis: dates; Y-axis: event count
- Smooth curve interpolation (`tension: 0.4`)
- Gradient fill from `--color-primary` (0.3 alpha at top) to transparent

### 2.5 Event Breakdown (Doughnut Chart)

- `chart.js` doughnut with custom segment colors per event type
- Center label shows total events for the period
- Legend with percentages displayed below the chart

### 2.6 Top Projects (Ranked List)

- Projects ordered by click count for the selected period
- Each row: project thumbnail, title, click count, percentage of total project clicks
- Clicking a project navigates to its edit form in `/builder`

### 2.7 AI Link Performance Table [PLANNED]

- Lists all generated AI share links (stored in `ai_preferences`)
- Columns: link slug, target role, views, CTR (resume downloads / views), created date
- "Copy Link" action per row
- Placeholder state shown until `aiService.ts` is implemented

### 2.8 Activity Heatmap

- 7 × 24 grid (days of week × hours)
- Cell color intensity = event count for that day+hour slot
- Color scale: `--color-primary` at low opacity → full saturation
- Tooltip: "Tuesday 3PM: 12 events"
- Built with `d3` SVG rendering

### 2.9 Raw Events Table (Paginated)

- Columns: timestamp, event type, page/resource, source (direct/ai-link/search)
- 20 rows per page; page navigation at bottom
- Column sorting by clicking header
- Search filter input (client-side, filters visible rows)
- "Export CSV" button triggers `Blob` download of current date range's events

---

## 3. Features & Functionality

### 3.1 Configurable Date Range

- Changing the date range re-fires all `useQuery` hooks with the new `startDate`/`endDate` parameters
- React Query caches each unique range independently (staleTime: 2 min)
- Loading skeleton replaces charts during re-fetch

### 3.2 Real-Time Refresh

- "Refresh Now" icon button in the header manually calls `queryClient.invalidateQueries(['analytics'])`
- Auto-refresh every 5 minutes while the tab is active (`refetchInterval: 5 * 60 * 1000`)

### 3.3 CSV Export

```ts
function exportToCsv(events: AnalyticsEvent[]) {
  const header = ['timestamp', 'type', 'resource', 'source'];
  const rows = events.map((e) => [
    e.timestamp.toDate().toISOString(),
    e.type,
    e.resource,
    e.source,
  ]);
  const csv = [header, ...rows].map((r) => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  // Trigger download
}
```

### 3.4 Top Projects Drill-Down

- Clicking a project row updates a secondary chart showing that project's click timeline
- "Edit Project" link opens `/builder` with the Projects accordion pre-expanded for that item

### 3.5 Trend Calculations

- Trend badge computes: `((current - previous) / previous) * 100`
- Previous period = same duration immediately before the selected range
- Requires two overlapping Firestore queries with `where('timestamp', '>=', ...)` constraints

---

## 4. Styling

### 4.1 Charts

- All charts use a shared `chartDefaults` config object:
  ```ts
  Chart.defaults.color = '#9ca3af'; // Axis labels
  Chart.defaults.borderColor = 'rgba(255,255,255,0.08)'; // Grid lines
  Chart.defaults.font.family = 'var(--font-body)';
  ```
- Primary series color: `--color-primary`
- Secondary series: `--color-secondary`
- Destructive/download: `#ef4444`
- Contact CTA: `#22c55e`

### 4.2 Heatmap

- Cell border-radius: `2px` (intentionally tighter than Bento blocks for data density)
- Empty cells: `rgba(255,255,255,0.04)`
- Active cells: gradient from `rgba(var(--color-primary-rgb), 0.1)` to full `--color-primary`

### 4.3 Table

- Alternating row background: `rgba(255,255,255,0.02)` on even rows
- Sticky header row with `backdrop-blur-sm`
- Hover row: `rgba(var(--color-primary-rgb), 0.05)` tint

### 4.4 Responsiveness

- On `< 1024px`: charts stack vertically; stat cards go to 2-column grid
- Heatmap collapses to a simplified "busiest days" horizontal bar chart on mobile
- Raw events table enables horizontal scroll on narrow viewports

---

## 5. Connections

### 5.1 React Query Hooks

```ts
const { data: summaryStats } = useAnalyticsSummary(ownerId, { start, end });
const { data: timeSeriesData } = useAnalyticsTimeSeries(ownerId, { start, end });
const { data: topProjects } = useTopProjects(ownerId, { start, end });
const { data: heatmapData } = useActivityHeatmap(ownerId, { start, end });
const { data: rawEvents } = useRawEvents(ownerId, { start, end, page, sort });
```

### 5.2 Services Called

- `adminService.fetchAnalyticsSummary(ownerId, range)`
- `adminService.fetchTimeSeries(ownerId, range)`
- `adminService.fetchTopProjects(ownerId, range)`
- `adminService.fetchHeatmap(ownerId, range)`
- `adminService.fetchRawEvents(ownerId, range, pagination)`

---

## 6. Firebase Setup & Integration

### 6.1 Firestore Queries

**Summary stats:**

```ts
const q = query(
  collection(db, 'analytics_events'),
  where('ownerId', '==', ownerId),
  where('timestamp', '>=', startDate),
  where('timestamp', '<=', endDate),
);
```

**Time series (requires client-side aggregation by date):**

- Reads all events in range, groups by `timestamp.toDate().toDateString()` client-side
- For large datasets (> 30 days), consider a Cloud Function aggregation endpoint

**Required Composite Indexes:**

```json
{
  "collectionGroup": "analytics_events",
  "fields": [
    { "fieldPath": "ownerId", "order": "ASCENDING" },
    { "fieldPath": "timestamp", "order": "DESCENDING" }
  ]
},
{
  "collectionGroup": "analytics_events",
  "fields": [
    { "fieldPath": "ownerId", "order": "ASCENDING" },
    { "fieldPath": "eventType", "order": "ASCENDING" },
    { "fieldPath": "timestamp", "order": "DESCENDING" }
  ]
}
```

### 6.2 Security Rules

```
match /analytics_events/{eventId} {
  allow read: if request.auth != null
    && request.auth.uid == resource.data.ownerId;
  allow create: if request.resource.data.ownerId is string
    && request.resource.data.timestamp is timestamp;
  allow update, delete: if false;
}
```

### 6.3 Performance Optimization

- For `All Time` range, a Cloud Function pre-aggregates monthly totals into a `analytics_aggregates` collection to avoid scanning thousands of raw events on each load
- Summary stats are also stored as denormalized fields on `profiles.stats` (incremented by Cloud Function triggers) for near-instant dashboard loads

---

## 7. Additional Notes

- **Privacy Note:** The analytics system does not collect IP addresses or personally identifiable visitor information — only event types, timestamps, and resource names. This is intentional for GDPR-friendliness.
- **AI Integration Readiness:** The AI Link Performance table is pre-structured to display data from `ai_preferences` collection, ready to populate once `aiService.ts` is implemented.
- **Scalability:** For high-traffic portfolios, the raw Firestore event reads should be replaced with a pre-aggregated time-series document written by Cloud Function triggers. The service layer interface remains unchanged.
- **Chart Library:** `chart.js` + `react-chartjs-2` are already in `package.json`. The `d3` dependency for the heatmap needs to be verified in package.json.
