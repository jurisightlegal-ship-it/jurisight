'use client';

import { useEffect, useState } from 'react';

interface SimplePreloaderProps {
  isLoading: boolean;
  children: React.ReactNode;
  onSkip?: () => void;
}

export function SimplePreloader({ isLoading, children, onSkip }: SimplePreloaderProps) {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      // Immediate transition for better responsiveness
      setShowContent(true);
    } else {
      setShowContent(false);
    }
  }, [isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          {/* Spinner */}
          <div className="relative">
            <div className="w-12 h-12 border-4 border-gray-200 rounded-full animate-spin border-t-blue-600 mx-auto mb-4"></div>
            <div className="w-8 h-8 border-4 border-gray-200 rounded-full animate-spin border-t-blue-400 mx-auto absolute top-2 left-1/2 transform -translate-x-1/2"></div>
          </div>
          
          {/* Loading text */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-gray-900">Loading Article</h3>
            <p className="text-sm text-gray-500">Please wait while we fetch the content...</p>
          </div>
          
          {/* Progress dots */}
          <div className="flex justify-center space-x-1 mt-4">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
          
          {/* Skip button */}
          {onSkip && (
            <button
              onClick={onSkip}
              className="mt-6 text-sm text-blue-600 hover:text-blue-800 underline transition-colors"
            >
              Click to continue
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`transition-opacity duration-150 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
      {children}
    </div>
  );
}
