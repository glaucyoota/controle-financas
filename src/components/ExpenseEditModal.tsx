import React, { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Modal } from './Modal';
import { Expense } from '../types/expense';
import { useExpenseStore } from '../store/useExpenseStore';
import { useCategoryStore } from '../store/useCategoryStore';
import { useVersionStore } from '../store/useVersionStore';
import { ConfirmationModal } from './ConfirmationModal';

interface ExpenseEditModalProps {
  expense: Expense | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ExpenseEditModal({ expense, isOpen, onClose }: ExpenseEditModalProps) {
  const { updateExpense } = useExpenseStore();
  const { getAllCategories } = useCategoryStore();
  const incrementVersion = useVersionStore((state) => state.incrementVersion);
  const categories = getAllCategories();

  const [dueDate, setDueDate] = useState(
    expense ? format(new Date(expense.dueDate), 'yyyy-MM-dd') : ''
  );
  const [paymentDate, setPaymentDate] = useState(
    expense?.paymentDate ? format(new Date(expense.paymentDate), 'yyyy-MM-dd') : ''
  );
  const [category, setCategory] = useState(expense?.category || '');
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirmation(true);
  };

  const handleConfirm = async () => {
    if (!expense) return;

    await updateExpense(expense.id, {
      dueDate: new Date(dueDate),
      paymentDate: paymentDate ? new Date(paymentDate) : undefined,
      category,
      paid: !!paymentDate
    });

    incrementVersion();
    setShowConfirmation(false);
    onClose();
  };

  if (!expense) return null;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Editar Despesa"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Data de Vencimento
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Data do Pagamento
            </label>
            <input
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Categoria
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
            >
              Salvar Alterações
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={handleConfirm}
        title="Confirmar Alterações"
        message="Tem certeza que deseja salvar as alterações nesta despesa?"
      />
    </>
  );
}