import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  actualTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_KEY = 'niletrace_theme';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem(THEME_KEY) as Theme;
    return saved || 'system';
  });

  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light');

  // Determine actual theme based on system preference and user choice
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const updateActualTheme = () => {
      if (theme === 'system') {
        setActualTheme(mediaQuery.matches ? 'dark' : 'light');
      } else {
        setActualTheme(theme);
      }
    };

    updateActualTheme();

    // Listen for system theme changes
    mediaQuery.addEventListener('change', updateActualTheme);
    return () => mediaQuery.removeEventListener('change', updateActualTheme);
  }, [theme]);

  // Apply theme class to document
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(actualTheme);

    // Update CSS variables for toast
    if (actualTheme === 'dark') {
      root.style.setProperty('--toast-bg', '#1e293b');
      root.style.setProperty('--toast-color', '#f1f5f9');
    } else {
      root.style.setProperty('--toast-bg', '#ffffff');
      root.style.setProperty('--toast-color', '#0f172a');
    }
  }, [actualTheme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(THEME_KEY, newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, actualTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
