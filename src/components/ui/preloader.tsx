'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PreloaderProps {
  isLoading: boolean;
  message?: string;
  progress?: number;
  variant?: 'default' | 'minimal' | 'fullscreen';
  showProgress?: boolean;
  showMessage?: boolean;
  className?: string;
}

export function Preloader({
  isLoading,
  message = 'Loading...',
  progress,
  variant = 'default',
  showProgress = false,
  showMessage = true,
  className = ''
}: PreloaderProps) {
  const [displayMessage, setDisplayMessage] = useState(message);

  useEffect(() => {
    if (message) {
      setDisplayMessage(message);
    }
  }, [message]);

  if (!isLoading) return null;

  const variants = {
    default: {
      container: 'fixed inset-0 z-50 bg-white/95 backdrop-blur-sm flex items-center justify-center',
      spinner: 'w-16 h-16 border-4 border-gray-200 border-t-jurisight-royal rounded-full animate-spin',
      content: 'text-center space-y-4'
    },
    minimal: {
      container: 'flex items-center justify-center p-4',
      spinner: 'w-8 h-8 border-2 border-gray-200 border-t-jurisight-royal rounded-full animate-spin',
      content: 'text-center space-y-2'
    },
    fullscreen: {
      container: 'fixed inset-0 z-50 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center',
      spinner: 'w-24 h-24 border-4 border-white/20 border-t-white rounded-full animate-spin',
      content: 'text-center space-y-6 text-white'
    }
  };

  const currentVariant = variants[variant];

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className={`${currentVariant.container} ${className}`}
        >
          <div className={currentVariant.content}>
            {/* Removed background element - only spinner remains */}

            {/* Spinner */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="flex justify-center"
            >
              <div className={currentVariant.spinner} />
            </motion.div>

            {/* Progress Bar */}
            {showProgress && progress !== undefined && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: '100%', opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="w-64 mx-auto"
              >
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-jurisight-royal to-blue-600 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-2">{progress}%</p>
              </motion.div>
            )}

            {/* Loading Message */}
            {showMessage && displayMessage && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="space-y-2"
              >
                <p className={`text-lg font-medium ${variant === 'fullscreen' ? 'text-white' : 'text-gray-900'}`}>
                  {displayMessage}
                </p>
                {variant === 'fullscreen' && (
                  <div className="flex justify-center space-x-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 bg-white rounded-full"
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{
                          duration: 0.6,
                          repeat: Infinity,
                          delay: i * 0.2
                        }}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Additional Loading Animation for Fullscreen */}
            {variant === 'fullscreen' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="absolute inset-0 pointer-events-none"
              >
                <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/30 rounded-full animate-pulse" />
                <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-white/20 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
                <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-white/25 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute bottom-1/3 right-1/3 w-1 h-1 bg-white/15 rounded-full animate-pulse" style={{ animationDelay: '1.5s' }} />
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Page Transition Preloader
export function PageTransitionPreloader() {
  return (
    <Preloader
      isLoading={true}
      message="Loading page..."
      variant="fullscreen"
      showProgress={false}
      showMessage={true}
    />
  );
}

// API Loading Preloader
export function APILoadingPreloader({ message = 'Loading data...' }: { message?: string }) {
  return (
    <Preloader
      isLoading={true}
      message={message}
      variant="default"
      showProgress={false}
      showMessage={true}
    />
  );
}

// Minimal Inline Preloader
export function InlinePreloader({ message = 'Loading...' }: { message?: string }) {
  return (
    <Preloader
      isLoading={true}
      message={message}
      variant="minimal"
      showProgress={false}
      showMessage={true}
    />
  );
}
