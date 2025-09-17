import { Navbar } from '@/components/navbar';
import { ShaderBackground } from '@/components/ui/hero-shader';
import HeroHeader from '@/components/hero-header';
import { FeaturedBlog } from '@/components/featured-blog';

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
    </>
  );
}