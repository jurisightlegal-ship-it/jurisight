import { Navbar } from '@/components/navbar';
import HeroHeader from '@/components/hero-header';
import { Footer } from '@/components/footer';
import { HomePageClient } from '@/components/home-page-client';

export default function Home() {
  return (
    <>
      <div className="relative min-h-[650px] w-full overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" />
        </div>
        
        {/* Content */}
        <div className="relative z-10">
          <Navbar />
          <div className="relative flex min-h-[650px] items-center justify-center py-20 sm:py-24">
            <HeroHeader />
          </div>
        </div>
      </div>
      <HomePageClient />
      <Footer />
    </>
  );
}