export interface Income {
  id: string;
  description: string;
  amount: number;
  date: Date;
  category: string;
  createdAt: Date;
  updatedAt: Date;
  recurring?: boolean;
  recurringDay?: number;
}