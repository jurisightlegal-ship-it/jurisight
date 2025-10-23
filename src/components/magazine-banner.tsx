"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { BookOpen, Download, X } from "lucide-react";
import { useMagazinePopupContext } from "./magazine-popup-provider";
import { cn } from "@/lib/utils";

interface MagazineBannerProps {
  className?: string;
  onDismiss?: () => void;
  isDismissed?: boolean;
}

export function MagazineBanner({ className, onDismiss, isDismissed }: MagazineBannerProps) {
  const { openPopup } = useMagazinePopupContext();

  const [dismissed, setDismissed] = useState(false);
  useEffect(() => {
    try {
      const flag = typeof window !== 'undefined' && localStorage.getItem('magazine-banner-dismissed') === 'true';
      if (flag) setDismissed(true);
    } catch {}
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    try { localStorage.setItem('magazine-banner-dismissed', 'true'); } catch {}
  };

  const hidden = !!isDismissed || dismissed;
  if (hidden) {
    return null;
  }

  const handleGetMagazine = () => {
    openPopup();
  };

  return (
    <div className={cn(
      "relative w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 px-3 sm:py-3 sm:px-4 shadow-sm",
      "border-b border-blue-500/20",
      className
    )}>
      {/* Dismiss (X) button */}
      <button
        onClick={onDismiss ? onDismiss : handleDismiss}
        className="absolute right-2 top-2 text-blue-100 hover:text-white transition-colors p-1"
        aria-label="Dismiss banner"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center gap-2 sm:gap-0 justify-center sm:justify-between">
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:flex-1">
          <div className="flex items-center gap-2 mr-0 sm:mr-4 font-bold">
            <BookOpen className="h-5 w-5 text-blue-100" />
            <span className="text-sm font-bold">
              Get Our Legal Magazine Free
            </span>
          </div>
          <div className="block text-xs text-blue-100 font-bold mt-1 sm:mt-0">
            Stay updated with the latest legal insights and analysis
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-end mt-2 sm:mt-0">
          <Button
            onClick={handleGetMagazine}
            size="sm"
            variant="secondary"
            className="bg-white text-blue-700 hover:bg-blue-50 font-medium text-sm px-4 py-2 h-8 w-full sm:w-auto"
          >
            <Download className="h-4 w-4 mr-1.5" />
            Get Magazine
          </Button>
        </div>
      </div>
    </div>
  );
}