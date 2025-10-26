'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Cookie, 
  X, 
  Settings, 
  CheckCircle, 
  AlertCircle,
  Info,
  Shield,
  Eye,
  Database,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';

// Global type declarations for analytics
declare global {
  interface Window {
    gtag: (command: string, ...args: any[]) => void;
    clarity: any;
  }
}

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  functional: boolean;
  marketing: boolean;
}

interface CookieConsent {
  essential: boolean;
  analytics: boolean;
  functional: boolean;
  marketing: boolean;
  timestamp: string;
  version: string;
}

export function CookieNotice() {
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true, // Always true, cannot be disabled
    analytics: false,
    functional: false,
    marketing: false
  });

  const CONSENT_VERSION = '1.0';

  useEffect(() => {
    // Check if user has already made a choice
    const cookieConsent = localStorage.getItem('cookie-consent');
    if (!cookieConsent) {
      setIsVisible(true);
    } else {
      // Check if consent version is outdated
      try {
        const consent: CookieConsent = JSON.parse(cookieConsent);
        if (consent.version !== CONSENT_VERSION) {
          setIsVisible(true);
        }
      } catch (error) {
        // Invalid consent data, show notice
        setIsVisible(true);
      }
    }
  }, []);

  const handleAcceptAll = () => {
    const consent: CookieConsent = {
      essential: true,
      analytics: true,
      functional: true,
      marketing: false, // We don't use marketing cookies currently
      timestamp: new Date().toISOString(),
      version: CONSENT_VERSION
    };
    
    localStorage.setItem('cookie-consent', JSON.stringify(consent));
    setIsVisible(false);
    
    // Enable Google Analytics consent mode
    enableGoogleAnalyticsConsent();
    // Enable Microsoft Clarity
    enableClarityConsent();
  };

  const handleRejectAll = () => {
    const consent: CookieConsent = {
      essential: true,
      analytics: false,
      functional: false,
      marketing: false,
      timestamp: new Date().toISOString(),
      version: CONSENT_VERSION
    };
    
    localStorage.setItem('cookie-consent', JSON.stringify(consent));
    setIsVisible(false);
    
    // Disable Google Analytics consent mode
    disableGoogleAnalyticsConsent();
    // Disable Microsoft Clarity
    disableClarityConsent();
  };

  const handleSavePreferences = () => {
    const consent: CookieConsent = {
      ...preferences,
      timestamp: new Date().toISOString(),
      version: CONSENT_VERSION
    };
    
    localStorage.setItem('cookie-consent', JSON.stringify(consent));
    setIsVisible(false);
    setShowSettings(false);
    
    // Enable/disable analytics based on preferences
    if (preferences.analytics) {
      enableGoogleAnalyticsConsent();
      enableClarityConsent();
    } else {
      disableGoogleAnalyticsConsent();
      disableClarityConsent();
    }
  };

  const enableGoogleAnalyticsConsent = () => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'granted',
        ad_storage: 'denied', // We don't use ads
        ad_user_data: 'denied',
        ad_personalization: 'denied'
      });
    }
  };

  const disableGoogleAnalyticsConsent = () => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'denied',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied'
      });
    }
  };

  const enableClarityConsent = () => {
    if (typeof window !== 'undefined' && window.clarity) {
      window.clarity('consent', true);
    }
  };

  const disableClarityConsent = () => {
    if (typeof window !== 'undefined' && window.clarity) {
      window.clarity('consent', false);
    }
  };

  const handleCustomize = () => {
    setShowSettings(true);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="bg-white border-t border-gray-200 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {!showSettings ? (
            // Modern cookie alert banner
            <div className="py-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center">
                      <Cookie className="h-4 w-4 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      We use cookies to enhance your experience and analyze site usage. 
                      <Link href="/privacy" className="text-blue-600 hover:text-blue-700 underline mx-1">
                        Learn more
                      </Link>
                      about our privacy practices.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    onClick={handleCustomize}
                    variant="ghost"
                    size="sm"
                    className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-1.5 h-auto text-sm font-medium"
                  >
                    Customize
                  </Button>
                  <Button
                    onClick={handleRejectAll}
                    variant="outline"
                    size="sm"
                    className="border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-1.5 h-auto text-sm font-medium"
                  >
                    Decline
                  </Button>
                  <Button
                    onClick={handleAcceptAll}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 h-auto text-sm font-medium shadow-sm"
                  >
                    Accept All
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            // Modern cookie preferences modal
            <div className="py-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center">
                    <Settings className="h-4 w-4 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Cookie Preferences
                  </h3>
                </div>
                <Button
                  onClick={() => setShowSettings(false)}
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full w-8 h-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                {/* Essential Cookies */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                        <Shield className="h-5 w-5 text-green-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-gray-900">Essential Cookies</h4>
                        <Badge className="bg-green-100 text-green-700 border-0 text-xs px-2 py-1">
                          Required
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                        These cookies are necessary for the platform to function properly. They enable 
                        authentication, security, session management, and basic functionality.
                      </p>
                      <div className="flex items-center gap-2 text-sm text-green-700 mb-2">
                        <CheckCircle className="h-4 w-4" />
                        <span>Always active - cannot be disabled</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        <strong>Examples:</strong> Authentication tokens, CSRF protection, session management
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Analytics Cookies */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                        <Eye className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <h4 className="font-semibold text-gray-900">Analytics Cookies</h4>
                          <Badge className="bg-blue-100 text-blue-700 border-0 text-xs px-2 py-1">
                            Optional
                          </Badge>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            id="analytics"
                            checked={preferences.analytics}
                            onChange={(e) => setPreferences(prev => ({ ...prev, analytics: e.target.checked }))}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                      <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                        These cookies help us understand how our platform is used so we can improve 
                        the user experience and content quality. We use Google Analytics and Microsoft Clarity.
                      </p>
                      <div className="text-xs text-gray-500">
                        <strong>Examples:</strong> Page views, user interactions, performance metrics
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Functional Cookies */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                        <Settings className="h-5 w-5 text-purple-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <h4 className="font-semibold text-gray-900">Functional Cookies</h4>
                          <Badge className="bg-purple-100 text-purple-700 border-0 text-xs px-2 py-1">
                            Optional
                          </Badge>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            id="functional"
                            checked={preferences.functional}
                            onChange={(e) => setPreferences(prev => ({ ...prev, functional: e.target.checked }))}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                        </label>
                      </div>
                      <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                        These cookies remember your preferences and settings to provide a personalized 
                        experience across visits.
                      </p>
                      <div className="text-xs text-gray-500">
                        <strong>Examples:</strong> Theme preferences, language settings, display options
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Marketing Cookies */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm opacity-75">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
                        <Database className="h-5 w-5 text-gray-500" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <h4 className="font-semibold text-gray-900">Marketing Cookies</h4>
                          <Badge className="bg-gray-100 text-gray-600 border-0 text-xs px-2 py-1">
                            Not Used
                          </Badge>
                        </div>
                        <label className="relative inline-flex items-center cursor-not-allowed">
                          <input
                            type="checkbox"
                            id="marketing"
                            checked={preferences.marketing}
                            onChange={(e) => setPreferences(prev => ({ ...prev, marketing: e.target.checked }))}
                            disabled
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-disabled:opacity-50"></div>
                        </label>
                      </div>
                      <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                        We currently do not use marketing cookies or third-party advertising tracking.
                      </p>
                      <div className="text-xs text-gray-500">
                        <strong>Note:</strong> We do not use third-party advertising or marketing tracking
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
                <Button
                  onClick={() => setShowSettings(false)}
                  variant="outline"
                  className="flex-1 sm:flex-none border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2.5 h-auto font-medium"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSavePreferences}
                  className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 h-auto font-medium shadow-sm"
                >
                  Save Preferences
                </Button>
              </div>
              
              <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl mt-4">
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <Info className="h-3 w-3 text-blue-600" />
                  </div>
                </div>
                <div className="text-sm text-blue-800 leading-relaxed">
                  <p className="mb-2">
                    <strong>Your Rights:</strong> You can change your cookie preferences at any time. 
                    Essential cookies cannot be disabled as they are necessary for platform functionality.
                  </p>
                  <p>
                    Learn more about our data practices in our{' '}
                    <Link href="/privacy" className="underline hover:text-blue-900 font-medium">
                      Privacy Policy
                    </Link>
                    {' '}and{' '}
                    <Link href="/cookies" className="underline hover:text-blue-900 font-medium">
                      Cookie Policy
                    </Link>
                    .
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CookieNotice;
