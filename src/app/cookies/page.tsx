import { Metadata } from 'next';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Footer } from '@/components/footer';
import { Navbar } from '@/components/navbar';
import { 
  Cookie, 
  Settings, 
  Shield, 
  Eye, 
  Lock, 
  Globe,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Cookie Policy | Jurisight - Legal Knowledge Platform',
  description: 'Learn about how Jurisight uses cookies and similar technologies to enhance your experience on our legal knowledge platform.',
  keywords: [
    'cookie policy',
    'cookies',
    'tracking',
    'legal platform',
    'privacy',
    'data collection',
    'web analytics'
  ],
  openGraph: {
    title: 'Cookie Policy | Jurisight',
    description: 'Learn about how Jurisight uses cookies and similar technologies.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cookie Policy | Jurisight',
    description: 'Learn about how Jurisight uses cookies and similar technologies.',
  },
  alternates: {
    canonical: '/cookies',
  },
};

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Dark Background */}
      <div className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 text-white">
        <Navbar />
        <div className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Cookie className="h-12 w-12 text-orange-400" />
              <h1 className="text-4xl font-bold text-white">Cookie Policy</h1>
            </div>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto">
              This policy explains how Jurisight uses cookies and similar technologies to enhance your experience on our platform.
            </p>
            <div className="mt-4">
              <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                Last Updated: August 2025
              </Badge>
            </div>
          </div>
        </div>
      </div>
      
      <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">

        {/* Quick Overview */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Eye className="h-6 w-6 text-orange-600" />
              Quick Overview
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Essential Cookies</h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Authentication and session management</li>
                  <li>• User preferences and settings</li>
                  <li>• Security and fraud prevention</li>
                  <li>• Basic platform functionality</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Analytics Cookies</h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Platform usage statistics</li>
                  <li>• Content performance metrics</li>
                  <li>• User experience improvements</li>
                  <li>• Error monitoring and debugging</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Sections */}
        <div className="space-y-8">
          {/* What Are Cookies */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="h-6 w-6 text-orange-600" />
                1. What Are Cookies?
              </h2>
              
              <div className="space-y-4">
                <p className="text-gray-700">
                  Cookies are small text files that are stored on your device when you visit our website. 
                  They help us provide you with a better experience by remembering your preferences and 
                  understanding how you use our platform.
                </p>
                
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">Types of Cookies We Use</h3>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h4 className="font-semibold text-blue-800 mb-1">Session Cookies</h4>
                      <p className="text-blue-700">Temporary cookies that expire when you close your browser</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-800 mb-1">Persistent Cookies</h4>
                      <p className="text-blue-700">Cookies that remain on your device for a set period</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Essential Cookies */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle className="h-6 w-6 text-green-600" />
                2. Essential Cookies (Required)
              </h2>
              
              <div className="space-y-4">
                <p className="text-gray-700">
                  These cookies are necessary for the platform to function properly and cannot be disabled. 
                  They enable basic functionality and security features.
                </p>
                
                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Lock className="h-5 w-5 text-green-600" />
                      Authentication Cookies
                    </h3>
                    <div className="text-sm text-gray-600 space-y-2">
                      <p><strong>Purpose:</strong> Keep you logged in and maintain your session</p>
                      <p><strong>Duration:</strong> Session-based or up to 30 days</p>
                      <p><strong>Data Stored:</strong> Encrypted session tokens, user ID</p>
                      <p><strong>Can be disabled:</strong> No (required for platform functionality)</p>
                    </div>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Settings className="h-5 w-5 text-green-600" />
                      Preference Cookies
                    </h3>
                    <div className="text-sm text-gray-600 space-y-2">
                      <p><strong>Purpose:</strong> Remember your settings and preferences</p>
                      <p><strong>Duration:</strong> Up to 1 year</p>
                      <p><strong>Data Stored:</strong> Theme preferences, language settings, display options</p>
                      <p><strong>Can be disabled:</strong> No (required for personalization)</p>
                    </div>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Shield className="h-5 w-5 text-green-600" />
                      Security Cookies
                    </h3>
                    <div className="text-sm text-gray-600 space-y-2">
                      <p><strong>Purpose:</strong> Protect against fraud and ensure security</p>
                      <p><strong>Duration:</strong> Session-based</p>
                      <p><strong>Data Stored:</strong> CSRF tokens, security flags</p>
                      <p><strong>Can be disabled:</strong> No (required for security)</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Analytics Cookies */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Eye className="h-6 w-6 text-blue-600" />
                3. Analytics Cookies (Optional)
              </h2>
              
              <div className="space-y-4">
                <p className="text-gray-700">
                  These cookies help us understand how our platform is used so we can improve the user experience. 
                  They are optional and can be disabled.
                </p>
                
                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Globe className="h-5 w-5 text-blue-600" />
                      Usage Analytics
                    </h3>
                    <div className="text-sm text-gray-600 space-y-2">
                      <p><strong>Purpose:</strong> Track how users interact with our platform</p>
                      <p><strong>Duration:</strong> Up to 2 years</p>
                      <p><strong>Data Stored:</strong> Page views, time spent, click patterns, device information</p>
                      <p><strong>Can be disabled:</strong> Yes (optional)</p>
                    </div>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      Content Performance
                    </h3>
                    <div className="text-sm text-gray-600 space-y-2">
                      <p><strong>Purpose:</strong> Measure content engagement and reading patterns</p>
                      <p><strong>Duration:</strong> Up to 1 year</p>
                      <p><strong>Data Stored:</strong> Article views, reading time, content preferences</p>
                      <p><strong>Can be disabled:</strong> Yes (optional)</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-900 mb-2">No Third-Party Tracking</h3>
                  <p className="text-green-800 text-sm">
                    We do not use third-party advertising cookies or tracking pixels. All analytics are 
                    processed internally and do not share data with external advertising networks.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cookie Management */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Settings className="h-6 w-6 text-orange-600" />
                4. Managing Your Cookie Preferences
              </h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Browser Settings</h3>
                  <p className="text-gray-700 text-sm mb-3">
                    You can control cookies through your browser settings. Most browsers allow you to:
                  </p>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• Block all cookies</li>
                    <li>• Block third-party cookies only</li>
                    <li>• Delete existing cookies</li>
                    <li>• Set preferences for specific websites</li>
                  </ul>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-yellow-900 mb-1">Important Note</h3>
                      <p className="text-yellow-800 text-sm">
                        Disabling essential cookies may affect the functionality of our platform. 
                        Some features may not work properly if you block these cookies.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Platform Cookie Settings</h3>
                  <p className="text-gray-700 text-sm mb-3">
                    We are working on adding cookie preference controls directly to our platform. 
                    Until then, you can manage cookies through your browser settings.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Third-Party Services */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Globe className="h-6 w-6 text-orange-600" />
                5. Third-Party Services
              </h2>
              
              <div className="space-y-4">
                <p className="text-gray-700">
                  Our platform uses certain third-party services that may set their own cookies. 
                  Here's what we use and why:
                </p>
                
                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Supabase</h3>
                    <div className="text-sm text-gray-600 space-y-2">
                      <p><strong>Purpose:</strong> Database and authentication services</p>
                      <p><strong>Cookies:</strong> Essential for platform functionality</p>
                      <p><strong>Privacy Policy:</strong> <a href="https://supabase.com/privacy" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Supabase Privacy Policy</a></p>
                    </div>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Vercel</h3>
                    <div className="text-sm text-gray-600 space-y-2">
                      <p><strong>Purpose:</strong> Hosting and performance optimization</p>
                      <p><strong>Cookies:</strong> Essential for platform functionality</p>
                      <p><strong>Privacy Policy:</strong> <a href="https://vercel.com/legal/privacy-policy" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Vercel Privacy Policy</a></p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">No Advertising Networks</h3>
                  <p className="text-blue-800 text-sm">
                    We do not use Google Analytics, Facebook Pixel, or any other advertising tracking services. 
                    Your browsing data is not shared with advertising networks.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Retention */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Lock className="h-6 w-6 text-orange-600" />
                6. Data Retention and Security
              </h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Cookie Data Retention</h3>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• Session cookies: Deleted when you close your browser</li>
                    <li>• Authentication cookies: Up to 30 days</li>
                    <li>• Preference cookies: Up to 1 year</li>
                    <li>• Analytics cookies: Up to 2 years</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Data Security</h3>
                  <p className="text-gray-700 text-sm">
                    All cookie data is encrypted and stored securely. We follow industry best practices 
                    for data protection and regularly review our security measures.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="h-6 w-6 text-orange-600" />
                7. Questions About Cookies?
              </h2>
              
              <div className="space-y-4">
                <p className="text-gray-700">
                  If you have any questions about our use of cookies or this Cookie Policy, please contact us:
                </p>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-orange-600" />
                      <span><strong>Email:</strong> editorial@jurisight.in</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600">
                  <p>
                    <strong>Jurisight Legal Knowledge Platform</strong><br />
                    New Delhi, India
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Policy Updates */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <AlertCircle className="h-6 w-6 text-orange-600" />
                8. Updates to This Policy
              </h2>
              
              <div className="space-y-4">
                <p className="text-gray-700">
                  We may update this Cookie Policy from time to time to reflect changes in our practices 
                  or legal requirements. We will notify you of any material changes by:
                </p>
                
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Posting the updated policy on our website</li>
                  <li>• Sending an email notification to registered users</li>
                  <li>• Updating the "Last Updated" date at the top of this policy</li>
                </ul>
                
                <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
                  <p className="text-orange-800 text-sm">
                    <strong>Continued Use:</strong> Your continued use of our platform after any changes 
                    to this Cookie Policy constitutes acceptance of the updated terms.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
