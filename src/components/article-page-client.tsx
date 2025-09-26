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
    
    // Wait for all media to load
    const checkMediaLoaded = () => {
      const images = document.querySelectorAll('img');
      const videos = document.querySelectorAll('video');
      
      let loadedCount = 0;
      const totalMedia = images.length + videos.length;
      
      if (totalMedia === 0) {
        // No media to wait for
        setIsLoading(false);
        return;
      }
      
      const onMediaLoad = () => {
        loadedCount++;
        if (loadedCount >= totalMedia) {
          setIsLoading(false);
        }
      };
      
      // Check if images are already loaded
      images.forEach(img => {
        if (img.complete) {
          loadedCount++;
        } else {
          img.addEventListener('load', onMediaLoad);
          img.addEventListener('error', onMediaLoad); // Count errors as loaded
        }
      });
      
      // Check if videos are already loaded
      videos.forEach(video => {
        if (video.readyState >= 3) { // HAVE_FUTURE_DATA or higher
          loadedCount++;
        } else {
          video.addEventListener('canplay', onMediaLoad);
          video.addEventListener('error', onMediaLoad);
        }
      });
      
      // If all media is already loaded
      if (loadedCount >= totalMedia) {
        setIsLoading(false);
      }
    };
    
    // Check media after a short delay to ensure DOM is ready
    const timer = setTimeout(checkMediaLoaded, 100);
    
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

  return (
    <SimplePreloader isLoading={isLoading}>
      {children}
    </SimplePreloader>
  );
}
