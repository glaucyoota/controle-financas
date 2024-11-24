import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuthStore } from './useAuthStore';

interface ThemeStore {
  isDark: boolean;
  toggle: () => Promise<void>;
  loadTheme: () => void;
  syncWithFirestore: () => Promise<void>;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      isDark: localStorage.getItem('theme') === 'dark' || 
              (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches),
      
      toggle: async () => {
        const newValue = !get().isDark;
        localStorage.setItem('theme', newValue ? 'dark' : 'light');
        set({ isDark: newValue });
        
        const user = useAuthStore.getState().user;
        if (user) {
          await setDoc(doc(db, `users/${user.uid}/settings/theme`), {
            isDark: newValue,
            updatedAt: new Date()
          });
        }
      },

      loadTheme: () => {
        const theme = localStorage.getItem('theme');
        if (theme) {
          set({ isDark: theme === 'dark' });
        }
      },

      syncWithFirestore: async () => {
        const user = useAuthStore.getState().user;
        if (!user) return;

        const themeDoc = await getDoc(doc(db, `users/${user.uid}/settings/theme`));
        if (themeDoc.exists()) {
          const isDark = themeDoc.data().isDark;
          localStorage.setItem('theme', isDark ? 'dark' : 'light');
          set({ isDark });
        }
      }
    }),
    {
      name: 'theme-storage',
    }
  )
);