import React, { useState } from 'react';
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CheckCircle2, XCircle, Trash2, AlertTriangle } from 'lucide-react';
import { useExpenseStore } from '../store/useExpenseStore';
import { usePeriodStore } from '../store/usePeriodStore';
import { ConfirmationModal } from './ConfirmationModal';
import { PaymentModal } from './PaymentModal';
import { ExpenseDetailModal } from './ExpenseDetailModal';
import { formatCurrencyValue } from './CurrencyInput';
import { Pagination } from './Pagination';

const ITEMS_PER_PAGE = 10;
const UPCOMING_ALERT_DAYS = 5;

export function ExpenseList() {
  const { expenses, markAsPaid, deleteExpense } = useExpenseStore();
  const { getPeriodRange } = usePeriodStore();
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null);
  const [expenseToMarkPaid, setExpenseToMarkPaid] = useState<string | null>(null);
  const [selectedExpense, setSelectedExpense] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredExpenses = expenses.filter(expense => {
    const { start, end } = getPeriodRange();
    const expenseDate = new Date(expense.dueDate);
    return expenseDate >= start && expenseDate <= end;
  });

  const sortedExpenses = [...filteredExpenses].sort((a, b) => {
    const now = new Date();
    const aDate = new Date(a.dueDate);
    const bDate = new Date(b.dueDate);
    const aOverdue = !a.paid && aDate < now;
    const bOverdue = !b.paid && bDate < now;

    // Prioridade: Vencidas > Não pagas > Pagas
    if (aOverdue && !bOverdue) return -1;
    if (!aOverdue && bOverdue) return 1;
    if (!a.paid && b.paid) return -1;
    if (a.paid && !b.paid) return 1;
    
    // Ordenação por data (mais recente primeiro)
    return bDate.getTime() - aDate.getTime();
  });

  const totalPages = Math.ceil(sortedExpenses.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedExpenses = sortedExpenses.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleDelete = (id: string) => {
    setExpenseToDelete(id);
  };

  const confirmDelete = () => {
    if (expenseToDelete) {
      deleteExpense(expenseToDelete);
      setExpenseToDelete(null);
    }
  };

  const handleMarkPaid = (id: string) => {
    setExpenseToMarkPaid(id);
  };

  const confirmPayment = (id: string, paymentDate: Date) => {
    markAsPaid(id, paymentDate);
    setExpenseToMarkPaid(null);
  };

  const handleExpenseClick = (id: string) => {
    setSelectedExpense(id);
  };

  const getExpenseStatus = (expense: typeof expenses[0]) => {
    if (expense.paid) return 'paid';
    const now = new Date();
    const dueDate = new Date(expense.dueDate);
    if (dueDate < now) return 'overdue';
    const daysUntilDue = differenceInDays(dueDate, now);
    if (daysUntilDue <= UPCOMING_ALERT_DAYS) return 'upcoming';
    return 'normal';
  };

  const expense = expenseToMarkPaid ? expenses.find(e => e.id === expenseToMarkPaid) : null;

  return (
    <>
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold p-6 border-b dark:border-slate-700">
          Minhas Despesas
        </h2>
        
        <div className="divide-y dark:divide-slate-700">
          {paginatedExpenses.map((expense) => {
            const status = getExpenseStatus(expense);
            const daysUntilDue = differenceInDays(new Date(expense.dueDate), new Date());
            
            return (
              <div
                key={expense.id}
                className={`relative flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 ${
                  status === 'paid'
                    ? 'before:bg-green-500'
                    : status === 'overdue'
                      ? 'before:bg-red-500'
                      : status === 'upcoming'
                        ? 'before:bg-amber-500'
                        : 'before:bg-transparent'
                }`}
              >
                <button
                  onClick={() => handleExpenseClick(expense.id)}
                  className="flex-1 text-left"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-slate-900 dark:text-white">
                        {expense.description}
                      </h3>
                      {status === 'upcoming' && !expense.paid && (
                        <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 text-sm">
                          <AlertTriangle className="w-4 h-4" />
                          <span>Vence em {daysUntilDue} dias</span>
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400 space-y-1">
                      <p>Vencimento: {format(new Date(expense.dueDate), "dd 'de' MMMM", { locale: ptBR })}</p>
                      <p>Categoria: {expense.category}</p>
                      {expense.paid && expense.paymentDate && (
                        <p>Pago em: {format(new Date(expense.paymentDate), "dd 'de' MMMM", { locale: ptBR })}</p>
                      )}
                    </div>
                  </div>
                </button>

                <div className="flex items-center gap-4">
                  <span className="font-medium text-lg text-slate-900 dark:text-white">
                    {formatCurrencyValue(expense.amount)}
                  </span>

                  {!expense.paid && (
                    <button
                      onClick={() => handleMarkPaid(expense.id)}
                      className="p-2 text-green-600 dark:text-green-500 hover:bg-green-50 dark:hover:bg-green-500/10 rounded-full transition-colors"
                      title="Marcar como pago"
                    >
                      <CheckCircle2 className="w-6 h-6" />
                    </button>
                  )}

                  {expense.paid && (
                    <span className="text-green-600 dark:text-green-500" title="Pago">
                      <CheckCircle2 className="w-6 h-6" />
                    </span>
                  )}

                  <button
                    onClick={() => handleDelete(expense.id)}
                    className="p-2 text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-full transition-colors"
                    title="Excluir despesa"
                  >
                    <Trash2 className="w-6 h-6" />
                  </button>
                </div>
              </div>
            );
          })}

          {sortedExpenses.length === 0 && (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400">
              <XCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Nenhuma despesa cadastrada</p>
            </div>
          )}
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      <ConfirmationModal
        isOpen={expenseToDelete !== null}
        onClose={() => setExpenseToDelete(null)}
        onConfirm={confirmDelete}
        title="Excluir Despesa"
        message="Tem certeza que deseja excluir esta despesa? Esta ação não pode ser desfeita."
      />

      <PaymentModal
        isOpen={expenseToMarkPaid !== null}
        onClose={() => setExpenseToMarkPaid(null)}
        onConfirm={(date) => expenseToMarkPaid && confirmPayment(expenseToMarkPaid, date)}
        dueDate={expense?.dueDate ? new Date(expense.dueDate) : undefined}
      />

      <ExpenseDetailModal
        expense={expenses.find(e => e.id === selectedExpense) || null}
        isOpen={selectedExpense !== null}
        onClose={() => setSelectedExpense(null)}
      />
    </>
  );
}