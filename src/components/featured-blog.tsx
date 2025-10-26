"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Clock, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { getImageDisplayUrl } from "@/lib/client-storage-utils";

type Article = {
  id: number;
  title: string;
  slug: string;
  dek: string | null;
  featuredImage: string | null;
  readingTime: number | null;
  views: number;
  publishedAt: string;
  author: {
    id: string;
    name: string | null;
    avatar: string | null;
  } | null;
  section: {
    id: number;
    name: string;
    slug: string;
    color: string;
  } | null;
};

export function FeaturedBlog() {
  const router = useRouter();
  const [articles, setArticles] = React.useState<Article[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [processedAvatars, setProcessedAvatars] = React.useState<Record<number, string | null>>({});

  React.useEffect(() => {
    const fetchFeaturedArticles = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/featured-articles?limit=5');
        
        if (response.ok) {
          const data = await response.json();
          setArticles(data.articles || []);
        } else {
          console.error('Failed to fetch featured articles:', response.status);
          setArticles([]);
        }
      } catch (error) {
        console.error('Error fetching featured articles:', error);
        setArticles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedArticles();
  }, []);

  // Process avatar URLs when articles change
  React.useEffect(() => {
    const processAvatars = async () => {
      if (articles.length === 0) return;

      const avatarPromises = articles.map(async (article) => {
        if (article.author?.avatar) {
          const processedUrl = await getImageDisplayUrl(article.author.avatar);
          return { id: article.id, url: processedUrl };
        }
        return { id: article.id, url: null };
      });

      const results = await Promise.all(avatarPromises);
      const avatarMap: Record<number, string | null> = {};
      results.forEach(({ id, url }) => {
        avatarMap[id] = url;
      });
      setProcessedAvatars(avatarMap);
    };

    processAvatars();
  }, [articles]);


  const visibleArticles = articles.slice(currentIndex, currentIndex + 3);
  const canGoNext = currentIndex + 3 < articles.length;
  const canGoPrev = currentIndex > 0;

  const handleNext = () => {
    if (canGoNext) {
      setCurrentIndex(prev => prev + 3);
    }
  };

  const handlePrev = () => {
    if (canGoPrev) {
      setCurrentIndex(prev => Math.max(0, prev - 3));
    }
  };

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 w-64 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 w-96 bg-gray-200 rounded mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="space-y-4">
                  <div className="aspect-video bg-gray-200 rounded-lg"></div>
                  <div className="h-6 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (articles.length === 0) {
    return (
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-black mb-4">Featured Articles</h2>
          <p className="text-black/60">No articles available at the moment.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-black mb-2">Featured Articles</h2>
            <p className="text-black/60">Discover the latest insights and analysis</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePrev}
                disabled={!canGoPrev}
                className="border-black/20 hover:bg-black/5"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleNext}
                disabled={!canGoNext}
                className="border-black/20 hover:bg-black/5"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            <Link href="/articles" prefetch={true}>
              <Button className="bg-white text-black hover:bg-gray-100 border border-black/20">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {visibleArticles.map((article) => (
            <Link 
               key={article.id} 
               href={`/articles/${article.slug}`}
               prefetch={false}
               onMouseEnter={() => router.prefetch(`/articles/${article.slug}`)}
             >
              <Card className="group overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="relative aspect-video overflow-hidden">
                  {article.featuredImage ? (
                    <Image
                      src={article.featuredImage}
                      alt={article.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-jurisight-navy via-jurisight-royal to-jurisight-teal flex items-center justify-center">
                      <div className="text-white text-lg font-semibold">
                        {article.title.charAt(0).toUpperCase()}
                      </div>
                    </div>
                  )}
                  
                  {article.section && (
                    <div className="absolute top-4 left-4">
                      <span
                        className="px-3 py-1 text-xs font-medium text-white rounded-full"
                        style={{ backgroundColor: article.section.color }}
                      >
                        {article.section.name}
                      </span>
                    </div>
                  )}
                </div>

                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-black mb-3 line-clamp-2 group-hover:text-jurisight-navy transition-colors">
                    {article.title}
                  </h3>
                  
                  {article.dek && (
                    <p className="text-black/70 text-sm mb-4 line-clamp-3">
                      {article.dek}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-xs text-black/50">
                    <div className="flex items-center gap-4">
                      {article.readingTime && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{article.readingTime} min read</span>
                        </div>
                      )}
                    </div>
                    
                    {article.author?.name && (
                      <div className="flex items-center gap-2">
                        {processedAvatars[article.id] ? (
                          <Image
                            src={processedAvatars[article.id]!}
                            alt={article.author.name}
                            width={20}
                            height={20}
                            className="rounded-full"
                          />
                        ) : (
                          <div className="w-5 h-5 bg-jurisight-navy rounded-full flex items-center justify-center text-white text-xs">
                            {article.author.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="font-medium">{article.author.name}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {articles.length > 3 && (
          <div className="mt-8 flex justify-center">
            <div className="flex items-center gap-2">
              {Array.from({ length: Math.ceil(articles.length / 3) }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i * 3)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all",
                    Math.floor(currentIndex / 3) === i
                      ? "bg-jurisight-navy w-8"
                      : "bg-black/20 hover:bg-black/40"
                  )}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default FeaturedBlog;
