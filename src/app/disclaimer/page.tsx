import { Metadata } from 'next';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Footer } from '@/components/footer';
import { Navbar } from '@/components/navbar';
import { 
  AlertTriangle, 
  Scale, 
  FileText, 
  Shield, 
  Eye, 
  Lock, 
  Globe,
  Mail,
  BookOpen,
  Users,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Legal Disclaimer | Jurisight - Legal Knowledge Platform',
  description: 'Important legal disclaimers and terms of use for Jurisight, a legal knowledge platform providing educational content and legal information.',
  keywords: [
    'legal disclaimer',
    'terms of use',
    'legal platform',
    'educational content',
    'legal information',
    'disclaimer',
    'liability'
  ],
  openGraph: {
    title: 'Legal Disclaimer | Jurisight',
    description: 'Important legal disclaimers and terms of use for Jurisight.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Legal Disclaimer | Jurisight',
    description: 'Important legal disclaimers and terms of use for Jurisight.',
  },
  alternates: {
    canonical: '/disclaimer',
  },
};

export default function LegalDisclaimer() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Dark Background */}
      <div className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 text-white">
        <Navbar />
        <div className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Scale className="h-12 w-12 text-red-400" />
              <h1 className="text-4xl font-bold text-white">Legal Disclaimer</h1>
            </div>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto">
              Important legal information about the use of Jurisight and the content provided on our platform.
            </p>
            <div className="mt-4">
              <Badge className="bg-red-100 text-red-800 border-red-200">
                Last Updated: August 2025
              </Badge>
            </div>
          </div>
        </div>
      </div>
      
      <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">

        {/* Important Notice */}
        <Card className="mb-8 border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-red-600 mt-1 flex-shrink-0" />
              <div>
                <h2 className="text-xl font-semibold text-red-900 mb-2">Important Notice</h2>
                <p className="text-red-800">
                  The information provided on Jurisight is for educational and informational purposes only. 
                  It does not constitute legal advice and should not be relied upon as such. Always consult 
                  with a qualified legal professional for specific legal matters.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Sections */}
        <div className="space-y-8">
          {/* General Disclaimer */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="h-6 w-6 text-red-600" />
                1. General Disclaimer
              </h2>
              
              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                  <h3 className="font-semibold text-yellow-900 mb-2">Educational Purpose Only</h3>
                  <p className="text-yellow-800 text-sm">
                    Jurisight is designed as an educational platform to provide general legal knowledge, 
                    court judgments, and legal analysis. All content is for informational purposes only 
                    and does not constitute legal advice.
                  </p>
                </div>
                
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">No Attorney-Client Relationship</h3>
                  <p className="text-gray-700 text-sm">
                    The use of this platform does not create an attorney-client relationship between 
                    you and Jurisight or any of its contributors. We are not your legal counsel.
                  </p>
                  
                  <h3 className="font-semibold text-gray-900">No Legal Advice</h3>
                  <p className="text-gray-700 text-sm">
                    The content on this platform should not be considered as legal advice for any 
                    specific situation. Legal advice must be tailored to the specific circumstances 
                    of each case.
                  </p>
                  
                  <h3 className="font-semibold text-gray-900">Professional Consultation Required</h3>
                  <p className="text-gray-700 text-sm">
                    For any legal matters, you should consult with a qualified attorney who can 
                    provide advice based on your specific situation and applicable laws.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content Accuracy */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Eye className="h-6 w-6 text-red-600" />
                2. Content Accuracy and Currency
              </h2>
              
              <div className="space-y-4">
                <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
                  <h3 className="font-semibold text-orange-900 mb-2">No Guarantee of Accuracy</h3>
                  <p className="text-orange-800 text-sm">
                    While we strive to provide accurate and up-to-date information, we cannot guarantee 
                    the accuracy, completeness, or currency of all content on our platform.
                  </p>
                </div>
                
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">Law Changes Frequently</h3>
                  <p className="text-gray-700 text-sm">
                    Laws and legal interpretations change frequently. Information that was accurate 
                    when published may become outdated or incorrect over time.
                  </p>
                  
                  <h3 className="font-semibold text-gray-900">Court Decisions May Be Overturned</h3>
                  <p className="text-gray-700 text-sm">
                    Court judgments and legal precedents may be overturned, modified, or distinguished 
                    by subsequent decisions. Always verify the current status of any legal authority.
                  </p>
                  
                  <h3 className="font-semibold text-gray-900">Jurisdiction-Specific Laws</h3>
                  <p className="text-gray-700 text-sm">
                    Laws vary by jurisdiction. Information that applies in one state or country may 
                    not apply in another. Always consider the applicable jurisdiction for your situation.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Limitation of Liability */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Shield className="h-6 w-6 text-red-600" />
                3. Limitation of Liability
              </h2>
              
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                  <h3 className="font-semibold text-red-900 mb-2">No Liability for Damages</h3>
                  <p className="text-red-800 text-sm">
                    Jurisight and its contributors shall not be liable for any direct, indirect, 
                    incidental, special, or consequential damages arising from the use of this platform 
                    or reliance on its content.
                  </p>
                </div>
                
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">Use at Your Own Risk</h3>
                  <p className="text-gray-700 text-sm">
                    You use this platform and its content at your own risk. We make no warranties 
                    regarding the accuracy, reliability, or suitability of the information provided.
                  </p>
                  
                  <h3 className="font-semibold text-gray-900">No Professional Relationship</h3>
                  <p className="text-gray-700 text-sm">
                    The platform does not establish any professional relationship between users and 
                    content contributors. Contributors are not acting as your legal counsel.
                  </p>
                  
                  <h3 className="font-semibold text-gray-900">Third-Party Content</h3>
                  <p className="text-gray-700 text-sm">
                    We are not responsible for the accuracy or reliability of any third-party content, 
                    links, or references that may appear on our platform.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Responsibilities */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="h-6 w-6 text-red-600" />
                4. User Responsibilities
              </h2>
              
              <div className="space-y-4">
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">Independent Verification</h3>
                  <p className="text-gray-700 text-sm">
                    Users are responsible for independently verifying any legal information before 
                    relying on it for any purpose. Always consult with qualified legal professionals.
                  </p>
                  
                  <h3 className="font-semibold text-gray-900">Professional Consultation</h3>
                  <p className="text-gray-700 text-sm">
                    For any legal matters, users must seek professional legal advice from qualified 
                    attorneys licensed in the relevant jurisdiction.
                  </p>
                  
                  <h3 className="font-semibold text-gray-900">Compliance with Laws</h3>
                  <p className="text-gray-700 text-sm">
                    Users are responsible for ensuring their use of the platform complies with all 
                    applicable laws and regulations in their jurisdiction.
                  </p>
                  
                  <h3 className="font-semibold text-gray-900">Content Sharing</h3>
                  <p className="text-gray-700 text-sm">
                    When sharing content from our platform, users must ensure they do not misrepresent 
                    the nature of the information or create false impressions about legal advice.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Intellectual Property */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-red-600" />
                5. Intellectual Property Rights
              </h2>
              
              <div className="space-y-4">
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">Platform Content</h3>
                  <p className="text-gray-700 text-sm">
                    The content on this platform is protected by copyright and other intellectual 
                    property laws. Users may not reproduce, distribute, or modify content without 
                    proper authorization.
                  </p>
                  
                  <h3 className="font-semibold text-gray-900">Court Judgments</h3>
                  <p className="text-gray-700 text-sm">
                    Court judgments and legal documents are generally in the public domain, but 
                    our analysis and commentary are protected by copyright.
                  </p>
                  
                  <h3 className="font-semibold text-gray-900">Fair Use</h3>
                  <p className="text-gray-700 text-sm">
                    Users may cite and reference content for educational and research purposes 
                    in accordance with fair use principles and applicable copyright laws.
                  </p>
                  
                  <h3 className="font-semibold text-gray-900">Attribution</h3>
                  <p className="text-gray-700 text-sm">
                    When using our content, proper attribution to Jurisight and the original 
                    contributors is required.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Platform Availability */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Globe className="h-6 w-6 text-red-600" />
                6. Platform Availability and Modifications
              </h2>
              
              <div className="space-y-4">
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">No Guarantee of Availability</h3>
                  <p className="text-gray-700 text-sm">
                    We do not guarantee that the platform will be available at all times. 
                    Maintenance, updates, or technical issues may cause temporary unavailability.
                  </p>
                  
                  <h3 className="font-semibold text-gray-900">Content Modifications</h3>
                  <p className="text-gray-700 text-sm">
                    We reserve the right to modify, update, or remove content at any time without 
                    prior notice. We are not obligated to maintain any specific content.
                  </p>
                  
                  <h3 className="font-semibold text-gray-900">Platform Changes</h3>
                  <p className="text-gray-700 text-sm">
                    We may modify the platform's features, functionality, or terms of use at any time. 
                    Continued use of the platform constitutes acceptance of any changes.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Governing Law */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Scale className="h-6 w-6 text-red-600" />
                7. Governing Law and Jurisdiction
              </h2>
              
              <div className="space-y-4">
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">Applicable Law</h3>
                  <p className="text-gray-700 text-sm">
                    This disclaimer and the use of this platform are governed by the laws of India, 
                    without regard to conflict of law principles.
                  </p>
                  
                  <h3 className="font-semibold text-gray-900">Jurisdiction</h3>
                  <p className="text-gray-700 text-sm">
                    Any disputes arising from the use of this platform shall be subject to the 
                    exclusive jurisdiction of the courts in New Delhi, India.
                  </p>
                  
                  <h3 className="font-semibold text-gray-900">Severability</h3>
                  <p className="text-gray-700 text-sm">
                    If any provision of this disclaimer is found to be invalid or unenforceable, 
                    the remaining provisions shall continue to be valid and enforceable.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Mail className="h-6 w-6 text-red-600" />
                8. Contact Information
              </h2>
              
              <div className="space-y-4">
                <p className="text-gray-700">
                  If you have any questions about this legal disclaimer or need clarification 
                  about any terms, please contact us:
                </p>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-red-600" />
                      <span><strong>Legal Inquiries:</strong> legal@jurisight.com</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-red-600" />
                      <span><strong>General Inquiries:</strong> editorial@jurisight.in</span>
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

          {/* Final Notice */}
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-6 w-6 text-red-600 mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-xl font-semibold text-red-900 mb-2">Final Notice</h2>
                  <p className="text-red-800 text-sm">
                    By using Jurisight, you acknowledge that you have read, understood, and agree to 
                    be bound by this legal disclaimer. If you do not agree with any part of this 
                    disclaimer, you must not use our platform.
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
