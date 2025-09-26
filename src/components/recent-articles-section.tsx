'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getImageDisplayUrl } from '@/lib/client-storage-utils';
import { 
  Calendar, 
  Clock, 
  User, 
  Eye,
  ArrowRight
} from 'lucide-react';

interface RecentArticle {
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
}

interface RecentArticlesSectionProps {
  currentArticleId: number;
  currentSectionId: number;
}

export function RecentArticlesSection({ 
  currentArticleId, 
  currentSectionId 
}: RecentArticlesSectionProps) {
  const [articles, setArticles] = React.useState<RecentArticle[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [imageUrls, setImageUrls] = React.useState<Map<number, string>>(new Map());

  React.useEffect(() => {
    const fetchRecentArticles = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/articles?limit=9&exclude=' + currentArticleId);
        
        if (!response.ok) {
          throw new Error('Failed to fetch recent articles');
        }
        
        const data = await response.json();
        const fetchedArticles = data.articles || [];
        setArticles(fetchedArticles);

        // Process image URLs - if they're already full URLs, use them directly
        const imageUrlMap = new Map<number, string>();
        for (const article of fetchedArticles) {
          if (article.featuredImage) {
            // If it's already a full URL, use it directly
            if (article.featuredImage.startsWith('http')) {
              imageUrlMap.set(article.id, article.featuredImage);
            } else {
              // Otherwise, get the signed URL
              try {
                const imageUrl = await getImageDisplayUrl(article.featuredImage);
                if (imageUrl) {
                  imageUrlMap.set(article.id, imageUrl);
                }
              } catch (err) {
                console.error(`Error loading image for article ${article.id}:`, err);
              }
            }
          }
        }
        setImageUrls(imageUrlMap);
      } catch (err) {
        console.error('Error fetching recent articles:', err);
        setError('Failed to load recent articles');
      } finally {
        setLoading(false);
      }
    };

    fetchRecentArticles();
  }, [currentArticleId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="mt-12 pt-8 border-t border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Recent Articles</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
            <Card key={i} className="overflow-hidden">
              <div className="h-48 bg-gray-200 animate-pulse" />
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-3 bg-gray-200 rounded animate-pulse mb-4" />
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-16" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-12" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || articles.length === 0) {
    return null; // Don't show section if there's an error or no articles
  }

  return (
    <div className="mt-12 pt-8 border-t border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900">Recent Articles</h3>
        <Link 
          href="/articles" 
          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
        >
          View all articles
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
        {articles.map((article) => (
          <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
            <Link href={`/articles/${article.slug}`}>
              {/* Featured Image */}
              {article.featuredImage && imageUrls.has(article.id) ? (
                <div className="relative h-48">
                  <Image
                    src={imageUrls.get(article.id)!}
                    alt={article.title}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="h-48 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                  <div className="text-4xl text-gray-400">📄</div>
                </div>
              )}

              <CardContent className="p-4">
                {/* Section Badge */}
                <div className="mb-3">
                  <Badge 
                    className="text-xs px-2 py-1"
                    style={{ 
                      backgroundColor: `${article.section.color}20`,
                      color: article.section.color,
                      border: `1px solid ${article.section.color}40`
                    }}
                  >
                    {article.section.name}
                  </Badge>
                </div>

                {/* Article Title */}
                <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2 leading-tight">
                  {article.title}
                </h4>

                {/* Article Description */}
                {article.dek && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {article.dek}
                  </p>
                )}

                {/* Article Meta */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(article.publishedAt)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {article.readingTime} min
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {article.views}
                  </div>
                </div>

                {/* Author Info */}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                  <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="h-3 w-3 text-gray-500" />
                  </div>
                  <span className="text-xs text-gray-600">{article.author.name}</span>
                </div>
              </CardContent>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
