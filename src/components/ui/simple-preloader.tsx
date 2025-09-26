'use client';

import { useEffect, useState } from 'react';

interface SimplePreloaderProps {
  isLoading: boolean;
  children: React.ReactNode;
}

export function SimplePreloader({ isLoading, children }: SimplePreloaderProps) {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      // Immediate transition for better responsiveness
      setShowContent(true);
    } else {
      setShowContent(false);
    }
  }, [isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-jurisight-royal"></div>
      </div>
    );
  }

  return (
    <div className={`transition-opacity duration-50 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
      {children}
    </div>
  );
}
