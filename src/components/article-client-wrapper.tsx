'use client';

import { useEffect, useState } from 'react';
import { usePreloader } from '@/hooks/use-loading';

interface ArticleClientWrapperProps {
  children: React.ReactNode;
  slug: string;
}

export function ArticleClientWrapper({ children, slug }: ArticleClientWrapperProps) {
  const { showPageTransition, hideLoading } = usePreloader();
  const [isLoading, setIsLoading] = useState(true);
  const [currentSlug, setCurrentSlug] = useState(slug);

  useEffect(() => {
    // If slug changed, show loading for navigation
    if (currentSlug !== slug) {
      showPageTransition();
      setCurrentSlug(slug);
    } else {
      // Initial page load
      showPageTransition();
    }
    
    // Hide loading after a short delay to show the loading animation
    const timer = setTimeout(() => {
      setIsLoading(false);
      hideLoading();
    }, 400); // Much faster for better UX

    return () => clearTimeout(timer);
  }, [showPageTransition, hideLoading, slug, currentSlug]);

  // Show loading state while the page is loading
  if (isLoading) {
    return null; // The preloader will be shown by the provider
  }

  return <>{children}</>;
}
