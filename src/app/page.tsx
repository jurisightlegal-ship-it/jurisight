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

export default function Home() {
  return (
    <>
      <div className="relative min-h-[650px] w-full overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 z-0">
          <AnimatedBackgroundWrapper />
        </div>
        
        {/* Content */}
        <div className="relative z-10">
          <Navbar />
          <div className="relative flex min-h-[650px] items-center justify-center py-20 sm:py-24">
            <HeroHeader />
          </div>
        </div>
      </div>
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