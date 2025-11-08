'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';

interface FluidInlineAdProps {
  className?: string;
  clientId?: string;
  slotId?: string;
  layoutKey?: string;
}

// AdSense fluid inline unit with duplicate-init guards for dev/StrictMode
export function FluidInlineAd({
  className,
  clientId = 'ca-pub-5234388962916973',
  slotId = '9663037526',
  layoutKey = '-6t+ed+2i-1n-4w',
}: FluidInlineAdProps) {
  const adRef = useRef<HTMLModElement | HTMLDivElement | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const isDev = process.env.NODE_ENV !== 'production';
  const [devHoldVisible, setDevHoldVisible] = useState(isDev);

  useEffect(() => {
    const el = adRef.current as unknown as HTMLElement | null;
    if (!el) return;

    // Avoid re-pushing on the same element in dev/StrictMode
    const alreadyInit = el.getAttribute('data-ad-init') === 'true';
    if (!alreadyInit) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).adsbygoogle = (window as any).adsbygoogle || [];
        // Mark as init before push to guard double invocation during HMR
        el.setAttribute('data-ad-init', 'true');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).adsbygoogle.push({});
      } catch (err) {
        // Ignore duplicate init errors thrown by AdSense
        console.warn('AdSense push skipped:', err);
      }
    }

    // Consider the ad "loaded" only when a creative iframe appears and has height
    function markIfRendered() {
      const iframe = el.querySelector('iframe');
      if (iframe && (iframe as HTMLIFrameElement).offsetHeight > 0 && el.offsetHeight > 0) setIsLoaded(true);
    }

    // Initial check
    markIfRendered();

    // Observe style/attribute changes that AdSense applies
    const mutationObserver = new MutationObserver(markIfRendered);
    mutationObserver.observe(el, {
      attributes: true,
      attributeFilter: ['style', 'data-adsbygoogle-status', 'data-ad-status'],
      childList: true,
      subtree: true,
    });

    // Also watch for size changes explicitly
    const resizeObserver = new ResizeObserver(markIfRendered);
    resizeObserver.observe(el);

    // Poll as a fallback in dev where mutation events may be noisy
    const interval = window.setInterval(markIfRendered, 800);

    return () => {
      mutationObserver.disconnect();
      resizeObserver.disconnect();
      window.clearInterval(interval);
    };
  }, []);

  // In development, ensure the placeholder is visible briefly so it’s noticeable
  useEffect(() => {
    if (!isDev) return;
    const t = window.setTimeout(() => setDevHoldVisible(false), 3000);
    return () => window.clearTimeout(t);
  }, [isDev]);

  return (
    <div className={className ?? ''}>
      {/* Ensure the AdSense library is loaded on the client (deduped by Script id) */}
      <Script
        id="adsense-lib"
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`}
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />
      <div className="relative min-h-[100px]">
        {(!isLoaded || devHoldVisible) && (
          <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center rounded-md border border-yellow-300 bg-yellow-50">
            <span className="text-xs font-medium text-black/70">Advertisement</span>
          </div>
        )}
        <ins
          ref={adRef as unknown as React.RefObject<HTMLModElement>}
          className="adsbygoogle z-0 block w-full"
          style={{ display: 'block', textAlign: 'center' }}
          data-ad-format="fluid"
          data-ad-layout-key={layoutKey}
          data-ad-client={clientId}
          data-ad-slot={slotId}
          data-adtest={isDev ? 'on' : undefined}
          aria-label="Advertisement"
        />
      </div>
    </div>
  );
}
