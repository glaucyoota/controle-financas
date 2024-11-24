import { create } from 'zustand';
import { Expense, RecurringTemplate } from '../types/expense';
import { startOfMonth, endOfMonth, setDate, addMonths } from 'date-fns';
import { collection, addDoc, updateDoc, deleteDoc, doc, query, where, getDocs, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuthStore } from './useAuthStore';
import { parseCurrencyToNumber } from '../components/CurrencyInput';

interface ExpenseStore {
  expenses: Expense[];
  recurringTemplates: RecurringTemplate[];
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  markAsPaid: (id: string, paymentDate?: Date) => Promise<void>;
  updateExpense: (id: string, expense: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  addRecurringTemplate: (template: Omit<RecurringTemplate, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateRecurringTemplate: (id: string, template: Partial<RecurringTemplate>) => Promise<void>;
  deleteRecurringTemplate: (id: string) => Promise<void>;
  generateFromTemplate: (templateId: string, amount: number, date?: Date) => Promise<void>;
  loadUserData: () => Promise<void>;
}

export const useExpenseStore = create<ExpenseStore>()((set, get) => ({
  expenses: [],
  recurringTemplates: [],
  
  loadUserData: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    const expensesRef = collection(db, `users/${user.uid}/expenses`);
    const templatesRef = collection(db, `users/${user.uid}/templates`);

    const [expensesSnap, templatesSnap] = await Promise.all([
      getDocs(expensesRef),
      getDocs(templatesRef)
    ]);

    const expenses = expensesSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      dueDate: new Date(doc.data().dueDate.seconds * 1000),
      paymentDate: doc.data().paymentDate ? new Date(doc.data().paymentDate.seconds * 1000) : undefined,
      createdAt: new Date(doc.data().createdAt.seconds * 1000),
      updatedAt: new Date(doc.data().updatedAt.seconds * 1000),
    })) as Expense[];

    const templates = templatesSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: new Date(doc.data().createdAt.seconds * 1000),
      updatedAt: new Date(doc.data().updatedAt.seconds * 1000),
      lastGeneratedDate: doc.data().lastGeneratedDate 
        ? new Date(doc.data().lastGeneratedDate.seconds * 1000)
        : undefined,
      startDate: doc.data().startDate 
        ? new Date(doc.data().startDate.seconds * 1000)
        : null,
      endDate: doc.data().endDate 
        ? new Date(doc.data().endDate.seconds * 1000)
        : null,
    })) as RecurringTemplate[];

    set({ expenses, recurringTemplates: templates });
  },

  addExpense: async (expense) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    const newExpense = {
      ...expense,
      amount: typeof expense.amount === 'string' ? parseCurrencyToNumber(expense.amount) : expense.amount,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await addDoc(collection(db, `users/${user.uid}/expenses`), newExpense);
    const expenseWithId = { ...newExpense, id: docRef.id };

    set(state => ({
      expenses: [...state.expenses, expenseWithId]
    }));
  },

  markAsPaid: async (id, paymentDate = new Date()) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    await updateDoc(doc(db, `users/${user.uid}/expenses`, id), {
      paid: true,
      paymentDate,
      updatedAt: new Date()
    });

    set(state => ({
      expenses: state.expenses.map(expense =>
        expense.id === id
          ? { ...expense, paid: true, paymentDate, updatedAt: new Date() }
          : expense
      )
    }));
  },

  updateExpense: async (id, updatedExpense) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    const updates = {
      ...updatedExpense,
      updatedAt: new Date()
    };

    // Remove undefined values to prevent Firestore errors
    Object.keys(updates).forEach(key => {
      if (updates[key] === undefined) {
        delete updates[key];
      }
    });

    await updateDoc(doc(db, `users/${user.uid}/expenses`, id), updates);

    set(state => ({
      expenses: state.expenses.map(expense =>
        expense.id === id
          ? { ...expense, ...updatedExpense, updatedAt: new Date() }
          : expense
      )
    }));
  },

  deleteExpense: async (id) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    await deleteDoc(doc(db, `users/${user.uid}/expenses`, id));

    set(state => ({
      expenses: state.expenses.filter(expense => expense.id !== id)
    }));
  },

  addRecurringTemplate: async (template) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    const newTemplate = {
      ...template,
      expectedAmount: typeof template.expectedAmount === 'string' 
        ? parseCurrencyToNumber(template.expectedAmount) 
        : template.expectedAmount,
      createdAt: new Date(),
      updatedAt: new Date(),
      // Convert undefined dates to null for Firestore
      startDate: template.startDate || null,
      endDate: template.endDate || null,
    };

    const docRef = await addDoc(collection(db, `users/${user.uid}/templates`), newTemplate);
    const templateWithId = { ...newTemplate, id: docRef.id };

    set(state => ({
      recurringTemplates: [...state.recurringTemplates, templateWithId]
    }));
  },

  updateRecurringTemplate: async (id, updatedTemplate) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    const updates = {
      ...updatedTemplate,
      updatedAt: new Date(),
      // Convert undefined dates to null for Firestore
      startDate: updatedTemplate.startDate || null,
      endDate: updatedTemplate.endDate || null,
    };

    // Remove undefined values to prevent Firestore errors
    Object.keys(updates).forEach(key => {
      if (updates[key] === undefined) {
        delete updates[key];
      }
    });

    await updateDoc(doc(db, `users/${user.uid}/templates`, id), updates);

    set(state => ({
      recurringTemplates: state.recurringTemplates.map(template =>
        template.id === id
          ? { ...template, ...updatedTemplate, updatedAt: new Date() }
          : template
      )
    }));
  },

  deleteRecurringTemplate: async (id) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    await deleteDoc(doc(db, `users/${user.uid}/templates`, id));

    set(state => ({
      recurringTemplates: state.recurringTemplates.filter(template => template.id !== id)
    }));
  },

  generateFromTemplate: async (templateId, amount, date) => {
    const state = get();
    const template = state.recurringTemplates.find(t => t.id === templateId);
    
    if (!template) return;

    const targetDate = date || new Date();
    const dueDate = setDate(targetDate, template.dueDay);

    await state.addExpense({
      description: template.description,
      amount: typeof amount === 'string' ? parseCurrencyToNumber(amount) : amount,
      dueDate,
      paid: false,
      notificationInterval: template.notificationInterval,
      category: template.category,
      recurringTemplateId: template.id,
    });

    await state.updateRecurringTemplate(templateId, {
      lastGeneratedDate: new Date(),
      expectedAmount: amount,
    });
  }
}));