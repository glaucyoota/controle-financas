import { useExpenseStore } from '../store/useExpenseStore';
import { useIncomeStore } from '../store/useIncomeStore';
import { usePeriodStore } from '../store/usePeriodStore';
import { startOfMonth, endOfMonth, isSameMonth, subMonths } from 'date-fns';

interface MonthlySummary {
  total: number;
  paid: number;
  pending: number;
  recurring: number;
  expectedRecurring: number;
  income: number;
}

interface Summary {
  currentMonth: MonthlySummary;
  previousMonth: MonthlySummary;
  percentageChange: number;
}

export function useMonthlySummary(): Summary {
  const expenses = useExpenseStore((state) => state.expenses);
  const recurringTemplates = useExpenseStore((state) => state.recurringTemplates);
  const incomes = useIncomeStore((state) => state.incomes);
  const { selectedDate, getPeriodRange } = usePeriodStore();
  const { start: periodStart } = getPeriodRange();
  
  const previousMonthStart = startOfMonth(subMonths(periodStart, 1));

  const calculateMonthlySummary = (date: Date): MonthlySummary => {
    const monthlyExpenses = expenses.filter((expense) => 
      isSameMonth(new Date(expense.dueDate), date)
    );

    const monthlyIncomes = incomes.filter((income) =>
      isSameMonth(new Date(income.date), date)
    );

    const total = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const paid = monthlyExpenses
      .filter((expense) => expense.paid)
      .reduce((sum, expense) => sum + expense.amount, 0);
    const recurring = monthlyExpenses
      .filter((expense) => expense.recurringTemplateId)
      .reduce((sum, expense) => sum + expense.amount, 0);
    const pending = total - paid;
    const income = monthlyIncomes.reduce((sum, income) => sum + income.amount, 0);

    // Calculate expected recurring expenses
    const expectedRecurring = recurringTemplates.reduce((sum, template) => {
      const hasMonthlyExpense = monthlyExpenses.some(
        expense => expense.recurringTemplateId === template.id
      );
      
      // Only include in expected if not already generated
      if (!hasMonthlyExpense) {
        return sum + template.expectedAmount;
      }
      return sum;
    }, 0);

    return { total, paid, pending, recurring, expectedRecurring, income };
  };

  const currentMonth = calculateMonthlySummary(periodStart);
  const previousMonth = calculateMonthlySummary(previousMonthStart);

  // Calculate percentage change, handling zero and undefined cases
  const percentageChange = previousMonth.total === 0
    ? (currentMonth.total > 0 ? 100 : 0)
    : ((currentMonth.total - previousMonth.total) / previousMonth.total) * 100;

  return {
    currentMonth,
    previousMonth,
    percentageChange: isNaN(percentageChange) ? 0 : percentageChange,
  };
}