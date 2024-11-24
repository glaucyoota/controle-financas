import React from 'react';
import { format, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar } from 'lucide-react';
import { usePeriodStore } from '../store/usePeriodStore';

export function PeriodSelector() {
  const { selectedDate, setSelectedDate } = usePeriodStore();
  const currentMonth = format(selectedDate || new Date(), 'yyyy-MM');
  const displayMonth = format(selectedDate || new Date(), "MMMM 'de' yyyy", { locale: ptBR });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.value) {
      const date = parse(event.target.value + '-01', 'yyyy-MM-dd', new Date());
      setSelectedDate(date);
    } else {
      setSelectedDate(null);
    }
  };

  return (
    <div className="period-selector flex items-center gap-2 bg-slate-800 dark:bg-slate-700 rounded-md px-3 py-2">
      <Calendar className="w-5 h-5 text-slate-400" />
      <div className="flex flex-col">
        <input
          type="month"
          value={currentMonth}
          onChange={handleChange}
          className="bg-transparent border-none p-0 text-white focus:ring-0 cursor-pointer"
          title={displayMonth}
        />
      </div>
    </div>
  );
}