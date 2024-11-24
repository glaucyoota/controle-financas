export interface Expense {
  id: string;
  description: string;
  amount: number;
  dueDate: Date;
  paid: boolean;
  notificationInterval: number;
  category: string;
  createdAt: Date;
  updatedAt: Date;
  recurringTemplateId?: string;
  paymentDate?: Date;
}

export interface RecurringTemplate {
  id: string;
  description: string;
  category: string;
  expectedAmount: number;
  closingDay: number; // Dia do fechamento da fatura
  dueDay: number; // Dia do vencimento
  notificationInterval: number;
  createdAt: Date;
  updatedAt: Date;
  lastGeneratedDate?: Date;
  startDate?: Date; // Data de início opcional
  endDate?: Date; // Data de fim opcional
}