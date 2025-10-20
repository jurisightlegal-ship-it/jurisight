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
  Database
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
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white/95 backdrop-blur-sm border-t border-gray-200 shadow-lg">
      <Card className="max-w-5xl mx-auto">
        <CardContent className="p-6">
          {!showSettings ? (
            // Main cookie notice
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <Cookie className="h-8 w-8 text-orange-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Cookie Consent & Data Protection
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    We use cookies and similar technologies to provide, protect, and improve our services. 
                    Some cookies are essential for the platform to function, while others help us understand 
                    how you use our platform to improve your experience. You can manage your preferences below.
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <Link href="/privacy" className="text-blue-600 hover:underline">
                      Privacy Policy
                    </Link>
                    <Link href="/cookies" className="text-blue-600 hover:underline">
                      Cookie Policy
                    </Link>
                    <Link href="/consent" className="text-blue-600 hover:underline">
                      Manage Consent
                    </Link>
                    <span>GDPR Compliant</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 justify-end">
                <Button
                  onClick={handleCustomize}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Settings className="h-4 w-4" />
                  Manage Options
                </Button>
                <Button
                  onClick={handleRejectAll}
                  variant="outline"
                  size="sm"
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  Do Not Consent
                </Button>
                <Button
                  onClick={handleAcceptAll}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Consent
                </Button>
              </div>
            </div>
          ) : (
            // Cookie preferences settings
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Cookie Preferences
                </h3>
                <Button
                  onClick={() => setShowSettings(false)}
                  variant="ghost"
                  size="sm"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                {/* Essential Cookies */}
                <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex-shrink-0">
                    <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-gray-900">Essential Cookies</h4>
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        Required
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      These cookies are necessary for the platform to function properly. They enable 
                      authentication, security, session management, and basic functionality.
                    </p>
                    <div className="flex items-center gap-2 text-sm text-green-700">
                      <CheckCircle className="h-4 w-4" />
                      <span>Always active - cannot be disabled</span>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      <strong>Examples:</strong> Authentication tokens, CSRF protection, session management
                    </div>
                  </div>
                </div>
                
                {/* Analytics Cookies */}
                <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex-shrink-0">
                    <Eye className="h-5 w-5 text-blue-600 mt-0.5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-gray-900">Analytics Cookies</h4>
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                        Optional
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      These cookies help us understand how our platform is used so we can improve 
                      the user experience and content quality. We use Google Analytics and Microsoft Clarity.
                    </p>
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="checkbox"
                        id="analytics"
                        checked={preferences.analytics}
                        onChange={(e) => setPreferences(prev => ({ ...prev, analytics: e.target.checked }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="analytics" className="text-sm text-gray-700">
                        Allow analytics cookies
                      </label>
                    </div>
                    <div className="text-xs text-gray-500">
                      <strong>Examples:</strong> Page views, user interactions, performance metrics
                    </div>
                  </div>
                </div>
                
                {/* Functional Cookies */}
                <div className="flex items-start gap-3 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex-shrink-0">
                    <Settings className="h-5 w-5 text-purple-600 mt-0.5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-gray-900">Functional Cookies</h4>
                      <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                        Optional
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      These cookies remember your preferences and settings to provide a personalized 
                      experience across visits.
                    </p>
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="checkbox"
                        id="functional"
                        checked={preferences.functional}
                        onChange={(e) => setPreferences(prev => ({ ...prev, functional: e.target.checked }))}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                      <label htmlFor="functional" className="text-sm text-gray-700">
                        Allow functional cookies
                      </label>
                    </div>
                    <div className="text-xs text-gray-500">
                      <strong>Examples:</strong> Theme preferences, language settings, display options
                    </div>
                  </div>
                </div>
                
                {/* Marketing Cookies */}
                <div className="flex items-start gap-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex-shrink-0">
                    <Database className="h-5 w-5 text-gray-600 mt-0.5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-gray-900">Marketing Cookies</h4>
                      <Badge className="bg-gray-100 text-gray-800 border-gray-200">
                        Not Used
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      We currently do not use marketing cookies or third-party advertising tracking.
                    </p>
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="checkbox"
                        id="marketing"
                        checked={preferences.marketing}
                        onChange={(e) => setPreferences(prev => ({ ...prev, marketing: e.target.checked }))}
                        disabled
                        className="h-4 w-4 text-gray-400 focus:ring-gray-300 border-gray-300 rounded"
                      />
                      <label htmlFor="marketing" className="text-sm text-gray-500">
                        Allow marketing cookies (disabled)
                      </label>
                    </div>
                    <div className="text-xs text-gray-500">
                      <strong>Note:</strong> We do not use third-party advertising or marketing tracking
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-gray-200">
                <Button
                  onClick={() => setShowSettings(false)}
                  variant="outline"
                  className="flex-1 sm:flex-none"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSavePreferences}
                  className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Save Preferences
                </Button>
              </div>
              
              <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="mb-1">
                    <strong>Your Rights:</strong> You can change your cookie preferences at any time. 
                    Essential cookies cannot be disabled as they are necessary for platform functionality.
                  </p>
                  <p>
                    Learn more about our data practices in our{' '}
                    <Link href="/privacy" className="underline hover:text-blue-900">
                      Privacy Policy
                    </Link>
                    {' '}and{' '}
                    <Link href="/cookies" className="underline hover:text-blue-900">
                      Cookie Policy
                    </Link>
                    .
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default CookieNotice;
