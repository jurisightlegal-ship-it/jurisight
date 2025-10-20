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
      {/* Hero Section */}
      <div className="mb-8 rounded-2xl bg-gradient-to-r from-gray-800 to-gray-900 p-8 shadow-lg">
        <div className="text-center">
          <Cookie className="mx-auto mb-4 h-12 w-12 text-blue-400" />
          <h1 className="mb-4 text-3xl font-bold text-white">Cookie Consent Management</h1>
          <p className="mx-auto mb-6 max-w-2xl text-lg text-gray-300">
            Your privacy is important to us. Manage your cookie preferences and data processing consent below.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Badge className="border-gray-700 bg-gray-800 text-gray-200">
              GDPR Compliant
            </Badge>
          </div>
        </div>
      </div>
      
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-white mb-2">Manage Your Cookie Preferences</h2>
              <p className="text-gray-300">
                You can change these settings at any time. Choose which cookies you want to allow.
              </p>
            </div>
            
            <div className="space-y-4">
              {/* Essential Cookies */}
              <div className="flex items-start gap-3 p-4 bg-gray-700/50 border border-gray-600 rounded-lg">
                <div className="flex-shrink-0">
                  <Shield className="h-5 w-5 text-green-400 mt-0.5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-white">Essential Cookies</h4>
                    <Badge className="bg-green-900/50 text-green-300 border-green-700">
                      Required
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-300 mb-3">
                    These cookies are necessary for the platform to function properly. They enable 
                    authentication, security, session management, and basic functionality.
                  </p>
                  <div className="flex items-center gap-2 text-sm text-green-300">
                    <CheckCircle className="h-4 w-4" />
                    <span>Always active - cannot be disabled</span>
                  </div>
                </div>
              </div>
              
              {/* Analytics Cookies */}
              <div className="flex items-start gap-3 p-4 bg-gray-700/50 border border-gray-600 rounded-lg">
                <div className="flex-shrink-0">
                  <Eye className="h-5 w-5 text-blue-400 mt-0.5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-white">Analytics Cookies</h4>
                    <Badge className="bg-blue-900/50 text-blue-300 border-blue-700">
                      Optional
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-300 mb-3">
                    These cookies help us understand how our platform is used so we can improve 
                    the user experience and content quality. We use Google Analytics and Microsoft Clarity.
                  </p>
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="checkbox"
                      id="analytics"
                      checked={preferences.analytics}
                      onChange={(e) => setPreferences(prev => ({ ...prev, analytics: e.target.checked }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded bg-gray-700"
                    />
                    <label htmlFor="analytics" className="text-sm text-gray-300">
                      Allow analytics cookies
                    </label>
                  </div>
                </div>
              </div>
              
              {/* Functional Cookies */}
              <div className="flex items-start gap-3 p-4 bg-gray-700/50 border border-gray-600 rounded-lg">
                <div className="flex-shrink-0">
                  <Settings className="h-5 w-5 text-purple-400 mt-0.5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-white">Functional Cookies</h4>
                    <Badge className="bg-purple-900/50 text-purple-300 border-purple-700">
                      Optional
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-300 mb-3">
                    These cookies remember your preferences and settings to provide a personalized 
                    experience across visits.
                  </p>
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="checkbox"
                      id="functional"
                      checked={preferences.functional}
                      onChange={(e) => setPreferences(prev => ({ ...prev, functional: e.target.checked }))}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded bg-gray-700"
                    />
                    <label htmlFor="functional" className="text-sm text-gray-300">
                      Allow functional cookies
                    </label>
                  </div>
                </div>
              </div>
              
              {/* Marketing Cookies */}
              <div className="flex items-start gap-3 p-4 bg-gray-700/50 border border-gray-600 rounded-lg">
                <div className="flex-shrink-0">
                  <Database className="h-5 w-5 text-gray-400 mt-0.5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-white">Marketing Cookies</h4>
                    <Badge className="bg-gray-700 text-gray-300 border-gray-600">
                      Not Used
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-300 mb-3">
                    We currently do not use marketing cookies or third-party advertising tracking.
                  </p>
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="checkbox"
                      id="marketing"
                      checked={preferences.marketing}
                      onChange={(e) => setPreferences(prev => ({ ...prev, marketing: e.target.checked }))}
                      disabled
                      className="h-4 w-4 text-gray-500 focus:ring-gray-600 border-gray-500 rounded bg-gray-700"
                    />
                    <label htmlFor="marketing" className="text-sm text-gray-400">
                      Allow marketing cookies (disabled)
                    </label>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-gray-600">
              <Button
                onClick={handleRejectAll}
                variant="outline"
                className="flex-1 sm:flex-none text-red-400 border-red-900/50 hover:bg-red-900/30"
              >
                Reject All Optional
              </Button>
              <Button
                onClick={handleAcceptAll}
                variant="outline"
                className="flex-1 sm:flex-none text-blue-400 border-gray-600 hover:bg-gray-700"
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
            
            <div className="flex items-start gap-2 p-3 bg-blue-900/30 border border-blue-800/50 rounded-lg">
              <Info className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-200">
                <p className="mb-1">
                  <strong>Your Rights:</strong> You can change your cookie preferences at any time. 
                  Essential cookies cannot be disabled as they are necessary for platform functionality.
                </p>
                <p>
                  Learn more about our data practices in our{' '}
                  <Link href="/privacy" className="underline hover:text-blue-300">
                    Privacy Policy
                  </Link>
                  {' '}and{' '}
                  <Link href="/cookies" className="underline hover:text-blue-300">
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
