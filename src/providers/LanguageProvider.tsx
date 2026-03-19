'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { th } from '@/locales/th';
import { en } from '@/locales/en';

type Locale = 'th' | 'en';
type Translations = typeof th;

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, any>) => string;
}

const translations: Record<Locale, Translations> = { th, en };

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('th');

  useEffect(() => {
    const saved = localStorage.getItem('locale') as Locale;
    if (saved && (saved === 'th' || saved === 'en')) {
      setLocaleState(saved);
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('locale', newLocale);
    document.documentElement.lang = newLocale;
  };

  const t = (key: string, params?: Record<string, any>): string => {
    const keys = key.split('.');
    let result: any = translations[locale];

    for (const k of keys) {
      if (result && result[k]) {
        result = result[k];
      } else {
        // Fallback to English if Thai key is missing
        if (locale === 'th') {
          let enResult: any = translations['en'];
          for (const ek of keys) {
             if (enResult && enResult[ek]) {
               enResult = enResult[ek];
             } else {
               return key;
             }
          }
          result = enResult;
          break;
        }
        return key;
      }
    }

    if (typeof result !== 'string') return key;

    // Parameter interpolation
    if (params) {
      let templated = result;
      Object.entries(params).forEach(([k, v]) => {
        templated = templated.replace(new RegExp(`{${k}}`, 'g'), String(v));
      });
      return templated;
    }

    return result;
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
}
