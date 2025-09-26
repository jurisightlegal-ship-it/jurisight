"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, BookOpen, CalendarDays, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getImageDisplayUrl } from "@/lib/client-storage-utils";

type Article = {
  id: number;
  title: string;
  slug: string;
  dek: string;
  featuredImage: string | null;
  readingTime: number;
  views: number;
  publishedAt: string;
  author: {
    id: string;
    name: string;
    avatar: string | null;
  };
  section: {
    id: number;
    name: string;
    slug: string;
    color: string;
  };
};

export function KnowTheLawBlogs() {
  const [items, setItems] = React.useState<Article[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [avatarUrls, setAvatarUrls] = React.useState<Record<string, string | null>>({});

  React.useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await fetch('/api/articles?section=academic&limit=6');
        if (response.ok) {
          const data = await response.json();
          const articles = data.articles || [];
          setItems(articles);

          // Process avatar URLs
          const avatarPromises = articles.map(async (article: Article) => {
            if (article.author.avatar) {
              try {
                const processedUrl = await getImageDisplayUrl(article.author.avatar);
                return { id: article.author.id, url: processedUrl };
              } catch (error) {
                console.error('Error processing avatar URL:', error);
                return { id: article.author.id, url: null };
              }
            }
            return { id: article.author.id, url: null };
          });
          
          const avatarResults = await Promise.all(avatarPromises);
          const avatarMap: Record<string, string | null> = {};
          avatarResults.forEach(({ id, url }) => {
            avatarMap[id] = url;
          });
          setAvatarUrls(avatarMap);
        } else {
          console.error('Failed to fetch articles');
        }
      } catch (error) {
        console.error('Error fetching articles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="h-8 w-72 bg-gray-200 rounded mb-2 animate-pulse" />
          <div className="h-4 w-96 bg-gray-200 rounded mb-8 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl h-64 bg-white animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-black mb-2">Know the Law</h2>
            <p className="text-black/60">Educational content to help you understand your legal rights and obligations</p>
          </div>
          <Link href="/categories/know-the-law">
            <Button className="bg-white text-black hover:bg-gray-100 border border-black/20">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((article, index) => (
            <Link key={article.id} href={`/articles/${article.slug}`}>
              <Card className="group overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white">
                <div className="relative aspect-video overflow-hidden">
                  {article.featuredImage ? (
                    <Image
                      src={article.featuredImage}
                      alt={article.title}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                      unoptimized
                      priority={index < 2}
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-emerald-600 via-blue-600 to-purple-600 flex items-center justify-center">
                      <BookOpen className="h-8 w-8 text-white" />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 text-xs font-medium text-white rounded-full bg-emerald-600/90 backdrop-blur">
                      Know Your Law
                    </span>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2 text-white/90 text-xs">
                    <span className="inline-flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-full backdrop-blur">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {new Date(article.publishedAt).toLocaleDateString()}
                    </span>
                    <span className="inline-flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-full backdrop-blur">
                      <BookOpen className="h-3.5 w-3.5" />
                      {article.readingTime} min read
                    </span>
                  </div>
                </div>

                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-black group-hover:text-emerald-700 transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-sm text-black/70 mt-2 line-clamp-3">{article.dek}</p>

                  <div className="mt-4 flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                      {avatarUrls[article.author.id] ? (
                        <Image
                          src={avatarUrls[article.author.id]!}
                          alt={article.author.name}
                          width={24}
                          height={24}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-300 flex items-center justify-center text-xs text-gray-600">
                          {article.author.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 truncate">{article.author.name}</p>
                      <p className="text-xs text-gray-500">{article.views} views</p>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <Button>
                      Read Article
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
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

export default KnowTheLawBlogs;
