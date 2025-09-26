import { Metadata } from 'next';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Footer } from '@/components/footer';
import { Navbar } from '@/components/navbar';
import { 
  Shield, 
  Database, 
  User, 
  Mail, 
  Eye, 
  Lock, 
  Globe,
  FileText,
  Settings,
  AlertTriangle
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy | Jurisight - Legal Knowledge Platform',
  description: 'Learn how Jurisight protects your privacy and handles your personal data. Our comprehensive privacy policy covers data collection, usage, and your rights.',
  keywords: [
    'privacy policy',
    'data protection',
    'legal platform',
    'user privacy',
    'GDPR compliance',
    'data security',
    'personal information'
  ],
  openGraph: {
    title: 'Privacy Policy | Jurisight',
    description: 'Learn how Jurisight protects your privacy and handles your personal data.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Privacy Policy | Jurisight',
    description: 'Learn how Jurisight protects your privacy and handles your personal data.',
  },
  alternates: {
    canonical: '/privacy',
  },
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Dark Background */}
      <div className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 text-white">
        <Navbar />
        <div className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Shield className="h-12 w-12 text-blue-400" />
              <h1 className="text-4xl font-bold text-white">Privacy Policy</h1>
            </div>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto">
              Your privacy is important to us. This policy explains how Jurisight collects, uses, and protects your personal information.
            </p>
            <div className="mt-4">
              <Badge className="bg-green-100 text-green-800 border-green-200">
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
              <Eye className="h-6 w-6 text-blue-600" />
              Quick Overview
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">What We Collect</h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Email address and name for account creation</li>
                  <li>• Profile information (bio, avatar, role)</li>
                  <li>• Article reading preferences and view counts</li>
                  <li>• Newsletter subscription data</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">How We Use It</h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Provide personalized legal content</li>
                  <li>• Send newsletter updates</li>
                  <li>• Improve platform functionality</li>
                  <li>• Ensure platform security</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Sections */}
        <div className="space-y-8">
          {/* Information We Collect */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Database className="h-6 w-6 text-blue-600" />
                1. Information We Collect
              </h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Personal Information</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700 mb-3">When you create an account or use our services, we collect:</p>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-start gap-2">
                        <User className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span><strong>Account Information:</strong> Email address, name, and password (encrypted)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <FileText className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span><strong>Profile Data:</strong> Bio, avatar image, professional role, and LinkedIn URL</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Mail className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span><strong>Communication:</strong> Newsletter subscription preferences and contact information</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Usage Information</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700 mb-3">We automatically collect certain information about your use of our platform:</p>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-start gap-2">
                        <Eye className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span><strong>Reading Activity:</strong> Articles viewed, reading time, and engagement metrics</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Globe className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span><strong>Technical Data:</strong> IP address, browser type, device information, and access times</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Settings className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span><strong>Preferences:</strong> Content preferences, search queries, and feature usage</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* How We Use Information */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Settings className="h-6 w-6 text-blue-600" />
                2. How We Use Your Information
              </h2>
              
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Service Provision</h3>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• Provide access to legal content and articles</li>
                      <li>• Enable user authentication and account management</li>
                      <li>• Deliver newsletter and email communications</li>
                      <li>• Support content creation and publishing features</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Platform Improvement</h3>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• Analyze usage patterns to improve content</li>
                      <li>• Personalize content recommendations</li>
                      <li>• Enhance user experience and functionality</li>
                      <li>• Monitor platform performance and security</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Storage and Security */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Lock className="h-6 w-6 text-blue-600" />
                3. Data Storage and Security
              </h2>
              
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-900 mb-2">Security Measures</h3>
                  <ul className="space-y-1 text-sm text-green-800">
                    <li>• All data is encrypted in transit and at rest</li>
                    <li>• Passwords are hashed using industry-standard methods</li>
                    <li>• Database access is protected by Row Level Security (RLS)</li>
                    <li>• Regular security audits and updates</li>
                    <li>• Secure cloud hosting with Supabase</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Data Storage</h3>
                  <p className="text-gray-700 text-sm mb-3">
                    Your data is stored securely on Supabase's cloud infrastructure, which is SOC 2 Type II compliant and follows industry best practices for data protection.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cookies and Tracking */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Globe className="h-6 w-6 text-blue-600" />
                4. Cookies and Tracking
              </h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Essential Cookies</h3>
                  <p className="text-gray-700 text-sm mb-3">
                    We use essential cookies for authentication, session management, and basic platform functionality. These cookies are necessary for the platform to work properly.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Analytics</h3>
                  <p className="text-gray-700 text-sm mb-3">
                    We may use analytics tools to understand how our platform is used. This helps us improve our services and content quality.
                  </p>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">No Third-Party Tracking</h3>
                  <p className="text-blue-800 text-sm">
                    We do not use third-party advertising cookies or tracking pixels. We respect your privacy and do not sell your data to advertisers.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Your Rights */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="h-6 w-6 text-blue-600" />
                5. Your Rights and Choices
              </h2>
              
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Access and Control</h3>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• View and update your profile information</li>
                      <li>• Download your data in a portable format</li>
                      <li>• Delete your account and associated data</li>
                      <li>• Unsubscribe from newsletters and communications</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Data Protection Rights</h3>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• Right to access your personal data</li>
                      <li>• Right to correct inaccurate information</li>
                      <li>• Right to request data deletion</li>
                      <li>• Right to data portability</li>
                    </ul>
                  </div>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-yellow-900 mb-1">Exercise Your Rights</h3>
                      <p className="text-yellow-800 text-sm">
                        To exercise any of these rights, please contact us at{' '}
                        <a href="mailto:privacy@jurisight.com" className="underline hover:text-yellow-900">
                          privacy@jurisight.com
                        </a>
                        . We will respond to your request within 30 days.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Sharing */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Globe className="h-6 w-6 text-blue-600" />
                6. Data Sharing and Disclosure
              </h2>
              
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                  <h3 className="font-semibold text-red-900 mb-2">We Do Not Sell Your Data</h3>
                  <p className="text-red-800 text-sm">
                    We do not sell, rent, or trade your personal information to third parties for marketing purposes.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Limited Sharing</h3>
                  <p className="text-gray-700 text-sm mb-3">
                    We may share your information only in the following limited circumstances:
                  </p>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• With your explicit consent</li>
                    <li>• To comply with legal obligations</li>
                    <li>• To protect our rights and prevent fraud</li>
                    <li>• With trusted service providers who assist in platform operations</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Mail className="h-6 w-6 text-blue-600" />
                7. Contact Us
              </h2>
              
              <div className="space-y-4">
                <p className="text-gray-700">
                  If you have any questions about this Privacy Policy or our data practices, please contact us:
                </p>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-blue-600" />
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
                <FileText className="h-6 w-6 text-blue-600" />
                8. Policy Updates
              </h2>
              
              <div className="space-y-4">
                <p className="text-gray-700">
                  We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. 
                  We will notify you of any material changes by:
                </p>
                
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Posting the updated policy on our website</li>
                  <li>• Sending an email notification to registered users</li>
                  <li>• Updating the "Last Updated" date at the top of this policy</li>
                </ul>
                
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <p className="text-blue-800 text-sm">
                    <strong>Continued Use:</strong> Your continued use of our platform after any changes to this Privacy Policy 
                    constitutes acceptance of the updated terms.
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
