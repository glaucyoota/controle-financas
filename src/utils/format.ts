import { format as dateFnsFormat } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

export function formatDate(date: Date | string | number): string {
  return dateFnsFormat(new Date(date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
}

export function formatDateTime(date: Date | string | number): string {
  return dateFnsFormat(new Date(date), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR });
}