import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useExpenseStore } from '../../store/useExpenseStore';
import { useIncomeStore } from '../../store/useIncomeStore';
import { usePeriodStore } from '../../store/usePeriodStore';
import { startOfMonth, endOfMonth, format, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatCurrencyValue } from '../CurrencyInput';

export function IncomeExpenseChart() {
  const expenses = useExpenseStore((state) => state.expenses);
  const incomes = useIncomeStore((state) => state.incomes);
  const { selectedDate } = usePeriodStore();
  const currentDate = selectedDate || new Date();

  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const date = subMonths(currentDate, 5 - i);
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    return {
      start,
      end,
      label: format(date, 'MMM/yy', { locale: ptBR })
    };
  });

  const data = last6Months.map(({ start, end, label }) => {
    const monthlyExpenses = expenses
      .filter(expense => {
        const date = new Date(expense.dueDate);
        return date >= start && date <= end;
      })
      .reduce((sum, expense) => sum + expense.amount, 0);

    const monthlyIncomes = incomes
      .filter(income => {
        const date = new Date(income.date);
        return date >= start && date <= end;
      })
      .reduce((sum, income) => sum + income.amount, 0);

    return {
      name: label,
      despesas: monthlyExpenses,
      receitas: monthlyIncomes,
      saldo: monthlyIncomes - monthlyExpenses
    };
  });

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
        Comparativo Receitas x Despesas
      </h2>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="name" />
            <YAxis tickFormatter={(value) => formatCurrencyValue(value)} />
            <Tooltip 
              formatter={(value: number) => [formatCurrencyValue(value), '']}
              contentStyle={{
                backgroundColor: 'rgb(30 41 59)',
                border: 'none',
                borderRadius: '0.375rem',
                color: 'white'
              }}
            />
            <Legend formatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)} />
            <Bar dataKey="receitas" fill="#10B981" name="Receitas" />
            <Bar dataKey="despesas" fill="#EF4444" name="Despesas" />
            <Bar dataKey="saldo" fill="#3B82F6" name="Saldo" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}