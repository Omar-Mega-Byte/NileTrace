import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  const { actualTheme, setTheme } = useTheme();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
      {/* Theme toggle */}
      <div className="absolute top-4 right-4">
        <button
          onClick={() => setTheme(actualTheme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          aria-label="Toggle theme"
        >
          {actualTheme === 'dark' ? (
            <Sun className="h-5 w-5 text-slate-400" />
          ) : (
            <Moon className="h-5 w-5 text-slate-600" />
          )}
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">NT</span>
              </div>
            </Link>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h1>
            {subtitle && (
              <p className="mt-2 text-slate-600 dark:text-slate-400">{subtitle}</p>
            )}
          </div>

          {/* Content */}
          <div className="card p-6 sm:p-8">{children}</div>

          {/* Footer */}
          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
            AI-Powered Incident Postmortem Platform
          </p>
        </div>
      </div>
    </div>
  );
};
