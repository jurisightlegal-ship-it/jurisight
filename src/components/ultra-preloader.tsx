'use client';

import { useEffect } from 'react';

export function UltraPreloader() {
  useEffect(() => {
    // Preload critical resources immediately
    const preloadCriticalResources = () => {
      // Preload critical CSS
      const criticalCSS = document.createElement('link');
      criticalCSS.rel = 'preload';
      criticalCSS.href = '/_next/static/css/app/layout.css';
      criticalCSS.as = 'style';
      criticalCSS.onload = () => {
        criticalCSS.rel = 'stylesheet';
      };
      document.head.appendChild(criticalCSS);

      // Preload critical fonts
      const interFont = document.createElement('link');
      interFont.rel = 'preload';
      interFont.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
      interFont.as = 'style';
      interFont.onload = () => {
        interFont.rel = 'stylesheet';
      };
      document.head.appendChild(interFont);

      // Preload critical images
      const preloadImage = (src: string) => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = src;
        document.head.appendChild(link);
      };

      // Preload likely next page resources
      const prefetchPage = (href: string) => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = href;
        document.head.appendChild(link);
      };

      // Prefetch likely next pages
      prefetchPage('/articles');
      prefetchPage('/business');
      prefetchPage('/supreme-court-judgements');
    };

    // DNS prefetch for external domains
    const addDNSPrefetch = () => {
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

    // Preconnect to critical origins
    const addPreconnect = () => {
      const origins = [
        'https://fonts.googleapis.com',
        'https://fonts.gstatic.com'
      ];

      origins.forEach(origin => {
        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = origin;
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
      });
    };

    // Register service worker
    const registerServiceWorker = async () => {
      if ('serviceWorker' in navigator) {
        try {
          await navigator.register('/sw.js');
          console.log('🚀 Service Worker registered successfully');
        } catch (error) {
          console.log('Service Worker registration failed:', error);
        }
      }
    };

    // Execute all optimizations
    preloadCriticalResources();
    addDNSPrefetch();
    addPreconnect();
    registerServiceWorker();

    // Preload on hover for better UX
    const addHoverPreloading = () => {
      const links = document.querySelectorAll('a[href^="/"]');
      links.forEach(link => {
        link.addEventListener('mouseenter', () => {
          const href = link.getAttribute('href');
          if (href && !document.querySelector(`link[href="${href}"][rel="prefetch"]`)) {
            const prefetchLink = document.createElement('link');
            prefetchLink.rel = 'prefetch';
            prefetchLink.href = href;
            document.head.appendChild(prefetchLink);
          }
        }, { once: true });
      });
    };

    // Add hover preloading after a delay
    setTimeout(addHoverPreloading, 1000);

  }, []);

  return null;
}
