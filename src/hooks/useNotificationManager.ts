import { useEffect } from 'react';
import { useExpenseStore } from '../store/useExpenseStore';
import { scheduleNotification } from '../utils/notifications';
import { isAfter, isSameDay, startOfDay, endOfDay, isToday } from 'date-fns';

export function useNotificationManager() {
  const expenses = useExpenseStore((state) => state.expenses);
  const recurringTemplates = useExpenseStore((state) => state.recurringTemplates);

  useEffect(() => {
    const checkExpenses = () => {
      const now = new Date();
      const today = startOfDay(now);
      const todayEnd = endOfDay(now);

      // Check pending expenses
      expenses.forEach((expense) => {
        if (expense.paid) return;

        const dueDate = new Date(expense.dueDate);
        
        if (isAfter(dueDate, todayEnd)) return;
        
        if (isSameDay(dueDate, now) || isAfter(now, dueDate)) {
          scheduleNotification(
            'Despesa Pendente',
            {
              body: `${expense.description} - R$ ${expense.amount.toFixed(2)}`,
              icon: '/icon.svg',
              tag: expense.id,
              renotify: true,
            },
            expense.notificationInterval * 60 * 1000
          );
        }
      });

      // Check recurring templates for closing date
      recurringTemplates.forEach((template) => {
        const closingDate = new Date(now.getFullYear(), now.getMonth(), template.closingDay);
        const dueDate = new Date(now.getFullYear(), now.getMonth(), template.dueDay);
        
        // Notify on closing date
        if (isToday(closingDate)) {
          const hasExpenseThisMonth = expenses.some(
            expense => 
              expense.recurringTemplateId === template.id && 
              isSameDay(new Date(expense.dueDate), dueDate)
          );

          if (!hasExpenseThisMonth) {
            scheduleNotification(
              'Fechamento de Fatura',
              {
                body: `Hoje é o dia de fechamento da fatura: ${template.description}. Por favor, informe o valor correto.`,
                icon: '/icon.svg',
                tag: `template-closing-${template.id}`,
                renotify: true,
              },
              60 * 60 * 1000 // Notify every hour
            );
          }
        }
      });
    };

    checkExpenses();
    const interval = setInterval(checkExpenses, 60 * 1000);

    return () => clearInterval(interval);
  }, [expenses, recurringTemplates]);
}