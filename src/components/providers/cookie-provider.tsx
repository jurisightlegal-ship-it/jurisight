'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface CookieConsent {
  essential: boolean;
  analytics: boolean;
  timestamp: string;
}

interface CookieContextType {
  consent: CookieConsent | null;
  updateConsent: (consent: CookieConsent) => void;
  hasConsent: () => boolean;
  getConsent: () => CookieConsent | null;
}

const CookieContext = createContext<CookieContextType | undefined>(undefined);

export function CookieProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsent] = useState<CookieConsent | null>(null);

  useEffect(() => {
    // Load consent from localStorage on mount
    const savedConsent = localStorage.getItem('cookie-consent');
    if (savedConsent) {
      try {
        setConsent(JSON.parse(savedConsent));
      } catch (error) {
        console.error('Error parsing cookie consent:', error);
      }
    }
  }, []);

  const updateConsent = (newConsent: CookieConsent) => {
    setConsent(newConsent);
    localStorage.setItem('cookie-consent', JSON.stringify(newConsent));
  };

  const hasConsent = () => {
    return consent !== null;
  };

  const getConsent = () => {
    return consent;
  };

  return (
    <CookieContext.Provider value={{ consent, updateConsent, hasConsent, getConsent }}>
      {children}
    </CookieContext.Provider>
  );
}

export function useCookieConsent() {
  const context = useContext(CookieContext);
  if (context === undefined) {
    throw new Error('useCookieConsent must be used within a CookieProvider');
  }
  return context;
}
