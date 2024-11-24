import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useExpenseStore } from '../../store/useExpenseStore';
import { useIncomeStore } from '../../store/useIncomeStore';
import { useThemeStore } from '../../store/useThemeStore';
import { useVersionStore } from '../../store/useVersionStore';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Repeat, 
  Settings,
  Menu,
  X 
} from 'lucide-react';
import { ThemeToggle } from '../ThemeToggle';
import { Modal } from '../Modal';
import { ExpenseForm } from '../ExpenseForm';
import { IncomeForm } from '../IncomeForm';
import { RecurringTemplates } from '../RecurringTemplates';
import { UserSettings } from '../UserSettings';
import { SearchBar } from '../SearchBar';
import { PeriodSelector } from '../PeriodSelector';
import { GuidedTour } from '../GuidedTour';

export function ProtectedLayout() {
  const { user, loading, signOut } = useAuthStore();
  const loadUserData = useExpenseStore(state => state.loadUserData);
  const loadIncomes = useIncomeStore(state => state.loadIncomes);
  const syncTheme = useThemeStore(state => state.syncWithFirestore);
  const version = useVersionStore(state => state.version);
  
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [incomeModalOpen, setIncomeModalOpen] = useState(false);
  const [recurringModalOpen, setRecurringModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserData();
      loadIncomes();
      syncTheme();
    }
  }, [user, loadUserData, loadIncomes, syncTheme]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
      <header className="bg-slate-900 dark:bg-slate-800 text-white p-4 shadow-lg">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet className="w-8 h-8" />
              <h1 className="text-2xl font-bold hidden md:block">Controle Financeiro</h1>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-md hover:bg-slate-700"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4 flex-1 mx-8">
              <PeriodSelector />
              <SearchBar />
            </div>

            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => setExpenseModalOpen(true)}
                className="p-2 rounded-md bg-red-600 hover:bg-red-700 transition-colors add-expense-button"
                title="Nova Despesa"
              >
                <TrendingDown className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => setIncomeModalOpen(true)}
                className="p-2 rounded-md bg-green-600 hover:bg-green-700 transition-colors add-income-button"
                title="Nova Receita"
              >
                <TrendingUp className="w-5 h-5" />
              </button>

              <button
                onClick={() => setRecurringModalOpen(true)}
                className="p-2 rounded-md bg-blue-600 hover:bg-blue-700 transition-colors recurring-button"
                title="Despesas Recorrentes"
              >
                <Repeat className="w-5 h-5" />
              </button>

              <button
                onClick={() => setSettingsModalOpen(true)}
                className="p-2 rounded-md bg-slate-700 hover:bg-slate-600 transition-colors"
                title="Configurações"
              >
                <Settings className="w-5 h-5" />
              </button>

              <ThemeToggle />
              
              <button
                onClick={() => signOut()}
                className="text-sm px-3 py-1 rounded-md bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600 transition-colors"
              >
                Sair
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="mt-4 space-y-4 md:hidden">
              <PeriodSelector />
              <SearchBar />
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setExpenseModalOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-center gap-2 p-2 rounded-md bg-red-600 hover:bg-red-700 transition-colors"
                >
                  <TrendingDown className="w-5 h-5" />
                  <span>Nova Despesa</span>
                </button>
                
                <button
                  onClick={() => {
                    setIncomeModalOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-center gap-2 p-2 rounded-md bg-green-600 hover:bg-green-700 transition-colors"
                >
                  <TrendingUp className="w-5 h-5" />
                  <span>Nova Receita</span>
                </button>

                <button
                  onClick={() => {
                    setRecurringModalOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-center gap-2 p-2 rounded-md bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  <Repeat className="w-5 h-5" />
                  <span>Recorrentes</span>
                </button>

                <button
                  onClick={() => {
                    setSettingsModalOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-center gap-2 p-2 rounded-md bg-slate-700 hover:bg-slate-600 transition-colors"
                >
                  <Settings className="w-5 h-5" />
                  <span>Configurações</span>
                </button>

                <div className="flex items-center justify-center gap-2 p-2">
                  <ThemeToggle />
                </div>

                <button
                  onClick={() => signOut()}
                  className="flex items-center justify-center gap-2 p-2 rounded-md bg-slate-800 hover:bg-slate-700 transition-colors"
                >
                  Sair
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="container mx-auto p-4 space-y-6 flex-1">
        <div className="dashboard-summary">
          <Outlet />
        </div>
      </main>

      <footer className="bg-slate-900 dark:bg-slate-800 text-white py-2">
        <div className="container mx-auto text-center text-sm text-slate-400">
          Versão {version}
        </div>
      </footer>

      <Modal
        isOpen={expenseModalOpen}
        onClose={() => setExpenseModalOpen(false)}
        title="Nova Despesa"
      >
        <ExpenseForm onSuccess={() => setExpenseModalOpen(false)} />
      </Modal>

      <Modal
        isOpen={incomeModalOpen}
        onClose={() => setIncomeModalOpen(false)}
        title="Nova Receita"
      >
        <IncomeForm onSuccess={() => setIncomeModalOpen(false)} />
      </Modal>

      <Modal
        isOpen={recurringModalOpen}
        onClose={() => setRecurringModalOpen(false)}
        title="Despesas Recorrentes"
      >
        <RecurringTemplates onSuccess={() => setRecurringModalOpen(false)} />
      </Modal>

      <Modal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        title="Configurações"
      >
        <UserSettings />
      </Modal>

      <GuidedTour />
    </div>
  );
}