import { create } from 'zustand';
import { collection, getDocs, addDoc, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuthStore } from './useAuthStore';
import { DEFAULT_CATEGORIES } from '../constants';

interface CategoryStore {
  customCategories: string[];
  suggestedCategories: string[];
  loadCategories: () => Promise<void>;
  addCategory: (category: string) => Promise<void>;
  loadSuggestedCategories: () => Promise<void>;
  getAllCategories: () => string[];
}

export const useCategoryStore = create<CategoryStore>()((set, get) => ({
  customCategories: [],
  suggestedCategories: [],

  getAllCategories: () => {
    const uniqueCategories = new Set([...DEFAULT_CATEGORIES, ...get().customCategories]);
    return Array.from(uniqueCategories);
  },

  loadCategories: async () => {
    const user = useAuthStore.getState().user;
    if (!user) {
      set({ customCategories: [] });
      return;
    }

    const categoriesRef = collection(db, `users/${user.uid}/categories`);
    const snapshot = await getDocs(categoriesRef);
    
    const customCategories = snapshot.docs.map(doc => doc.data().name as string);
    set({ customCategories });
  },

  addCategory: async (category: string) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    // Don't add if it's a default category or already exists
    if (DEFAULT_CATEGORIES.includes(category) || get().customCategories.includes(category)) {
      return;
    }

    const categoriesRef = collection(db, `users/${user.uid}/categories`);
    await addDoc(categoriesRef, { 
      name: category,
      createdAt: new Date()
    });

    // Also add to global categories for suggestions
    await addDoc(collection(db, 'globalCategories'), {
      name: category,
      createdAt: new Date()
    });

    set(state => ({
      customCategories: [...state.customCategories, category]
    }));
  },

  loadSuggestedCategories: async () => {
    const globalCategoriesRef = collection(db, 'globalCategories');
    const q = query(globalCategoriesRef, orderBy('createdAt', 'desc'), limit(10));
    const snapshot = await getDocs(q);
    
    const categories = snapshot.docs.map(doc => doc.data().name as string);
    set({ suggestedCategories: categories });
  }
}));