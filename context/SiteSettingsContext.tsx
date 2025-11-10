import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { listenToSiteSettings } from '../firebase/services';
import { SiteSettings } from '../types';

interface SiteSettingsContextType {
  settings: SiteSettings | null;
  loading: boolean;
}

const SiteSettingsContext = createContext<SiteSettingsContextType | undefined>(undefined);

export const SiteSettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = listenToSiteSettings((settingsData) => {
      setSettings(settingsData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const value = {
    settings,
    loading,
  };

  return (
    <SiteSettingsContext.Provider value={value}>
      {children}
    </SiteSettingsContext.Provider>
  );
};

export const useSiteSettings = (): SiteSettingsContextType => {
  const context = useContext(SiteSettingsContext);
  if (context === undefined) {
    throw new Error('useSiteSettings must be used within a SiteSettingsProvider');
  }
  return context;
};