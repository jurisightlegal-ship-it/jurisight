'use client';

import { Button } from '@/components/ui/button';
import { useDarkMode } from '@/components/providers/dark-mode-provider';
import { Moon, Sun } from 'lucide-react';

interface DarkModeToggleProps {
  size?: 'sm' | 'default' | 'lg' | 'icon';
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  className?: string;
}

export function DarkModeToggle({ 
  size = 'icon', 
  variant = 'ghost', 
  className = '' 
}: DarkModeToggleProps) {
  const { isDarkMode, toggleDarkMode, isDashboardPage } = useDarkMode();

  // Only show dark mode toggle on dashboard pages
  if (!isDashboardPage) {
    return null;
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={toggleDarkMode}
      className={`${className}`}
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDarkMode ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
      <span className="sr-only">
        {isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      </span>
    </Button>
  );
}
