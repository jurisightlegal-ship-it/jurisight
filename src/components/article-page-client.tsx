'use client';

import { useEffect, useState } from 'react';
import { SimplePreloader } from '@/components/ui/simple-preloader';
import { useClarity } from '@/hooks/use-clarity';

interface ArticlePageClientProps {
  children: React.ReactNode;
  articleId?: number;
  articleTitle?: string;
  articleSection?: string;
}

export function ArticlePageClient({ children, articleId, articleTitle, articleSection }: ArticlePageClientProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const { trackEvent, setCustomTag } = useClarity();

  useEffect(() => {
    setIsMounted(true);
    
    // Show preloader for at least 5ms to ensure it's visible
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 5);
    
    return () => clearTimeout(timer);
  }, []);

  // Track article view when component mounts
  useEffect(() => {
    if (isMounted && articleId) {
      // Set custom tags for this article
      if (articleTitle) {
        setCustomTag('articleTitle', articleTitle);
      }
      if (articleSection) {
        setCustomTag('articleSection', articleSection);
      }
      
      // Track article view event
      trackEvent('article_view', {
        articleId: articleId.toString(),
        articleTitle: articleTitle || 'Unknown',
        articleSection: articleSection || 'Unknown',
        timestamp: new Date().toISOString(),
      });

      console.log('Clarity: Article view tracked', { articleId, articleTitle, articleSection });
    }
  }, [isMounted, articleId, articleTitle, articleSection, trackEvent, setCustomTag]);

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
