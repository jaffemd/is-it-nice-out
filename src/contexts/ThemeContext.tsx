import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useMediaQuery } from '@mui/material';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  isDarkMode: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'weather-app-theme-mode';

interface ThemeProviderProps {
  children: ReactNode;
}

export const WeatherThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  
  // Initialize theme mode from localStorage or default to 'system'
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    try {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system') {
        return savedTheme;
      }
    } catch (error) {
      console.warn('Failed to load theme from localStorage:', error);
    }
    return 'system';
  });

  // Determine effective dark mode
  const isDarkMode = themeMode === 'system' ? prefersDarkMode : themeMode === 'dark';

  // Save theme preference to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, themeMode);
    } catch (error) {
      console.warn('Failed to save theme to localStorage:', error);
    }
  }, [themeMode]);

  const contextValue: ThemeContextType = {
    themeMode,
    setThemeMode,
    isDarkMode,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useWeatherTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useWeatherTheme must be used within a WeatherThemeProvider');
  }
  return context;
};