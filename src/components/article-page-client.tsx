'use client';

import { useEffect, useState } from 'react';
import { SimplePreloader } from '@/components/ui/simple-preloader';

interface ArticlePageClientProps {
  children: React.ReactNode;
}

export function ArticlePageClient({ children }: ArticlePageClientProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Prevent hydration mismatch
  if (!isMounted) {
    return <div>{children}</div>;
  }

  return <div>{children}</div>;
}
