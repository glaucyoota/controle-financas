import React, { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Modal } from './Modal';
import { Expense } from '../types/expense';
import { formatCurrencyValue } from './CurrencyInput';
import { Calendar, Tag, Clock, CheckCircle2, AlertCircle, Edit2 } from 'lucide-react';
import { ExpenseEditModal } from './ExpenseEditModal';

interface ExpenseDetailModalProps {
  expense: Expense | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ExpenseDetailModal({ expense, isOpen, onClose }: ExpenseDetailModalProps) {
  const [showEditModal, setShowEditModal] = useState(false);

  if (!expense) return null;

  const isOverdue = !expense.paid && new Date(expense.dueDate) < new Date();

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Detalhes da Despesa"
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                {expense.description}
              </h3>
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                expense.paid
                  ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                  : isOverdue
                    ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                    : 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200'
              }`}>
                {expense.paid ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Pago</span>
                  </>
                ) : isOverdue ? (
                  <>
                    <AlertCircle className="w-4 h-4" />
                    <span>Vencida</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-4 h-4" />
                    <span>Pendente</span>
                  </>
                )}
              </div>
            </div>

            <button
              onClick={() => setShowEditModal(true)}
              className="p-2 text-blue-600 dark:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-full transition-colors"
              title="Editar despesa"
            >
              <Edit2 className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <Calendar className="w-4 h-4" />
                <span>Vencimento</span>
              </div>
              <p className="font-medium text-slate-900 dark:text-white">
                {format(new Date(expense.dueDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <Tag className="w-4 h-4" />
                <span>Categoria</span>
              </div>
              <p className="font-medium text-slate-900 dark:text-white">
                {expense.category}
              </p>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-slate-500 dark:text-slate-400">Valor</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {formatCurrencyValue(expense.amount)}
            </p>
          </div>

          {expense.paid && expense.paymentDate && (
            <div className="space-y-1">
              <p className="text-sm text-slate-500 dark:text-slate-400">Data do Pagamento</p>
              <p className="font-medium text-slate-900 dark:text-white">
                {format(new Date(expense.paymentDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            </div>
          )}

          {expense.recurringTemplateId && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Esta é uma despesa recorrente
              </p>
            </div>
          )}
        </div>
      </Modal>

      <ExpenseEditModal
        expense={expense}
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
      />
    </>
  );
}