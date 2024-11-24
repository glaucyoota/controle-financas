import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useExpenseStore } from '../../store/useExpenseStore';
import { usePeriodStore } from '../../store/usePeriodStore';
import { isSameMonth } from 'date-fns';
import { formatCurrencyValue } from '../CurrencyInput';

const COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#6366F1',
  '#EC4899', '#8B5CF6', '#14B8A6', '#F97316', '#06B6D4'
];

export function ExpenseByCategoryChart() {
  const expenses = useExpenseStore((state) => state.expenses);
  const { getPeriodRange } = usePeriodStore();
  const { start: periodStart } = getPeriodRange();

  const data = expenses
    .filter(expense => isSameMonth(new Date(expense.dueDate), periodStart))
    .reduce((acc, expense) => {
      const existingCategory = acc.find(item => item.name === expense.category);
      if (existingCategory) {
        existingCategory.value += expense.amount;
      } else {
        acc.push({
          name: expense.category,
          value: expense.amount
        });
      }
      return acc;
    }, [] as { name: string; value: number }[]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-slate-800 px-3 py-2 rounded-lg shadow-lg border border-slate-700">
          <p className="text-white font-medium" style={{ color: data.payload.fill }}>
            {data.name}
          </p>
          <p className="text-white">
            {formatCurrencyValue(data.value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
        Despesas por Categoria
      </h2>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend formatter={(value) => value} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}