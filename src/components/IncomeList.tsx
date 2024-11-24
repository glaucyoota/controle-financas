import React, { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Trash2 } from 'lucide-react';
import { useIncomeStore } from '../store/useIncomeStore';
import { usePeriodStore } from '../store/usePeriodStore';
import { ConfirmationModal } from './ConfirmationModal';
import { formatCurrencyValue } from './CurrencyInput';
import { Pagination } from './Pagination';

const ITEMS_PER_PAGE = 10;

export function IncomeList() {
  const { incomes, deleteIncome } = useIncomeStore();
  const { getPeriodRange } = usePeriodStore();
  const [incomeToDelete, setIncomeToDelete] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredIncomes = incomes.filter(income => {
    const { start, end } = getPeriodRange();
    const incomeDate = new Date(income.date);
    return incomeDate >= start && incomeDate <= end;
  });

  const sortedIncomes = [...filteredIncomes].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const totalPages = Math.ceil(sortedIncomes.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedIncomes = sortedIncomes.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleDelete = (id: string) => {
    setIncomeToDelete(id);
  };

  const confirmDelete = () => {
    if (incomeToDelete) {
      deleteIncome(incomeToDelete);
      setIncomeToDelete(null);
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md mt-6">
        <h2 className="text-xl font-semibold p-6 border-b dark:border-slate-700">
          Minhas Receitas
        </h2>
        
        <div className="divide-y dark:divide-slate-700">
          {paginatedIncomes.map((income) => (
            <div
              key={income.id}
              className="p-4 flex items-center justify-between"
            >
              <div className="space-y-1">
                <h3 className="font-medium text-slate-900 dark:text-white">
                  {income.description}
                </h3>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  <p>Data: {format(new Date(income.date), "dd 'de' MMMM", { locale: ptBR })}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="font-medium text-lg text-green-600 dark:text-green-400">
                  {formatCurrencyValue(income.amount)}
                </span>

                <button
                  onClick={() => handleDelete(income.id)}
                  className="p-2 text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-full transition-colors"
                  title="Excluir receita"
                >
                  <Trash2 className="w-6 h-6" />
                </button>
              </div>
            </div>
          ))}

          {sortedIncomes.length === 0 && (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400">
              <p>Nenhuma receita cadastrada</p>
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
        isOpen={incomeToDelete !== null}
        onClose={() => setIncomeToDelete(null)}
        onConfirm={confirmDelete}
        title="Excluir Receita"
        message="Tem certeza que deseja excluir esta receita? Esta ação não pode ser desfeita."
      />
    </>
  );
}