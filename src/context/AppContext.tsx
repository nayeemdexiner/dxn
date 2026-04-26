import React, { createContext, useContext, useEffect, useState } from 'react';
import { db, initSettings } from '../lib/db';
import { AppSettings } from '../types';
import { translations } from '../lib/translations';

interface AppContextType {
  settings: AppSettings | null;
  t: any;
  setLanguage: (lang: 'en' | 'bn') => Promise<void>;
  updateSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [currentPage, setCurrentPage] = useState('dashboard');

  useEffect(() => {
    async function load() {
      await initSettings();
      const s = await db.settings.get(1);
      if (s) setSettings(s);
    }
    load();
  }, []);

  const setLanguage = async (language: 'en' | 'bn') => {
    if (settings) {
      const updated = { ...settings, language };
      await db.settings.put(updated);
      setSettings(updated);
    }
  };

  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    if (settings) {
      const updated = { ...settings, ...newSettings };
      await db.settings.put(updated);
      setSettings(updated);
    }
  };

  const t = settings ? translations[settings.language] : translations.bn;

  return (
    <AppContext.Provider value={{ settings, t, setLanguage, updateSettings, currentPage, setCurrentPage }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
