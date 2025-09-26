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
    
    // Show loading in browser navigation
    const showBrowserLoading = () => {
      // Update browser loading state
      if (typeof window !== 'undefined') {
        // Update page title to show loading
        window.document.title = 'Loading... | Jurisight';
        
        // Add loading indicator to browser
        const loadingMeta = document.createElement('meta');
        loadingMeta.name = 'loading';
        loadingMeta.content = 'true';
        document.head.appendChild(loadingMeta);
        
        // Add loading class to body for CSS styling
        document.body.classList.add('loading');
        
        // Show browser loading indicator (if supported)
        if ('loading' in document) {
          (document as any).loading = true;
        }
      }
    };
    
    // Hide loading in browser navigation
    const hideBrowserLoading = () => {
      if (typeof window !== 'undefined') {
        // Restore original title
        const originalTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content') || 'Jurisight';
        window.document.title = `${originalTitle} | Jurisight`;
        
        // Remove loading indicator
        const loadingMeta = document.querySelector('meta[name="loading"]');
        if (loadingMeta) {
          loadingMeta.remove();
        }
        
        // Remove loading class from body
        document.body.classList.remove('loading');
        
        // Hide browser loading indicator (if supported)
        if ('loading' in document) {
          (document as any).loading = false;
        }
      }
    };
    
    // Wait for all media to load
    const checkMediaLoaded = () => {
      const images = document.querySelectorAll('img');
      const videos = document.querySelectorAll('video');
      
      let loadedCount = 0;
      const totalMedia = images.length + videos.length;
      
      if (totalMedia === 0) {
        // No media to wait for
        hideBrowserLoading();
        setIsLoading(false);
        return;
      }
      
      const onMediaLoad = () => {
        loadedCount++;
        if (loadedCount >= totalMedia) {
          hideBrowserLoading();
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
        hideBrowserLoading();
        setIsLoading(false);
      }
    };
    
    // Show loading immediately
    showBrowserLoading();
    
    // Check media after a short delay to ensure DOM is ready
    const timer = setTimeout(checkMediaLoaded, 100);
    
    return () => {
      clearTimeout(timer);
      hideBrowserLoading();
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

  return (
    <SimplePreloader isLoading={isLoading}>
      {children}
    </SimplePreloader>
  );
}
