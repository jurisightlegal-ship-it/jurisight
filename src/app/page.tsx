import { Navbar } from '@/components/navbar';
import HeroHeader from '@/components/hero-header';
import AnimatedBackgroundWrapper from '@/components/animated-background-wrapper';
import { FeaturedBlog } from '@/components/featured-blog';
import { TopNews } from '@/components/top-news';
import { SupremeCourtJudgement } from '@/components/supreme-court-judgement';
import { HighCourtJudgement } from '@/components/high-court-judgement';
import { KnowTheLawBlogs } from '@/components/know-the-law-blogs';
import { WhatsAppCommunityBadge } from '@/components/whatsapp-community-badge';
import { Footer } from '@/components/footer';
import { HomepageStructuredData } from '@/components/structured-data';
import { MagazineBanner } from '@/components/magazine-banner';
import { AdsenseBannerHome } from '@/components/ads/adsense-banner-home';

export default function Home() {
  return (
    <>
      <HomepageStructuredData />
      <MagazineBanner />
      <div className="relative min-h-[180px] w-full overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 z-0">
          <AnimatedBackgroundWrapper />
        </div>
        
        {/* Content */}
        <div className="relative z-10">
          <Navbar />
          <div className="relative flex min-h-[180px] items-center justify-center py-0 sm:py-1">
            <HeroHeader />
          </div>
        </div>
      </div>
      {/* AdSense unit below the hero section */}
      <AdsenseBannerHome className="mx-auto w-full max-w-[320px] sm:max-w-[468px] lg:max-w-[728px]" />
      <FeaturedBlog />
      <TopNews />
      <SupremeCourtJudgement />
      <HighCourtJudgement />
      <KnowTheLawBlogs />
      <WhatsAppCommunityBadge />
      <Footer />
    </>
  );
}
