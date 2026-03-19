'use client';

import React from 'react';
import { LanguageProvider } from './LanguageProvider';
import { NotificationProvider } from './NotificationProvider';

export function WebProviders({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <NotificationProvider>
        {children}
      </NotificationProvider>
    </LanguageProvider>
  );
}
