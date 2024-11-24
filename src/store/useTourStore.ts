import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TourStore {
  hasSeenTour: boolean;
  setHasSeenTour: (value: boolean) => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
}

export const useTourStore = create<TourStore>()(
  persist(
    (set) => ({
      hasSeenTour: false,
      setHasSeenTour: (value) => set({ hasSeenTour: value }),
      currentStep: 0,
      setCurrentStep: (step) => set({ currentStep: step }),
    }),
    {
      name: 'tour-storage',
    }
  )
);