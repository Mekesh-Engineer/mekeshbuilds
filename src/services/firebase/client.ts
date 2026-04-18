import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import { Analytics, getAnalytics, isSupported } from 'firebase/analytics';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore';
import { getDatabase } from 'firebase/database';

function requiredEnv(name: string): string {
  const value = (import.meta.env[name] as string | undefined)?.trim();
  if (!value) {
    throw new Error(`[firebase] Missing required environment variable: ${name}`);
  }
  return value;
}

function optionalEnv(name: string): string | undefined {
  const value = (import.meta.env[name] as string | undefined)?.trim();
  return value || undefined;
}

const measurementId = optionalEnv('VITE_FIREBASE_MEASUREMENT_ID');
const databaseURL = optionalEnv('VITE_FIREBASE_DATABASE_URL');

const firebaseConfig = {
  apiKey: requiredEnv('VITE_FIREBASE_API_KEY'),
  authDomain: requiredEnv('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: requiredEnv('VITE_FIREBASE_PROJECT_ID'),
  messagingSenderId: requiredEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: requiredEnv('VITE_FIREBASE_APP_ID'),
  ...(measurementId ? { measurementId } : {}),
  ...(databaseURL ? { databaseURL } : {}),
};

export const firebaseApp: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
export const db = initializeFirestore(firebaseApp, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});
export const realtimeDb = getDatabase(firebaseApp);

setPersistence(auth, browserLocalPersistence).catch((err) => {
  console.warn('[firebase] Auth persistence setup failed:', err);
});

// Offline persistence is configured directly in initializeFirestore above.
// persistentLocalCache + persistentMultipleTabManager handles multi-tab scenarios natively (Firebase v10+).

let analyticsInstance: Analytics | null = null;

export async function initFirebaseAnalytics(): Promise<Analytics | null> {
  if (typeof window === 'undefined') return null;
  if (analyticsInstance) return analyticsInstance;

  const supported = await isSupported();
  if (!supported) return null;

  analyticsInstance = getAnalytics(firebaseApp);
  return analyticsInstance;
}
