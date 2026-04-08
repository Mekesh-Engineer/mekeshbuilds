// src/hooks/useRealtimeSync.ts
// Subscribes to Firestore onSnapshot for live portfolio data sync.
import { useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebaseClient';

export const useRealtimeSync = (
  userId: string | undefined,
  onRemoteChange: () => void,
) => {
  useEffect(() => {
    if (!userId) return;

    // Skip the first snapshot (initial data load) to avoid duplicate fetches
    let isFirst = true;
    const unsubscribe = onSnapshot(doc(db, 'profiles', userId), () => {
      if (isFirst) {
        isFirst = false;
        return;
      }
      onRemoteChange();
    });

    return () => unsubscribe();
  }, [userId, onRemoteChange]);
};
