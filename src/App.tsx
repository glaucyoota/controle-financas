import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './lib/firebase';
import { useAuthStore } from './store/useAuthStore';
import { useThemeStore } from './store/useThemeStore';
import { AuthLayout } from './components/auth/AuthLayout';
import { ProtectedLayout } from './components/auth/ProtectedLayout';
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
import { Dashboard } from './components/Dashboard';
import { ExpenseList } from './components/ExpenseList';
import { IncomeList } from './components/IncomeList';

export default function App() {
  const setUser = useAuthStore((state) => state.setUser);
  const { isDark, loadTheme } = useThemeStore();

  useEffect(() => {
    loadTheme();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, [setUser, loadTheme]);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
        </Route>

        <Route element={<ProtectedLayout />}>
          <Route path="/" element={
            <>
              <Dashboard />
              <ExpenseList />
              <IncomeList />
            </>
          } />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      <Toaster 
        position="top-right"
        toastOptions={{
          className: 'dark:bg-slate-800 dark:text-white',
        }}
      />
    </BrowserRouter>
  );
}