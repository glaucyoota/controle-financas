import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { useExpenseStore } from '../store/useExpenseStore';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatCurrencyValue } from './CurrencyInput';
import { ExpenseDetailModal } from './ExpenseDetailModal';
import { Expense } from '../types/expense';

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const expenses = useExpenseStore((state) => state.expenses);

  const filteredExpenses = expenses.filter((expense) => {
    const searchTerm = query.toLowerCase();
    const amount = formatCurrencyValue(expense.amount);
    const date = format(new Date(expense.dueDate), "dd 'de' MMMM", { locale: ptBR });
    
    return (
      expense.description.toLowerCase().includes(searchTerm) ||
      amount.toLowerCase().includes(searchTerm) ||
      date.toLowerCase().includes(searchTerm)
    );
  }).slice(0, 5);

  const handleExpenseClick = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsOpen(false);
  };

  return (
    <>
      <div className="relative w-full md:w-auto">
        <div className="flex items-center bg-slate-800 dark:bg-slate-700 rounded-md">
          <Search className="w-5 h-5 ml-3 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder="Buscar despesas..."
            className="w-full md:w-64 px-3 py-2 bg-transparent text-white placeholder-slate-400 focus:outline-none"
          />
        </div>

        {isOpen && query && (
          <>
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-md shadow-lg z-20">
              {filteredExpenses.length > 0 ? (
                <div className="py-2">
                  {filteredExpenses.map((expense) => (
                    <button
                      key={expense.id}
                      onClick={() => handleExpenseClick(expense)}
                      className="w-full px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 text-left"
                    >
                      <div className="font-medium text-slate-900 dark:text-white">
                        {expense.description}
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        {formatCurrencyValue(expense.amount)} - {format(new Date(expense.dueDate), "dd 'de' MMMM", { locale: ptBR })}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-2 text-slate-500 dark:text-slate-400">
                  Nenhum resultado encontrado
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <ExpenseDetailModal
        expense={selectedExpense}
        isOpen={selectedExpense !== null}
        onClose={() => setSelectedExpense(null)}
      />
    </>
  );
}