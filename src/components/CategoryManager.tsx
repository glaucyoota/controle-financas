import React, { useState, useEffect } from 'react';
import { Plus, Tag } from 'lucide-react';
import { useCategoryStore } from '../store/useCategoryStore';
import { toast } from 'react-hot-toast';

export function CategoryManager() {
  const [newCategory, setNewCategory] = useState('');
  const { customCategories, suggestedCategories, addCategory, loadCategories, loadSuggestedCategories } = useCategoryStore();

  useEffect(() => {
    loadCategories();
    loadSuggestedCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newCategory.trim()) return;

    try {
      await addCategory(newCategory.trim());
      setNewCategory('');
      toast.success('Categoria adicionada com sucesso!');
    } catch (error) {
      toast.error('Erro ao adicionar categoria');
    }
  };

  const handleSuggestionClick = (category: string) => {
    setNewCategory(category);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Gerenciar Categorias</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Nova Categoria
          </label>
          <div className="mt-1 flex gap-2">
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Digite o nome da categoria"
            />
            <button
              type="submit"
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Adicionar
            </button>
          </div>
        </div>
      </form>

      <div className="mt-6">
        <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Suas Categorias
        </h3>
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

      {suggestedCategories.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Sugestões de Categorias
          </h3>
          <div className="flex flex-wrap gap-2">
            {suggestedCategories.map((category) => (
              <button
                key={category}
                onClick={() => handleSuggestionClick(category)}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                <Tag className="w-4 h-4" />
                {category}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}