"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Eye, ArrowRight } from "lucide-react";
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

export function TopNews() {
  const router = useRouter();
  const [articles, setArticles] = React.useState<Article[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [failedImageIds, setFailedImageIds] = React.useState<Set<number>>(new Set());
  const [processedAvatars, setProcessedAvatars] = React.useState<Record<number, string | null>>({});

  React.useEffect(() => {
    const fetchTopNews = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/top-news?limit=6');
        
        if (response.ok) {
          const data = await response.json();
          setArticles(data.articles || []);
        } else {
          console.error('Failed to fetch top news:', response.status);
          setArticles([]);
        }
      } catch (error) {
        console.error('Error fetching top news:', error);
        setArticles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTopNews();
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

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="h-8 w-48 bg-gray-200 rounded mb-2 animate-pulse" />
          <div className="h-4 w-80 bg-gray-200 rounded mb-8 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="space-y-4">
                <div className="aspect-video bg-gray-200 rounded-lg animate-pulse" />
                <div className="h-6 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (articles.length === 0) {
    return (
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-black mb-2">Top News</h2>
          <p className="text-black/60">No top news available right now.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-black mb-2">Top News</h2>
            <p className="text-black/60">Most read stories across Jurisight</p>
          </div>
          <Link href="/articles" prefetch={true}>
            <Button className="bg-white text-black hover:bg-gray-100 border border-black/20">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article, index) => (
            <Link 
               key={article.id} 
               href={`/articles/${article.slug}`}
               prefetch={false}
               onMouseEnter={() => router.prefetch(`/articles/${article.slug}`)}
             >
              <Card className="group overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="relative aspect-video overflow-hidden">
                  {article.featuredImage && !failedImageIds.has(article.id) ? (
                    <Image
                      src={article.featuredImage}
                      alt={article.title}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                      unoptimized
                      priority={index < 2}
                      onError={() => setFailedImageIds(prev => {
                        const next = new Set(prev);
                        next.add(article.id);
                        return next;
                      })}
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
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TopNews;


