import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeDebug = () => {
  const { theme, toggleTheme, isDark } = useTheme();

  // Only show in development
  if (import.meta.env.PROD) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="text-sm space-y-2">
        <div className="font-semibold text-gray-800 dark:text-gray-200">Theme Debug</div>
        <div className="text-gray-600 dark:text-gray-400">
          Current: <span className="font-mono">{theme}</span>
        </div>
        <div className="text-gray-600 dark:text-gray-400">
          isDark: <span className="font-mono">{isDark.toString()}</span>
        </div>
        <button
          onClick={toggleTheme}
          className="px-3 py-1 bg-teal-500 text-white rounded text-xs hover:bg-teal-600 transition-colors"
        >
          Toggle Theme
        </button>
      </div>
    </div>
  );
};

export default ThemeDebug;
