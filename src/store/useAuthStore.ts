import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { auth } from '../lib/firebase';

interface AuthStore {
  user: User | null;
  loading: boolean;
  error: string | null;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  setUser: (user: User | null) => void;
  setError: (error: string | null) => void;
}

const isDevelopment = import.meta.env.DEV;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      loading: true,
      error: null,
      signUp: async (email, password) => {
        try {
          set({ error: null });
          await createUserWithEmailAndPassword(auth, email, password);
        } catch (error) {
          set({ error: (error as Error).message });
          throw error;
        }
      },
      signIn: async (email, password) => {
        try {
          set({ error: null });
          
          // Allow dev credentials in development mode
          if (isDevelopment && email === 'admin' && password === '123456') {
            set({
              user: {
                email: 'admin@dev.local',
                uid: 'dev-admin',
                emailVerified: true,
              } as User,
              loading: false,
            });
            return;
          }

          await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
          set({ error: (error as Error).message });
          throw error;
        }
      },
      signOut: async () => {
        try {
          if (isDevelopment && auth.currentUser?.email === 'admin@dev.local') {
            set({ user: null, error: null });
            return;
          }
          
          await firebaseSignOut(auth);
          set({ user: null, error: null });
        } catch (error) {
          set({ error: (error as Error).message });
          throw error;
        }
      },
      setUser: (user) => set({ user, loading: false }),
      setError: (error) => set({ error }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
);