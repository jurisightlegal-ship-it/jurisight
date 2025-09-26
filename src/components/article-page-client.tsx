'use client';

import { useEffect, useState } from 'react';
import { SimplePreloader } from '@/components/ui/simple-preloader';

interface ArticlePageClientProps {
  children: React.ReactNode;
}

export function ArticlePageClient({ children }: ArticlePageClientProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Shorter loading time for better responsiveness
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300); // Reduced to 300ms for better UX

    return () => clearTimeout(timer);
  }, []);

  // Prevent hydration mismatch
  if (!isMounted) {
    return (
      <SimplePreloader isLoading={true}>
        {children}
      </SimplePreloader>
    );
  }

  const handleSkip = () => {
    setIsLoading(false);
  };

  return (
    <SimplePreloader isLoading={isLoading} onSkip={handleSkip}>
      {children}
    </SimplePreloader>
  );
}
