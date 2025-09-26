'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { usePreloader } from '@/components/providers/preloader-provider';

interface NavigationWrapperProps {
  children: React.ReactNode;
}

export function NavigationWrapper({ children }: NavigationWrapperProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { showPageTransition, hideLoading } = usePreloader();
  const [isNavigating, setIsNavigating] = useState(false);

  // Show loading on initial page load
  useEffect(() => {
    const timer = setTimeout(() => {
      hideLoading();
    }, 1000); // Hide after 1 second on initial load

    return () => clearTimeout(timer);
  }, [hideLoading]);

  // Add immediate response to navigation links
  useEffect(() => {
    const handleLinkClick = (e: Event) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a[href]') as HTMLAnchorElement;
      
      if (link && link.href && !link.href.startsWith('mailto:') && !link.href.startsWith('tel:')) {
        const url = new URL(link.href);
        const pathname = url.pathname;
        
        // Only show preloader for internal navigation
        if (pathname.startsWith('/') && !pathname.startsWith('//')) {
          showPageTransition();
        }
      }
    };

    // Add event listeners for immediate response
    document.addEventListener('click', handleLinkClick, true);
    document.addEventListener('touchstart', handleLinkClick, true);

    return () => {
      document.removeEventListener('click', handleLinkClick, true);
      document.removeEventListener('touchstart', handleLinkClick, true);
    };
  }, [showPageTransition]);

  // Enhanced router with loading states
  const enhancedRouter = {
    push: useCallback((href: string) => {
      if (href !== pathname) {
        // Show preloader immediately
        showPageTransition();
        setIsNavigating(true);
        
        // Navigate immediately with minimal delay
        setTimeout(() => {
          router.push(href);
        }, 50);
      }
    }, [router, pathname, showPageTransition]),

    replace: useCallback((href: string) => {
      if (href !== pathname) {
        // Show preloader immediately
        showPageTransition();
        setIsNavigating(true);
        
        setTimeout(() => {
          router.replace(href);
        }, 50);
      }
    }, [router, pathname, showPageTransition]),

    back: useCallback(() => {
      // Show preloader immediately
      showPageTransition();
      setIsNavigating(true);
      
      setTimeout(() => {
        router.back();
      }, 50);
    }, [router, showPageTransition]),

    forward: useCallback(() => {
      // Show preloader immediately
      showPageTransition();
      setIsNavigating(true);
      
      setTimeout(() => {
        router.forward();
      }, 50);
    }, [router, showPageTransition]),

    refresh: useCallback(() => {
      // Show preloader immediately
      showPageTransition();
      setIsNavigating(true);
      
      setTimeout(() => {
        router.refresh();
      }, 50);
    }, [router, showPageTransition])
  };

  // Hide loading when navigation completes
  useEffect(() => {
    if (isNavigating) {
      const timer = setTimeout(() => {
        setIsNavigating(false);
        hideLoading();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isNavigating, hideLoading]);

  return (
    <div className="navigation-wrapper">
      {children}
    </div>
  );
}

// Custom hook for enhanced navigation
export function useEnhancedRouter() {
  const router = useRouter();
  const pathname = usePathname();
  const { showPageTransition, hideLoading } = usePreloader();

  const push = useCallback((href: string) => {
    if (href !== pathname) {
      // Show preloader immediately
      showPageTransition();
      
      setTimeout(() => {
        router.push(href);
        setTimeout(() => hideLoading(), 200);
      }, 50);
    }
  }, [router, pathname, showPageTransition, hideLoading]);

  const replace = useCallback((href: string) => {
    if (href !== pathname) {
      // Show preloader immediately
      showPageTransition();
      
      setTimeout(() => {
        router.replace(href);
        setTimeout(() => hideLoading(), 200);
      }, 50);
    }
  }, [router, pathname, showPageTransition, hideLoading]);

  const back = useCallback(() => {
    // Show preloader immediately
    showPageTransition();
    
    setTimeout(() => {
      router.back();
      setTimeout(() => hideLoading(), 200);
    }, 50);
  }, [router, showPageTransition, hideLoading]);

  const forward = useCallback(() => {
    // Show preloader immediately
    showPageTransition();
    
    setTimeout(() => {
      router.forward();
      setTimeout(() => hideLoading(), 200);
    }, 50);
  }, [router, showPageTransition, hideLoading]);

  const refresh = useCallback(() => {
    // Show preloader immediately
    showPageTransition();
    
    setTimeout(() => {
      router.refresh();
      setTimeout(() => hideLoading(), 200);
    }, 50);
  }, [router, showPageTransition, hideLoading]);

  return {
    push,
    replace,
    back,
    forward,
    refresh,
    // Pass through other router properties
    ...router
  };
}
