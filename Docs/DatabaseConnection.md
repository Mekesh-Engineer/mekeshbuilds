# Database & Services Connection

## Connection Strategy

All backend services (Authentication, Firestore Database, and Cloud Functions) are initialized and exported through a single, strictly typed singleton instance located in `src/lib/firebaseClient.ts`.

By centralizing the Firebase SDK configuration, the application adheres to the following design principles:

- **Singleton Instantiation:** Guarantees a single Firebase App instance, preventing memory leaks and duplicate connections.
- **Fail-Fast Validation:** Validates required environment variables at runtime, throwing explicit developer warnings if misconfigured.
- **Offline-First Resilience:** Automatically enables Firestore IndexedDB persistence to support the core PWA offline capabilities.
- **Modular Bundling:** Utilizes the Firebase v9/v10+ modular SDK to aggressively tree-shake unused code, keeping the initial JavaScript bundle exceptionally lightweight.

## Required Environment Variables

The application relies on standard Firebase configuration keys. From `.env.example`:

```env
# Firebase Core Configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Application specific
VITE_APP_URL=http://localhost:5173
VITE_OWNER_EMAIL=your-email@example.com
```

## Client Initialization & Offline Persistence

The connection orchestrates the core services and attempts to enable offline caching immediately.

```ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Singleton initialization
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Offline-first Firestore — persistentLocalCache replaces the removed
// enableIndexedDbPersistence API (Firebase JS SDK v10+)
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(), // Multi-tab support built-in
  }),
});

// Enforce local session persistence
setPersistence(auth, browserLocalPersistence);
```

## Service Layer Usage Pattern

To maintain a clean architectural boundary (Separation of Concerns), UI components must **never** interact with the `db` instance directly. All Firebase operations are abstracted into domain-specific service files.

**Example: `src/services/profileService.ts`**

```ts
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebaseClient';
import { profileConverter } from '../types/database.types';

export async function fetchProfileById(userId: string) {
  const profileRef = doc(db, 'profiles', userId).withConverter(profileConverter);
  const snapshot = await getDoc(profileRef);

  if (!snapshot.exists()) {
    throw new Error('Profile document not found.');
  }

  return snapshot.data();
}
```

## Development Setup Steps

1. Duplicate `.env.example` and rename to `.env.local`.
2. Retrieve your Firebase config object from the Firebase Console (Project Settings > General).
3. Populate the `VITE_FIREBASE_*` variables.
4. Set `VITE_OWNER_EMAIL` to properly gate your admin workspace.
5. Run `npm run dev` and monitor the console for successful connection and persistence initialization.

## Troubleshooting

### Missing Environment Variables

**Symptom:** Firebase throws a `FirebaseError: Bad config object` or missing API key error on startup.
**Fix:** Ensure your variables are explicitly prefixed with `VITE_` and that you restarted the Vite development server after editing the `.env` file.

### Offline Persistence Fails

**Symptom:** Console warns of a `failed-precondition`.
**Fix:** IndexedDB persistence can only operate in a single browser tab at a time in development. Close other tabs running the local server, or ignore the warning (it functions normally in production PWA contexts).

### Unauthorized / Permission Denied

**Symptom:** Reads or writes to Firestore throw a `missing or insufficient permissions` error.
**Fix:** - Verify your Firebase Authentication state.

- Check the **Firestore Security Rules** in the Firebase Console to ensure your current user UID or custom claims map correctly to the attempted read/write operation.


