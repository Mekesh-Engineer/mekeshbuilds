// src/store/settingsStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '@/services/firebase/client';

export interface SeoSettings {
  title: string;
  metaDesc: string;
}

export interface ThemeSettings {
  primary: string;
  secondary: string;
  fontPrimary: string;
  fontSecondary: string;
  mode: 'light' | 'dark';
}

export interface SiteSettings {
  seo: SeoSettings;
  theme: ThemeSettings;
}

interface SettingsStoreState {
  settings: SiteSettings;
  isLoading: boolean;
  initSync: () => void;
  updateGlobalSettings: (partial: DeepPartial<SiteSettings>) => Promise<void>;
}

type DeepPartial<T> = T extends object ? {
    [P in keyof T]?: DeepPartial<T[P]>;
} : T;

const defaultSettings: SiteSettings = {
  seo: {
    title: 'MekeshBuilds — Portfolio',
    metaDesc: 'A professional interactive portfolio demonstrating full-stack engineering capabilities.',
  },
  theme: {
    primary: '#FF6B2C',
    secondary: '#FF8A57',
    fontPrimary: 'Inter',
    fontSecondary: 'Inter',
    mode: 'dark',
  },
};

let settingsUnsubscribe: (() => void) | null = null;

export const useSettingsStore = create<SettingsStoreState>()(
  devtools(
    (set) => ({
      settings: defaultSettings,
      isLoading: true,

      initSync: () => {
        if (settingsUnsubscribe) return; // already syncing

        const settingsRef = doc(db, 'settings', 'global');
        
        settingsUnsubscribe = onSnapshot(
          settingsRef,
          (snapshot) => {
            if (snapshot.exists()) {
               const data = snapshot.data();
               set({
                  settings: {
                     seo: { ...defaultSettings.seo, ...data.seo },
                     theme: { ...defaultSettings.theme, ...data.theme },
                  },
                  isLoading: false,
               }, false, 'settingsSync');
            } else {
               // initialize default settings in DB if none exist
               setDoc(settingsRef, defaultSettings, { merge: true })
                 .catch((e) => console.error("Failed to initialize remote settings:", e));
               set({ settings: defaultSettings, isLoading: false }, false, 'settingsDefaultInit');
            }
          },
          (error) => {
            console.error("Firestore settings sync error:", error);
            set({ isLoading: false }, false, 'settingsSyncError');
          }
        );
      },

      updateGlobalSettings: async (partial) => {
        try {
          const settingsRef = doc(db, 'settings', 'global');
          // Firestore merges cleanly natively via setDoc with merge: true for nested objects
          await setDoc(settingsRef, partial, { merge: true });
        } catch (error) {
          console.error("Failed to push settings update to remote:", error);
          throw error;
        }
      },
    }),
    { name: 'SettingsStore' }
  )
);
