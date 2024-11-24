export const NOTIFICATION_INTERVALS = [
  { value: 1, label: '1 minuto' },
  { value: 5, label: '5 minutos' },
  { value: 15, label: '15 minutos' },
  { value: 30, label: '30 minutos' },
  { value: 60, label: '1 hora' },
] as const;

export const DEFAULT_CATEGORIES = [
  'Moradia',
  'Alimentação',
  'Transporte',
  'Educação',
  'Saúde',
  'Lazer e Entretenimento',
  'Contas e Serviços',
  'Dívidas e Financiamentos',
  'Investimentos e Poupança'
] as const;