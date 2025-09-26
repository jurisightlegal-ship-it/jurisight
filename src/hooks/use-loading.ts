'use client';

import { useCallback } from 'react';
import { usePreloader } from '@/components/providers/preloader-provider';

// Re-export usePreloader for convenience
export { usePreloader } from '@/components/providers/preloader-provider';

export function useLoading() {
  const preloader = usePreloader();

  const withLoading = useCallback(async <T>(
    asyncFunction: () => Promise<T>,
    options?: {
      message?: string;
      showProgress?: boolean;
      variant?: 'default' | 'minimal' | 'fullscreen';
    }
  ): Promise<T> => {
    try {
      preloader.setLoading(true, {
        message: options?.message || 'Loading...',
        showProgress: options?.showProgress || false,
        variant: options?.variant || 'default',
        showMessage: true
      });

      const result = await asyncFunction();
      return result;
    } finally {
      preloader.hideLoading();
    }
  }, [preloader]);

  const withProgress = useCallback(async <T>(
    asyncFunction: (updateProgress: (progress: number) => void) => Promise<T>,
    options?: {
      message?: string;
      variant?: 'default' | 'minimal' | 'fullscreen';
    }
  ): Promise<T> => {
    try {
      preloader.setLoading(true, {
        message: options?.message || 'Loading...',
        showProgress: true,
        variant: options?.variant || 'default',
        showMessage: true,
        progress: 0
      });

      const result = await asyncFunction((progress) => {
        preloader.setProgress(progress);
      });

      return result;
    } finally {
      preloader.hideLoading();
    }
  }, [preloader]);

  const withPageTransition = useCallback(async <T>(
    asyncFunction: () => Promise<T>
  ): Promise<T> => {
    try {
      preloader.showPageTransition();
      const result = await asyncFunction();
      return result;
    } finally {
      preloader.hideLoading();
    }
  }, [preloader]);

  return {
    ...preloader,
    withLoading,
    withProgress,
    withPageTransition
  };
}

// Hook for API calls with automatic loading states
export function useAPILoading() {
  const { withLoading, withProgress } = useLoading();

  const fetchWithLoading = useCallback(async <T>(
    url: string,
    options?: RequestInit,
    loadingOptions?: {
      message?: string;
      showProgress?: boolean;
    }
  ): Promise<T> => {
    return withLoading(async () => {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response.json();
    }, loadingOptions);
  }, [withLoading]);

  const fetchWithProgress = useCallback(async <T>(
    url: string,
    options?: RequestInit,
    loadingOptions?: {
      message?: string;
    }
  ): Promise<T> => {
    return withProgress(async (updateProgress) => {
      // Simulate progress updates for long-running requests
      updateProgress(25);
      
      const response = await fetch(url, options);
      
      updateProgress(75);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      updateProgress(100);
      
      return data;
    }, loadingOptions);
  }, [withProgress]);

  return {
    fetchWithLoading,
    fetchWithProgress
  };
}
