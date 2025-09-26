'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

interface DarkModeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  isDashboardPage: boolean;
}

const DarkModeContext = createContext<DarkModeContextType | undefined>(undefined);

export function DarkModeProvider({ children }: { children: React.ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const pathname = usePathname();
  
  // Check if current page is a dashboard page
  const isDashboardPage = pathname?.startsWith('/dashboard') || false;

  // Load dark mode preference from localStorage on mount
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode !== null) {
      setIsDarkMode(JSON.parse(savedDarkMode));
    } else {
      // Default to light mode for frontend pages
      setIsDarkMode(false);
    }
  }, []);

  // Apply dark mode class to document only on dashboard pages
  useEffect(() => {
    if (isDashboardPage && isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode, isDashboardPage]);

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem('darkMode', JSON.stringify(newDarkMode));
  };

  return (
    <DarkModeContext.Provider value={{ isDarkMode, toggleDarkMode, isDashboardPage }}>
      {children}
    </DarkModeContext.Provider>
  );
}

export function useDarkMode() {
  const context = useContext(DarkModeContext);
  if (context === undefined) {
    throw new Error('useDarkMode must be used within a DarkModeProvider');
  }
  return context;
}
