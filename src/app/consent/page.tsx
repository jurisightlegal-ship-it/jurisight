import { Metadata } from 'next';
import { ConsentRevocation } from '@/components/consent-revocation';
import { Footer } from '@/components/footer';
import { Navbar } from '@/components/navbar';

export const metadata: Metadata = {
  title: 'Cookie Consent Management | Jurisight - GDPR Compliant',
  description: 'Manage your cookie preferences and data processing consent. Change your privacy settings at any time.',
  keywords: [
    'cookie consent',
    'privacy settings',
    'data protection',
    'GDPR compliance',
    'cookie management',
    'consent revocation'
  ],
  openGraph: {
    title: 'Cookie Consent Management | Jurisight',
    description: 'Manage your cookie preferences and data processing consent.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cookie Consent Management | Jurisight',
    description: 'Manage your cookie preferences and data processing consent.',
  },
  alternates: {
    canonical: '/consent',
  },
};

export default function ConsentManagementPage() {
  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <main className="py-12">
        <ConsentRevocation />
      </main>
      <Footer />
    </div>
  );
}
