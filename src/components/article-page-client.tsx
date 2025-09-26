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
    
    // Show preloader instantly, hide immediately for instant effect
    setIsLoading(false);
  }, []);

  // Prevent hydration mismatch
  if (!isMounted) {
    return (
      <SimplePreloader isLoading={true}>
        {children}
      </SimplePreloader>
    );
  }

  return (
    <SimplePreloader isLoading={isLoading}>
      {children}
    </SimplePreloader>
  );
}
