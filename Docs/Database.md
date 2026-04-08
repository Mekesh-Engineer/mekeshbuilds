# Database Architecture

## Overview

MekeshBuilds leverages **Firebase Cloud Firestore**, a highly scalable, serverless NoSQL document database. This architecture is specifically chosen for its real-time synchronization capabilities, seamless integration with offline PWA service workers, and rapid document retrieval at the edge.

To maintain strict enterprise-grade data integrity across the React frontend, all Firestore interactions are wrapped in **TypeScript Data Converters** (`withConverter`), ensuring end-to-end type safety without the overhead of a traditional ORM.

**Primary Approach:**

- Document-based CRUD operations via the modular Firebase JS SDK (v9/v10+).
- Secure, client-side data access governed by strict **Firestore Security Rules**.
- Built-in offline persistence cache, enabling the portfolio to load instantly even on flaky network connections.

## Core Collections

### Identity and Profile Management

- `profiles`
  - Core owner identity, presentation data, and bio.
  - Theme configurations (Bento grid layouts, organic styling tokens).
  - Authorization metadata (`role` field for owner gating).

### Portfolio Assets

- `experience` (Document per role)
- `skills` (Document per skill, heavily utilized by the AI recommendation engine)
- `projects` (Includes media links, 3D asset references, and repository URLs)
- `certificates`

### Content & Publishing

- `blog_posts` (Markdown/Rich text content for deep-dive technical writing)
- `gallery_items`
- `testimonials`

### Analytics & AI Telemetry

- `analytics_events` (Consolidates page views, project clicks, and interaction times)
- `ai_preferences` (Stores generated contextual resumes or tailored pitch variations based on specific recruiter links)
- `error_logs` (Client-side error reporting for PWA resilience)

## Data Modeling Strategy

Unlike relational SQL databases, this NoSQL architecture relies on flat root collections to optimize query performance and indexing.

Logical ownership is maintained via standardized referencing fields across all documents:

- `ownerId` (Maps directly to the Firebase Auth UID)
- `username` (For fast, indexed public lookups)

_Note: For highly nested, read-heavy data (like a single project's tags), denormalized arrays are preferred over subcollections to minimize document read counts and latency._

## Common Query Patterns

All queries utilize Firestore's modular syntax combined with custom TypeScript converters defined in `src/types/database.types.ts`.

### 1. Fetch Published Profile by Username

```ts
import { collection, query, where, limit, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebaseClient';
import { profileConverter } from '../types/database.types';

const q = query(
  collection(db, 'profiles').withConverter(profileConverter),
  where('username', '==', username),
  where('isPublished', '==', true),
  limit(1),
);
const snapshot = await getDocs(q);
const profile = snapshot.empty ? null : snapshot.docs[0].data();
```

````

### 2. Fetch Ordered Portfolio Assets (e.g., Skills)

```ts
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';

const q = query(
  collection(db, 'skills').withConverter(skillConverter),
  where('ownerId', '==', ownerId),
  orderBy('sortOrder', 'asc'),
);
const snapshot = await getDocs(q);
const skills = snapshot.docs.map((doc) => doc.data());
```

### 3. Date-Ranged Analytics via Composite Indexes

```ts
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';

const q = query(
  collection(db, 'analytics_events'),
  where('ownerId', '==', ownerId),
  where('timestamp', '>=', startDate),
  where('timestamp', '<=', endDate),
  orderBy('timestamp', 'desc'),
);
// Note: This requires a composite index to be created in the Firebase Console.
```

## Security & Data Integrity

Data integrity and authorization are enforced at the database layer using **Firestore Security Rules**, mitigating the need for a separate backend server.

**Core Rule Principles:**

1. **Public Reads, Owner Writes:** Public portfolio collections (`profiles`, `projects`) allow read access to anyone, but strict write access only if `request.auth.uid == resource.data.ownerId`.
2. **Admin-Only Collections:** Collections like `analytics_events` and `admin_access_logs` are locked behind custom claims or owner ID validation.
3. **Data Validation:** Rules enforce schema integrity (e.g., ensuring `isPublished` is a boolean, and `sortOrder` is an integer).

## Offline Caching & PWA Integration

To deliver the blistering performance expected of a 2025–2026 web app, Firestore's offline persistence is enabled upon initialization:

```ts
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore';

// Modern Firebase v10+ offline persistence — replaces enableIndexedDbPersistence
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});
```

This guarantees that once a recruiter views the portfolio, the data (and associated images/3D models via service workers) remains instantly accessible upon subsequent visits, regardless of network status.

## Suggested Composite Indexes

To support the UI's sorting and filtering requirements, the following composite indexes must be deployed via `firestore.indexes.json`:

- `skills`: `ownerId` (ASC), `sortOrder` (ASC)
- `projects`: `ownerId` (ASC), `status` (ASC), `sortOrder` (ASC)
- `analytics_events`: `ownerId` (ASC), `timestamp` (DESC)


