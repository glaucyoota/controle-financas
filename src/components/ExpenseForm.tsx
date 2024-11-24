import React, { useState, useEffect } from 'react';
import { PlusCircle } from 'lucide-react';
import { useExpenseStore } from '../store/useExpenseStore';
import { useCategoryStore } from '../store/useCategoryStore';
import { useVersionStore } from '../store/useVersionStore';
import { CurrencyInput } from './CurrencyInput';

interface ExpenseFormProps {
  onSuccess?: () => void;
}

export function ExpenseForm({ onSuccess }: ExpenseFormProps) {
  const addExpense = useExpenseStore((state) => state.addExpense);
  const { loadCategories, getAllCategories } = useCategoryStore();
  const incrementVersion = useVersionStore((state) => state.incrementVersion);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('R$ 0,00');
  const [dueDate, setDueDate] = useState('');
  const [notificationInterval, setNotificationInterval] = useState('60');
  const [category, setCategory] = useState('');
  const categories = getAllCategories();

  useEffect(() => {
    loadCategories();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const numericAmount = parseFloat(amount.replace(/[^\d,]/g, '').replace(',', '.'));
    
    addExpense({
      description,
      amount: numericAmount,
      dueDate: new Date(dueDate),
      paid: false,
      notificationInterval: parseInt(notificationInterval),
      category,
    });

    incrementVersion();
    onSuccess?.();

    setDescription('');
    setAmount('R$ 0,00');
    setDueDate('');
    setNotificationInterval('60');
    setCategory('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Descrição</label>
          <input
            type="text"
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Valor</label>
          <CurrencyInput
            value={amount}
            onChange={setAmount}
            required
            className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Vencimento</label>
          <input
            type="date"
            required
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Categoria</label>
          <select
            required
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Selecione uma categoria</option>
            {categories.map((cat, index) => (
              <option key={`${cat}-${index}`} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="submit"
        className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
      >
        <PlusCircle className="w-5 h-5" />
        Adicionar Despesa
      </button>
    </form>
  );
}