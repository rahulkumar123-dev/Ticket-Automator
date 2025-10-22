import React, { useState } from 'react';
import { Settings as SettingsIcon, Sun, Moon } from 'lucide-react';

const Settings = ({ theme, setTheme }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"
      >
        <SettingsIcon className="text-slate-600 dark:text-slate-300" />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 z-50">
          <div className="p-2">
            <p className="px-2 py-1 text-xs font-semibold text-slate-400">Theme</p>
            <button 
              onClick={() => handleThemeChange('light')} 
              className={`w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-md text-sm ${theme === 'light' ? 'bg-sky-100 dark:bg-sky-900 text-sky-700 dark:text-sky-300' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}`}
            >
              <Sun size={16} /> Light Mode
            </button>
            <button 
              onClick={() => handleThemeChange('dark')} 
              className={`w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-md text-sm ${theme === 'dark' ? 'bg-sky-100 dark:bg-sky-900 text-sky-700 dark:text-sky-300' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}`}
            >
              <Moon size={16} /> Dark Mode
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;