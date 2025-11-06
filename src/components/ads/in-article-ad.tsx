'use client';

import { useEffect, useRef } from 'react';

interface InArticleAdProps {
  className?: string;
}

// Client-only AdSense in-article unit with duplicate-init guards for dev/StrictMode
export function InArticleAd({ className }: InArticleAdProps) {
  const adRef = useRef<HTMLDivElement | HTMLModElement | null>(null);

  useEffect(() => {
    const initAd = () => {
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
    };

    // Rely on global loader; retry until library is present, then init
    const tryInit = (attempts = 0) => {
      const el = adRef.current as unknown as HTMLElement | null;
      if (!el) return;
      const status = el.getAttribute('data-ad-status') || el.getAttribute('data-adsbygoogle-status');
      if (status === 'done') return;

      const libReady = typeof (window as any).adsbygoogle !== 'undefined';
      if (libReady) {
        initAd();
        return;
      }
      if (attempts < 50) {
        setTimeout(() => tryInit(attempts + 1), 200);
      }
    };

    tryInit();
  }, []);

  return (
    <ins
      ref={adRef as React.RefObject<HTMLModElement>}
      className={`adsbygoogle ${className || ''}`}
      style={{ display: 'block', textAlign: 'center' }}
      data-ad-layout="in-article"
      data-ad-format="fluid"
      data-ad-client="ca-pub-5234388962916973"
      data-ad-slot="4967962667"
    />
  );
}
