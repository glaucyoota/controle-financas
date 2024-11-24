import React from 'react';
import { Settings, Tag } from 'lucide-react';
import { useCategoryStore } from '../store/useCategoryStore';
import { useTourStore } from '../store/useTourStore';
import { DEFAULT_CATEGORIES } from '../constants';

export function UserSettings() {
  const { customCategories, addCategory } = useCategoryStore();
  const { setHasSeenTour } = useTourStore();
  const [newCategory, setNewCategory] = React.useState('');

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    
    await addCategory(newCategory.trim());
    setNewCategory('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">Categorias</h3>
        <form onSubmit={handleAddCategory} className="flex gap-2 mb-4">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Nova categoria"
            className="block flex-1 rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Adicionar
          </button>
        </form>

        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Categorias Padrão
            </h4>
            <div className="flex flex-wrap gap-2">
              {DEFAULT_CATEGORIES.map((category) => (
                <span
                  key={category}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                >
                  <Tag className="w-4 h-4" />
                  {category}
                </span>
              ))}
            </div>
          </div>

          {customCategories.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Suas Categorias
              </h4>
              <div className="flex flex-wrap gap-2">
                {customCategories.map((category) => (
                  <span
                    key={category}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200"
                  >
                    <Tag className="w-4 h-4" />
                    {category}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">Tour Guiado</h3>
        <button
          onClick={() => setHasSeenTour(false)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Reiniciar Tour
        </button>
      </div>
    </div>
  );
}