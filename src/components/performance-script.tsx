'use client';

import { useEffect } from 'react';
import { measureWebVitals } from '@/lib/performance';

export function PerformanceScript() {
  useEffect(() => {
    // Measure Web Vitals
    measureWebVitals();

    // Preload critical resources
    const preloadCriticalResources = () => {
      // Preload critical CSS
      const criticalCSS = document.createElement('link');
      criticalCSS.rel = 'preload';
      criticalCSS.href = '/_next/static/css/app/layout.css';
      criticalCSS.as = 'style';
      document.head.appendChild(criticalCSS);

      // Preload critical fonts
      const interFont = document.createElement('link');
      interFont.rel = 'preload';
      interFont.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
      interFont.as = 'style';
      document.head.appendChild(interFont);
    };

    preloadCriticalResources();

    // Resource hints
    const addResourceHints = () => {
      // DNS prefetch for external domains
      const domains = [
        'https://fonts.googleapis.com',
        'https://fonts.gstatic.com',
        'https://images.unsplash.com',
        'https://xxrajbmlbjlgihncivxi.supabase.co'
      ];

      domains.forEach(domain => {
        const link = document.createElement('link');
        link.rel = 'dns-prefetch';
        link.href = domain;
        document.head.appendChild(link);
      });
    };

    addResourceHints();
  }, []);

  return null;
}
