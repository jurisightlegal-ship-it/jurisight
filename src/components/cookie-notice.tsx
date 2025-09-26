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
  Info
} from 'lucide-react';
import Link from 'next/link';

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
}

export function CookieNotice() {
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true, // Always true, cannot be disabled
    analytics: false
  });

  useEffect(() => {
    // Check if user has already made a choice
    const cookieConsent = localStorage.getItem('cookie-consent');
    if (!cookieConsent) {
      setIsVisible(true);
    }
  }, []);

  const handleAcceptAll = () => {
    const consent = {
      essential: true,
      analytics: true,
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('cookie-consent', JSON.stringify(consent));
    setIsVisible(false);
    
    // Enable analytics if user accepts
    // You can add analytics initialization here
  };

  const handleRejectAll = () => {
    const consent = {
      essential: true,
      analytics: false,
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('cookie-consent', JSON.stringify(consent));
    setIsVisible(false);
  };

  const handleSavePreferences = () => {
    const consent = {
      ...preferences,
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('cookie-consent', JSON.stringify(consent));
    setIsVisible(false);
    setShowSettings(false);
    
    // Enable/disable analytics based on preference
    if (preferences.analytics) {
      // Initialize analytics
    }
  };

  const handleCustomize = () => {
    setShowSettings(true);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white/95 backdrop-blur-sm border-t border-gray-200 shadow-lg">
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-6">
          {!showSettings ? (
            // Main cookie notice
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="flex-shrink-0">
                  <Cookie className="h-8 w-8 text-orange-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    We use cookies to enhance your experience
                  </h3>
                  <p className="text-sm text-gray-600">
                    We use essential cookies for platform functionality and optional analytics cookies 
                    to improve our services. You can customize your preferences or learn more in our{' '}
                    <Link href="/cookies" className="text-blue-600 hover:underline">
                      Cookie Policy
                    </Link>
                    .
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                <Button
                  onClick={handleCustomize}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Settings className="h-4 w-4" />
                  Customize
                </Button>
                <Button
                  onClick={handleRejectAll}
                  variant="outline"
                  size="sm"
                >
                  Reject All
                </Button>
                <Button
                  onClick={handleAcceptAll}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Accept All
                </Button>
              </div>
            </div>
          ) : (
            // Cookie preferences settings
            <div className="space-y-4">
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
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-gray-900">Essential Cookies</h4>
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        Required
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      These cookies are necessary for the platform to function properly. They enable 
                      authentication, security, and basic functionality.
                    </p>
                    <div className="flex items-center gap-2 text-sm text-green-700">
                      <CheckCircle className="h-4 w-4" />
                      <span>Always active - cannot be disabled</span>
                    </div>
                  </div>
                </div>
                
                {/* Analytics Cookies */}
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-gray-900">Analytics Cookies</h4>
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                        Optional
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      These cookies help us understand how our platform is used so we can improve 
                      the user experience and content quality.
                    </p>
                    <div className="flex items-center gap-2">
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
              
              <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-800">
                  You can change your cookie preferences at any time by visiting our{' '}
                  <Link href="/cookies" className="underline hover:text-blue-900">
                    Cookie Policy
                  </Link>
                  {' '}page.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default CookieNotice;
