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

  // Enhanced router with loading states
  const enhancedRouter = {
    push: useCallback((href: string) => {
      if (href !== pathname) {
        setIsNavigating(true);
        showPageTransition();
        
        // Add a small delay to show the loading animation
        setTimeout(() => {
          router.push(href);
        }, 300);
      }
    }, [router, pathname, showPageTransition]),

    replace: useCallback((href: string) => {
      if (href !== pathname) {
        setIsNavigating(true);
        showPageTransition();
        
        setTimeout(() => {
          router.replace(href);
        }, 300);
      }
    }, [router, pathname, showPageTransition]),

    back: useCallback(() => {
      setIsNavigating(true);
      showPageTransition();
      
      setTimeout(() => {
        router.back();
      }, 300);
    }, [router, showPageTransition]),

    forward: useCallback(() => {
      setIsNavigating(true);
      showPageTransition();
      
      setTimeout(() => {
        router.forward();
      }, 300);
    }, [router, showPageTransition]),

    refresh: useCallback(() => {
      setIsNavigating(true);
      showPageTransition();
      
      setTimeout(() => {
        router.refresh();
      }, 300);
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
      showPageTransition();
      
      setTimeout(() => {
        router.push(href);
        setTimeout(() => hideLoading(), 500);
      }, 300);
    }
  }, [router, pathname, showPageTransition, hideLoading]);

  const replace = useCallback((href: string) => {
    if (href !== pathname) {
      showPageTransition();
      
      setTimeout(() => {
        router.replace(href);
        setTimeout(() => hideLoading(), 500);
      }, 300);
    }
  }, [router, pathname, showPageTransition, hideLoading]);

  const back = useCallback(() => {
    showPageTransition();
    
    setTimeout(() => {
      router.back();
      setTimeout(() => hideLoading(), 500);
    }, 300);
  }, [router, showPageTransition, hideLoading]);

  const forward = useCallback(() => {
    showPageTransition();
    
    setTimeout(() => {
      router.forward();
      setTimeout(() => hideLoading(), 500);
    }, 300);
  }, [router, showPageTransition, hideLoading]);

  const refresh = useCallback(() => {
    showPageTransition();
    
    setTimeout(() => {
      router.refresh();
      setTimeout(() => hideLoading(), 500);
    }, 300);
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
