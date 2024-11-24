import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useVersionStore } from '../../store/useVersionStore';
import { toast } from 'react-hot-toast';
import { LogIn } from 'lucide-react';

export function LoginForm() {
  const [email, setEmail] = useState(import.meta.env.DEV ? 'admin' : '');
  const [password, setPassword] = useState(import.meta.env.DEV ? '123456' : '');
  const { signIn, error } = useAuthStore();
  const version = useVersionStore((state) => state.version);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signIn(email, password);
      toast.success('Login realizado com sucesso!');
    } catch {
      toast.error(error || 'Erro ao fazer login');
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-md">
      <div className="flex items-center justify-center gap-2 mb-8">
        <LogIn className="w-8 h-8 text-blue-600" />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Login</h1>
      </div>

      {import.meta.env.DEV && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 rounded-md text-sm">
          <p>Ambiente de Desenvolvimento</p>
          <p>Login: admin</p>
          <p>Senha: 123456</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
          <input
            type="text"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:focus:border-blue-400 dark:focus:ring-blue-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Senha</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:focus:border-blue-400 dark:focus:ring-blue-400"
          />
        </div>

        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          <LogIn className="w-5 h-5" />
          Entrar
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-slate-600 dark:text-slate-400">
        Não tem uma conta?{' '}
        <Link to="/register" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
          Registre-se
        </Link>
      </p>

      <p className="mt-4 text-center text-xs text-slate-500 dark:text-slate-400">
        Versão {version}
      </p>
    </div>
  );
}