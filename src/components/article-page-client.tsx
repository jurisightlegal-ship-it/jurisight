'use client';

import { useEffect, useState } from 'react';
import { SimplePreloader } from '@/components/ui/simple-preloader';

interface ArticlePageClientProps {
  children: React.ReactNode;
}

export function ArticlePageClient({ children }: ArticlePageClientProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [canSkip, setCanSkip] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    // Allow skipping after 10ms
    const skipTimer = setTimeout(() => {
      setCanSkip(true);
    }, 10);
    
    // Auto-hide after 30ms for minimal delay
    const hideTimer = setTimeout(() => {
      setIsLoading(false);
    }, 30);

    return () => {
      clearTimeout(skipTimer);
      clearTimeout(hideTimer);
    };
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
    <SimplePreloader isLoading={isLoading} onSkip={handleSkip} canSkip={canSkip}>
      {children}
    </SimplePreloader>
  );
}
