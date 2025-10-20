'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  CheckCircle, 
  AlertCircle,
  Info,
  Shield,
  Eye,
  Database,
  Cookie
} from 'lucide-react';
import Link from 'next/link';

// Global type declarations for analytics
declare global {
  interface Window {
    gtag: (command: string, ...args: any[]) => void;
    clarity: (command: string, ...args: any[]) => void;
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

export function ConsentRevocation() {
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    analytics: false,
    functional: false,
    marketing: false
  });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load current consent preferences
    const cookieConsent = localStorage.getItem('cookie-consent');
    if (cookieConsent) {
      try {
        const consent: CookieConsent = JSON.parse(cookieConsent);
        setPreferences({
          essential: consent.essential,
          analytics: consent.analytics,
          functional: consent.functional,
          marketing: consent.marketing
        });
      } catch (error) {
        console.error('Error parsing cookie consent:', error);
      }
    }
    setIsLoaded(true);
  }, []);

  const handleSavePreferences = () => {
    const consent: CookieConsent = {
      ...preferences,
      timestamp: new Date().toISOString(),
      version: '1.0'
    };
    
    localStorage.setItem('cookie-consent', JSON.stringify(consent));
    
    // Update Google Analytics consent
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: preferences.analytics ? 'granted' : 'denied',
        functionality_storage: preferences.functional ? 'granted' : 'denied',
        personalization_storage: preferences.functional ? 'granted' : 'denied',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied'
      });
    }
    
    // Update Microsoft Clarity consent
    if (typeof window !== 'undefined' && window.clarity) {
      window.clarity('consent', preferences.analytics);
    }
    
    // Show success message
    alert('Your cookie preferences have been updated successfully!');
  };

  const handleAcceptAll = () => {
    setPreferences({
      essential: true,
      analytics: true,
      functional: true,
      marketing: false
    });
  };

  const handleRejectAll = () => {
    setPreferences({
      essential: true,
      analytics: false,
      functional: false,
      marketing: false
    });
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Cookie className="h-8 w-8 text-orange-500" />
                <h1 className="text-2xl font-bold text-gray-900">Cookie Consent Management</h1>
              </div>
              <p className="text-gray-600 mb-4">
                Manage your cookie preferences and data processing consent. You can change these settings at any time.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  GDPR Compliant
                </Badge>
                <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                  Google AdSense Ready
                </Badge>
              </div>
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
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-gray-200">
              <Button
                onClick={handleRejectAll}
                variant="outline"
                className="flex-1 sm:flex-none text-red-600 border-red-200 hover:bg-red-50"
              >
                Reject All Optional
              </Button>
              <Button
                onClick={handleAcceptAll}
                variant="outline"
                className="flex-1 sm:flex-none"
              >
                Accept All Optional
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
        </CardContent>
      </Card>
    </div>
  );
}
