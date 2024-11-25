import React, { useState } from 'react';
import { Plus, Repeat, Edit2, Trash2, Check, X, Calendar } from 'lucide-react';
import { useExpenseStore } from '../store/useExpenseStore';
import { useCategoryStore } from '../store/useCategoryStore';
import { useVersionStore } from '../store/useVersionStore';
import { usePeriodStore } from '../store/usePeriodStore';
import { ConfirmationModal } from './ConfirmationModal';
import { CurrencyInput, formatCurrencyValue, parseCurrencyToNumber } from './CurrencyInput';
import { format, parseISO, isSameMonth, isAfter, isBefore } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type RecurringTemplatesProps = {
  onSuccess?: () => void;
};

export function RecurringTemplates({ onSuccess }: RecurringTemplatesProps) {
  const { recurringTemplates, expenses, addRecurringTemplate, updateRecurringTemplate, deleteRecurringTemplate, generateFromTemplate } = useExpenseStore();
  const { getAllCategories } = useCategoryStore();
  const incrementVersion = useVersionStore((state) => state.incrementVersion);
  const { getPeriodRange } = usePeriodStore();
  const [isAdding, setIsAdding] = useState(false);
  const [description, setDescription] = useState('');
  const [expectedAmount, setExpectedAmount] = useState('R$ 0,00');
  const [closingDay, setClosingDay] = useState('1');
  const [dueDay, setDueDay] = useState('10');
  const [category, setCategory] = useState('');
  const [notificationInterval, setNotificationInterval] = useState('60');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [generatingForId, setGeneratingForId] = useState<string | null>(null);
  const [newAmount, setNewAmount] = useState('R$ 0,00');
  const [newDate, setNewDate] = useState('');
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);
  const [editStartDate, setEditStartDate] = useState('');
  const [editEndDate, setEditEndDate] = useState('');
  const categories = getAllCategories();

  const { start: periodStart } = getPeriodRange();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    addRecurringTemplate({
      description,
      expectedAmount: parseCurrencyToNumber(expectedAmount),
      closingDay: parseInt(closingDay),
      dueDay: parseInt(dueDay),
      category,
      notificationInterval: parseInt(notificationInterval),
      startDate: startDate ? parseISO(startDate) : undefined,
      endDate: endDate ? parseISO(endDate) : undefined,
    });

    incrementVersion();
    onSuccess?.();

    setIsAdding(false);
    setDescription('');
    setExpectedAmount('R$ 0,00');
    setClosingDay('1');
    setDueDay('10');
    setCategory('');
    setStartDate('');
    setEndDate('');
  };

  const handleGenerate = (templateId: string) => {
    const amount = parseCurrencyToNumber(newAmount);
    const date = parseISO(newDate);
    generateFromTemplate(templateId, amount, date);
    incrementVersion();
    setGeneratingForId(null);
    setNewAmount('R$ 0,00');
    setNewDate('');
  };

  const handleGenerateSubmit = (e: React.FormEvent, templateId: string) => {
    e.preventDefault();
    handleGenerate(templateId);
  };

  const handleDelete = (id: string) => {
    setTemplateToDelete(id);
  };

  const confirmDelete = () => {
    if (templateToDelete) {
      deleteRecurringTemplate(templateToDelete);
      incrementVersion();
      setTemplateToDelete(null);
    }
  };

  const handleStartGenerate = (template: typeof recurringTemplates[0]) => {
    setGeneratingForId(template.id);
    setNewAmount(formatCurrencyValue(template.expectedAmount));
    const defaultDate = new Date(periodStart);
    defaultDate.setDate(template.dueDay);
    setNewDate(format(defaultDate, 'yyyy-MM-dd'));
  };

  const handleStartEdit = (template: typeof recurringTemplates[0]) => {
    setEditingTemplate(template.id);
    setEditStartDate(template.startDate ? format(new Date(template.startDate), 'yyyy-MM-dd') : '');
    setEditEndDate(template.endDate ? format(new Date(template.endDate), 'yyyy-MM-dd') : '');
  };

  const handleSaveEdit = async (templateId: string) => {
    await updateRecurringTemplate(templateId, {
      startDate: editStartDate ? parseISO(editStartDate) : undefined,
      endDate: editEndDate ? parseISO(editEndDate) : undefined,
    });
    incrementVersion();
    setEditingTemplate(null);
  };

  const isTemplateActive = (template: typeof recurringTemplates[0]) => {
    const now = periodStart;
    
    if (template.startDate && isAfter(template.startDate, now)) {
      return false;
    }
    
    if (template.endDate && isBefore(template.endDate, now)) {
      return false;
    }
    
    return true;
  };

  const getTemplateStatus = (template: typeof recurringTemplates[0]) => {
    if (!isTemplateActive(template)) return 'inactive';

    const monthlyExpense = expenses.find(expense => 
      expense.recurringTemplateId === template.id && 
      isSameMonth(new Date(expense.dueDate), periodStart)
    );

    if (!monthlyExpense) return 'pending';
    if (monthlyExpense.paid) return 'paid';
    return 'generated';
  };

  const sortedTemplates = [...recurringTemplates].sort((a, b) => {
    const statusA = getTemplateStatus(a);
    const statusB = getTemplateStatus(b);

    // Order: pending -> generated -> paid -> inactive
    const statusOrder = { pending: 0, generated: 1, paid: 2, inactive: 3 };
    return statusOrder[statusA] - statusOrder[statusB];
  });

  return (
    <>
      <div className="space-y-4">
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nova Recorrência
          </button>
        )}

        {isAdding && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Descrição</label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Valor Esperado</label>
                <CurrencyInput
                  value={expectedAmount}
                  onChange={setExpectedAmount}
                  required
                  className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Dia do Fechamento</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="31"
                  value={closingDay}
                  onChange={(e) => setClosingDay(e.target.value)}
                  className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Dia do Vencimento</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="31"
                  value={dueDay}
                  onChange={(e) => setDueDay(e.target.value)}
                  className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Categoria</label>
                <select
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Selecione uma categoria</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Data de Início</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Data de Fim</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                  className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Salvar
              </button>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        <div className="space-y-4">
          {sortedTemplates.map((template) => {
            const status = getTemplateStatus(template);
            
            return (
              <div
                key={template.id}
                className={`bg-white dark:bg-slate-800 rounded-lg shadow p-4 ${
                  status === 'inactive'
                    ? 'opacity-50'
                    : status === 'pending' 
                      ? 'border-l-4 border-amber-500'
                      : status === 'generated'
                        ? 'border-l-4 border-blue-500'
                        : 'border-l-4 border-green-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="font-medium text-slate-900 dark:text-white">{template.description}</h3>
                    <div className="text-sm text-slate-500 dark:text-slate-400 space-y-1">
                      <p>Valor Esperado: {formatCurrencyValue(template.expectedAmount)}</p>
                      <p>Fechamento: Dia {template.closingDay}</p>
                      <p>Vencimento: Dia {template.dueDay}</p>
                      <p>Categoria: {template.category}</p>
                      
                      {editingTemplate === template.id ? (
                        <div className="space-y-2 mt-2">
                          <div>
                            <label className="block text-sm">Data de Início</label>
                            <input
                              type="date"
                              value={editStartDate}
                              onChange={(e) => setEditStartDate(e.target.value)}
                              className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm">Data de Fim</label>
                            <input
                              type="date"
                              value={editEndDate}
                              onChange={(e) => setEditEndDate(e.target.value)}
                              min={editStartDate}
                              className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSaveEdit(template.id)}
                              className="p-2 text-green-600 dark:text-green-500 hover:bg-green-50 dark:hover:bg-green-500/10 rounded-full transition-colors"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingTemplate(null)}
                              className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-full transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        (template.startDate || template.endDate) && (
                          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {template.startDate && format(new Date(template.startDate), "dd/MM/yyyy", { locale: ptBR })}
                              {template.startDate && template.endDate && ' - '}
                              {template.endDate && format(new Date(template.endDate), "dd/MM/yyyy", { locale: ptBR })}
                            </span>
                            <button
                              onClick={() => handleStartEdit(template)}
                              className="p-1 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-full transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {generatingForId === template.id ? (
                      <form 
                        onSubmit={(e) => handleGenerateSubmit(e, template.id)}
                        className="space-y-2"
                      >
                        <CurrencyInput
                          value={newAmount}
                          onChange={setNewAmount}
                          placeholder="Novo valor"
                          className="w-32 rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                        <input
                          type="date"
                          value={newDate}
                          onChange={(e) => setNewDate(e.target.value)}
                          className="w-32 rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                        <div className="flex gap-2">
                          <button
                            type="submit"
                            className="p-2 text-green-600 dark:text-green-500 hover:bg-green-50 dark:hover:bg-green-500/10 rounded-full transition-colors"
                          >
                            <Check className="w-5 h-5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setGeneratingForId(null)}
                            className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-full transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </form>
                    ) : (
                      <button
                        onClick={() => handleStartGenerate(template)}
                        className="p-2 text-blue-600 dark:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-full transition-colors"
                        title="Gerar despesa"
                        disabled={status === 'paid' || status === 'inactive'}
                      >
                        <Repeat className="w-6 h-6" />
                      </button>
                    )}

                    <button
                      onClick={() => handleDelete(template.id)}
                      className="p-2 text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-full transition-colors"
                      title="Excluir modelo"
                    >
                      <Trash2 className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {recurringTemplates.length === 0 && !isAdding && (
            <div className="text-center text-slate-500 dark:text-slate-400 py-8">
              <Repeat className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Nenhuma conta recorrente cadastrada</p>
            </div>
          )}
        </div>
      </div>

      <ConfirmationModal
        isOpen={templateToDelete !== null}
        onClose={() => setTemplateToDelete(null)}
        onConfirm={confirmDelete}
        title="Excluir Modelo Recorrente"
        message="Tem certeza que deseja excluir este modelo de despesa recorrente? Esta ação não pode ser desfeita e não afetará as despesas já geradas."
      />
    </>
  );
}