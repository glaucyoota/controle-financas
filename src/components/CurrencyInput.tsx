import React from 'react';

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
}

export function parseCurrencyToNumber(currencyString: string): number {
  if (!currencyString) return 0;
  const cleanValue = currencyString.replace(/[^\d,]/g, '').replace(',', '.');
  return cleanValue ? parseFloat(cleanValue) : 0;
}

export function formatCurrencyValue(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

export function CurrencyInput({ value, onChange, ...props }: CurrencyInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove tudo exceto números
    const numericValue = e.target.value.replace(/\D/g, '');
    
    // Converte para número preservando os centavos
    const numberValue = parseInt(numericValue || '0', 10) / 100;
    
    // Formata o valor
    const formattedValue = formatCurrencyValue(numberValue);
    
    onChange(formattedValue);
  };

  return (
    <input
      type="text"
      value={value}
      onChange={handleChange}
      {...props}
    />
  );
}