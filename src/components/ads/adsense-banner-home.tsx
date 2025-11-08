"use client";

import React from "react";
import Script from "next/script";

interface AdsenseBannerHomeProps {
  clientId?: string;
  slotId?: string;
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle: Array<unknown>;
  }
}

export function AdsenseBannerHome({
  clientId = "ca-pub-5234388962916973",
  slotId = "8290246107",
  className,
}: AdsenseBannerHomeProps) {
  const initializedRef = React.useRef(false);
  const insRef = React.useRef<HTMLModElement | null>(null);

  React.useEffect(function () {
    if (initializedRef.current) return;
    initializedRef.current = true;
    try {
      // Initialize the ad slot when the script is available.
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // No-op: AdSense may block double initialization in dev.
    }
  }, []);

  return (
    <div className={className ?? ""}>
      {/* Ensure the AdSense library is loaded on the client */}
      <Script
        id="adsense-lib"
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`}
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />
      <ins
        ref={insRef}
        className="adsbygoogle"
        style={{ display: "block", lineHeight: 0 }}
        data-ad-client={clientId}
        data-ad-slot={slotId}
        data-ad-format="horizontal"
        data-full-width-responsive="true"
        aria-label="Advertisement"
      />
    </div>
  );
}
