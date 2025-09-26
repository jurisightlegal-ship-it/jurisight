"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  X, 
  Mail, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Sparkles,
  Download,
  Calendar,
  BookOpen
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MagazinePopupProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export function MagazinePopup({ isOpen, onClose, className }: MagazinePopupProps) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Close popup on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    setIsSuccess(false);

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || 'Successfully subscribed! You won\'t miss our magazine launch.');
        setIsSuccess(true);
        setEmail("");
      } else {
        setMessage(data.error || 'Failed to subscribe to newsletter');
        setIsSuccess(false);
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      setMessage('An error occurred. Please try again.');
      setIsSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Popup Content */}
      <Card className={cn(
        "relative w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden bg-white dark:bg-gray-900 shadow-2xl",
        "animate-in zoom-in-95 duration-300",
        "mx-2 sm:mx-0", // Add horizontal margin on mobile
        className
      )}>
        <CardContent className="p-0">
          <div className="flex flex-col lg:flex-row h-full">
            {/* Magazine Cover Section */}
            <div className="lg:w-1/2 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-center min-h-[40vh] lg:min-h-auto">
              {/* Close Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 h-8 w-8 p-0 hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>

              {/* Magazine Cover */}
              <div className="relative w-full max-w-xs sm:max-w-sm mx-auto mb-4 sm:mb-6">
                <div className="aspect-[3/4] relative rounded-lg overflow-hidden shadow-2xl">
                  <Image
                    src="/Cover.svg"
                    alt="Jurisight Legal Magazine Cover"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
                
                {/* Magazine Badge */}
                <div className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3">
                  <Badge className="bg-red-500 text-white px-2 py-1 sm:px-3 text-xs sm:text-sm font-bold shadow-lg">
                    FREE
                  </Badge>
                </div>
              </div>

              {/* Magazine Info */}
              <div className="text-center space-y-2 sm:space-y-3 px-2">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  Jurisight Legal Magazine
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base lg:text-lg">
                  Your comprehensive guide to Indian law
                </p>
                
                <div className="flex items-center justify-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>Monthly</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>Expert Articles</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Newsletter Signup Section */}
            <div className="lg:w-1/2 p-4 sm:p-6 lg:p-8 flex flex-col justify-center min-h-[50vh] lg:min-h-auto">
              <div className="max-w-md mx-auto w-full space-y-4 sm:space-y-6">
                {/* Header */}
                <div className="text-center space-y-2">
                  <div className="flex justify-center mb-3 sm:mb-4">
                    <Badge 
                      variant="secondary" 
                      className="bg-blue-100 text-blue-700 border-blue-200 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium"
                    >
                      <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                      Don't Miss Out
                    </Badge>
                  </div>
                  
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                    Get Our Free Magazine
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base lg:text-lg leading-relaxed">
                    Subscribe to our newsletter and be the first to know when our legal magazine launches. 
                    Get exclusive access to expert legal insights, case studies, and practical guides.
                  </p>
                </div>

                {/* Newsletter Form */}
                <form onSubmit={handleNewsletterSubmit} className="space-y-3 sm:space-y-4">
                  <div className="relative">
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        placeholder="Enter your email address"
                        className="pl-10 h-11 sm:h-12 text-sm sm:text-base"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full h-11 sm:h-12 text-sm sm:text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={isSubmitting || !email.trim()}
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 mr-2 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    )}
                    <span className="hidden sm:inline">
                      {isSubmitting ? 'Subscribing...' : 'Subscribe & Get Notified'}
                    </span>
                    <span className="sm:hidden">
                      {isSubmitting ? 'Subscribing...' : 'Subscribe'}
                    </span>
                  </Button>
                </form>
                
                {/* Message Display */}
                {message && (
                  <div className={cn(
                    "p-3 sm:p-4 rounded-lg text-xs sm:text-sm font-medium animate-in slide-in-from-top-2 duration-300",
                    isSuccess 
                      ? 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-300' 
                      : 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-300'
                  )}>
                    <div className="flex items-center gap-2">
                      {isSuccess ? (
                        <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 text-red-500 flex-shrink-0" />
                      )}
                      <span className="break-words">{message}</span>
                    </div>
                  </div>
                )}

                {/* Trust Indicators */}
                <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 flex-shrink-0" />
                    <span>No spam, ever</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 flex-shrink-0" />
                    <span>Unsubscribe anytime</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 flex-shrink-0" />
                    <span>Early access to magazine</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Hook to manage popup state
export function useMagazinePopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  const openPopup = () => setIsOpen(true);
  const closePopup = () => {
    setIsOpen(false);
    setHasShown(true);
  };

  // Auto-show popup after 3 seconds on first visit
  useEffect(() => {
    const hasShownBefore = localStorage.getItem('magazine-popup-shown');
    if (!hasShownBefore) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Save to localStorage when popup is shown
  useEffect(() => {
    if (hasShown) {
      localStorage.setItem('magazine-popup-shown', 'true');
    }
  }, [hasShown]);

  return {
    isOpen,
    openPopup,
    closePopup,
    hasShown
  };
}
