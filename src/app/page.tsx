import { Navbar } from '@/components/navbar';
import { ShaderBackground } from '@/components/ui/hero-shader';
import HeroHeader from '@/components/hero-header';
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
      <ShaderBackground>
        <Navbar />
        <div className="relative flex min-h-[650px] items-center justify-center py-20 sm:py-24">
          <HeroHeader />
        </div>
      </ShaderBackground>
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