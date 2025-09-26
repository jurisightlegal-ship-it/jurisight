'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Preloader } from '@/components/ui/preloader';

interface PreloaderContextType {
  isLoading: boolean;
  message: string;
  progress: number;
  showProgress: boolean;
  showMessage: boolean;
  variant: 'default' | 'minimal' | 'fullscreen';
  setLoading: (loading: boolean, options?: PreloaderOptions) => void;
  setMessage: (message: string) => void;
  setProgress: (progress: number) => void;
  showPageTransition: () => void;
  showAPILoading: (message?: string) => void;
  showInlineLoading: (message?: string) => void;
  hideLoading: () => void;
}

interface PreloaderOptions {
  message?: string;
  progress?: number;
  showProgress?: boolean;
  showMessage?: boolean;
  variant?: 'default' | 'minimal' | 'fullscreen';
}

const PreloaderContext = createContext<PreloaderContextType | undefined>(undefined);

export function usePreloader() {
  const context = useContext(PreloaderContext);
  if (context === undefined) {
    throw new Error('usePreloader must be used within a PreloaderProvider');
  }
  return context;
}

interface PreloaderProviderProps {
  children: ReactNode;
}

export function PreloaderProvider({ children }: PreloaderProviderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessageState] = useState('Loading...');
  const [progress, setProgressState] = useState(0);
  const [showProgress, setShowProgress] = useState(false);
  const [showMessage, setShowMessage] = useState(true);
  const [variant, setVariant] = useState<'default' | 'minimal' | 'fullscreen'>('default');

  const setLoading = useCallback((loading: boolean, options?: PreloaderOptions) => {
    setIsLoading(loading);
    
    if (options) {
      if (options.message !== undefined) {
        setMessageState(options.message);
      }
      if (options.progress !== undefined) {
        setProgressState(options.progress);
      }
      if (options.showProgress !== undefined) {
        setShowProgress(options.showProgress);
      }
      if (options.showMessage !== undefined) {
        setShowMessage(options.showMessage);
      }
      if (options.variant !== undefined) {
        setVariant(options.variant);
      }
    }
  }, []);

  const setMessage = useCallback((newMessage: string) => {
    setMessageState(newMessage);
  }, []);

  const setProgress = useCallback((newProgress: number) => {
    setProgressState(newProgress);
  }, []);

  const showPageTransition = useCallback(() => {
    setLoading(true, {
      message: 'Loading page...',
      variant: 'fullscreen',
      showProgress: false,
      showMessage: true
    });
  }, [setLoading]);

  const showAPILoading = useCallback((loadingMessage?: string) => {
    setLoading(true, {
      message: loadingMessage || 'Loading data...',
      variant: 'default',
      showProgress: false,
      showMessage: true
    });
  }, [setLoading]);

  const showInlineLoading = useCallback((loadingMessage?: string) => {
    setLoading(true, {
      message: loadingMessage || 'Loading...',
      variant: 'minimal',
      showProgress: false,
      showMessage: true
    });
  }, [setLoading]);

  const hideLoading = useCallback(() => {
    setIsLoading(false);
  }, []);

  const value: PreloaderContextType = {
    isLoading,
    message,
    progress,
    showProgress,
    showMessage,
    variant,
    setLoading,
    setMessage,
    setProgress,
    showPageTransition,
    showAPILoading,
    showInlineLoading,
    hideLoading
  };

  return (
    <PreloaderContext.Provider value={value}>
      {children}
      <Preloader
        isLoading={isLoading}
        message={message}
        progress={progress}
        variant={variant}
        showProgress={showProgress}
        showMessage={showMessage}
      />
    </PreloaderContext.Provider>
  );
}
