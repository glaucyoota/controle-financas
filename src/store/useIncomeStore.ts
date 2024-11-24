import { create } from 'zustand';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuthStore } from './useAuthStore';
import { Income } from '../types/income';
import { parseCurrencyToNumber } from '../components/CurrencyInput';

interface IncomeStore {
  incomes: Income[];
  recurringIncomes: RecurringIncome[];
  addIncome: (income: Omit<Income, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateIncome: (id: string, income: Partial<Income>) => Promise<void>;
  deleteIncome: (id: string) => Promise<void>;
  loadIncomes: () => Promise<void>;
  addRecurringIncome: (income: Omit<RecurringIncome, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateRecurringIncome: (id: string, income: Partial<RecurringIncome>) => Promise<void>;
  deleteRecurringIncome: (id: string) => Promise<void>;
  generateFromRecurring: (templateId: string, amount: number, date?: Date) => Promise<void>;
}

interface RecurringIncome {
  id: string;
  description: string;
  expectedAmount: number;
  day: number;
  createdAt: Date;
  updatedAt: Date;
  lastGeneratedDate?: Date;
}

export const useIncomeStore = create<IncomeStore>()((set, get) => ({
  incomes: [],
  recurringIncomes: [],

  loadIncomes: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    const incomesRef = collection(db, `users/${user.uid}/incomes`);
    const recurringRef = collection(db, `users/${user.uid}/recurring-incomes`);
    
    const [incomesSnap, recurringSnap] = await Promise.all([
      getDocs(incomesRef),
      getDocs(recurringRef)
    ]);

    const incomes = incomesSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: new Date(doc.data().date.seconds * 1000),
      createdAt: new Date(doc.data().createdAt.seconds * 1000),
      updatedAt: new Date(doc.data().updatedAt.seconds * 1000),
    })) as Income[];

    const recurringIncomes = recurringSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: new Date(doc.data().createdAt.seconds * 1000),
      updatedAt: new Date(doc.data().updatedAt.seconds * 1000),
      lastGeneratedDate: doc.data().lastGeneratedDate 
        ? new Date(doc.data().lastGeneratedDate.seconds * 1000)
        : undefined,
    })) as RecurringIncome[];

    set({ incomes, recurringIncomes });
  },

  addIncome: async (income) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    const newIncome = {
      ...income,
      amount: typeof income.amount === 'string' ? parseCurrencyToNumber(income.amount) : income.amount,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await addDoc(collection(db, `users/${user.uid}/incomes`), newIncome);
    const incomeWithId = { ...newIncome, id: docRef.id };

    set(state => ({
      incomes: [...state.incomes, incomeWithId]
    }));
  },

  updateIncome: async (id, updatedIncome) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    await updateDoc(doc(db, `users/${user.uid}/incomes`, id), {
      ...updatedIncome,
      updatedAt: new Date()
    });

    set(state => ({
      incomes: state.incomes.map(income =>
        income.id === id
          ? { ...income, ...updatedIncome, updatedAt: new Date() }
          : income
      )
    }));
  },

  deleteIncome: async (id) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    await deleteDoc(doc(db, `users/${user.uid}/incomes`, id));

    set(state => ({
      incomes: state.incomes.filter(income => income.id !== id)
    }));
  },

  addRecurringIncome: async (income) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    const newIncome = {
      ...income,
      expectedAmount: typeof income.expectedAmount === 'string' 
        ? parseCurrencyToNumber(income.expectedAmount) 
        : income.expectedAmount,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await addDoc(collection(db, `users/${user.uid}/recurring-incomes`), newIncome);
    const incomeWithId = { ...newIncome, id: docRef.id };

    set(state => ({
      recurringIncomes: [...state.recurringIncomes, incomeWithId]
    }));
  },

  updateRecurringIncome: async (id, updatedIncome) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    await updateDoc(doc(db, `users/${user.uid}/recurring-incomes`, id), {
      ...updatedIncome,
      updatedAt: new Date()
    });

    set(state => ({
      recurringIncomes: state.recurringIncomes.map(income =>
        income.id === id
          ? { ...income, ...updatedIncome, updatedAt: new Date() }
          : income
      )
    }));
  },

  deleteRecurringIncome: async (id) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    await deleteDoc(doc(db, `users/${user.uid}/recurring-incomes`, id));

    set(state => ({
      recurringIncomes: state.recurringIncomes.filter(income => income.id !== id)
    }));
  },

  generateFromRecurring: async (templateId, amount, date) => {
    const state = get();
    const template = state.recurringIncomes.find(t => t.id === templateId);
    
    if (!template) return;

    const targetDate = date || new Date();

    await state.addIncome({
      description: template.description,
      amount,
      date: targetDate,
      recurring: true,
      recurringDay: template.day,
    });

    await state.updateRecurringIncome(templateId, {
      lastGeneratedDate: new Date(),
      expectedAmount: amount,
    });
  }
}));