'use client';

import dynamic from 'next/dynamic';

// Dynamic imports for heavy components with proper client-side loading
const AnimatedBackgroundWrapper = dynamic(
  () => import('@/components/animated-background-wrapper'),
  { 
    ssr: false, 
    loading: () => <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" />
  }
);

const FeaturedBlog = dynamic(
  () => import('@/components/featured-blog').then(mod => ({ default: mod.FeaturedBlog })),
  { 
    ssr: false,
    loading: () => <div className="h-96 bg-gray-100 animate-pulse" />
  }
);

const TopNews = dynamic(
  () => import('@/components/top-news').then(mod => ({ default: mod.TopNews })),
  { 
    ssr: false,
    loading: () => <div className="h-96 bg-gray-100 animate-pulse" />
  }
);

const SupremeCourtJudgement = dynamic(
  () => import('@/components/supreme-court-judgement').then(mod => ({ default: mod.SupremeCourtJudgement })),
  { 
    ssr: false,
    loading: () => <div className="h-96 bg-gray-100 animate-pulse" />
  }
);

const HighCourtJudgement = dynamic(
  () => import('@/components/high-court-judgement').then(mod => ({ default: mod.HighCourtJudgement })),
  { 
    ssr: false,
    loading: () => <div className="h-96 bg-gray-100 animate-pulse" />
  }
);

const KnowTheLawBlogs = dynamic(
  () => import('@/components/know-the-law-blogs').then(mod => ({ default: mod.KnowTheLawBlogs })),
  { 
    ssr: false,
    loading: () => <div className="h-96 bg-gray-100 animate-pulse" />
  }
);

const WhatsAppCommunityBadge = dynamic(
  () => import('@/components/whatsapp-community-badge').then(mod => ({ default: mod.WhatsAppCommunityBadge })),
  { 
    ssr: false,
    loading: () => <div className="h-32 bg-gray-100 animate-pulse" />
  }
);

export function HomePageClient() {
  return (
    <>
      <FeaturedBlog />
      <TopNews />
      <SupremeCourtJudgement />
      <HighCourtJudgement />
      <KnowTheLawBlogs />
      <WhatsAppCommunityBadge />
    </>
  );
}
