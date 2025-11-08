'use client';

import { useEffect, useRef } from 'react';
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

  useEffect(() => {
    const el = adRef.current as unknown as HTMLElement | null;
    if (!el) return;

    // Avoid re-pushing on the same element in dev/StrictMode
    const alreadyInit = el.getAttribute('data-ad-init') === 'true';
    const status = el.getAttribute('data-ad-status') || el.getAttribute('data-adsbygoogle-status');
    if (alreadyInit || status === 'done') return;

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
  }, []);

  return (
    <div className={className ?? ''}>
      {/* Ensure the AdSense library is loaded on the client (deduped by Script id) */}
      <Script
        id="adsense-lib"
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`}
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />
      <ins
        ref={adRef as unknown as React.RefObject<HTMLModElement>}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-format="fluid"
        data-ad-layout-key={layoutKey}
        data-ad-client={clientId}
        data-ad-slot={slotId}
      />
    </div>
  );
}

