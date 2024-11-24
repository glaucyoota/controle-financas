import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuthStore } from './useAuthStore';

interface Settings {
  notificationInterval: number;
}

interface SettingsStore {
  settings: Settings;
  updateSettings: (settings: Partial<Settings>) => Promise<void>;
  loadSettings: () => Promise<void>;
}

const DEFAULT_SETTINGS: Settings = {
  notificationInterval: 60,
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      settings: DEFAULT_SETTINGS,
      
      updateSettings: async (newSettings) => {
        const user = useAuthStore.getState().user;
        if (!user) return;

        const updatedSettings = {
          ...get().settings,
          ...newSettings,
        };

        await setDoc(doc(db, `users/${user.uid}/settings/preferences`), {
          ...updatedSettings,
          updatedAt: new Date(),
        });

        set({ settings: updatedSettings });
      },

      loadSettings: async () => {
        const user = useAuthStore.getState().user;
        if (!user) return;

        const settingsDoc = await getDoc(doc(db, `users/${user.uid}/settings/preferences`));
        if (settingsDoc.exists()) {
          set({ settings: { ...DEFAULT_SETTINGS, ...settingsDoc.data() } });
        }
      },
    }),
    {
      name: 'settings-storage',
    }
  )
);