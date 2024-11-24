import React from 'react';
import { TrendingDown, TrendingUp, Calendar, Repeat, AlertTriangle } from 'lucide-react';
import { useExpenseStore } from '../store/useExpenseStore';
import { useIncomeStore } from '../store/useIncomeStore';
import { useMonthlySummary } from '../hooks/useMonthlySummary';
import { ExpenseByCategoryChart } from './charts/ExpenseByCategoryChart';
import { IncomeExpenseChart } from './charts/IncomeExpenseChart';
import { isToday, isSameMonth } from 'date-fns';
import { formatCurrencyValue } from './CurrencyInput';
import { usePeriodStore } from '../store/usePeriodStore';

export function Dashboard() {
  const summary = useMonthlySummary();
  const { recurringTemplates, expenses } = useExpenseStore();
  const { incomes } = useIncomeStore();
  const { selectedDate, getPeriodRange } = usePeriodStore();
  const { start: periodStart } = getPeriodRange();

  // Filter pending templates that don't have an expense for the selected month
  const pendingTemplates = recurringTemplates.filter(template => {
    const hasExpenseThisMonth = expenses.some(expense => 
      expense.recurringTemplateId === template.id && 
      isSameMonth(new Date(expense.dueDate), periodStart)
    );
    
    return isToday(new Date(periodStart.getFullYear(), periodStart.getMonth(), template.closingDay)) && 
           !hasExpenseThisMonth;
  });

  const currentMonthIncome = incomes
    .filter(income => isSameMonth(new Date(income.date), periodStart))
    .reduce((sum, income) => sum + income.amount, 0);

  const balance = currentMonthIncome - (summary.currentMonth.total + summary.currentMonth.expectedRecurring);
  const isPositive = balance >= 0;

  // Calculate percentage changes, handling zero and undefined cases
  const incomeChange = summary.previousMonth.income === 0
    ? (currentMonthIncome > 0 ? 100 : 0)
    : ((currentMonthIncome - summary.previousMonth.income) / summary.previousMonth.income) * 100;

  const expenseChange = summary.previousMonth.total === 0
    ? (summary.currentMonth.total > 0 ? 100 : 0)
    : ((summary.currentMonth.total - summary.previousMonth.total) / summary.previousMonth.total) * 100;

  return (
    <div className="dashboard-summary space-y-6">
      {pendingTemplates.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded-r-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h3 className="font-medium text-amber-800 dark:text-amber-200">
              Atenção: Despesas Recorrentes Pendentes
            </h3>
          </div>
          <div className="mt-2 space-y-2">
            {pendingTemplates.map(template => (
              <div key={template.id} className="flex items-center justify-between text-sm text-amber-700 dark:text-amber-300">
                <span>{template.description}</span>
                <span>Valor previsto: {formatCurrencyValue(template.expectedAmount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Resumo do Período</h2>
            <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-bold ${
              isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}>
              {isPositive ? '+' : '-'} {formatCurrencyValue(Math.abs(balance))}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-slate-500 dark:text-slate-400">Receitas</p>
              <p className="font-medium text-green-600 dark:text-green-400">
                {formatCurrencyValue(currentMonthIncome)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-slate-500 dark:text-slate-400">Despesas</p>
              <p className="font-medium text-red-600 dark:text-red-400">
                {formatCurrencyValue(summary.currentMonth.total + summary.currentMonth.expectedRecurring)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-slate-500 dark:text-slate-400">Confirmado</p>
              <div className="space-y-1">
                <p className="font-medium text-green-600 dark:text-green-400">
                  Pago: {formatCurrencyValue(summary.currentMonth.paid)}
                </p>
                <p className="font-medium text-red-600 dark:text-red-400">
                  Pendente: {formatCurrencyValue(summary.currentMonth.pending)}
                </p>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
                <Repeat className="w-4 h-4" />
                <span>Recorrentes</span>
              </div>
              <div className="space-y-1">
                <p className="font-medium text-blue-600 dark:text-blue-400">
                  Confirmado: {formatCurrencyValue(summary.currentMonth.recurring)}
                </p>
                <p className="font-medium text-amber-600 dark:text-amber-400">
                  Previsto: {formatCurrencyValue(summary.currentMonth.expectedRecurring)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
            Comparativo Mensal
          </h2>
          
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-slate-500 dark:text-slate-400">Receitas</p>
                <div className="flex items-center gap-2">
                  {incomeChange >= 0 ? (
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-500" />
                  )}
                  <span className={`font-medium ${
                    incomeChange >= 0 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {Math.abs(isNaN(incomeChange) ? 0 : incomeChange).toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">
                  Anterior: {formatCurrencyValue(summary.previousMonth.income)}
                </span>
                <span className="text-slate-900 dark:text-white font-medium">
                  Atual: {formatCurrencyValue(currentMonthIncome)}
                </span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-slate-500 dark:text-slate-400">Despesas</p>
                <div className="flex items-center gap-2">
                  {expenseChange >= 0 ? (
                    <TrendingUp className="w-5 h-5 text-red-500" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-green-500" />
                  )}
                  <span className={`font-medium ${
                    expenseChange >= 0 
                      ? 'text-red-600 dark:text-red-400' 
                      : 'text-green-600 dark:text-green-400'
                  }`}>
                    {Math.abs(isNaN(expenseChange) ? 0 : expenseChange).toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">
                  Anterior: {formatCurrencyValue(summary.previousMonth.total)}
                </span>
                <span className="text-slate-900 dark:text-white font-medium">
                  Atual: {formatCurrencyValue(summary.currentMonth.total)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="charts-section grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ExpenseByCategoryChart />
        <IncomeExpenseChart />
      </div>
    </div>
  );
}