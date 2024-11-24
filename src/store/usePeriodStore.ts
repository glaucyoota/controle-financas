import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { startOfMonth, endOfMonth } from 'date-fns';

interface PeriodStore {
  selectedDate: Date | null;
  setSelectedDate: (date: Date | null) => void;
  getPeriodRange: () => { start: Date; end: Date };
}

export const usePeriodStore = create<PeriodStore>()(
  persist(
    (set, get) => ({
      selectedDate: null,

      setSelectedDate: (date) => {
        set({ selectedDate: date });
      },

      getPeriodRange: () => {
        const date = get().selectedDate || new Date();
        return {
          start: startOfMonth(date),
          end: endOfMonth(date)
        };
      }
    }),
    {
      name: 'period-storage',
    }
  )
);