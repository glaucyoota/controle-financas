import React, { useState } from 'react';
import { Plus, Repeat, Edit2, Trash2, Check, X } from 'lucide-react';
import { useIncomeStore } from '../store/useIncomeStore';
import { useVersionStore } from '../store/useVersionStore';
import { ConfirmationModal } from './ConfirmationModal';
import { format, parseISO } from 'date-fns';
import { CurrencyInput, formatCurrencyValue, parseCurrencyToNumber } from './CurrencyInput';

interface IncomeFormProps {
  onSuccess?: () => void;
}

export function IncomeForm({ onSuccess }: IncomeFormProps) {
  const { recurringIncomes, addRecurringIncome, updateRecurringIncome, deleteRecurringIncome, generateFromRecurring } = useIncomeStore();
  const incrementVersion = useVersionStore((state) => state.incrementVersion);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState('R$ 0,00');
  const [description, setDescription] = useState('');
  const [expectedAmount, setExpectedAmount] = useState('R$ 0,00');
  const [day, setDay] = useState('1');
  const [generatingForId, setGeneratingForId] = useState<string | null>(null);
  const [newAmount, setNewAmount] = useState('R$ 0,00');
  const [newDate, setNewDate] = useState('');
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    addRecurringIncome({
      description,
      expectedAmount: parseCurrencyToNumber(expectedAmount),
      day: parseInt(day),
    });

    incrementVersion();
    onSuccess?.();

    setIsAdding(false);
    setDescription('');
    setExpectedAmount('R$ 0,00');
    setDay('1');
  };

  const handleStartEdit = (template: typeof recurringIncomes[0]) => {
    setEditingId(template.id);
    setEditAmount(formatCurrencyValue(template.expectedAmount));
  };

  const handleSaveEdit = async (templateId: string) => {
    await updateRecurringIncome(templateId, {
      expectedAmount: parseCurrencyToNumber(editAmount),
    });
    incrementVersion();
    setEditingId(null);
    setEditAmount('R$ 0,00');
  };

  const handleGenerate = (templateId: string) => {
    if (!newAmount || !newDate) return;
    
    const numericAmount = parseCurrencyToNumber(newAmount);
    const date = parseISO(newDate);
    generateFromRecurring(templateId, numericAmount, date);
    incrementVersion();
    setGeneratingForId(null);
    setNewAmount('R$ 0,00');
    setNewDate('');
  };

  const handleStartGenerate = (template: typeof recurringIncomes[0]) => {
    setGeneratingForId(template.id);
    setNewAmount(formatCurrencyValue(template.expectedAmount));
    const defaultDate = new Date();
    defaultDate.setDate(template.day);
    setNewDate(format(defaultDate, 'yyyy-MM-dd'));
  };

  const handleDelete = (id: string) => {
    setTemplateToDelete(id);
  };

  const confirmDelete = () => {
    if (templateToDelete) {
      deleteRecurringIncome(templateToDelete);
      incrementVersion();
      setTemplateToDelete(null);
    }
  };

  return (
    <>
      <div className="space-y-4">
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="w-full flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nova Receita Recorrente
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
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Dia do Mês</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="31"
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                  className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
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
          {recurringIncomes.map((template) => (
            <div
              key={template.id}
              className="bg-white dark:bg-slate-800 rounded-lg shadow p-4"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="font-medium text-slate-900 dark:text-white">{template.description}</h3>
                  <div className="text-sm text-slate-500 dark:text-slate-400 space-y-1">
                    <div className="flex items-center gap-2">
                      <span>Valor Esperado:</span>
                      {editingId === template.id ? (
                        <div className="flex items-center gap-2">
                          <CurrencyInput
                            value={editAmount}
                            onChange={setEditAmount}
                            className="w-32 rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          />
                          <button
                            onClick={() => handleSaveEdit(template.id)}
                            className="p-1 text-green-600 dark:text-green-500 hover:bg-green-50 dark:hover:bg-green-500/10 rounded-full transition-colors"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="p-1 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-full transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span>{formatCurrencyValue(template.expectedAmount)}</span>
                          <button
                            onClick={() => handleStartEdit(template)}
                            className="p-1 text-blue-600 dark:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-full transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                    <p>Dia do Mês: {template.day}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {generatingForId === template.id ? (
                    <div className="space-y-2">
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
                          onClick={() => handleGenerate(template.id)}
                          className="p-2 text-green-600 dark:text-green-500 hover:bg-green-50 dark:hover:bg-green-500/10 rounded-full transition-colors"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setGeneratingForId(null)}
                          className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-full transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleStartGenerate(template)}
                      className="p-2 text-green-600 dark:text-green-500 hover:bg-green-50 dark:hover:bg-green-500/10 rounded-full transition-colors"
                      title="Confirmar receita"
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
          ))}

          {recurringIncomes.length === 0 && !isAdding && (
            <div className="text-center text-slate-500 dark:text-slate-400 py-8">
              <Repeat className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Nenhuma receita recorrente cadastrada</p>
            </div>
          )}
        </div>
      </div>

      <ConfirmationModal
        isOpen={templateToDelete !== null}
        onClose={() => setTemplateToDelete(null)}
        onConfirm={confirmDelete}
        title="Excluir Modelo Recorrente"
        message="Tem certeza que deseja excluir este modelo de receita recorrente? Esta ação não pode ser desfeita e não afetará as receitas já geradas."
      />
    </>
  );
}