'use client';

import React from 'react';
import { LanguageProvider } from './LanguageProvider';

export function WebProviders({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      {children}
    </LanguageProvider>
  );
}
